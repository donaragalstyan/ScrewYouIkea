"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, Clock, Sparkles } from "lucide-react"

interface ExtractionStatus {
  manualId: string
  isExtracting: boolean
  currentPage: number
  totalPages: number
  extractedPages: number[]
  completedPages: { [key: number]: any }
  error?: string
}

interface LiveExtractionViewerProps {
  manualId: string
  onExtractionComplete?: (extractedSteps: any[]) => void
}

export function LiveExtractionViewer({ manualId, onExtractionComplete }: LiveExtractionViewerProps) {
  const [status, setStatus] = useState<ExtractionStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/extraction-status?manualId=${manualId}`)
        const data = await response.json()
        setStatus(data)
        setLoading(false)

        // If extraction is complete, notify parent
        if (!data.isExtracting && data.extractedPages.length > 0 && onExtractionComplete) {
          const extractedSteps = Object.values(data.completedPages)
          onExtractionComplete(extractedSteps)
        }
      } catch (error) {
        console.error('Error fetching extraction status:', error)
        setLoading(false)
      }
    }

    // Fetch immediately
    fetchStatus()

    // Poll every 2 seconds while extracting
    intervalId = setInterval(() => {
      if (status?.isExtracting !== false) {
        fetchStatus()
      }
    }, 2000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [manualId, status?.isExtracting, onExtractionComplete])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading extraction status...</p>
        </div>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-muted-foreground">No extraction status available</p>
        </div>
      </div>
    )
  }

  const pages = Array.from({ length: status.totalPages }, (_, i) => i + 1)
  const progressPercentage = status.totalPages > 0 ? (status.extractedPages.length / status.totalPages) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with overall progress */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          {status.isExtracting ? (
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          ) : (
            <CheckCircle className="h-6 w-6 text-green-500" />
          )}
          <h2 className="text-xl font-semibold">
            {status.isExtracting ? 'Extracting Assembly Steps...' : 'Extraction Complete!'}
          </h2>
          <Sparkles className="h-5 w-5 text-secondary" />
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress: {status.extractedPages.length} of {status.totalPages} pages</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {status.isExtracting && (
          <p className="text-sm text-muted-foreground mt-2">
            Currently processing page {status.currentPage}...
          </p>
        )}
      </div>

      {/* Grid of pages */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {pages.map(pageNo => {
          const isCompleted = status.extractedPages.includes(pageNo)
          const isCurrently = status.currentPage === pageNo && status.isExtracting
          const pageData = status.completedPages[pageNo]

          return (
            <Card 
              key={pageNo}
              className={`relative aspect-square transition-all duration-300 ${
                isCompleted 
                  ? 'border-green-500 bg-green-500/10 shadow-lg' 
                  : isCurrently
                  ? 'border-primary bg-primary/10 shadow-md animate-pulse'
                  : 'border-muted bg-muted/50'
              }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                <div className="text-lg font-bold mb-2">
                  Page {pageNo}
                </div>

                {isCompleted ? (
                  <div className="text-center space-y-1">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto" />
                    <Badge variant="secondary" className="text-xs">
                      Complete
                    </Badge>
                    {pageData?.parts && (
                      <div className="text-xs text-muted-foreground">
                        {pageData.parts.length} parts
                      </div>
                    )}
                    {pageData?.instructions && (
                      <div className="text-xs text-muted-foreground">
                        {pageData.instructions.length} steps
                      </div>
                    )}
                  </div>
                ) : isCurrently ? (
                  <div className="text-center space-y-1">
                    <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    <Badge variant="outline" className="text-xs">
                      Processing...
                    </Badge>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <Clock className="h-6 w-6 text-muted-foreground mx-auto" />
                    <Badge variant="outline" className="text-xs opacity-50">
                      Waiting
                    </Badge>
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Completion message */}
      {!status.isExtracting && status.extractedPages.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-green-800 mb-1">
            All Steps Extracted Successfully!
          </h3>
          <p className="text-sm text-green-600">
            Your manual is ready with {status.extractedPages.length} interactive assembly steps.
          </p>
        </div>
      )}

      {status.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{status.error}</p>
        </div>
      )}
    </div>
  )
}