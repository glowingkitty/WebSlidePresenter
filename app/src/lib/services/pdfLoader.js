/**
 * PDF Loader Service
 * 
 * Handles PDF loading and rendering using PDF.js
 * - Loads PDF files from File API
 * - Renders each page to canvas and stores as data URL
 * - Updates presentation stores with loaded data
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - using static file
// This avoids CORS and CDN issues
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

/**
 * Load a PDF file and render all pages
 * @param {File} file - PDF file from input
 * @param {function} onProgress - Progress callback (currentPage, totalPages)
 * @returns {Promise<{document, slides}>} PDF document and array of slide data URLs
 */
export async function loadPDF(file, onProgress = null) {
  try {
    console.log(`Loading PDF: ${file.name}, size: ${file.size} bytes`);
    
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    
    console.log(`PDF loaded: ${pdfDoc.numPages} pages`);
    
    // Render all pages
    const slides = [];
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      console.log(`Rendering page ${i}/${pdfDoc.numPages}`);
      
      const page = await pdfDoc.getPage(i);
      const dataUrl = await renderPageToDataURL(page);
      slides.push(dataUrl);
      
      // Call progress callback
      if (onProgress) {
        onProgress(i, pdfDoc.numPages);
      }
    }
    
    console.log(`All ${slides.length} pages rendered`);
    
    return {
      document: pdfDoc,
      slides,
      fileName: file.name
    };
  } catch (error) {
    console.error('Failed to load PDF:', error);
    throw new Error(`Failed to load PDF: ${error.message}`);
  }
}

/**
 * Render a single PDF page to a data URL
 * @param {PDFPageProxy} page - PDF.js page object
 * @param {number} scale - Render scale (default: 2 for high quality)
 * @returns {Promise<string>} Data URL of rendered page
 */
async function renderPageToDataURL(page, scale = 2) {
  // Get page viewport
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  
  // Render page to canvas
  const renderContext = {
    canvasContext: context,
    viewport: viewport
  };
  
  await page.render(renderContext).promise;
  
  // Convert canvas to data URL
  return canvas.toDataURL('image/png');
}

/**
 * Get dimensions of a PDF page
 * @param {PDFPageProxy} page - PDF.js page object
 * @returns {Object} Width and height
 */
export function getPageDimensions(page) {
  const viewport = page.getViewport({ scale: 1 });
  return {
    width: viewport.width,
    height: viewport.height
  };
}

/**
 * Preload PDF.js worker
 * Call this early in the app lifecycle to speed up first PDF load
 */
export function preloadWorker() {
  // Worker is lazy-loaded, so we don't need to do anything special
  console.log('PDF.js worker configured');
}

