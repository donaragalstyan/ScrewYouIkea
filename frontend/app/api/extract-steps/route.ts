import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

// Helper function to save steps to library
async function saveStepsToLibrary(manualId: string, extractedSteps: any[]) {
  console.log(`💾 saveStepsToLibrary called for manualId: ${manualId}, steps: ${extractedSteps.length}`)
  
  try {
    const libraryPath = path.join(process.cwd(), 'data', 'library.json')
    console.log(`💾 Library path: ${libraryPath}`)
    
    if (!fs.existsSync(libraryPath)) {
      console.error('❌ Library file not found when trying to save steps:', libraryPath)
      return
    }

    console.log(`💾 Reading library file...`)
    const library = JSON.parse(fs.readFileSync(libraryPath, 'utf-8'))
    console.log(`💾 Library loaded, contains ${library.length} items`)
    
    const actualId = manualId.replace('converted_', '')
    console.log(`💾 Looking for manual with ID: ${actualId}`)
    console.log(`💾 Available IDs in library:`, library.map((item: any) => item.id))
    
    // Find the manual and update its steps
    const manualIndex = library.findIndex((item: any) => item.id === actualId)
    console.log(`💾 Manual found at index: ${manualIndex}`)
    
    if (manualIndex !== -1) {
      console.log(`💾 Updating manual at index ${manualIndex} with ${extractedSteps.length} steps`)
      library[manualIndex].steps = extractedSteps
      library[manualIndex].extractedAt = new Date().toISOString()
      
      console.log(`💾 Writing updated library back to file...`)
      // Save back to file
      fs.writeFileSync(libraryPath, JSON.stringify(library, null, 2))
      console.log(`💾 ✅ Successfully saved ${extractedSteps.length} steps to library for manual: ${actualId}`)
    } else {
      console.error(`❌ Manual ${actualId} not found in library when trying to save steps`)
      console.error(`❌ Available manual IDs:`, library.map((item: any) => `${item.id} (${item.manualName})`))
    }
  } catch (error) {
    console.error('❌ Error saving steps to library:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
  }
}

interface ExtractStepsRequest {
  pdfPath: string
  manualTitle: string
  totalPages: number
  manualId?: string
}

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

interface StepExtraction {
  sceneJson: SceneJson
  instructions: string[]
  parts: Part[]
  tools: Tool[]
  rawText: string
}

export async function POST(request: NextRequest) {
  try {
    const { pdfPath, manualTitle, totalPages, manualId } = await request.json() as ExtractStepsRequest & { manualId: string }

    if (!pdfPath || !manualTitle || !totalPages) {
      return NextResponse.json(
        { error: 'Missing required fields: pdfPath, manualTitle, totalPages' },
        { status: 400 }
      )
    }

    // Initialize extraction status
    if (manualId) {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/extraction-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualId,
          isExtracting: true,
          currentPage: 0,
          totalPages,
          extractedPages: [],
          completedPages: {}
        })
      })
    }

    // Extract steps for each page
    const extractedSteps: (StepExtraction & { pageNo: number })[] = []

    for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
      try {
        console.log(`🔧 Calling step extraction API for page ${pageNo}/${totalPages}`)
        console.log(`📄 Request data:`, {
          image: { kind: 'pdf', filePath: pdfPath },
          manualTitle,
          pageNo
        })

        // Call the external step extraction API
        const response = await fetch('http://localhost:5050/api/extract-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: {
              kind: 'pdf',
              filePath: pdfPath
            },
            manualTitle,
            pageNo
          })
        })

        console.log(`📡 Response status for page ${pageNo}:`, response.status, response.statusText)
        console.log(`📡 Response headers for page ${pageNo}:`, Object.fromEntries(response.headers.entries()))

        // Get the raw response text first
        const rawResponseText = await response.text()
        console.log(`📄 RAW RESPONSE for page ${pageNo}:`)
        console.log(`📄 Raw response length: ${rawResponseText.length} characters`)
        console.log(`📄 Raw response content:`, rawResponseText)

        if (!response.ok) {
          console.error(`❌ Failed to extract step for page ${pageNo}:`, response.statusText)
          console.error(`❌ Raw error response:`, rawResponseText)
          continue
        }

        // Parse the JSON from the raw text
        let stepData: StepExtraction
        try {
          stepData = JSON.parse(rawResponseText) as StepExtraction
          console.log(`✅ Successfully parsed JSON for page ${pageNo}`)
        } catch (parseError) {
          console.error(`❌ Failed to parse JSON for page ${pageNo}:`, parseError)
          console.error(`❌ Raw response that failed to parse:`, rawResponseText)
          continue
        }
        console.log(`✅ Successfully extracted step for page ${pageNo}:`)
        console.log(`📊 Step data for page ${pageNo}:`, JSON.stringify(stepData, null, 2))
        console.log(`🔩 Parts found:`, stepData.parts?.length || 0)
        console.log(`🔧 Tools found:`, stepData.tools?.length || 0)
        console.log(`📝 Instructions:`, stepData.instructions?.length || 0)

        extractedSteps.push({
          ...stepData,
          pageNo
        })

        // Update extraction status with completed page
        if (manualId) {
          await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/extraction-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              manualId,
              isExtracting: true,
              currentPage: pageNo,
              totalPages,
              extractedPages: extractedSteps.map(s => s.pageNo),
              completedPages: Object.fromEntries(extractedSteps.map(s => [s.pageNo, s]))
            })
          })

          // Save the current steps to the library
          await saveStepsToLibrary(manualId, extractedSteps)
        }

      } catch (error) {
        console.error(`💥 Exception extracting step for page ${pageNo}:`, error)
        continue
      }
    }

    console.log(`🎯 Step extraction completed!`)
    console.log(`📈 Total steps extracted: ${extractedSteps.length}/${totalPages}`)
    console.log(`📋 Summary of extracted steps:`, extractedSteps.map(step => ({
      pageNo: step.pageNo,
      parts: step.parts?.length || 0,
      tools: step.tools?.length || 0,
      instructions: step.instructions?.length || 0
    })))

    const finalResponse = {
      success: true,
      extractedSteps,
      totalStepsExtracted: extractedSteps.length
    }

    // Mark extraction as complete
    if (manualId) {
      await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/extraction-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          manualId,
          isExtracting: false,
          currentPage: totalPages,
          totalPages,
          extractedPages: extractedSteps.map(s => s.pageNo),
          completedPages: Object.fromEntries(extractedSteps.map(s => [s.pageNo, s]))
        })
      })
    }

    console.log(`📤 Sending final response:`, finalResponse)
    return NextResponse.json(finalResponse)

  } catch (error) {
    console.error('Error in step extraction API:', error)
    return NextResponse.json(
      { error: 'Failed to extract steps' },
      { status: 500 }
    )
  }
}