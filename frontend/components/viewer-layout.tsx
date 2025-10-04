"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Settings } from "lucide-react"
import Link from "next/link"
import { Canvas3D } from "@/components/canvas-3d"
import { StepsList } from "@/components/steps-list"
import { PartsPanel } from "@/components/parts-panel"
import type { ManualDetail } from "@/lib/manual-types"

interface ViewerLayoutProps {
  manualId: string
}

export function ViewerLayout({ manualId }: ViewerLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [manual, setManual] = useState<ManualDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setIsLoading(true)
    setError(null)
    setManual(null)
    setCurrentStep(0)

    const controller = new AbortController()

    fetch(`/api/manuals/${manualId}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load manual: ${response.status}`)
        }
        return response.json()
      })
      .then((data: ManualDetail) => {
        if (!active) return
        setManual(data)
        setIsLoading(false)
      })
      .catch((err) => {
        if (!active) return
        if (err.name === "AbortError") return
        console.error("Failed to load manual", err)
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [manualId])

  const steps = manual?.stepsData ?? []
  const safeStepIndex = useMemo(() => {
    if (steps.length === 0) return 0
    return Math.min(currentStep, steps.length - 1)
  }, [steps, currentStep])

  useEffect(() => {
    if (currentStep !== safeStepIndex) {
      setCurrentStep(safeStepIndex)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeStepIndex])

  const activeStep = steps[safeStepIndex]
  const headerTitle = manual?.title ?? "Manual Viewer"
  const headerMeta = manual ? `${manual.steps} steps • ${manual.parts} parts` : ""

  const content = (() => {
    if (isLoading) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          Loading manual…
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="max-w-md rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
            <p className="mb-2 font-semibold">Unable to load this manual.</p>
            <p className="text-xs opacity-80">{error}</p>
          </div>
        </div>
      )
    }

    if (!manual || steps.length === 0) {
      return (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          No steps available for this manual yet.
        </div>
      )
    }

    return (
      <Canvas3D currentStep={safeStepIndex} step={activeStep} manualTitle={manual.title} />
    )
  })()

  return (
    <div className="flex h-screen flex-col bg-primary">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-center gap-4">
          <Link href="/library">
            <Button variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="font-semibold">{headerTitle}</h1>
            {headerMeta && <p className="text-xs text-muted-foreground">{headerMeta}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Steps */}
        <aside className="w-80 border-r border-border bg-card overflow-y-auto">
          <StepsList steps={steps} currentStep={safeStepIndex} onStepChange={setCurrentStep} />
        </aside>

        {/* Center - 3D Canvas */}
        <main className="flex flex-1 flex-col">
          <div className="relative flex-1 overflow-y-auto bg-primary/20">
            {content}
          </div>
        </main>

        {/* Right Sidebar - Parts */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <PartsPanel currentStep={safeStepIndex} manual={manual ?? undefined} />
        </aside>
      </div>
    </div>
  )
}
