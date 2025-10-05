// Dynamic import to avoid SSR issues
let pdfjsLib: any = null

// Initialize PDF.js only on client side
async function initPdfJs() {
  if (typeof window === 'undefined') {
    throw new Error('PDF processing is only available in the browser')
  }
  
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`
  }
  
  return pdfjsLib
}

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
 * Converts a PDF file to JPG images (one per page)
 * @param file The PDF file to convert
 * @param onProgress Callback for progress updates
 * @returns Promise that resolves to an array of converted pages
 */
export async function convertPdfToJpgs(
  file: File,
  onProgress?: (progress: ConversionProgress) => void
): Promise<ConvertedPage[]> {
  // Ensure we're running in the browser
  if (typeof window === 'undefined') {
    throw new Error('PDF conversion is only available in the browser')
  }

  try {
    // Initialize PDF.js (client-side only)
    const pdfjs = await initPdfJs()
    
    // Read the PDF file
    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjs.getDocument(arrayBuffer).promise
    
    const totalPages = pdf.numPages
    const convertedPages: ConvertedPage[] = []

    // Update progress - PDF loaded
    onProgress?.({
      currentPage: 0,
      totalPages,
      percentage: 0,
      status: `PDF loaded successfully. Converting ${totalPages} pages...`
    })

    // Convert each page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      
      // Set up viewport with good quality (scale = 2 for higher resolution)
      const viewport = page.getViewport({ scale: 2.0 })
      
      // Create canvas
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      
      canvas.width = viewport.width
      canvas.height = viewport.height
      
      // Render the page
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
        canvas: canvas
      }
      
      await page.render(renderContext).promise
      
      // Convert canvas to blob and data URL
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!)
        }, 'image/jpeg', 0.9) // High quality JPEG
      })
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9)
      
      convertedPages.push({
        pageNumber: pageNum,
        imageDataUrl,
        blob
      })
      
      // Update progress
      const percentage = (pageNum / totalPages) * 100
      onProgress?.({
        currentPage: pageNum,
        totalPages,
        percentage,
        status: `Converted page ${pageNum} of ${totalPages}`
      })
    }
    
    return convertedPages
    
  } catch (error) {
    console.error('Error converting PDF to JPGs:', error)
    throw new Error(`Failed to convert PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Downloads converted pages as JPG files
 * @param pages Array of converted pages
 * @param baseFilename Base filename (without extension)
 */
export function downloadConvertedPages(pages: ConvertedPage[], baseFilename: string) {
  // Ensure we're running in the browser
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
 * Creates download links for converted pages
 * @param pages Array of converted pages
 * @returns Array of download URLs that need to be cleaned up later
 */
export function createDownloadUrls(pages: ConvertedPage[]): string[] {
  // Ensure we're running in the browser
  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    throw new Error('URL creation is only available in the browser')
  }
  
  return pages.map((page) => URL.createObjectURL(page.blob))
}

/**
 * Cleans up created object URLs
 * @param urls Array of URLs to revoke
 */
export function cleanupUrls(urls: string[]) {
  // Ensure we're running in the browser
  if (typeof window === 'undefined' || typeof URL === 'undefined') {
    return // Silently fail on server-side
  }
  
  urls.forEach(url => URL.revokeObjectURL(url))
}