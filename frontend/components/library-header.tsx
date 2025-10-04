"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function LibraryHeader() {
  return (
    <div className="mb-8 rounded-lg bg-primary p-6 text-primary-foreground shadow-lg">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-white">Manual Library</h1>
        <p className="text-white/80">Browse and manage your uploaded assembly manuals</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search manuals..."
            className="pl-9 bg-secondary border-secondary text-secondary-foreground"
          />
        </div>
      </div>
    </div>
  )
}
