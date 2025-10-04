"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface StepsListProps {
  currentStep: number
  onStepChange: (step: number) => void
}

const steps = [
  {
    index: 0,
    title: "Prepare workspace",
    thumbnail: "/step-1-prepare-workspace.jpg",
    warnings: ["Ensure flat surface"],
  },
  {
    index: 1,
    title: "Attach legs to frame",
    thumbnail: "/step-2-attach-legs.jpg",
    warnings: [],
  },
  {
    index: 2,
    title: "Install side panels",
    thumbnail: "/step-3-side-panels.jpg",
    warnings: ["Do not overtighten"],
  },
  {
    index: 3,
    title: "Secure bottom shelf",
    thumbnail: "/step-4-bottom-shelf.jpg",
    warnings: [],
  },
  {
    index: 4,
    title: "Add middle shelf",
    thumbnail: "/step-5-middle-shelf.jpg",
    warnings: [],
  },
  {
    index: 5,
    title: "Install top shelf",
    thumbnail: "/step-6-top-shelf.jpg",
    warnings: [],
  },
  {
    index: 6,
    title: "Attach back panel",
    thumbnail: "/step-7-back-panel.jpg",
    warnings: ["Align carefully"],
  },
  {
    index: 7,
    title: "Secure all fasteners",
    thumbnail: "/step-8-secure-fasteners.jpg",
    warnings: [],
  },
  {
    index: 8,
    title: "Check stability",
    thumbnail: "/step-9-check-stability.jpg",
    warnings: ["Test before loading"],
  },
  {
    index: 9,
    title: "Final adjustments",
    thumbnail: "/step-10-adjustments.jpg",
    warnings: [],
  },
  {
    index: 10,
    title: "Clean up",
    thumbnail: "/step-11-cleanup.jpg",
    warnings: [],
  },
  {
    index: 11,
    title: "Complete",
    thumbnail: "/step-12-complete.jpg",
    warnings: [],
  },
]

export function StepsList({ currentStep, onStepChange }: StepsListProps) {
  return (
    <div className="p-4 bg-primary/5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">Assembly Steps</h2>

      <div className="space-y-2">
        {steps.map((step) => (
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
                  src={step.thumbnail || "/placeholder.svg"}
                  alt={step.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs font-bold">
                    {step.index + 1}
                  </Badge>
                  {step.warnings.length > 0 && <AlertTriangle className="h-3 w-3 text-secondary" />}
                </div>
                <h3 className="text-sm font-medium leading-tight text-foreground">{step.title}</h3>
                {step.warnings.length > 0 && <p className="mt-1 text-xs text-muted-foreground">{step.warnings[0]}</p>}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
