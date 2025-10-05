"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Loader2, Sparkles } from "lucide-react"
import { useIsClient } from "@/hooks/use-is-client"

// Dynamic import types
type ConvertedPage = {
  pageNumber: number
  imageDataUrl: string
  blob: Blob
}

type ConversionProgress = {
  currentPage: number
  totalPages: number
  percentage: number
  status: string
}

interface ProgressModalProps {
  open: boolean
  onComplete: (convertedPages?: ConvertedPage[], manualId?: string) => void
  file?: File | null
}

export function ProgressModal({ open, onComplete, file }: ProgressModalProps) {
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("Initializing...")
  const [isProcessing, setIsProcessing] = useState(false)
  const isClient = useIsClient()

  useEffect(() => {
    if (!open) {
      setProgress(0)
      setStatusMessage("Initializing...")
      setIsProcessing(false)
      return
    }

    if (!file) {
      // Fallback to original behavior if no file
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => onComplete(), 500)
            return 100
          }

          const increment = Math.random() * 7 + 1
          const newProgress = Math.min(prev + increment, 100)
          return newProgress
        })
      }, 200)

      return () => clearInterval(interval)
    }

    // Process PDF file
    const processPdf = async () => {
      if (isProcessing || !isClient) return
      
      setIsProcessing(true)
      
      try {
        // Check if file is PDF
        if (file.type === 'application/pdf') {
          setStatusMessage("Loading PDF conversion library...")
          setProgress(5)
          
          // Dynamic import of client-only PDF utilities
          const { convertPdfToJpgsClient } = await import('@/lib/pdf-utils-client')
          
          setStatusMessage("Processing PDF file...")
          setProgress(10)
          
          const convertedPages = await convertPdfToJpgsClient(file, (conversionProgress: ConversionProgress) => {
            setProgress(10 + (conversionProgress.percentage * 0.8)) // 10% to 90%
            setStatusMessage(conversionProgress.status)
          })
          
          setProgress(90)
          setStatusMessage("Processing converted images...")
          
          // Simulate some additional processing time
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          setProgress(100)
          setStatusMessage("Complete! Redirecting to viewer...")
          
          // Get the manual ID from localStorage to pass it along
          const manualId = localStorage.getItem('latestManualId')
          console.log("[PROGRESS-MODAL] Completing with manual ID:", manualId)
          
          setTimeout(() => {
            onComplete(convertedPages, manualId || undefined)
          }, 500)
          
        } else {
          // Handle non-PDF files (images)
          setStatusMessage("Processing image file...")
          for (let i = 0; i <= 100; i += 10) {
            setProgress(i)
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          setTimeout(() => onComplete(), 500)
        }
        
      } catch (error) {
        console.error('Error processing file:', error)
        setStatusMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`)
        setProgress(0)
        setTimeout(() => onComplete(), 3000)
      }
    }

    processPdf()
  }, [open, onComplete, file, isProcessing])

  const getDisplayMessage = () => {
    if (statusMessage !== "Initializing...") {
      return statusMessage
    }
    
    // Fallback messages for non-PDF files
    if (progress < 20) return "Analyzing manual structure..."
    if (progress < 40) return "Detecting parts and components..."
    if (progress < 60) return "Generating assembly steps..."
    if (progress < 80) return "Creating 3D visualizations..."
    if (progress < 95) return "Finalizing animations..."
    return "Almost ready!"
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-card border-border" showCloseButton={false}>
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
              <span className="text-muted-foreground">{getDisplayMessage()}</span>
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
