'use server'

import { cache } from "react"
import { promises as fs } from "node:fs"
import path from "node:path"
import type { ManualDetail, ManualSummary } from "@/lib/manual-types"
import { demoManualDetail, demoManualSummary } from "@/lib/manual-steps"

const manualsDir = path.join(process.cwd(), "public", "manuals")

const FALLBACK_SUMMARIES: ManualSummary[] = [
  demoManualSummary,
  {
    id: "m_002",
    title: "KALLAX Storage Unit",
    status: "processing",
    thumbnail: "/ikea-storage-unit-assembly-diagram.jpg",
    steps: 0,
    parts: 0,
    uploadedAt: "5 minutes ago",
  },
  {
    id: "m_003",
    title: "HEMNES Dresser",
    status: "completed",
    thumbnail: "/dresser-assembly-diagram-technical-drawing.jpg",
    steps: 18,
    parts: 15,
    uploadedAt: "1 day ago",
  },
  {
    id: "m_004",
    title: "MALM Bed Frame",
    status: "failed",
    thumbnail: "/bed-frame-assembly-diagram.jpg",
    steps: 0,
    parts: 0,
    uploadedAt: "3 days ago",
  },
  {
    id: "m_005",
    title: "BILLY Bookcase",
    status: "completed",
    thumbnail: "/bookcase-assembly-instructions-line-art.jpg",
    steps: 8,
    parts: 6,
    uploadedAt: "1 week ago",
  },
  {
    id: "m_006",
    title: "EKTORP Sofa",
    status: "completed",
    thumbnail: "/sofa-assembly-diagram-technical.jpg",
    steps: 15,
    parts: 12,
    uploadedAt: "2 weeks ago",
  },
]

async function readManualDetailFromDisk(manualId: string): Promise<ManualDetail | null> {
  try {
    const manualPath = path.join(manualsDir, manualId, "manual.json")
    const raw = await fs.readFile(manualPath, "utf8")
    const detail = JSON.parse(raw) as ManualDetail
    return detail
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`[manual-store] Failed to read manual ${manualId}:`, error)
    }
    return null
  }
}

export const listManualSummaries = cache(async (): Promise<ManualSummary[]> => {
  const summaries: ManualSummary[] = []

  try {
    const entries = await fs.readdir(manualsDir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      const detail = await readManualDetailFromDisk(entry.name)
      if (!detail) continue
      summaries.push({
        id: detail.id,
        title: detail.title,
        status: detail.status,
        thumbnail: detail.thumbnail,
        steps: detail.steps,
        parts: detail.parts,
        uploadedAt: detail.uploadedAt,
        description: detail.description,
      })
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[manual-store] Failed to list manuals", error)
    }
  }

  if (summaries.length === 0) {
    return FALLBACK_SUMMARIES
  }

  const merged = [...summaries.sort((a, b) => (a.uploadedAt < b.uploadedAt ? 1 : -1)), ...FALLBACK_SUMMARIES]
  const seen = new Map<string, ManualSummary>()
  for (const summary of merged) {
    if (!seen.has(summary.id)) {
      seen.set(summary.id, summary)
    }
  }
  return Array.from(seen.values())
})

export const getManualDetail = cache(async (manualId: string): Promise<ManualDetail | null> => {
  if (manualId === demoManualDetail.id) {
    return demoManualDetail
  }

  const detail = await readManualDetailFromDisk(manualId)
  return detail
})
