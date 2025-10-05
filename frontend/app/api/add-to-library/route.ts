import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile, mkdir } from 'fs/promises'
import path from 'path'

interface Part {
  id: string
  name: string
  type: string
  quantity: number
}

interface Tool {
  name: string
}

interface SceneJson {
  camera: {
    type: string
    position: number[]
    target: number[]
  }
  parts: Array<{
    id: string
    type: string
    dimensions: any
    position: number[]
    rotation?: number[]
    style: {
      line: string
      fill: string
      edgeWidth: number
    }
  }>
  assemblies: Array<{
    action: string
    from: string
    to: string
    position: number[]
  }>
  timeline: Array<{
    t: number
    action: string
    target: string
    to?: number[]
  }>
}

interface ExtractedStep {
  pageNo: number
  sceneJson: SceneJson
  instructions: string[]
  parts: Part[]
  tools: Tool[]
  rawText: string
  imagePath: string
}

interface LibraryItem {
  id: string
  manualName: string
  originalFilename: string
  pages: string[]
  totalPages: number
  createdAt: string
  thumbnail: string
  steps?: ExtractedStep[]
  extractedAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { manualName, originalFilename, pages, totalPages, createdAt } = body

    if (!manualName || !pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    try {
      await mkdir(dataDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const libraryPath = path.join(dataDir, 'library.json')
    
    // Read existing library data or create empty array
    let library: LibraryItem[] = []
    try {
      const existingData = await readFile(libraryPath, 'utf-8')
      library = JSON.parse(existingData)
    } catch (error) {
      // File doesn't exist yet, start with empty library
    }

    // Create new library item
    const newItem: LibraryItem = {
      id: Date.now().toString(),
      manualName,
      originalFilename,
      pages,
      totalPages,
      createdAt,
      thumbnail: pages[0] || '' // Use first page as thumbnail
    }

    // Add to library
    library.push(newItem)

    // Save updated library
    await writeFile(libraryPath, JSON.stringify(library, null, 2))

    return NextResponse.json({
      success: true,
      item: newItem,
      id: newItem.id, // Include the ID for external use
      message: 'Added to library successfully'
    })

  } catch (error) {
    console.error('Error adding to library:', error)
    return NextResponse.json(
      { error: 'Failed to add to library' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const libraryPath = path.join(process.cwd(), 'data', 'library.json')
    
    let library: LibraryItem[] = []
    try {
      const data = await readFile(libraryPath, 'utf-8')
      library = JSON.parse(data)
    } catch (error) {
      // File doesn't exist, return empty library
    }

    return NextResponse.json({ library })

  } catch (error) {
    console.error('Error reading library:', error)
    return NextResponse.json(
      { error: 'Failed to read library' },
      { status: 500 }
    )
  }
}