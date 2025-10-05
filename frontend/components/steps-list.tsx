"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { manualSteps } from "@/lib/manual-steps"

interface ExtractedStep {
  pageNo: number
  sceneJson: any
  instructions: string[]
  parts: Array<{
    id: string
    name: string
    type: string
    quantity: number
    image?: string
  }>
  tools: Array<{
    name: string
    image?: string
  }>
  rawText: string
  imagePath: string
  title?: string
  threeCode?: string
}

interface StepsListProps {
  currentStep: number
  onStepChange: (step: number) => void
  extractedSteps?: ExtractedStep[]
  isExtracting?: boolean
  extractionProgress?: {
    currentPage: number
    totalPages: number
    extractedPages: number[]
  }
}

export function StepsList({ currentStep, onStepChange, extractedSteps, isExtracting, extractionProgress }: StepsListProps) {
  // Use extracted steps if available, otherwise fall back to manual steps
  const steps = extractedSteps ? extractedSteps : manualSteps
  const isExtracted = Boolean(extractedSteps)

  // Create a combined list that includes extracted steps + loading preview
  const renderSteps = () => {
    if (isExtracting && extractedSteps && extractionProgress) {
      // Show extracted steps + loading preview for next step
      const stepsToShow = [...extractedSteps]
      
      // Calculate the next page that should be processed
      // This should be the page after the last extracted page
      const lastExtractedPage = extractedSteps.length > 0 
        ? Math.max(...extractedSteps.map(step => step.pageNo))
        : 0
      const nextPageToProcess = lastExtractedPage + 1
      
      // Add a loading step for the next page being processed
      if (nextPageToProcess <= extractionProgress.totalPages) {
        const nextStepIndex = stepsToShow.length
        stepsToShow.push({
          pageNo: nextPageToProcess,
          sceneJson: { camera: { type: "orthographic", position: [0,0,0], target: [0,0,0] }, parts: [], assemblies: [], timeline: [] },
          instructions: [`Extracting page ${nextPageToProcess}...`],
          parts: [],
          tools: [],
          rawText: "",
          imagePath: "/placeholder.svg"
        } as ExtractedStep)
      }
      
      return stepsToShow
    }
    
    return steps
  }

  const stepsToDisplay = renderSteps()

  return (
    <div className="bg-primary/5 p-4">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary">
        Assembly Steps 
        {isExtracted && <Badge variant="secondary" className="ml-2">AI-Generated</Badge>}
        {isExtracting && <Badge variant="outline" className="ml-2">Loading...</Badge>}
      </h2>

      <div className="space-y-2">
        {isExtracting && !extractedSteps ? (
          // Show loading state when extracting
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Extracting assembly steps...</p>
            </div>
          </div>
        ) : (
          stepsToDisplay.map((step, index) => {
          // Handle both extracted steps and manual steps
          const stepIndex = isExtracted ? index : (step as any).index
          const extractedStep = step as ExtractedStep
          const stepTitle = isExtracted 
            ? extractedStep.title || `Step ${index + 1}` 
            : (step as any).title
          const stepThumbnail = isExtracted 
            ? (extractedStep.imagePath || (extractedStep as any).image)
            : (step as any).thumbnail
          const stepWarnings = isExtracted ? [] : (step as any).warnings || []
          const stepInstructions = isExtracted 
            ? (step as ExtractedStep).instructions 
            : []
            
          // Check if this is a loading step
          const isLoadingStep = isExtracting && extractionProgress && 
            index === stepsToDisplay.length - 1 && 
            (step as ExtractedStep).instructions?.[0]?.includes('Extracting page')

          return (
            <Card
              key={stepIndex}
              className={`cursor-pointer overflow-hidden transition-all hover:shadow-md ${
                isLoadingStep 
                  ? "border-2 border-orange-300 bg-orange-50 animate-pulse"
                  : currentStep === stepIndex
                  ? "border-2 border-secondary bg-secondary/20 ring-2 ring-secondary"
                  : "border border-border"
              }`}
              onClick={() => !isLoadingStep && onStepChange(stepIndex)}
            >
              <div className="flex gap-3 p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded bg-muted">
                  {isLoadingStep ? (
                    <div className="flex items-center justify-center h-full w-full bg-orange-100">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    <img
                      src={stepThumbnail || "/placeholder.svg"}
                      alt={stepTitle}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <Badge 
                      variant={isLoadingStep ? "outline" : "secondary"} 
                      className={`text-xs font-bold ${isLoadingStep ? 'border-orange-300 text-orange-600' : ''}`}
                    >
                      {stepIndex + 1}
                    </Badge>
                    {isLoadingStep && <Badge variant="outline" className="text-xs border-orange-300 text-orange-600">Extracting...</Badge>}
                    {stepWarnings.length > 0 && <AlertTriangle className="h-3 w-3 text-secondary" />}
                  </div>
                  <h3 className={`text-sm font-medium leading-tight ${isLoadingStep ? 'text-orange-700' : 'text-foreground'}`}>
                    {stepTitle}
                  </h3>
                  {isExtracted && stepInstructions.length > 0 && (
                    <p className={`mt-1 text-xs ${isLoadingStep ? 'text-orange-600' : 'text-muted-foreground'}`}>
                      {stepInstructions[0]}
                    </p>
                  )}
                  {stepWarnings.length > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">{stepWarnings[0]}</p>
                  )}
                </div>
              </div>
            </Card>
          )
        }))}
      </div>
    </div>
  )
}
