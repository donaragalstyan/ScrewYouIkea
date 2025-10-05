"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, FileImage } from "lucide-react"

// Type definition to avoid top-level import
type ConvertedPage = {
  pageNumber: number
  imageDataUrl: string
  blob: Blob
}

interface ConvertedPagesDisplayProps {
  pages: ConvertedPage[]
  originalFileName?: string
}

export function ConvertedPagesDisplay({ pages, originalFileName }: ConvertedPagesDisplayProps) {
  const [selectedPage, setSelectedPage] = useState<ConvertedPage | null>(null)

  const handleDownloadAll = async () => {
    const { downloadConvertedPagesClient } = await import('@/lib/pdf-utils-client')
    
    if (originalFileName) {
      const baseName = originalFileName.replace(/\.[^/.]+$/, "") // Remove extension
      downloadConvertedPagesClient(pages, baseName)
    } else {
      downloadConvertedPagesClient(pages, "manual")
    }
  }

  const handleViewPage = (page: ConvertedPage) => {
    setSelectedPage(page)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-primary" />
              <CardTitle>PDF Converted Successfully</CardTitle>
              <Badge variant="secondary">{pages.length} pages</Badge>
            </div>
            <Button onClick={handleDownloadAll} className="gap-2">
              <Download className="h-4 w-4" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pages.map((page) => (
              <div key={page.pageNumber} className="space-y-2">
                <div className="relative group cursor-pointer" onClick={() => handleViewPage(page)}>
                  <img
                    src={page.imageDataUrl}
                    alt={`Page ${page.pageNumber}`}
                    className="w-full aspect-[3/4] object-cover rounded-lg border hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                    <Eye className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm font-medium">Page {page.pageNumber}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Page Preview Modal */}
      {selectedPage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPage(null)}
        >
          <div className="max-w-4xl max-h-full bg-white rounded-lg p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Page {selectedPage.pageNumber}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedPage(null)}>
                Close
              </Button>
            </div>
            <img
              src={selectedPage.imageDataUrl}
              alt={`Page ${selectedPage.pageNumber}`}
              className="max-w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}