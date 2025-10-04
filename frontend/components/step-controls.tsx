"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react"
import { useState } from "react"

interface StepControlsProps {
  currentStep: number
  totalSteps: number
  onStepChange: (step: number) => void
}

export function StepControls({ currentStep, totalSteps, onStepChange }: StepControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1])

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      onStepChange(currentStep + 1)
    }
  }

  const handleFirst = () => {
    onStepChange(0)
  }

  const handleLast = () => {
    onStepChange(totalSteps - 1)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    onStepChange(0)
    setIsPlaying(false)
  }

  return (
    <div className="flex items-center gap-6 bg-primary p-4 rounded-lg">
      {/* Playback Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFirst}
          disabled={currentStep === 0}
          className="text-white hover:bg-secondary hover:text-secondary-foreground"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="text-white hover:bg-secondary hover:text-secondary-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button variant="secondary" size="icon" className="h-10 w-10" onClick={handlePlayPause}>
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNext}
          disabled={currentStep === totalSteps - 1}
          className="text-white hover:bg-secondary hover:text-secondary-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLast}
          disabled={currentStep === totalSteps - 1}
          className="text-white hover:bg-secondary hover:text-secondary-foreground"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="mx-2 h-6 w-px bg-secondary" />

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          className="text-white hover:bg-secondary hover:text-secondary-foreground"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Progress Indicator */}
      <div className="flex flex-1 items-center gap-4">
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between text-xs text-white/80">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-primary-foreground/20">
            <div
              className="h-full bg-secondary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Speed Control */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/80">Speed</span>
        <div className="w-24">
          <Slider value={speed} onValueChange={setSpeed} min={0.5} max={2} step={0.25} className="cursor-pointer" />
        </div>
        <span className="w-8 text-sm font-medium text-white">{speed[0]}×</span>
      </div>
    </div>
  )
}
