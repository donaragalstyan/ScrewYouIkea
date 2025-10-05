"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchLibraryModal } from "./search-library-modal"
import { ManualDetailsModal } from "./manual-details-modal"
import { ProgressModal } from "./progress-modal-wrapper"
import { ConvertedPagesDisplay } from "./converted-pages-display"

// Type definition to avoid top-level import
type ConvertedPage = {
  pageNumber: number
  imageDataUrl: string
  blob: Blob
}

export function UploadSection() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isManualDetailsOpen, setIsManualDetailsOpen] = useState(false)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [convertedPages, setConvertedPages] = useState<ConvertedPage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
      setIsManualDetailsOpen(true)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      setUploadedFile(files[0])
      setIsManualDetailsOpen(true)
    }
  }

  const handleGenerate = (manualName: string) => {
    console.log("[v0] Generating manual for:", manualName, "File:", uploadedFile)
    setIsManualDetailsOpen(false)
    setIsProgressModalOpen(true)
  }

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    handleUploadClick()
  }

  const handleProgressComplete = (convertedPagesResult?: ConvertedPage[], manualId?: string) => {
    setIsProgressModalOpen(false)
    
    if (convertedPagesResult && convertedPagesResult.length > 0) {
      console.log("[v0] PDF converted to", convertedPagesResult.length, "JPG pages:", convertedPagesResult)
      console.log("[v0] Manual ID passed from progress modal:", manualId)
      setConvertedPages(convertedPagesResult)
      
      // Use the manual ID passed from the progress modal first
      if (manualId) {
        console.log("[v0] Navigating to viewer with passed ID:", `/viewer/${manualId}`)
        router.push(`/viewer/${manualId}`)
        return
      }
      
      // Fallback: check localStorage
      const latestManualId = localStorage.getItem('latestManualId')
      console.log("[v0] Checking localStorage for manual ID:", latestManualId)
      
      if (latestManualId) {
        console.log("[v0] Navigating to viewer with localStorage ID:", `/viewer/${latestManualId}`)
        router.push(`/viewer/${latestManualId}`)
        return
      }
      
      // Final fallback: try to find the latest manual from the library API
      console.log("[v0] No manual ID found, fetching from library API")
      fetch('/api/add-to-library')
        .then(response => response.json())
        .then(data => {
          console.log("[v0] Library API response:", data)
          if (data.library && data.library.length > 0) {
            // Get the most recent manual (first in sorted array)
            const latestManual = data.library[0]
            const fallbackManualId = `converted_${latestManual.id}`
            console.log("[v0] Found latest manual from API:", fallbackManualId)
            router.push(`/viewer/${fallbackManualId}`)
          } else {
            console.log("[v0] No manuals found in library, going to library page")
            router.push('/library')
          }
        })
        .catch((error) => {
          console.error("[v0] Error fetching from library API:", error)
          router.push('/library')
        })
    } else {
      console.log("[v0] Generation complete!")
    }
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1.5 text-sm font-medium text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary"></span>
          </span>
          AI-Powered Assembly Visualization
        </div>

        <h1 className="mb-4 text-5xl font-bold tracking-tight text-balance text-white">
          Transform Assembly Manuals into <span className="text-secondary">Interactive 3D</span>
        </h1>

        <p className="mb-12 text-xl text-white/90 text-balance">
          Upload your furniture assembly manuals and watch AI convert them into step-by-step 3D animations with the
          classic black & white manual aesthetic.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Left: Search Existing */}
          <Card
            className="relative overflow-hidden border-2 border-dashed border-border cursor-pointer hover:border-secondary/50 transition-colors"
            onClick={() => setIsSearchModalOpen(true)}
          >
            <div className="p-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
                <Search className="h-10 w-10 text-primary" />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-primary">Search Public Library</h3>
              <p className="mb-6 text-sm text-primary/70">Browse existing assembly manuals from our community</p>

              <Button
                size="lg"
                variant="outline"
                className="gap-2 border-primary text-primary hover:bg-primary/10 bg-transparent"
              >
                <Search className="h-4 w-4" />
                Browse Library
              </Button>
            </div>
          </Card>

          {/* Right: Upload New */}
          <Card
            className={`relative overflow-hidden border-2 border-dashed transition-colors cursor-pointer hover:border-secondary/50 ${
              isDragging ? "border-secondary bg-secondary/5" : "border-border"
            }`}
            onClick={handleUploadClick}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <div className="p-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary/20">
                <Upload className="h-10 w-10 text-primary" />
              </div>

              <h3 className="mb-2 text-xl font-semibold text-primary">Upload Assembly Manual</h3>
              <p className="mb-6 text-sm text-primary/70">
                Drag and drop your files here, or click to browse
                <br />
                <span className="text-xs text-primary/50">PDFs will be automatically converted to JPG images</span>
              </p>

              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="flex items-center gap-2 text-sm text-primary/70">
                  <FileText className="h-4 w-4" />
                  <span>PDF</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2 text-sm text-primary/70">
                  <ImageIcon className="h-4 w-4" />
                  <span>JPG, PNG</span>
                </div>
              </div>

              <Button size="lg" variant="secondary" className="gap-2" onClick={handleButtonClick}>
                <Upload className="h-4 w-4" />
                Select Files
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </Card>
        </div>

        <div className="mt-8 flex items-center justify-center gap-8 text-sm text-white/80">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span>AI-Powered Parsing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span>3D Visualization</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
            <span>Step-by-Step Guide</span>
          </div>
        </div>

        {/* Display converted pages if available */}
        {convertedPages.length > 0 && (
          <div className="mt-12">
            <ConvertedPagesDisplay 
              pages={convertedPages} 
              originalFileName={uploadedFile?.name}
            />
          </div>
        )}
      </div>

      <SearchLibraryModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} />
      <ManualDetailsModal
        open={isManualDetailsOpen}
        onOpenChange={setIsManualDetailsOpen}
        fileName={uploadedFile?.name || ""}
        onGenerate={handleGenerate}
      />
      <ProgressModal open={isProgressModalOpen} onComplete={handleProgressComplete} file={uploadedFile} />
    </section>
  )
}
