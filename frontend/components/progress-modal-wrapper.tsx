"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Dynamically import the progress modal with no SSR
const ProgressModalClient = dynamic(
  () => import('./progress-modal').then(mod => ({ default: mod.ProgressModal })),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
)

export { ProgressModalClient as ProgressModal }