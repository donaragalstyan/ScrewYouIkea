"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ExtractedStep {
  pageNo: number
  sceneJson: any
  instructions: string[]
  parts: Array<{
    id: string
    name: string
    type: string
    quantity: number
  }>
  tools: Array<{
    name: string
  }>
  rawText: string
  imagePath: string
}

interface PartsPanelProps {
  currentStep: number
  extractedSteps?: ExtractedStep[]
  isExtracting?: boolean
}

const parts = [
  {
    id: "A",
    name: "Side frame",
    count: 2,
    sprite: "/part-a-side-frame.jpg",
    usedInStep: [1, 2],
  },
  {
    id: "B",
    name: "Shelf panel",
    count: 4,
    sprite: "/part-b-shelf-panel.jpg",
    usedInStep: [3, 4, 5],
  },
  {
    id: "C",
    name: "Back panel",
    count: 1,
    sprite: "/part-c-back-panel.jpg",
    usedInStep: [6],
  },
  {
    id: "D",
    name: "Leg",
    count: 4,
    sprite: "/part-d-leg.jpg",
    usedInStep: [1],
  },
  {
    id: "S1",
    name: "Screw M6",
    count: 16,
    sprite: "/part-s1-screw.jpg",
    usedInStep: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: "S2",
    name: "Washer",
    count: 16,
    sprite: "/part-s2-washer.jpg",
    usedInStep: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: "T1",
    name: "Allen key",
    count: 1,
    sprite: "/part-t1-allen-key.jpg",
    usedInStep: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: "T2",
    name: "Wrench",
    count: 1,
    sprite: "/part-t2-wrench.jpg",
    usedInStep: [7],
  },
]

export function PartsPanel({ currentStep, extractedSteps, isExtracting = false }: PartsPanelProps) {
  // Use extracted steps if available, otherwise fall back to manual parts
  const currentExtractedStep = extractedSteps?.[currentStep]
  const isExtracted = Boolean(extractedSteps && currentExtractedStep)
  
  let displayParts: any[] = []
  let displayTools: any[] = []
  let activeParts: any[] = []

  if (isExtracted && currentExtractedStep) {
    // Use extracted parts and tools
    displayParts = currentExtractedStep.parts.map(part => ({
      id: part.id,
      name: part.name,
      count: part.quantity,
      sprite: "/placeholder.svg", // No sprite available for extracted parts
      isActive: true
    }))
    
    displayTools = currentExtractedStep.tools.map((tool, index) => ({
      id: `T${index + 1}`,
      name: tool.name,
      count: 1,
      sprite: "/placeholder.svg", // No sprite available for extracted tools
      isActive: true
    }))
    
    activeParts = [...displayParts, ...displayTools]
  } else if (isExtracting) {
    // If currently extracting this step, show empty arrays (loading state)
    displayParts = []
    displayTools = []
    activeParts = []
  } else {
    // Use manual parts
    activeParts = parts.filter((part) => part.usedInStep.includes(currentStep))
    displayParts = parts
  }

  return (
    <div className="p-4 bg-primary/5">
      <div className="mb-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">
          Parts & Tools 
          {isExtracted && <Badge variant="secondary" className="ml-2">AI-Generated</Badge>}
          {isExtracting && (
            <span className="ml-2 inline-flex items-center text-xs normal-case">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
              Loading...
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground">
          {isExtracting && activeParts.length === 0 
            ? "Loading items for this step..." 
            : `${activeParts.length} items needed for this step`
          }
        </p>
      </div>

      <div className="space-y-3">
        {isExtracting && activeParts.length === 0 ? (
          // Show loading state when extracting
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-muted-foreground">Extracting parts and tools for this step...</p>
          </div>
        ) : (
          (isExtracted ? activeParts : displayParts).map((part) => {
            const isActive = isExtracted ? part.isActive : part.usedInStep.includes(currentStep)

            return (
              <Card
                key={part.id}
                className={`overflow-hidden transition-all ${
                  isActive
                    ? "border-2 border-secondary bg-secondary/20 ring-2 ring-secondary"
                    : "border border-border opacity-50"
                }`}
              >
                <div className="flex gap-3 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-secondary/30">
                    <img
                      src={part.sprite || "/placeholder.svg"}
                      alt={part.name}
                      className="h-full w-full object-contain p-2"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-mono border-primary text-primary">
                        {part.id}
                      </Badge>
                      <Badge variant="secondary" className="text-xs font-bold">
                        ×{part.count}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium leading-tight text-foreground">{part.name}</h3>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
