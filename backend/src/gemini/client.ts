import { Buffer } from 'node:buffer'
import { GoogleGenerativeAI, type Content, type GenerativeModel, type Part } from '@google/generative-ai'

export type GeminiImageSource =
  | { kind: 'url'; url: string }
  | { kind: 'base64'; data: string; mimeType: string }
  | { kind: 'dataUrl'; dataUrl: string }

export type SceneExtractionRequest = {
  images: GeminiImageSource[]
  manualTitle?: string
  pageNo?: number
  previousStepSummary?: string
  extraInstructions?: string
}

export type SceneExtractionResult = {
  sceneJson: unknown
  instructions?: string[]
  parts?: { id?: string; name?: string; type?: string; quantity?: number; dimensions?: Record<string, number>; material?: string; imgUrl?: string }[]
  tools?: { name: string; imgUrl?: string }[]
  rawText: string
}

export type CodegenRequest = {
  sceneJson: unknown
  manualTitle?: string
  instructions?: string[]
  preferredStyle?: 'ikea-monochrome' | 'realistic'
}

export type CodegenResult = {
  threeCode: string
  rawText: string
}

export type QuestionAnswerRequest = {
  question: string
  context: string
  manualTitle?: string
  stepSummary?: string
}

export type QuestionAnswerResult = {
  answer: string
  rawText: string
}

export type EmbeddingRequest = {
  texts: string[]
}

export type EmbeddingResult = {
  vectors: number[][]
}

export type GeminiClientConfig = {
  apiKey?: string
  passOneModel?: string
  passTwoModel?: string
  embeddingModel?: string
}

const DEFAULT_PASS_ONE_MODEL = 'gemini-1.5-pro-latest'
const DEFAULT_PASS_TWO_MODEL = 'gemini-1.5-pro-latest'
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-004'

const PASS_ONE_SYSTEM_PROMPT = `You are an expert at interpreting IKEA-style assembly manuals.

Given one or more images from a manual step, you must return STRICT JSON matching:
{
  "parts": [
    { "id": "string?", "name": "string?", "type": "box|cylinder|plane|sphere?", "quantity": number?, "dimensions": { "key": number }?, "material": "string?" }
  ],
  "tools": [ { "name": "string", "imgUrl": "string?" } ],
  "instructions": [ "string" ],
  "sceneJson": {
    "camera": { "type": "orthographic", "position": [x,y,z], "target": [x,y,z] },
    "parts": [
      { "id": "string", "type": "box|cylinder|plane|sphere", "dimensions": { ... }, "position": [x,y,z]?, "rotation": [x,y,z]?, "material": "string?", "style": { "line": "black", "fill": "white", "edgeWidth": number? }? }
    ],
    "assemblies": [ { "action": "attach|align|move|rotate", "from": "string?", "to": "string?", "position": [x,y,z]?, "rotation": [x,y,z]? } ],
    "timeline": [
      { "t": number, "action": "ghost|move|rotate|attach", "target": "string", "to": [x,y,z]?, "rotation": [x,y,z]? }
    ]
  }
}

Rules:
- ONLY include parts/tools actually shown or clearly implied.
- Prefer simple primitives for geometry.
- Assume flat white fills with black outlines; provide a style block per part when possible.
- Use an orthographic camera pointing toward the origin (axonometric feel).
- If information is missing, omit the relevant field.
- Respond with valid JSON only, no commentary.`

const PASS_TWO_SYSTEM_PROMPT = `You are a Three.js IKEA-manual style coding assistant. Input is a sceneJson. Generate a complete ES module that:
- Creates a white canvas background via renderer.setClearColor(0xffffff, 1).
- Uses OrthographicCamera at an axonometric angle (rotate ~35-45° on X/Y).
- Builds primitives with MeshBasicMaterial({ color: 0xffffff }) so fills are white.
- Adds black outlines using EdgesGeometry + LineSegments with LineBasicMaterial({ color: 0x000000 }).
- Respects part transforms (position, rotation, scale) and optional style.edgeWidth.
- Registers autoplay actions from sceneJson.timeline supporting ghost, move, rotate, attach.
- Exposes window.SYI = { play, pause, seek, loadScene }.
- Sets renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)).
- Leaves the scene orbitable once autoplay finishes.
- Avoids lights, shadows, textures, or external loaders.
Respond with a single \`\`\`js\n...code...\n\`\`\` block containing the full ES module and no commentary.`

