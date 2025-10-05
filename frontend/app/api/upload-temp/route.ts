import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf') as File
    
    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'No valid PDF file provided' },
        { status: 400 }
      )
    }

    // Create temp directory that matches the curl command path
    const tempDir = 'C:/Users/m1nor/temp'
    try {
      await mkdir(tempDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Create temp file path (keep original filename for the external API)
    const tempPath = path.join(tempDir, file.name)
    
    // Convert file to buffer and save
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    await writeFile(tempPath, buffer)

    // Return the path in the format expected by the external API
    return NextResponse.json({
      success: true,
      tempPath: tempPath.replace(/\\/g, '/'), // Convert Windows path to forward slashes
      originalName: file.name
    })

  } catch (error) {
    console.error('Error uploading temp file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}