"use client"

import { Navigation } from "@/components/navigation"
import { LibraryGrid } from "@/components/library-grid"
import { LibraryHeader } from "@/components/library-header"

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary/30">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <LibraryHeader />
        <LibraryGrid />
      </main>
    </div>
  )
}
