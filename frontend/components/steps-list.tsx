"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { ManualStepData } from "@/lib/manual-types"

interface StepsListProps {
  steps: ManualStepData[]
  currentStep: number
  onStepChange: (step: number) => void
}

export function StepsList({ steps, currentStep, onStepChange }: StepsListProps) {
  const safeSteps = useMemo(() => steps ?? [], [steps])

  if (safeSteps.length === 0) {
    return (
      <div className="bg-primary/5 p-4">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Assembly Steps</h2>
        <div className="rounded-lg border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
          No step images available yet.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Assembly Steps</h2>

      <div className="space-y-2">
        {safeSteps.map((step) => (
          <Card
            key={step.index}
            className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
              currentStep === step.index
                ? "border-2 border-secondary bg-secondary/20 ring-2 ring-secondary"
                : "border border-border"
            }`}
            onClick={() => onStepChange(step.index)}
          >
            <div className="flex gap-3 p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                <img
                  src={step.imageUrl || "/placeholder.svg"}
                  alt={step.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {step.index + 1}
                  </Badge>
                  {step.warnings && step.warnings.length > 0 && (
                    <AlertTriangle className="h-3 w-3 text-secondary" />
                  )}
                </div>
                <h3 className="text-sm font-medium leading-tight text-foreground">{step.title}</h3>
                {step.warnings && step.warnings.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{step.warnings[0]}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