const QA_SYSTEM_PROMPT = `You answer user questions about furniture assembly steps. Use only the supplied context. Prefer concise, friendly answers. If unsure, plainly admit it.`

export class GeminiClient {
  private readonly genAI: GoogleGenerativeAI
  private readonly passOneModelName: string
  private readonly passTwoModelName: string
  private readonly embeddingModelName: string
  private readonly cache = new Map<string, GenerativeModel>()

  constructor(config: GeminiClientConfig = {}) {
    const apiKey = config.apiKey ?? process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }

    this.genAI = new GoogleGenerativeAI(apiKey)
    this.passOneModelName = config.passOneModel ?? DEFAULT_PASS_ONE_MODEL
    this.passTwoModelName = config.passTwoModel ?? DEFAULT_PASS_TWO_MODEL
    this.embeddingModelName = config.embeddingModel ?? DEFAULT_EMBEDDING_MODEL
  }

  async extractStep(request: SceneExtractionRequest): Promise<SceneExtractionResult> {
    const model = this.getModel(this.passOneModelName)
    const imageParts = await Promise.all(request.images.map(resolveImageSource))

    const contents: Content[] = [
      { role: 'system', parts: [{ text: PASS_ONE_SYSTEM_PROMPT }] },
      {
        role: 'user',
        parts: [
          {
            text: buildPassOneUserPrompt(request.manualTitle, request.pageNo, request.previousStepSummary, request.extraInstructions),
          },
          ...imageParts,
        ],
      },
    ]

    const result = await model.generateContent({ contents })
    const rawText = result.response.text() ?? ''
    const json = parseJsonFromResponse(rawText)

    return {
      sceneJson: json.sceneJson,
      instructions: json.instructions,
      parts: json.parts,
      tools: json.tools,
      rawText,
    }
  }

  async generateThreeCode(request: CodegenRequest): Promise<CodegenResult> {
    const model = this.getModel(this.passTwoModelName)

    const contents: Content[] = [
      { role: 'system', parts: [{ text: PASS_TWO_SYSTEM_PROMPT }] },
      {
        role: 'user',
        parts: [
          { text: buildPassTwoUserPrompt(request.manualTitle, request.instructions, request.preferredStyle) },
          { text: JSON.stringify(request.sceneJson, null, 2) },
        ],
      },
    ]

    const result = await model.generateContent({ contents })
    const rawText = result.response.text() ?? ''
    const trimmed = rawText.trim()

    if (trimmed.startsWith('```')) {
      const threeCode = extractCodeFromBlock(trimmed)
      return { threeCode, rawText }
    }

    const json = parseJsonFromResponse(rawText)
    if (typeof json.threeCode !== 'string' || !json.threeCode.trim()) {
      throw new Error('Gemini did not return threeCode')
    }

    const threeCode = json.threeCode.startsWith('```') ? extractCodeFromBlock(json.threeCode) : json.threeCode
    return { threeCode, rawText }
  }

  async answerQuestion(request: QuestionAnswerRequest): Promise<QuestionAnswerResult> {
    const model = this.getModel(this.passOneModelName)

    const contents: Content[] = [
      { role: 'system', parts: [{ text: QA_SYSTEM_PROMPT }] },
      {
        role: 'user',
        parts: [
          { text: `Manual: ${request.manualTitle ?? 'Unknown manual'}` },
          { text: `Step summary: ${request.stepSummary ?? 'n/a'}` },
          { text: `Context:\n${request.context}` },
          { text: `Question: ${request.question}` },
        ],
      },
    ]

    const result = await model.generateContent({ contents })
    const rawText = result.response.text() ?? ''

    return { answer: rawText.trim(), rawText }
  }

  async embed(request: EmbeddingRequest): Promise<EmbeddingResult> {
    if (request.texts.length === 0) {
      return { vectors: [] }
    }

    const model = this.getModel(this.embeddingModelName)
    const embedContent = (model as unknown as {
      embedContent: (input: unknown) => Promise<{ embedding: { values: number[] } }>
    }).embedContent

    if (typeof embedContent !== 'function') {
      throw new Error('Selected Gemini embedding model does not support embedContent')
    }

    const vectors: number[][] = []
    for (const text of request.texts) {
      const response = await embedContent.call(model, {
        content: { parts: [{ text }] },
      })
      vectors.push(Array.from(response.embedding.values))
    }

    return { vectors }
  }

  private getModel(name: string): GenerativeModel {
    const cached = this.cache.get(name)
    if (cached) {
      return cached
    }
    const model = this.genAI.getGenerativeModel({ model: name })
    this.cache.set(name, model)
    return model
  }
}

