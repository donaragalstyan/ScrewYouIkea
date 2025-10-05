"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Settings } from "lucide-react"
import Link from "next/link"
import { Canvas3D } from "@/components/canvas-3d"
import { StepsList } from "@/components/steps-list"
import { PartsPanel } from "@/components/parts-panel"

interface Part {
  id: string
  name: string
  type: string
  quantity: number
}

interface Tool {
  name: string
}

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

interface ExtractedStep {
  pageNo: number
  sceneJson: SceneJson
  instructions: string[]
  parts: Part[]
  tools: Tool[]
  rawText: string
  imagePath: string
}

interface LibraryItem {
  id: string
  manualName: string
  originalFilename: string
  pages: string[]
  totalPages: number
  createdAt: string
  thumbnail: string
  steps?: ExtractedStep[]
  extractedAt?: string
}

interface ViewerLayoutProps {
  manualId: string
}

export function ViewerLayout({ manualId }: ViewerLayoutProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [manualData, setManualData] = useState<LibraryItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionStarted, setExtractionStarted] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<{
    currentPage: number
    totalPages: number
    extractedPages: number[]
  } | null>(null)

  useEffect(() => {
    const fetchManualData = async () => {
      try {
        const response = await fetch('/api/add-to-library')
        const data = await response.json()
        
        // Extract the ID from the manualId (remove 'converted_' prefix)
        const actualId = manualId.replace('converted_', '')
        
        // Find the manual in the library
        const manual = data.library.find((item: LibraryItem) => item.id === actualId)
        
        if (manual) {
          console.log('📚 Manual found:', {
            id: manual.id,
            name: manual.manualName,
            hasSteps: !!manual.steps,
            stepsLength: manual.steps?.length || 0
          })
          setManualData(manual)
          // Check if extraction is needed (no steps yet)
          if (!manual.steps || manual.steps.length === 0) {
            if (!extractionStarted) {
              console.log('🚀 No steps found, starting extraction...')
              setIsExtracting(true)
              setExtractionStarted(true)
              // Start step extraction for this manual
              startStepExtraction(manual)
              
              // Also start polling immediately as a fallback
              console.log('🔄 Starting fallback polling...')
              setTimeout(() => startPollingExtractionStatus(), 2000)
            } else {
              console.log('🔄 Extraction already started, skipping duplicate call')
              // Make sure polling is running even if extraction was already started
              console.log('🔄 Ensuring polling is active...')
              setTimeout(() => startPollingExtractionStatus(), 1000)
            }
          } else {
            console.log('✅ Manual already has steps, no extraction needed')
          }
        } else {
          console.error('Manual not found:', manualId)
        }
        
      } catch (error) {
        console.error('Error fetching manual data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchManualData()
  }, [manualId]) // Only run when manualId changes

  const startStepExtraction = async (manual: LibraryItem) => {
    console.log('🚀 Starting step extraction for manual:', manual.manualName)
    
    try {
      console.log('📡 Making API call to /api/start-extraction...')
      // Call the start-extraction API which will handle the extraction process
      const response = await fetch('/api/start-extraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manualId: manualId
        })
      })

      console.log('📡 API response received, status:', response.status)

      if (response.ok) {
        console.log('✅ Step extraction started successfully')
        console.log('🎯 About to start polling...')
        // Start polling for extraction status
        startPollingExtractionStatus()
        console.log('🎯 Polling function called!')
      } else {
        console.log('❌ API response not OK, status:', response.status)
        console.log('🔄 Starting polling anyway since backend might be working...')
        // Start polling anyway - the backend might be processing even if the API failed
        startPollingExtractionStatus()
        const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }))
        console.error('❌ Failed to start step extraction:', error)
      }
    } catch (error) {
      console.error('💥 Error starting step extraction:', error)
      console.error('💥 Error details:', error instanceof Error ? error.message : 'Unknown error')
      console.log('🔄 Starting polling anyway since backend might be working...')
      // Start polling anyway - the backend might be processing even if the API failed
      startPollingExtractionStatus()
    }
  }

  const startPollingExtractionStatus = () => {
    console.log('🎯 Starting polling for manual:', manualId, 'at', new Date().toLocaleTimeString())
    const pollInterval = setInterval(async () => {
      try {
        console.log('🔄 [POLL] Checking status for:', manualId, 'at', new Date().toLocaleTimeString())
        
        // First, try to get extraction status
        let hasExtractionStatus = false
        try {
          const response = await fetch(`/api/extraction-status?manualId=${manualId}`)
          if (response.ok) {
            const rawStatusText = await response.text()
            console.log('📄 RAW extraction status response:', rawStatusText)
            
            const status = JSON.parse(rawStatusText)
            console.log('📊 Parsed extraction status:', JSON.stringify(status, null, 2))
            hasExtractionStatus = true
            
            // Update extraction progress
            if (status && typeof status === 'object') {
              setExtractionProgress({
                currentPage: status.currentPage || 0,
                totalPages: status.totalPages || 0,
                extractedPages: status.extractedPages || []
              })
              
              if (!status.isExtracting) {
                console.log('✅ Extraction marked as complete in status!')
              }
            }
          } else {
            console.log('⚠️ Extraction status API returned:', response.status)
          }
        } catch (statusError) {
          console.log('⚠️ Could not fetch extraction status:', statusError)
        }
        
        // Always refresh manual data to get the latest extracted steps
        console.log('🔄 Fetching updated library data...')
        const libraryResponse = await fetch('/api/add-to-library')
        if (!libraryResponse.ok) {
          console.error('❌ Library API failed:', libraryResponse.status)
          return
        }
        
        const rawLibraryText = await libraryResponse.text()
        console.log('📄 RAW library response length:', rawLibraryText.length, 'characters')
        
        const libraryData = JSON.parse(rawLibraryText)
        console.log('📚 Library data structure:', {
          totalItems: libraryData.library?.length || 0,
          libraryKeys: Object.keys(libraryData)
        })
        
        const actualId = manualId.replace('converted_', '')
        console.log('🔍 Looking for manual:', {
          manualId: manualId,
          actualId: actualId,
          librarySize: libraryData.library?.length || 0
        })
        
        const updatedManual = libraryData.library.find((item: LibraryItem) => item.id === actualId)
        
        if (updatedManual) {
          console.log('✅ Found updated manual:', {
            id: updatedManual.id,
            name: updatedManual.manualName,
            stepsCount: updatedManual.steps?.length || 0,
            hasExtractedAt: !!updatedManual.extractedAt,
            currentStepInUI: currentStep,
            stepAtCurrentIndex: updatedManual.steps?.[currentStep] ? 'EXISTS' : 'NOT_FOUND',
            stepsDetails: updatedManual.steps?.map((step: any, index: number) => ({
              stepIndex: index,
              pageNo: step.pageNo,
              hasInstructions: !!step.instructions?.length,
              hasParts: !!step.parts?.length,
              hasSceneJson: !!step.sceneJson
            }))
          })
          
          console.log('🎯 Current UI state:', {
            currentStep,
            isExtracting,
            hasStepsForCurrentStep: !!updatedManual.steps?.[currentStep],
            shouldShowLoading: isExtracting && !updatedManual.steps?.[currentStep]
          })
          setManualData(updatedManual)
          
          // Check if extraction is complete by comparing steps to total pages
          // Only stop when we have steps for all pages OR extraction status says it's done
          if (updatedManual.steps) {
            console.log('📊 Progress update:', {
              stepsExtracted: updatedManual.steps.length,
              totalPages: updatedManual.totalPages,
              isComplete: updatedManual.steps.length >= updatedManual.totalPages
            })
            
            // Only stop if we have extracted all pages
            if (updatedManual.steps.length >= updatedManual.totalPages) {
              console.log('🎉 All pages extracted! Stopping extraction.')
              clearInterval(pollInterval)
              setIsExtracting(false)
              return
            }
          }
        } else {
          console.log('❌ Manual not found in library.')
          console.log('❌ Searching for actualId:', actualId)
          console.log('❌ Available IDs in library:')
          libraryData.library.forEach((item: any, index: number) => {
            console.log(`  ${index}: ID="${item.id}" Name="${item.manualName}" Steps=${item.steps?.length || 0}`)
          })
          console.log('❌ Full manualId being used:', manualId)
        }
        
        // Also check extraction status to see if backend says it's complete
        if (hasExtractionStatus) {
          try {
            const statusResponse = await fetch(`/api/extraction-status?manualId=${manualId}`)
            if (statusResponse.ok) {
              const statusText = await statusResponse.text()
              const status = JSON.parse(statusText)
              if (status && typeof status === 'object' && !status.isExtracting) {
                console.log('✅ Backend says extraction is complete!')
                clearInterval(pollInterval)
                setIsExtracting(false)
                return
              }
            }
          } catch (statusError) {
            console.log('⚠️ Could not check final extraction status:', statusError)
          }
        }

      } catch (error) {
        console.error('❌ Error polling extraction status:', error)
        clearInterval(pollInterval)
        setIsExtracting(false)
      }
    }, 2000) // Poll every 2 seconds

    // Clear interval after 15 minutes to prevent infinite polling
    setTimeout(() => {
      console.log('⏰ Polling timeout reached, clearing interval')
      clearInterval(pollInterval)
      setIsExtracting(false)
    }, 15 * 60 * 1000)
  }

  // Manual refresh function for testing
  const forceRefresh = async () => {
    console.log('🔄 Force refreshing manual data...')
    try {
      const libraryResponse = await fetch('/api/add-to-library')
      const libraryData = await libraryResponse.json()
      const actualId = manualId.replace('converted_', '')
      const updatedManual = libraryData.library.find((item: LibraryItem) => item.id === actualId)
      
      console.log('🔄 Force refresh result:', {
        found: !!updatedManual,
        steps: updatedManual?.steps?.length || 0
      })
      
      if (updatedManual) {
        setManualData(updatedManual)
        if (updatedManual.steps && updatedManual.steps.length > 0) {
          setIsExtracting(false)
        }
      }
    } catch (error) {
      console.error('❌ Force refresh failed:', error)
    }
  }

  // Add a keyboard shortcut for manual refresh (for debugging)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        forceRefresh()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [manualId])  // Include manualId as dependency

  const handleExtractionComplete = (extractedSteps: any[]) => {
    setIsExtracting(false)
    // Refresh manual data to get the updated steps
    if (manualData) {
      setManualData({
        ...manualData,
        steps: extractedSteps
      })
    }
  }

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
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </div>
            ) : manualData ? (
              <>
                <h1 className="font-semibold">{manualData.manualName}</h1>
                <p className="text-xs text-muted-foreground">
                  {manualData.steps 
                    ? `${manualData.steps.length} assembly steps • AI-extracted`
                    : `${manualData.totalPages} pages • Converted manual`
                  }
                </p>
              </>
            ) : (
              <>
                <h1 className="font-semibold">Manual Not Found</h1>
                <p className="text-xs text-muted-foreground">Unable to load manual data</p>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isExtracting && (
            <Button variant="outline" size="sm" onClick={forceRefresh}>
              🔄 Refresh
            </Button>
          )}
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
          <StepsList 
            currentStep={currentStep} 
            onStepChange={setCurrentStep}
            extractedSteps={manualData?.steps}
            isExtracting={isExtracting}
            extractionProgress={extractionProgress || undefined}
          />
        </aside>

        {/* Center - 3D Canvas */}
        <main className="flex flex-1 flex-col">
          <div className="relative flex-1 overflow-y-auto bg-primary/20">
            <Canvas3D 
              currentStep={currentStep}
              sceneData={manualData?.steps?.[currentStep]?.sceneJson}
              isExtracting={isExtracting && !manualData?.steps?.[currentStep]}
            />
          </div>
        </main>

        {/* Right Sidebar - Parts */}
        <aside className="w-80 border-l border-border bg-card overflow-y-auto">
          <PartsPanel 
            currentStep={currentStep}
            extractedSteps={manualData?.steps}
            isExtracting={isExtracting && !manualData?.steps?.[currentStep]}
          />
        </aside>
      </div>
    </div>
  )
}
