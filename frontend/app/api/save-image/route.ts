import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { filename, imageData, directory = 'converted-manuals' } = body

    if (!filename || !imageData) {
      return NextResponse.json(
        { error: 'Missing filename or imageData' },
        { status: 400 }
      )
    }

    // Create directory path in public folder
    const publicDir = path.join(process.cwd(), 'public', directory)
    
    // Ensure directory exists
    try {
      await mkdir(publicDir, { recursive: true })
    } catch (error) {
      // Directory might already exist, that's fine
    }

    // Full file path
    const filePath = path.join(publicDir, filename)
    
    // Convert base64 back to buffer
    const buffer = Buffer.from(imageData, 'base64')
    
    // Write file to public directory
    await writeFile(filePath, buffer)
    
    // Return the public URL path
    const publicPath = `/${directory}/${filename}`

    return NextResponse.json({
      success: true,
      publicPath,
      message: 'Image saved successfully'
    })

  } catch (error) {
    console.error('Error saving image:', error)
    return NextResponse.json(
      { error: 'Failed to save image' },
      { status: 500 }
    )
  }
}