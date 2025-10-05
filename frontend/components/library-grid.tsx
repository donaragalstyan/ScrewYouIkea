"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, MoreVertical, FileImage, Upload, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Link from "next/link"
import { useEffect, useState } from "react"

interface LibraryItem {
  id: string
  manualName: string
  originalFilename: string
  pages: string[]
  totalPages: number
  createdAt: string
  thumbnail: string
}

interface Manual {
  id: string
  title: string
  status: string
  thumbnail: string
  steps: number
  parts: number
  uploadedAt: string
  type?: 'converted' | 'default'
}

// No default manuals - only show converted ones

export function LibraryGrid() {
  const [allManuals, setAllManuals] = useState<Manual[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [manualToDelete, setManualToDelete] = useState<Manual | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        // Fetch converted manuals from API
        const response = await fetch('/api/add-to-library')
        const data = await response.json()
        
        // Filter manuals to only include those with existing files
        const validManuals: Manual[] = []
        
        for (const item of data.library) {
          // Verify that files actually exist
          try {
            const verifyResponse = await fetch('/api/verify-files', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ pages: item.pages })
            })
            
            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json()
              
              // Only include if at least one file exists
              if (verifyData.verifiedPages.length > 0) {
                validManuals.push({
                  id: `converted_${item.id}`,
                  title: item.manualName,
                  status: 'completed',
                  thumbnail: verifyData.verifiedPages[0], // Use first verified page as thumbnail
                  steps: verifyData.verifiedPages.length,
                  parts: verifyData.verifiedPages.length,
                  uploadedAt: formatUploadTime(item.createdAt),
                  type: 'converted' as const
                })
              }
            }
          } catch (error) {
            console.error('Error verifying files for manual:', item.manualName, error)
            // Skip this manual if verification fails
          }
        }

        // Sort by creation date (most recent first) and show manuals with verified existing files
        validManuals.sort((a, b) => {
          // Extract the original library items to compare creation dates
          const itemA = data.library.find((item: LibraryItem) => `converted_${item.id}` === a.id)
          const itemB = data.library.find((item: LibraryItem) => `converted_${item.id}` === b.id)
          
          if (itemA && itemB) {
            return new Date(itemB.createdAt).getTime() - new Date(itemA.createdAt).getTime()
          }
          return 0
        })
        
        setAllManuals(validManuals)
        
      } catch (error) {
        console.error('Error fetching library:', error)
        // No fallback - just empty array if error
        setAllManuals([])
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [])

  const handleDeleteClick = (manual: Manual) => {
    setManualToDelete(manual)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!manualToDelete) return

    console.log('Starting deletion for manual:', manualToDelete)
    setIsDeleting(true)
    try {
      // Extract the actual ID from the manual ID (remove 'converted_' prefix)
      const actualId = manualToDelete.id.replace('converted_', '')
      console.log('Extracted actual ID:', actualId)
      
      const response = await fetch(`/api/delete-manual?id=${actualId}`, {
        method: 'DELETE',
      })
      console.log('Delete request sent, response status:', response.status)

      const responseData = await response.json()
      console.log('Delete API Response:', responseData)

      if (response.ok) {
        console.log('Successfully deleted manual:', responseData)
        // Remove the manual from the local state
        setAllManuals(prev => prev.filter(m => m.id !== manualToDelete.id))
        setDeleteDialogOpen(false)
        setManualToDelete(null)
      } else {
        console.error('Failed to delete manual:', responseData)
        alert('Failed to delete manual. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting manual:', error)
      alert('Failed to delete manual. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatUploadTime = (createdAt: string) => {
    const date = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return '1 day ago'
    return `${diffDays} days ago`
  }

  const viewableManuals = allManuals.filter((manual) => manual.status === "completed")

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-200" />
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (viewableManuals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 rounded-full bg-secondary/20 p-6">
          <FileImage className="h-12 w-12 text-secondary" />
        </div>
        <h3 className="mb-2 text-xl font-semibold text-white">No Converted Manuals Yet</h3>
        <p className="mb-6 text-white/70 max-w-md">
          Upload and convert your first PDF assembly manual to see it here in your library.
        </p>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Your First Manual
          </Button>
        </Link>
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

              <Link href={manual.type === 'converted' ? `/viewer/${manual.id}` : `/viewer/${manual.id}`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 gap-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  {manual.type === 'converted' ? <FileImage className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {manual.type === 'converted' ? 'View Pages' : 'View'}
                </Button>
              </Link>

              {/* Badge for converted manuals */}
              {manual.type === 'converted' && (
                <div className="absolute top-2 left-2">
                  <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs font-medium">
                    Converted
                  </span>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <div className="mb-3 flex items-start justify-between gap-2">
                <h3 className="font-semibold leading-tight text-primary">{manual.title}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreVertical className="h-4 w-4 text-primary" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(manual)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Manual
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center gap-4 text-sm text-foreground/70">
                <span>{manual.steps} steps</span>
                <span className="h-1 w-1 rounded-full bg-foreground/70" />
                <span>{manual.parts} parts</span>
              </div>
            </CardContent>

            <CardFooter className="border-t-2 border-secondary bg-secondary/30 p-3 text-xs text-secondary-foreground font-medium">
              Uploaded {manual.uploadedAt}
            </CardFooter>
          </Card>
        )
      })}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Manual</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{manualToDelete?.title}"? This action cannot be undone and will permanently delete all associated files.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