function buildPassOneUserPrompt(manualTitle?: string, pageNo?: number, previous?: string, extra?: string): string {
  const lines = [
    manualTitle ? `Manual title: ${manualTitle}` : undefined,
    pageNo != null ? `Page number: ${pageNo}` : undefined,
    previous ? `Summary of previous step: ${previous}` : undefined,
    extra ? `Extra instructions: ${extra}` : undefined,
    'Return JSON that conforms to the schema.',
  ].filter(Boolean)
  return lines.join('\n')
}

function buildPassTwoUserPrompt(manualTitle?: string, instructions?: string[], preferredStyle?: CodegenRequest['preferredStyle']): string {
  const lines = [
    manualTitle ? `Manual title: ${manualTitle}` : undefined,
    instructions?.length ? `Instructions:\n${instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}` : undefined,
    preferredStyle ? `Preferred style: ${preferredStyle}` : undefined,
    'Generate production-ready Three.js code for the provided sceneJson.',
    'Respond with a single ```js``` code block that contains the full ES module.',
  ].filter(Boolean)
  return lines.join('\n')
}

async function resolveImageSource(source: GeminiImageSource): Promise<Part> {
  if (source.kind === 'base64') {
    return {
      inlineData: {
        data: source.data,
        mimeType: source.mimeType,
      },
    }
  }

  if (source.kind === 'dataUrl') {
    const match = /^data:(?<mime>.*?);base64,(?<data>.+)$/.exec(source.dataUrl)
    if (!match?.groups) {
      throw new Error('Invalid data URL provided')
    }
    const { mime, data } = match.groups
    return {
      inlineData: {
        data,
        mimeType: mime,
      },
    }
  }

  const response = await fetch(source.url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${source.url}: ${response.status}`)
  }
  const mimeType = response.headers.get('content-type') ?? 'image/png'
  const arrayBuffer = await response.arrayBuffer()
  const base64 = Buffer.from(arrayBuffer).toString('base64')
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  }
}

function parseJsonFromResponse(raw: string): any {
  const jsonBlock = extractJsonBlock(raw)
  try {
    return JSON.parse(jsonBlock)
  } catch (error) {
    throw new Error(`Failed to parse JSON from Gemini response: ${(error as Error).message}`)
  }
}

function extractJsonBlock(raw: string): string {
  const fenced = /```json\s*([\s\S]*?)```/i.exec(raw)
  if (fenced?.[1]) {
    return fenced[1].trim()
  }
  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return raw.slice(firstBrace, lastBrace + 1)
  }
  return raw.trim()
}

function extractCodeFromBlock(block: string): string {
  const match = /```(?:js|javascript)?\s*([\s\S]*?)```/i.exec(block)
  if (match?.[1]) {
    return match[1].trim()
  }
  return block.replace(/^```|```$/g, '').trim()
}
