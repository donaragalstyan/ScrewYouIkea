"use client"

// This file should only run on the client side
export interface ConversionProgress {
  currentPage: number
  totalPages: number
  percentage: number
  status: string
}

export interface ConvertedPage {
  pageNumber: number
  imageDataUrl: string
  blob: Blob
}

/**
 * Real PDF to JPG conversion using PDF.js
 */
export async function convertPdfToJpgsClient(
  file: File,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConvertedPage[]> {
  // Double-check we're in browser
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser')
  }

  if (file.type === 'application/pdf') {
    try {
      onProgress?.({
        currentPage: 0,
        totalPages: 0,
        percentage: 5,
        status: 'Loading PDF.js library...'
      })

      // Dynamic import of PDF.js
      const pdfjsLib = await import('pdfjs-dist')
      
      // Set up worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`

      onProgress?.({
        currentPage: 0,
        totalPages: 0,
        percentage: 10,
        status: 'Reading PDF file...'
      })

      // Convert file to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()
      
      // Load PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const totalPages = pdf.numPages

      onProgress?.({
        currentPage: 0,
        totalPages,
        percentage: 15,
        status: `PDF loaded. Found ${totalPages} pages. Starting conversion...`
      })

      const convertedPages: ConvertedPage[] = []

      // Convert each page
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        onProgress?.({
          currentPage: pageNum,
          totalPages,
          percentage: Math.floor(15 + (pageNum / totalPages) * 70),
          status: `Converting page ${pageNum} of ${totalPages}...`
        })

        const page = await pdf.getPage(pageNum)
        
        // Set up canvas for rendering
        const viewport = page.getViewport({ scale: 2.0 })
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        
        canvas.height = viewport.height
        canvas.width = viewport.width

        // Render page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, 'image/jpeg', 0.9)
        })

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
        
        convertedPages.push({
          pageNumber: pageNum,
          imageDataUrl,
          blob
        })

        // Clean up canvas
        canvas.remove()
      }

      onProgress?.({
        currentPage: totalPages,
        totalPages,
        percentage: 85,
        status: 'Saving converted pages...'
      })

      // Save to public folder and add to library
      const manualId = await saveToPublicAndLibrary(convertedPages, file.name)

      onProgress?.({
        currentPage: totalPages,
        totalPages,
        percentage: 100,
        status: 'Complete! Redirecting to viewer...'
      })

      // Don't extract steps here - let the viewer page handle it
      // This allows for immediate redirect and live extraction viewing
      
      return convertedPages

    } catch (error) {
      console.error('Error converting PDF:', error)
      
      // Fallback: Create a placeholder page with PDF info
      onProgress?.({
        currentPage: 1,
        totalPages: 1,
        percentage: 50,
        status: 'PDF conversion failed, creating fallback page...'
      })
      
      const fallbackPage = await createFallbackPage(file.name, error)
      await saveToPublicAndLibrary([fallbackPage], file.name)
      
      return [fallbackPage]
    }
  }

  // If it's not a PDF, return empty array
  return []
}

/**
 * Downloads converted pages as JPG files - CLIENT SIDE ONLY
 */
