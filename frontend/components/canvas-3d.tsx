"use client"

import { Card } from "@/components/ui/card"
import { VoiceAssistantInput } from "@/components/voice-assistant-input"
import { ThreeRunner } from "@/components/three-runner"
import type { ManualStepData } from "@/lib/manual-types"

interface Canvas3DProps {
  currentStep: number
  step?: ManualStepData
  manualTitle?: string
}

export function Canvas3D({ currentStep, step, manualTitle }: Canvas3DProps) {
  const canRender = Boolean(step?.threeCode)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center p-8">
        <Card className="relative aspect-square w-full max-w-2xl overflow-hidden border-2 border-secondary bg-white">
          <ThreeRunner code={step?.threeCode} stepKey={currentStep} />

          <div className="absolute left-4 top-4 flex max-w-[75%] flex-col gap-1 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
            <span className="uppercase tracking-wide text-muted-foreground">Step {currentStep + 1}</span>
            {step?.title && <span className="text-sm text-foreground">{step.title}</span>}
            {manualTitle && <span className="text-xs text-muted-foreground">{manualTitle}</span>}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-card/90 px-3 py-1 text-xs text-muted-foreground shadow">
            <span>Drag to rotate</span>
            <span className="text-muted-foreground/60">•</span>
            <span>Scroll to zoom</span>
          </div>

          {!canRender && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/85 text-sm text-muted-foreground">
              No 3D preview available for this step yet.
            </div>
          )}
        </Card>
      </div>

      <VoiceAssistantInput />
    </div>
  )
}
