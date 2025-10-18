<script>
  /**
   * PDFSlide Component
   * 
   * Renders a PDF slide from a data URL
   * 
   * Props:
   * - slideDataUrl: Data URL of the rendered PDF page
   * - slideNumber: Slide number for display (1-based)
   * - className: Additional CSS classes
   */
  
  export let slideDataUrl = '';
  export let slideNumber = 0;
  export let className = '';
  
  // Handle image load error
  function handleError() {
    console.error(`Failed to load slide ${slideNumber}`);
  }
</script>

{#if slideDataUrl}
  <div class="pdf-slide {className}">
    <img
      src={slideDataUrl}
      alt="Slide {slideNumber}"
      class="w-full h-full object-contain"
      on:error={handleError}
    />
  </div>
{:else}
  <div class="pdf-slide {className} flex items-center justify-center bg-gray-800">
    <p class="text-gray-400">No slide loaded</p>
  </div>
{/if}

<style>
  .pdf-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #1f2937; /* gray-800 */
    overflow: hidden;
  }
</style>

