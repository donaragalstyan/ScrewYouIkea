"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Settings } from "lucide-react"
import Link from "next/link"
import { Canvas3D } from "@/components/canvas-3d"
import { StepsList } from "@/components/steps-list"
import { PartsPanel } from "@/components/parts-panel"

interface ViewerLayoutProps {
  manualId: string
}

export function ViewerLayout({ manualId }: ViewerLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

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
            <h1 className="font-semibold">BROR Shelf Unit</h1>
            <p className="text-xs text-muted-foreground">12 steps • 8 parts</p>
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
          <StepsList currentStep={currentStep} onStepChange={setCurrentStep} />
        </aside>

        {/* Center - 3D Canvas */}
        <main className="flex flex-1 flex-col">
          <div className="relative flex-1 overflow-y-auto bg-primary/20">
            <Canvas3D currentStep={currentStep} />
          </div>
        </main>

        {/* Right Sidebar - Parts */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <PartsPanel currentStep={currentStep} />
        </aside>
      </div>
    </div>
  )
}
