"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ManualDetail } from "@/lib/manual-types"

interface PartsPanelProps {
  currentStep: number
  manual?: ManualDetail
}

export function PartsPanel({ currentStep, manual }: PartsPanelProps) {
  const partsCatalog = manual?.partsCatalog ?? []
  const activePartIds = useMemo(() => {
    const step = manual?.stepsData[currentStep]
    if (!step?.partsUsed) return new Set<string>()
    return new Set(step.partsUsed.map((part) => part.partId))
  }, [manual, currentStep])

  if (partsCatalog.length === 0) {
    return (
      <div className="bg-primary/5 p-4">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-primary">Parts & Tools</h2>
        <div className="rounded-lg border border-dashed border-border bg-card/70 p-6 text-center text-sm text-muted-foreground">
          No parts data available for this step.
        </div>
      </div>
    )
  }

  const activeCount = partsCatalog.filter((part) => activePartIds.has(part.id)).length

  return (
    <div className="bg-primary/5 p-4">
      <div className="mb-4">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-primary">Parts & Tools</h2>
        <p className="text-xs text-muted-foreground">
          {activeCount} item{activeCount === 1 ? "" : "s"} needed for this step
        </p>
      </div>

      <div className="space-y-3">
        {partsCatalog.map((part) => {
          const isActive = activePartIds.has(part.id)

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
                    src={part.imageUrl || "/placeholder.svg"}
                    alt={part.name || part.id}
                    className="h-full w-full object-contain p-2"
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs font-mono border-primary text-primary">
                      {part.id}
                    </Badge>
                    {part.quantity != null && (
                      <Badge variant="secondary" className="text-xs font-bold">
                        ×{part.quantity}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-sm font-medium leading-tight text-foreground">{part.name || "Unnamed part"}</h3>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
