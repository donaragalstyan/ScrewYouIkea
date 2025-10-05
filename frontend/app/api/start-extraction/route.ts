import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

interface LibraryItem {
  id: string
  manualName: string
  originalFilename: string
  pages: string[]
  totalPages: number
  createdAt: string
  thumbnail: string
  steps?: any[]
  extractedAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const { manualId } = await request.json()

    if (!manualId) {
      return NextResponse.json(
        { error: 'Manual ID is required' },
        { status: 400 }
      )
    }

    // Extract the actual ID from the manual ID (remove 'converted_' prefix)
    const actualId = manualId.replace('converted_', '')

    // Read library data to get manual info
    const libraryPath = path.join(process.cwd(), 'data', 'library.json')
    let library: LibraryItem[] = []
    
    try {
      const existingData = await readFile(libraryPath, 'utf-8')
      library = JSON.parse(existingData)
    } catch (error) {
      return NextResponse.json(
        { error: 'Library file not found' },
        { status: 404 }
      )
    }

    // Find the manual
    const manual = library.find(item => item.id === actualId)
    if (!manual) {
      return NextResponse.json(
        { error: 'Manual not found' },
        { status: 404 }
      )
    }

    console.log('🔧 Starting step extraction for:', manual.manualName)

    // Start the step extraction by calling the extract-steps API
    // We'll use a placeholder path since we're working with converted images
    const extractResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/extract-steps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfPath: `C:/Users/m1nor/temp/${manual.originalFilename}`,
        manualTitle: manual.manualName,
        totalPages: manual.totalPages,
        manualId: manualId
      })
    })

    if (!extractResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to start step extraction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Step extraction started',
      manual: manual
    })

  } catch (error) {
    console.error('Error starting step extraction:', error)
    return NextResponse.json(
      { error: 'Failed to start step extraction' },
      { status: 500 }
    )
  }
}