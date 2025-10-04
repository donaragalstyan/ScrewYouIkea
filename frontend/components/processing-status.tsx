"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Loader2, FileText, Scan, Sparkles, Boxes, ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

interface ProcessingStatusProps {
  manualId: string
}

const processingSteps = [
  {
    id: "upload",
    label: "File Upload",
    description: "Receiving and validating manual files",
    icon: FileText,
  },
  {
    id: "preprocess",
    label: "Preprocessing",
    description: "Converting PDF to images and normalizing",
    icon: Scan,
  },
  {
    id: "ai-analysis",
    label: "AI Analysis",
    description: "Extracting parts, steps, and instructions",
    icon: Sparkles,
  },
  {
    id: "3d-generation",
    label: "3D Generation",
    description: "Creating 3D models and animations",
    icon: Boxes,
  },
]

export function ProcessingStatus({ manualId }: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  // Simulate processing progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true)
          clearInterval(interval)
          return 100
        }
        return prev + 2
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stepProgress = Math.floor(progress / 25)
    setCurrentStep(Math.min(stepProgress, processingSteps.length - 1))
  }, [progress])

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold">Processing Manual</h1>
        <p className="text-muted-foreground">
          {isComplete ? "Your manual is ready to view!" : "AI is analyzing your assembly manual..."}
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Processing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">
                {isComplete ? "Complete" : `Step ${currentStep + 1} of ${processingSteps.length}`}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-4">
            {processingSteps.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index === currentStep && !isComplete
              const isDone = index < currentStep || isComplete

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    isActive
                      ? "border-primary bg-primary/5"
                      : isDone
                        ? "border-border bg-muted/30"
                        : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                      isDone
                        ? "bg-primary text-primary-foreground"
                        : isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-1 font-semibold">{step.label}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {isComplete && (
        <div className="flex justify-center">
          <Link href={`/viewer/${manualId}`}>
            <Button size="lg" className="gap-2">
              View 3D Manual
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {!isComplete && (
        <div className="rounded-lg border border-border bg-muted/30 p-4 text-center text-sm text-muted-foreground">
          This process typically takes 2-5 minutes depending on manual complexity
        </div>
      )}
    </div>
  )
}
