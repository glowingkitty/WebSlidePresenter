<script>
  /**
   * Presenter View (Main Page)
   * 
   * Main control interface for the presenter with:
   * - PDF upload
   * - Current slide (large) and next slide preview
   * - Mini current/next slides in top right (PowerPoint style)
   * - Timer and pacing controls
   * - Speaker notes editor
   * - Keyboard navigation
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { slides, currentSlide, totalSlides, pdfFileName, nextSlide, previousSlide, firstSlide, lastSlide, resetPresentation } from '$lib/stores/presentation.js';
  import { pdfDocument } from '$lib/stores/presentation.js';
  import { isRunning, startTimer } from '$lib/stores/timing.js';
  import { loadPDF } from '$lib/services/pdfLoader.js';
  import { sendSlideChange, sendPresentationLoaded } from '$lib/services/broadcast.js';
  import { readYAMLFile } from '$lib/services/yamlService.js';
  import { setTargetTimes } from '$lib/stores/timing.js';
  import { saveSlides } from '$lib/services/indexedDBService.js';
  
  import PDFSlide from '$lib/components/PDFSlide.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import NotesEditor from '$lib/components/NotesEditor.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import TimingSetupModal from '$lib/components/TimingSetupModal.svelte';
  
  // UI state
  let isLoadingPDF = false;
  let loadingProgress = { current: 0, total: 0 };
  let isTimingModalOpen = false;
  let showKeyboardShortcuts = false;
  
  // Reactive: next slide index
  $: nextSlideIndex = $currentSlide < $totalSlides - 1 ? $currentSlide + 1 : null;
  
  /**
   * Handle PDF file upload
   */
  async function handlePDFUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      isLoadingPDF = true;
      loadingProgress = { current: 0, total: 0 };
      
      console.log('Loading PDF:', file.name);
      
      // Load PDF and render slides
      const result = await loadPDF(file, (current, total) => {
        loadingProgress = { current, total };
      });
      
      // Update stores
      pdfDocument.set(result.document);
      slides.set(result.slides);
      pdfFileName.set(result.fileName);
      currentSlide.set(0);
      
      console.log(`PDF loaded: ${result.slides.length} slides`);
      
      // Share slides with audience view via IndexedDB (avoids sessionStorage quota issues)
      try {
        await saveSlides(result.slides);
        console.log('Slides saved to IndexedDB for audience view');
      } catch (error) {
        console.error('Failed to save slides to IndexedDB:', error);
        // Non-fatal - presenter view will still work
      }
      
      // Broadcast to audience window
      sendPresentationLoaded(result.slides.length);
      
      // Try to auto-load matching YAML file
      await tryAutoLoadYAML(file.name);
      
      isLoadingPDF = false;
    } catch (error) {
      console.error('Failed to load PDF:', error);
      alert(`Failed to load PDF: ${error.message}`);
      isLoadingPDF = false;
    }
  }
  
  /**
   * Try to auto-load YAML file with same name as PDF
   */
  async function tryAutoLoadYAML(pdfName) {
    // Create a file input to check if YAML exists
    // Note: For security, we can't directly check file existence
    // User would need to select it manually
    console.log('To load timing, use "Setup Timing" > "Import YAML"');
  }
  
  /**
   * Handle keyboard navigation
   */
  function handleKeyPress(event) {
    // Ignore if user is typing in an input/textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    switch (event.key) {
      case 'ArrowRight':
      case ' ':
        event.preventDefault();
        nextSlide();
        sendSlideChange($currentSlide + 1);
        // Auto-start timer on first navigation
        if (!$isRunning && $currentSlide === 0) {
          startTimer();
        }
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        previousSlide();
        sendSlideChange($currentSlide - 1);
        break;
      
      case 'Home':
        event.preventDefault();
        firstSlide();
        sendSlideChange(0);
        break;
      
      case 'End':
        event.preventDefault();
        lastSlide();
        sendSlideChange($totalSlides - 1);
        break;
      
      case '?':
        event.preventDefault();
        showKeyboardShortcuts = !showKeyboardShortcuts;
        break;
    }
  }
  
  /**
   * Open audience window
   */
  function openAudienceWindow() {
    const audienceUrl = '/audience';
    window.open(audienceUrl, '_blank', 'width=1920,height=1080');
  }
  
  /**
   * Update broadcast when slide changes
   */
  $: if ($currentSlide >= 0) {
    sendSlideChange($currentSlide);
  }
  
  // Setup keyboard listeners
  onMount(() => {
    window.addEventListener('keydown', handleKeyPress);
    console.log('Presenter view mounted');
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyPress);
    console.log('Presenter view unmounted');
  });
</script>

