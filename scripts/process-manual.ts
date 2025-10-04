#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import process from "node:process"
import { fileURLToPath } from "node:url"
import { GeminiClient } from "../backend/src/gemini/client"

const execFileAsync = promisify(execFile)

function assertEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`${key} is not configured`)
  }
  return value
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 64) || "manual"
}

async function ensurePdftoppmAvailable() {
  try {
    await execFileAsync("pdftoppm", ["-v"]) // version command prints to stderr, ignore output
  } catch (error) {
    throw new Error(
      "pdftoppm is required to convert PDF pages. Install poppler (e.g. `brew install poppler`) and ensure pdftoppm is on PATH."
    )
  }
}

async function convertPdfToImages(pdfPath: string, outputDir: string): Promise<string[]> {
  await fs.mkdir(outputDir, { recursive: true })
  const prefix = path.join(outputDir, "step")
  await execFileAsync("pdftoppm", ["-jpeg", "-r", "200", pdfPath, prefix])

  const files = await fs.readdir(outputDir)
  const jpegFiles = files.filter((file) => file.endsWith(".jpg") || file.endsWith(".jpeg"))
  if (jpegFiles.length === 0) {
    throw new Error("PDF conversion produced no images")
  }

  const sorted = jpegFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  const normalized: string[] = []
  await Promise.all(
    sorted.map(async (file, index) => {
      const newName = `step-${String(index + 1).padStart(3, "0")}.jpg`
      if (file !== newName) {
        await fs.rename(path.join(outputDir, file), path.join(outputDir, newName))
      }
      normalized.push(newName)
    })
  )

  return normalized
}

function extractWarning(instructions: string[] | undefined): string[] | undefined {
  if (!instructions || instructions.length === 0) return undefined
  const warnings = instructions.filter((line) => /caution|warning|careful/i.test(line))
  return warnings.length > 0 ? warnings : undefined
}

async function main() {
  const args = process.argv.slice(2)
  let pdfPath = args[0] && !args[0].startsWith("-") ? args[0] : ""
  let manualTitle = ""
  let manualId = ""
  let force = false

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === "--pdf" && args[i + 1]) {
      pdfPath = args[i + 1]
      i += 1
    } else if (arg === "--title" && args[i + 1]) {
      manualTitle = args[i + 1]
      i += 1
    } else if (arg === "--id" && args[i + 1]) {
      manualId = args[i + 1]
      i += 1
    } else if (arg === "--force") {
      force = true
    }
  }

  if (!pdfPath) {
    pdfPath = path.resolve(process.cwd(), "ikea_sample.pdf")
  }

  const pdfStat = await fs.stat(pdfPath).catch(() => null)
  if (!pdfStat || !pdfStat.isFile()) {
    throw new Error(`PDF not found at ${pdfPath}`)
  }

  if (!manualTitle) {
    manualTitle = path.basename(pdfPath, path.extname(pdfPath)).replace(/[-_]/g, " ")
  }

  if (!manualId) {
    manualId = slugify(manualTitle)
  }

  await ensurePdftoppmAvailable()

  const geminiKey = assertEnv("GEMINI_API_KEY")

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const projectRoot = path.resolve(__dirname, "..")
  const publicDir = path.join(projectRoot, "frontend", "public", "manuals", manualId)
  const manualPath = path.join(publicDir, "manual.json")

  if (force) {
    await fs.rm(publicDir, { recursive: true, force: true }).catch(() => {})
  } else {
    try {
      await fs.access(manualPath)
      console.log(`Manual '${manualId}' already exists on disk. Use --force to overwrite.`)
      return
    } catch {
      // file does not exist, continue
    }
  }

  console.log(`Converting PDF '${pdfPath}' to images in ${publicDir}`)
  const imageFiles = await convertPdfToImages(pdfPath, publicDir)
  console.log(`Generated ${imageFiles.length} step image(s).`)

  const gemini = new GeminiClient({ apiKey: geminiKey })

  const partsMap = new Map<string, { id: string; name?: string; quantity?: number; imageUrl?: string; type?: string; material?: string }>()
  const toolsMap = new Map<string, { id: string; name: string; imageUrl?: string }>()
  const stepsData: any[] = []

  for (let index = 0; index < imageFiles.length; index += 1) {
    const fileName = imageFiles[index]
    const absolutePath = path.join(publicDir, fileName)
    const imageBuffer = await fs.readFile(absolutePath)
    const base64 = imageBuffer.toString("base64")

    console.log(`Processing step ${index + 1}/${imageFiles.length} (${fileName}) with Gemini…`)

    const extraction = await gemini.extractStep({
      manualTitle,
      pageNo: index + 1,
      images: [
        {
          kind: "base64",
          data: base64,
          mimeType: "image/jpeg",
        },
      ],
    })

    const { instructions = [], parts = [], tools = [], sceneJson } = extraction

    const codeResult = await gemini.generateThreeCode({
      manualTitle,
      sceneJson,
      instructions,
      preferredStyle: "ikea-monochrome",
    })

    const stepTitle = instructions[0] ?? `Step ${index + 1}`
    const warnings = extractWarning(instructions)

    const partsUsed = parts.map((part, partIndex) => {
      const candidateId = part.id || part.name || `part-${index + 1}-${partIndex + 1}`
      const partId = slugify(candidateId)
      const existing = partsMap.get(partId)
      if (!existing) {
        partsMap.set(partId, {
          id: partId,
          name: part.name,
          quantity: part.quantity,
          imageUrl: part.imgUrl,
          type: part.type,
          material: part.material,
        })
      } else {
        existing.quantity = (existing.quantity ?? 0) + (part.quantity ?? 1)
        if (part.name && !existing.name) existing.name = part.name
        if (part.imgUrl && !existing.imageUrl) existing.imageUrl = part.imgUrl
        if (part.type && !existing.type) existing.type = part.type
        if (part.material && !existing.material) existing.material = part.material
      }
      return {
        partId,
        quantity: part.quantity,
      }
    })

    const toolsUsed = tools.map((tool, toolIndex) => {
      const candidateName = tool.name || `tool-${index + 1}-${toolIndex + 1}`
      const toolId = slugify(candidateName)
      const existing = toolsMap.get(toolId)
      if (!existing) {
        toolsMap.set(toolId, { id: toolId, name: tool.name || candidateName, imageUrl: tool.imgUrl })
      }
      return {
        id: toolId,
        name: tool.name || candidateName,
        imageUrl: tool.imgUrl,
      }
    })

    stepsData.push({
      index,
      title: stepTitle,
      imageUrl: `/manuals/${manualId}/${fileName}`,
      instructions,
      warnings,
      threeCode: codeResult.threeCode,
      sceneJson,
      partsUsed: partsUsed.length > 0 ? partsUsed : undefined,
      toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
    })
  }

  const partsCatalog = Array.from(partsMap.values())
  const toolsCatalog = Array.from(toolsMap.values())

  const uploadedAt = new Date().toISOString()
  const summary = {
    id: manualId,
    title: manualTitle,
    status: "completed",
    thumbnail: stepsData[0]?.imageUrl ?? "",
    steps: stepsData.length,
    parts: partsCatalog.length,
    uploadedAt,
  }

  const detail = {
    ...summary,
    stepsData,
    partsCatalog,
    toolsCatalog,
  }

  await fs.writeFile(manualPath, JSON.stringify(detail, null, 2), "utf8")

  console.log(`Manual '${manualId}' written to ${manualPath}`)
}

main().catch((error) => {
  console.error("Failed to process manual:", error)
  process.exitCode = 1
})
