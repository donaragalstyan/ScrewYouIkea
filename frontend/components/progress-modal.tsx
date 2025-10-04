"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles } from "lucide-react"

interface ProgressModalProps {
  open: boolean
  onComplete: () => void
}

export function ProgressModal({ open, onComplete }: ProgressModalProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!open) {
      setProgress(0)
      return
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => onComplete(), 500)
          return 100
        }

        // Random increment between 1-8 for fluctuating speed
        const increment = Math.random() * 7 + 1
        const newProgress = Math.min(prev + increment, 100)
        return newProgress
      })
    }, 200) // Update every 200ms

    return () => clearInterval(interval)
  }, [open, onComplete])

  const getStatusMessage = () => {
    if (progress < 20) return "Analyzing manual structure..."
    if (progress < 40) return "Detecting parts and components..."
    if (progress < 60) return "Generating assembly steps..."
    if (progress < 80) return "Creating 3D visualizations..."
    if (progress < 95) return "Finalizing animations..."
    return "Almost ready!"
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border" hideClose>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-secondary animate-pulse" />
            Generating Your Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-16 w-16 text-secondary animate-spin" />
          </div>

          <div className="space-y-3">
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getStatusMessage()}</span>
              <span className="font-semibold text-primary">{Math.round(progress)}%</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            This may take a few moments. Please don't close this window.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
