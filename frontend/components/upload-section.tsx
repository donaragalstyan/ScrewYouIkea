"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, Search } from "lucide-react"
import { SearchLibraryModal } from "./search-library-modal"
import { ManualDetailsModal } from "./manual-details-modal"
import { ProgressModal } from "./progress-modal"

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false)
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
  const [isManualDetailsOpen, setIsManualDetailsOpen] = useState(false)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
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

  const handleProgressComplete = () => {
    setIsProgressModalOpen(false)
    console.log("[v0] Generation complete!")
    // TODO: Navigate to viewer page or show success message
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
              <p className="mb-6 text-sm text-primary/70">Drag and drop your files here, or click to browse</p>

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
      </div>

      <SearchLibraryModal open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen} />
      <ManualDetailsModal
        open={isManualDetailsOpen}
        onOpenChange={setIsManualDetailsOpen}
        fileName={uploadedFile?.name || ""}
        onGenerate={handleGenerate}
      />
      <ProgressModal open={isProgressModalOpen} onComplete={handleProgressComplete} />
    </section>
  )
}
