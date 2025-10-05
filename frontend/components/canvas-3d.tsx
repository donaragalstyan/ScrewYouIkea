"use client"

import { Card } from "@/components/ui/card"
import { VoiceAssistantInput } from "@/components/voice-assistant-input"
import { ThreeRunner } from "@/components/three-runner"
import { manualSteps } from "@/lib/manual-steps"

interface SceneJson {
  camera: {
    type: string
    position: number[]
    target: number[]
  }
  parts: Array<{
    id: string
    type: string
    dimensions: any
    position: number[]
    rotation?: number[]
    style: {
      line: string
      fill: string
      edgeWidth: number
    }
  }>
  assemblies: Array<{
    action: string
    from: string
    to: string
    position: number[]
  }>
  timeline: Array<{
    t: number
    action: string
    target: string
    to?: number[]
  }>
}

interface Canvas3DProps {
  currentStep: number
  sceneData?: SceneJson | null
  stepCode?: string
  stepTitle?: string
  isExtracting?: boolean
}

export function Canvas3D({ currentStep, sceneData, stepCode, stepTitle, isExtracting = false }: Canvas3DProps) {
  const step = manualSteps[currentStep]
  const hasSceneData = Boolean(sceneData)
  const codeToRun = stepCode ?? step?.threeCode
  const derivedTitle = stepTitle ?? step?.title ?? (hasSceneData ? 'AI-Generated 3D Scene' : undefined)

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="relative flex h-full w-full max-h-[calc(100vh-160px)] max-w-5xl flex-col overflow-hidden border-2 border-secondary bg-white">
          {hasSceneData ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="text-center p-8">
                <div className="text-2xl mb-4">🔧</div>
                <h3 className="text-lg font-semibold mb-2">3D Assembly Visualization</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  AI-extracted 3D scene data available for this step
                </p>
                <pre className="text-xs bg-muted p-3 rounded max-h-32 overflow-y-auto text-left">
                  {JSON.stringify(sceneData, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            codeToRun ? (
              <div className="flex-1 min-h-0">
                <ThreeRunner code={codeToRun} stepKey={currentStep} />
              </div>
            ) : (
              <div className="flex h-full flex-1 items-center justify-center">
                <p className="text-muted-foreground text-sm">Interactive preview not available for this step.</p>
              </div>
            )
          )}

          <div className="absolute left-4 top-4 flex max-w-[75%] flex-col gap-1 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-medium text-foreground backdrop-blur-sm">
            <span className="uppercase tracking-wide text-muted-foreground">
              Step {currentStep + 1}
              {isExtracting && (
                <span className="ml-2 inline-flex items-center text-xs">
                  <div className="animate-spin rounded-full h-2 w-2 border-b border-gray-600 mr-1"></div>
                  Extracting...
                </span>
              )}
            </span>
            {isExtracting ? (
              <span className="text-sm text-muted-foreground">Analyzing 3D structure...</span>
            ) : (
              <span className="text-sm text-foreground">
                {derivedTitle || 'Interactive preview'}
              </span>
            )}
          </div>

          <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-lg bg-card/90 px-3 py-1 text-xs text-muted-foreground shadow">
            <span>Drag to rotate</span>
            <span className="text-muted-foreground/60">•</span>
            <span>Scroll to zoom</span>
          </div>
        </Card>
      </div>

      <VoiceAssistantInput />
    </div>
  )
}
