export type ManualStatus = "completed" | "processing" | "failed"

export interface ManualSummary {
  id: string
  title: string
  status: ManualStatus
  thumbnail: string
  steps: number
  parts: number
  uploadedAt: string
  description?: string
}

export interface ManualPartDefinition {
  id: string
  name?: string
  quantity?: number
  imageUrl?: string
  type?: string
  material?: string
}

export interface ManualStepPartUsage {
  partId: string
  quantity?: number
  note?: string
}

export interface ManualToolDefinition {
  id?: string
  name: string
  imageUrl?: string
}

export interface ManualStepData {
  index: number
  title: string
  imageUrl: string
  instructions: string[]
  warnings?: string[]
  threeCode?: string
  sceneJson?: unknown
  partsUsed?: ManualStepPartUsage[]
  toolsUsed?: ManualToolDefinition[]
}

export interface ManualDetail extends ManualSummary {
  stepsData: ManualStepData[]
  partsCatalog?: ManualPartDefinition[]
  toolsCatalog?: ManualToolDefinition[]
}
