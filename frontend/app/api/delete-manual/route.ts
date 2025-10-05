import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, unlink } from 'fs/promises'
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('id')
    console.log('DELETE request received for item ID:', itemId)

    if (!itemId) {
      console.error('No item ID provided in request')
      return NextResponse.json(
        { error: 'Item ID is required' },
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

    // Find the item to delete
    const itemIndex = library.findIndex(item => item.id === itemId)
    console.log('Found item index:', itemIndex)
    console.log('Current library items:', library.map(item => ({ id: item.id, name: item.manualName })))
    
    if (itemIndex === -1) {
      console.error('Item not found in library:', itemId)
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    const itemToDelete = library[itemIndex]
    console.log('Item to delete:', itemToDelete)

    // Delete associated image files
    const publicDir = path.join(process.cwd(), 'public')
    console.log('Attempting to delete', itemToDelete.pages.length, 'image files')
    
    let deletedFiles = 0
    let failedFiles = 0
    
    for (const imagePath of itemToDelete.pages) {
      try {
        const fullImagePath = path.join(publicDir, imagePath)
        console.log('Deleting image file:', fullImagePath)
        await unlink(fullImagePath)
        deletedFiles++
      } catch (error) {
        console.warn(`Could not delete image file: ${imagePath}`, error)
        failedFiles++
        // Continue with deletion even if some files can't be deleted
      }
    }

    console.log(`File deletion results: ${deletedFiles} deleted, ${failedFiles} failed`)

    // Remove item from library
    library.splice(itemIndex, 1)
    console.log('Removed item from library, new library size:', library.length)

    // Save updated library
    await writeFile(libraryPath, JSON.stringify(library, null, 2))
    console.log('Library file updated successfully')

    const response = {
      success: true,
      message: 'Item deleted successfully',
      deletedItem: itemToDelete,
      filesDeleted: deletedFiles,
      filesFailed: failedFiles
    }
    
    console.log('Sending success response:', response)
    return NextResponse.json(response)

  } catch (error) {
    console.error('Error deleting item:', error)
    const errorResponse = { 
      error: 'Failed to delete item', 
      details: error instanceof Error ? error.message : String(error)
    }
    console.log('Sending error response:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}