<svelte:head>
  <title>PresentPilot - Presenter View</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-gray-100 p-4">
  {#if $totalSlides === 0}
    <!-- Welcome screen -->
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-4xl font-bold mb-4 text-white">🧭 PresentPilot</h1>
      <p class="text-gray-400 mb-8">Professional presentation tool with timing and dual-window support</p>
      
      <label class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors text-lg">
        <input
          type="file"
          accept=".pdf"
          on:change={handlePDFUpload}
          class="hidden"
        />
        📁 Load PDF Presentation
      </label>
      
      {#if isLoadingPDF}
        <div class="mt-6 text-center">
          <div class="text-sm text-gray-400">Loading PDF...</div>
          <div class="text-xs text-gray-500">
            {loadingProgress.current} / {loadingProgress.total} pages
          </div>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Presenter interface -->
    <div class="grid grid-cols-12 gap-4 h-screen max-h-screen">
      <!-- Top bar (spans full width) -->
      <div class="col-span-12 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h1 class="text-xl font-bold text-white">🧭 PresentPilot</h1>
            <label class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded cursor-pointer transition-colors">
              <input
                type="file"
                accept=".pdf"
                on:change={handlePDFUpload}
                class="hidden"
              />
              Change PDF
            </label>
            <button
              on:click={() => isTimingModalOpen = true}
              class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded transition-colors"
            >
              Setup Timing
            </button>
          </div>
          
          <div class="flex items-center gap-4">
            <button
              on:click={openAudienceWindow}
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              Open Audience View
            </button>
            <button
              on:click={() => showKeyboardShortcuts = !showKeyboardShortcuts}
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              ?
            </button>
          </div>
        </div>
        
        <!-- Progress bar -->
        <ProgressBar />
      </div>
      
      <!-- Main content area -->
      <div class="col-span-8 flex flex-col gap-4 overflow-hidden">
        
        <!-- Large current slide with mini next slide overlay (PowerPoint style) -->
        <div class="flex-1 bg-gray-800 rounded-lg p-4 flex items-center justify-center overflow-hidden relative">
          {#if $slides[$currentSlide]}
            <PDFSlide
              slideDataUrl={$slides[$currentSlide]}
              slideNumber={$currentSlide + 1}
              className="max-h-full"
            />
          {/if}
          
          <!-- Mini next slide preview (top right corner) -->
          {#if nextSlideIndex !== null && $slides[nextSlideIndex]}
            <div class="absolute top-6 right-6 w-48 bg-gray-900 rounded border-2 border-gray-700 shadow-xl p-2">
              <div class="text-xs text-gray-400 mb-1 text-center">Next Slide</div>
              <div class="aspect-video bg-gray-700 rounded overflow-hidden">
                <PDFSlide
                  slideDataUrl={$slides[nextSlideIndex]}
                  slideNumber={nextSlideIndex + 1}
                  className="h-full"
                />
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Notes editor -->
        <div class="bg-gray-800 rounded-lg p-4">
          <NotesEditor slideIndex={$currentSlide} />
        </div>
      </div>
      
      <!-- Right sidebar -->
      <div class="col-span-4 flex flex-col gap-4 overflow-y-auto scrollbar-thin">
        <!-- Timer panel -->
        <Timer />
        
        <!-- Navigation help -->
        <div class="bg-gray-800 rounded-lg p-4 text-sm">
          <h3 class="font-semibold text-gray-300 mb-2">Quick Navigation</h3>
          <div class="space-y-1 text-gray-400 text-xs">
            <div><kbd class="px-2 py-1 bg-gray-700 rounded">→</kbd> <kbd class="px-2 py-1 bg-gray-700 rounded">Space</kbd> Next slide</div>
            <div><kbd class="px-2 py-1 bg-gray-700 rounded">←</kbd> Previous slide</div>
            <div><kbd class="px-2 py-1 bg-gray-700 rounded">Home</kbd> First slide</div>
            <div><kbd class="px-2 py-1 bg-gray-700 rounded">End</kbd> Last slide</div>
            <div><kbd class="px-2 py-1 bg-gray-700 rounded">?</kbd> Keyboard shortcuts</div>
          </div>
        </div>
        
        <!-- File info -->
        <div class="bg-gray-800 rounded-lg p-4 text-sm">
          <h3 class="font-semibold text-gray-300 mb-2">Presentation Info</h3>
          <div class="space-y-1 text-gray-400 text-xs">
            <div class="truncate" title={$pdfFileName}>
              <span class="text-gray-500">File:</span> {$pdfFileName}
            </div>
            <div>
              <span class="text-gray-500">Slides:</span> {$totalSlides}
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Timing setup modal -->
<TimingSetupModal bind:isOpen={isTimingModalOpen} />

<!-- Keyboard shortcuts overlay -->
{#if showKeyboardShortcuts}
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    on:click={() => showKeyboardShortcuts = false}
  >
    <div class="bg-gray-800 rounded-lg p-6 max-w-md" on:click|stopPropagation>
      <h2 class="text-xl font-bold text-white mb-4">Keyboard Shortcuts</h2>
      <div class="space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400">Next slide</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">→</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Previous slide</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">←</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Next slide (alt)</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">Space</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">First slide</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">Home</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Last slide</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">End</kbd>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Toggle shortcuts</span>
          <kbd class="px-3 py-1 bg-gray-700 rounded text-white">?</kbd>
        </div>
      </div>
      <button
        on:click={() => showKeyboardShortcuts = false}
        class="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
      >
        Close
      </button>
    </div>
  </div>
{/if}

<style>
  kbd {
    font-family: monospace;
    font-size: 0.875em;
  }
</style>
