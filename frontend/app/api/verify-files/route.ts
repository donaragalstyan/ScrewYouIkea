import { NextRequest, NextResponse } from 'next/server'
import { access, constants } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pages } = body

    if (!pages || !Array.isArray(pages)) {
      return NextResponse.json(
        { error: 'Pages array required' },
        { status: 400 }
      )
    }

    const verifiedPages: string[] = []
    
    // Check each page file exists in public folder
    for (const pagePath of pages) {
      try {
        const fullPath = path.join(process.cwd(), 'public', pagePath)
        await access(fullPath, constants.F_OK)
        verifiedPages.push(pagePath)
      } catch (error) {
        // File doesn't exist, skip it
        console.log(`File not found: ${pagePath}`)
      }
    }

    return NextResponse.json({
      verifiedPages,
      totalFound: verifiedPages.length,
      totalRequested: pages.length
    })

  } catch (error) {
    console.error('Error verifying files:', error)
    return NextResponse.json(
      { error: 'Failed to verify files' },
      { status: 500 }
    )
  }
}