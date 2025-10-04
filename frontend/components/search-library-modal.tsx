"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface SearchLibraryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Mock data for public library
const publicManuals = [
  {
    id: "1",
    name: "KALLAX Shelf Unit",
    brand: "IKEA",
    category: "Storage",
    steps: 8,
    parts: 24,
    thumbnail: "/ikea-shelf-assembly-diagram-black-and-white.jpg",
  },
  {
    id: "2",
    name: "HEMNES Dresser",
    brand: "IKEA",
    category: "Bedroom",
    steps: 12,
    parts: 36,
    thumbnail: "/dresser-assembly-diagram-technical-drawing.jpg",
  },
  {
    id: "3",
    name: "MALM Bed Frame",
    brand: "IKEA",
    category: "Bedroom",
    steps: 10,
    parts: 28,
    thumbnail: "/bed-frame-assembly-diagram.jpg",
  },
  {
    id: "4",
    name: "BILLY Bookcase",
    brand: "IKEA",
    category: "Storage",
    steps: 6,
    parts: 18,
    thumbnail: "/bookcase-assembly-instructions-line-art.jpg",
  },
  {
    id: "5",
    name: "EKTORP Sofa",
    brand: "IKEA",
    category: "Living Room",
    steps: 15,
    parts: 42,
    thumbnail: "/sofa-assembly-diagram-technical.jpg",
  },
  {
    id: "6",
    name: "BESTÅ Storage Unit",
    brand: "IKEA",
    category: "Storage",
    steps: 9,
    parts: 30,
    thumbnail: "/ikea-storage-unit-assembly-diagram.jpg",
  },
]

export function SearchLibraryModal({ open, onOpenChange }: SearchLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredManuals = publicManuals.filter(
    (manual) =>
      manual.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      manual.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">Search Public Library</DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, brand, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background border-primary/20 text-foreground"
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredManuals.map((manual) => (
              <div
                key={manual.id}
                className="group relative overflow-hidden rounded-lg border-2 border-primary/20 bg-card hover:border-secondary transition-colors"
              >
                <div className="aspect-video relative overflow-hidden bg-muted">
                  <img
                    src={manual.thumbnail || "/placeholder.svg"}
                    alt={manual.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-primary">{manual.name}</h3>
                      <p className="text-sm text-muted-foreground">{manual.brand}</p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {manual.category}
                    </Badge>
                  </div>
                  <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{manual.steps} steps</span>
                    <span>•</span>
                    <span>{manual.parts} parts</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full gap-2"
                    onClick={() => {
                      window.location.href = `/viewer/${manual.id}`
                    }}
                  >
                    <Eye className="h-4 w-4" />
                    View Manual
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredManuals.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-primary">No manuals found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search query</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