export function downloadConvertedPagesClient(pages: ConvertedPage[], baseFilename: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Download functionality is only available in the browser')
  }

  pages.forEach((page) => {
    const link = document.createElement('a')
    link.href = page.imageDataUrl
    link.download = `${baseFilename}_page_${page.pageNumber.toString().padStart(2, '0')}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  })
}

/**
 * Save converted pages to public folder via API and add to library
 * Returns the manual ID if successful
 */
async function saveToPublicAndLibrary(pages: ConvertedPage[], originalFilename: string): Promise<string | null> {
  try {
    const baseName = originalFilename.replace(/\.[^/.]+$/, "") // Remove extension
    const savedFiles: string[] = []
    
    // Save each page to public folder via API
    for (const page of pages) {
      const filename = `${baseName}_page_${page.pageNumber.toString().padStart(2, '0')}.jpg`
      
      // Convert blob to base64 for API transmission
      const base64 = await blobToBase64(page.blob)
      
      // Call API to save file to public folder
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          imageData: base64,
          directory: 'converted-manuals'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        savedFiles.push(result.publicPath)
      }
    }
    
    // Add to library via API
    const libraryResponse = await fetch('/api/add-to-library', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        manualName: baseName,
        originalFilename,
        pages: savedFiles,
        totalPages: pages.length,
        createdAt: new Date().toISOString()
      })
    })
    
    if (libraryResponse.ok) {
      const result = await libraryResponse.json()
      // Store the manual ID for redirect to viewer
      const manualViewerId = `converted_${result.id}`
      console.log('[PDF-UTILS] Setting localStorage latestManualId:', manualViewerId)
      localStorage.setItem('latestManualId', manualViewerId)
      console.log('[PDF-UTILS] localStorage set, current value:', localStorage.getItem('latestManualId'))
      return result.id // Return the manual ID
    }
    
  } catch (error) {
    console.error('Error saving to public folder and library:', error)
    // Don't throw - this is not critical for the conversion process
  }
  
  return null
}

/**
 * Extract assembly steps from PDF using external API
 */
async function extractStepsFromPdf(
  file: File, 
  manualTitle: string, 
  totalPages: number, 
  manualId: string,
  onProgress?: (progress: ConversionProgress) => void
): Promise<void> {
  try {
    // Use the uploaded PDF file directly
    // In production, you'd upload to a temp location accessible by the backend
    const formData = new FormData()
    formData.append('pdf', file)
    
    onProgress?.({
      currentPage: 0,
      totalPages,
      percentage: 92,
      status: 'Calling step extraction API...'
    })
    
    // First upload the PDF file to a temp location
    const uploadResponse = await fetch('/api/upload-temp', {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      console.error('Failed to upload PDF for step extraction')
      return
    }
    
    const { tempPath } = await uploadResponse.json()
    
    // Call our step extraction API
    const response = await fetch('/api/extract-steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfPath: tempPath,
        manualTitle,
        totalPages,
        manualId: `converted_${manualId}`
      })
    })

    if (!response.ok) {
      console.error('Step extraction failed:', response.statusText)
      return
    }

    const { extractedSteps } = await response.json()

    onProgress?.({
      currentPage: 0,
      totalPages,
      percentage: 96,
      status: 'Updating manual with extracted steps...'
    })

    // Update the library item with extracted steps
    await fetch('/api/update-steps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        manualId,
        extractedSteps
      })
    })

  } catch (error) {
    console.error('Error extracting steps:', error)
    // Don't throw - this is not critical for the conversion process
  }
}

/**
 * Convert blob to base64 string
 */
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Remove the data URL prefix to get just the base64 data
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Create a fallback page when PDF conversion fails
 */
async function createFallbackPage(filename: string, error: unknown): Promise<ConvertedPage> {
  const canvas = document.createElement('canvas')
  canvas.width = 800
  canvas.height = 1000
  const ctx = canvas.getContext('2d')!
  
  // Draw error page
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Border
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 3
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
  
  // Error icon
  ctx.fillStyle = '#ff0000'
  ctx.font = 'bold 72px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('⚠', canvas.width / 2, 150)
  
  // Title
  ctx.fillStyle = '#333333'
  ctx.font = 'bold 32px Arial'
  ctx.fillText('PDF Conversion Failed', canvas.width / 2, 220)
  
  // Filename
  ctx.font = '24px Arial'
  ctx.fillStyle = '#666666'
  ctx.fillText(`File: ${filename}`, canvas.width / 2, 280)
  
  // Error message
  ctx.font = '18px Arial'
  ctx.fillStyle = '#999999'
  const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred'
  ctx.fillText(`Error: ${errorMsg}`, canvas.width / 2, 340)
  
  // Instructions
  ctx.font = '16px Arial'
  ctx.fillStyle = '#333333'
  ctx.fillText('Please try:', canvas.width / 2, 420)
  ctx.textAlign = 'left'
  ctx.fillText('• Uploading a different PDF file', 100, 460)
  ctx.fillText('• Checking if the PDF is not corrupted', 100, 490)
  ctx.fillText('• Converting the PDF to images manually', 100, 520)
  
  const blob = await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/jpeg', 0.9)
  })
  
  const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
  
  canvas.remove()
  
  return {
    pageNumber: 1,
    imageDataUrl,
    blob
  }
}