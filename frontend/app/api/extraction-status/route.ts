import { NextRequest, NextResponse } from 'next/server'

interface ExtractionStatus {
  manualId: string
  isExtracting: boolean
  currentPage: number
  totalPages: number
  extractedPages: number[]
  completedPages: { [key: number]: any }
  error?: string
}

// In-memory store for extraction status (in production, use Redis or database)
const extractionStatuses = new Map<string, ExtractionStatus>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const manualId = searchParams.get('manualId')

    if (!manualId) {
      return NextResponse.json(
        { error: 'Manual ID is required' },
        { status: 400 }
      )
    }

    const status = extractionStatuses.get(manualId) || {
      manualId,
      isExtracting: false,
      currentPage: 0,
      totalPages: 0,
      extractedPages: [],
      completedPages: {}
    }

    console.log(`📊 GET extraction status for ${manualId}:`, JSON.stringify(status, null, 2))
    console.log(`📊 Total statuses in memory: ${extractionStatuses.size}`)
    console.log(`📊 All manual IDs in memory:`, Array.from(extractionStatuses.keys()))

    return NextResponse.json(status)

  } catch (error) {
    console.error('Error getting extraction status:', error)
    return NextResponse.json(
      { error: 'Failed to get extraction status' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    console.log('📄 RAW POST body for extraction status:', rawBody)
    
    const status: ExtractionStatus = JSON.parse(rawBody)
    
    console.log('📊 POST: Updating extraction status for', status.manualId)
    console.log('📊 POST: Status details:', JSON.stringify(status, null, 2))
    console.log('📊 POST: Completed pages keys:', Object.keys(status.completedPages || {}))
    
    extractionStatuses.set(status.manualId, status)
    
    console.log('📊 POST: Status successfully stored in memory')
    console.log('📊 POST: Memory now contains:', extractionStatuses.size, 'statuses')

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error updating extraction status:', error)
    return NextResponse.json(
      { error: 'Failed to update extraction status' },
      { status: 500 }
    )
  }
}