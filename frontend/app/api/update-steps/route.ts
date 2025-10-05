import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile } from 'fs/promises'
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
    const { manualId, extractedSteps } = await request.json()

    if (!manualId || !extractedSteps || !Array.isArray(extractedSteps)) {
      return NextResponse.json(
        { error: 'Missing required fields: manualId, extractedSteps' },
        { status: 400 }
      )
    }

    const libraryPath = path.join(process.cwd(), 'data', 'library.json')
    
    // Read existing library data
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

    // Find the manual to update
    const manualIndex = library.findIndex(item => item.id === manualId)
    if (manualIndex === -1) {
      return NextResponse.json(
        { error: 'Manual not found in library' },
        { status: 404 }
      )
    }

    // Convert extracted steps to include image paths
    const stepsWithImages: ExtractedStep[] = extractedSteps.map((step: any) => ({
      pageNo: step.pageNo,
      sceneJson: step.sceneJson,
      instructions: step.instructions,
      parts: step.parts,
      tools: step.tools,
      rawText: step.rawText,
      imagePath: library[manualIndex].pages[step.pageNo - 1] || ''
    }))

    // Update the manual with extracted steps
    library[manualIndex] = {
      ...library[manualIndex],
      steps: stepsWithImages,
      extractedAt: new Date().toISOString()
    }

    // Save updated library
    await writeFile(libraryPath, JSON.stringify(library, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Steps updated successfully',
      stepsCount: stepsWithImages.length
    })

  } catch (error) {
    console.error('Error updating steps:', error)
    return NextResponse.json(
      { error: 'Failed to update steps' },
      { status: 500 }
    )
  }
}