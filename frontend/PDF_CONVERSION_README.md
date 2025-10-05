# PDF to JPG Conversion Feature

This feature allows users to upload PDF files and automatically converts them to individual JPG images (one per page) during the upload process.

## How it works

1. **User uploads a PDF file** using the file upload button or drag & drop
2. **Progress modal opens** and shows real-time conversion progress
3. **PDF is processed** using PDF.js to extract each page
4. **Each page is rendered** to a canvas and converted to high-quality JPG
5. **Converted images are displayed** in a grid layout with preview and download options

## Implementation Details

### Files Modified/Created:

- `lib/pdf-utils.ts` - Core PDF conversion utilities
- `components/progress-modal.tsx` - Updated to handle real PDF processing
- `components/upload-section.tsx` - Updated to pass file to progress modal and display results
- `components/converted-pages-display.tsx` - New component to show converted images

### Dependencies Added:

- `pdfjs-dist` - PDF processing library that works in web browsers

### Key Features:

- **Real-time progress tracking** - Shows current page being processed and percentage complete
- **High-quality conversion** - Uses 2x scale for crisp images
- **Image preview** - Click any converted page to view full-size
- **Bulk download** - Download all converted pages as JPG files
- **Error handling** - Graceful fallbacks for unsupported files or errors

## Usage

1. Navigate to the homepage
2. Upload a PDF file using "Select Files" or drag & drop
3. Enter manual details and click "Generate"
4. Watch the progress modal as your PDF is converted
5. View and download the converted JPG images

## Technical Notes

- PDF.js worker is loaded from CDN for optimal performance
- Canvas rendering at 2x scale ensures high image quality
- Each page is converted to JPEG with 90% quality
- Memory is efficiently managed by cleaning up canvas elements
- Works entirely in the browser - no server-side processing needed

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support  
- Safari: Full support
- Requires modern browser with Canvas API support