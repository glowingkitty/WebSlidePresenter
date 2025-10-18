<script lang="ts">
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
  import { exportConfigToYAML, downloadYAML, readYAMLFile } from '$lib/services/yamlService.js';
  import { setTargetTimes } from '$lib/stores/timing.js';
  import { saveSlides } from '$lib/services/indexedDBService.js';
  import { speakerNotes } from '$lib/stores/notes.js';
  import { explicitTargetTimes, targetTimes } from '$lib/stores/timing.js';
  import { isExplicitTime } from '$lib/services/timingInterpolation.js';
  
  import PDFSlide from '$lib/components/PDFSlide.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import NotesEditor from '$lib/components/NotesEditor.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  
  // UI state
  let isLoadingPDF = false;
  let loadingProgress = { current: 0, total: 0 };
  let showKeyboardShortcuts = false;
  
  // Reactive: next slide index
  $: nextSlideIndex = $currentSlide < $totalSlides - 1 ? $currentSlide + 1 : null;
  
  /**
   * Handle PDF file upload
   */
  async function handlePDFUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    try {
      isLoadingPDF = true;
      loadingProgress = { current: 0, total: 0 };
      
      console.log('Loading PDF:', file.name);
      
      // Load PDF and render slides
      const result = await loadPDF(file, (current: number, total: number) => {
        loadingProgress = { current, total };
      });
      
      // Update stores
      pdfDocument.set(result.document);
      slides.set(result.slides);
      pdfFileName.set((result as any).fileName);
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
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to load PDF: ${message}`);
      isLoadingPDF = false;
    }
  }
  
  /**
   * Try to auto-load YAML file with same name as PDF
   */
  async function tryAutoLoadYAML(pdfName: string) {
    // Create a file input to check if YAML exists
    // Note: For security, we can't directly check file existence
    // User would need to select it manually
    console.log('To load timing, use "Load Config" button');
  }
  
  /**
   * Save config (timing + notes) to file
   */
  function saveConfig() {
    try {
      const yamlString = exportConfigToYAML($explicitTargetTimes, $speakerNotes, $pdfFileName);
      const baseFileName = $pdfFileName.replace(/\.pdf$/i, '');
      downloadYAML(yamlString, baseFileName);
      console.log('Config saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to save config: ${message}`);
    }
  }
  
  /**
   * Load config (timing + notes) from file
   */
  async function loadConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yml,.yaml';
    
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;
      
      try {
        const data = await readYAMLFile(file);
        
        // Load timing
        if ('targetTimes' in data && data.targetTimes) {
          setTargetTimes(data.targetTimes as Record<number, number>);
          console.log('Timing loaded');
        }
        
        // Load notes
        if ('speakerNotes' in data && data.speakerNotes) {
          speakerNotes.set(data.speakerNotes as Record<number, string>);
          const noteCount = Object.keys(data.speakerNotes as Record<number, string>).length;
          console.log('Notes loaded:', noteCount, 'slides');
        }
        
        alert('Config loaded successfully!');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        alert(`Failed to load config: ${message}`);
      }
    };
    
    input.click();
  }
  
  /**
   * Handle keyboard navigation
   */
  function handleKeyPress(event: KeyboardEvent) {
    // Ignore if user is typing in an input/textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }
    
    switch (event.key) {
      case 'ArrowRight':
      case ' ':
        event.preventDefault();
        // Only navigate if not at end
        if ($currentSlide < $totalSlides - 1) {
          nextSlide();
          // Auto-start timer on first navigation
          if (!$isRunning && $currentSlide === 0) {
            startTimer();
          }
        }
        break;
      
      case 'ArrowLeft':
        event.preventDefault();
        // Only navigate if not at beginning
        if ($currentSlide > 0) {
          previousSlide();
        }
        break;
      
      case 'Home':
        event.preventDefault();
        firstSlide();
        break;
      
      case 'End':
        event.preventDefault();
        lastSlide();
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
   * React to slide changes and broadcast to audience
   */
  $: {
    if ($currentSlide >= 0 && $totalSlides > 0) {
      sendSlideChange($currentSlide);
    }
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
          <div class="flex items-center gap-2">
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
              on:click={loadConfig}
              class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded transition-colors"
              title="Load timing and notes from file"
            >
              📂 Load Config
            </button>
            <button
              on:click={saveConfig}
              class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded transition-colors"
              title="Save timing and notes to file"
            >
              💾 Save Config
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
          <div class="space-y-1 text-gray-400 text-xs mb-3">
            <div class="truncate" title={$pdfFileName}>
              <span class="text-gray-500">File:</span> {$pdfFileName}
            </div>
            <div>
              <span class="text-gray-500">Slides:</span> {$totalSlides}
            </div>
            {#if Object.keys($targetTimes).length > 0}
              <div>
                <span class="text-gray-500">Total Duration:</span> {Math.round(($targetTimes as Record<number, number>)[$totalSlides - 1] || 0)} min
              </div>
            {/if}
          </div>
          
          {#if Object.keys($targetTimes).length > 0}
            <div class="border-t border-gray-700 pt-3">
              <h4 class="font-semibold text-gray-300 mb-2 text-xs">Timing Overview</h4>
              <div class="max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                {#each Array($totalSlides) as _, i}
                  {@const targetTime = ($targetTimes as Record<number, number>)[i]}
                  {@const isExplicit = isExplicitTime(i, $explicitTargetTimes)}
                  {@const isCurrent = i === $currentSlide}
                  {#if targetTime !== undefined}
                    <div 
                      class="flex justify-between text-xs px-2 py-1 rounded transition-colors {isCurrent ? 'bg-blue-600/30 text-blue-200' : 'text-gray-400 hover:bg-gray-700/50'}"
                    >
                      <span class="flex items-center gap-1">
                        {isExplicit ? '📍' : '🔄'}
                        <span class={isCurrent ? 'font-semibold' : ''}>Slide {i + 1}</span>
                      </span>
                      <span class={isCurrent ? 'font-semibold' : ''}>{Math.round(targetTime)} min</span>
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<!-- Keyboard shortcuts overlay -->
{#if showKeyboardShortcuts}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions a11y-interactive-supports-focus -->
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    on:click={() => showKeyboardShortcuts = false}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
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
