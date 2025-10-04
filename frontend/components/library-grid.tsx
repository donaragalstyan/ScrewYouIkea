"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreVertical } from "lucide-react"
import Link from "next/link"
import type { ManualSummary } from "@/lib/manual-types"

const FALLBACK_MANUALS: ManualSummary[] = [
  {
    id: "m_001",
    title: "BROR Shelf Unit",
    status: "completed",
    thumbnail: "/ikea-shelf-assembly-diagram-black-and-white.jpg",
    steps: 12,
    parts: 8,
    uploadedAt: "2 hours ago",
  },
  {
    id: "m_002",
    title: "KALLAX Storage Unit",
    status: "processing",
    thumbnail: "/ikea-storage-unit-assembly-diagram.jpg",
    steps: 0,
    parts: 0,
    uploadedAt: "5 minutes ago",
  },
  {
    id: "m_003",
    title: "HEMNES Dresser",
    status: "completed",
    thumbnail: "/dresser-assembly-diagram-technical-drawing.jpg",
    steps: 18,
    parts: 15,
    uploadedAt: "1 day ago",
  },
  {
    id: "m_004",
    title: "MALM Bed Frame",
    status: "failed",
    thumbnail: "/bed-frame-assembly-diagram.jpg",
    steps: 0,
    parts: 0,
    uploadedAt: "3 days ago",
  },
  {
    id: "m_005",
    title: "BILLY Bookcase",
    status: "completed",
    thumbnail: "/bookcase-assembly-instructions-line-art.jpg",
    steps: 8,
    parts: 6,
    uploadedAt: "1 week ago",
  },
  {
    id: "m_006",
    title: "EKTORP Sofa",
    status: "completed",
    thumbnail: "/sofa-assembly-diagram-technical.jpg",
    steps: 15,
    parts: 12,
    uploadedAt: "2 weeks ago",
  },
]

function formatUploadedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString()
}

export function LibraryGrid() {
  const [manuals, setManuals] = useState<ManualSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    fetch("/api/manuals")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch manuals: ${response.status}`)
        }
        return response.json()
      })
      .then((data: ManualSummary[]) => {
        if (!active) return
        setManuals(data)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error("Failed to load manuals", err)
        setError(err instanceof Error ? err.message : String(err))
        setManuals(FALLBACK_MANUALS)
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const viewableManuals = useMemo(
    () => (manuals.length > 0 ? manuals : FALLBACK_MANUALS).filter((manual) => manual.status === "completed"),
    [manuals],
  )

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="h-64 animate-pulse border-2 border-secondary/40 bg-secondary/10" />
        ))}
      </div>
    )
  }

  if (error && viewableManuals.length === 0) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
        Unable to load manuals right now. {error}
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {viewableManuals.map((manual) => {
        return (
          <Card
            key={manual.id}
            className="group overflow-hidden border-2 border-secondary transition-all hover:border-primary hover:shadow-xl"
          >
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img
                src={manual.thumbnail || "/placeholder.svg"}
                alt={manual.title}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <Link href={`/viewer/${manual.id}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Play className="h-4 w-4" />
                  View
                </Button>
              </Link>
            </div>

            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-primary">{manual.title}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4 text-primary" />
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-foreground/70">
                <span>{manual.steps} steps</span>
                <span className="h-1 w-1 rounded-full bg-foreground/70" />
                <span>{manual.parts} parts</span>
              </div>
            </CardContent>

            <CardFooter className="border-t-2 border-secondary bg-secondary/30 p-3 text-xs text-secondary-foreground font-medium">
              Uploaded {formatUploadedAt(manual.uploadedAt)}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
