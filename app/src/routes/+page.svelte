<script lang="ts">
  /**
   * Presenter View (Main Page)
   * 
   * Main control interface for the presenter with:
   * - PDF upload with drag & drop support
   * - Current slide (large) and next slide preview
   * - Mini current/next slides in top right (PowerPoint style)
   * - Timer and pacing controls
   * - Speaker notes editor
   * - Keyboard navigation
   * - Persistent slide storage (restores on reload)
   * - Responsive design for mobile/tablet
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { slides, currentSlide, totalSlides, pdfFileName, nextSlide, previousSlide, firstSlide, lastSlide, resetPresentation } from '$lib/stores/presentation.js';
  import { pdfDocument } from '$lib/stores/presentation.js';
  import { isRunning, startTimer, explicitTargetTimes, targetTimes, resetTimer } from '$lib/stores/timing.js';
  import { loadPDF } from '$lib/services/pdfLoader.js';
  import { sendSlideChange, sendPresentationLoaded } from '$lib/services/broadcast.js';
  import { exportConfigToYAML, downloadYAML, readYAMLFile } from '$lib/services/yamlService.js';
  import { setTargetTimes } from '$lib/stores/timing.js';
  import { saveSlides, loadSlides, clearSlides } from '$lib/services/indexedDBService.js';
  import { speakerNotes } from '$lib/stores/notes.js';
  import { isExplicitTime } from '$lib/services/timingInterpolation.js';
  import { saveToStorage, loadFromStorage, removeFromStorage } from '$lib/services/storage.js';
  
  import PDFSlide from '$lib/components/PDFSlide.svelte';
  import Timer from '$lib/components/Timer.svelte';
  import NotesEditor from '$lib/components/NotesEditor.svelte';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  
  // UI state
  let isLoadingPDF = false;
  let loadingProgress = { current: 0, total: 0 };
  let showKeyboardShortcuts = false;
  let isDragging = false;
  let fileInputRef: HTMLInputElement;
  
  // Reactive: next slide index
  $: nextSlideIndex = $currentSlide < $totalSlides - 1 ? $currentSlide + 1 : null;
  
  /**
   * Restore slides from IndexedDB on page load
   * This allows the presentation to persist across page refreshes
   */
  async function restoreSlidesFromStorage() {
    try {
      console.log('Checking for stored slides...');
      const storedSlides = await loadSlides();
      
      if (storedSlides && storedSlides.length > 0) {
        console.log(`Restoring ${storedSlides.length} slides from storage`);
        slides.set(storedSlides as string[]);
        
        // Restore PDF filename and current slide from localStorage
        const storedFileName = loadFromStorage('WebSlidePresenter-currentPdfName');
        const storedSlideIndex = loadFromStorage('WebSlidePresenter-currentSlideIndex');
        
        if (storedFileName) {
          pdfFileName.set(storedFileName);
        }
        
        if (typeof storedSlideIndex === 'number' && storedSlideIndex >= 0 && storedSlideIndex < storedSlides.length) {
          currentSlide.set(storedSlideIndex);
        } else {
          currentSlide.set(0);
        }
        
        // Broadcast to audience window
        sendPresentationLoaded(storedSlides.length);
        sendSlideChange(storedSlideIndex || 0);
      }
    } catch (error) {
      console.error('Failed to restore slides from storage:', error);
    }
  }
  
  /**
   * Handle PDF file upload
   */
  async function handlePDFUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;
    
    await processPDFFile(file);
    
    // Reset file input
    if (target) {
      target.value = '';
    }
  }
  
  /**
   * Process a PDF file (from upload or drag & drop)
   */
  async function processPDFFile(file: File) {
    if (!file || file.type !== 'application/pdf') {
      alert('Please select a valid PDF file');
      return;
    }
    
    try {
      // Reset presentation state but keep slides while loading
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
      
      // Save to persistent storage
      saveToStorage('WebSlidePresenter-currentPdfName', (result as any).fileName);
      saveToStorage('WebSlidePresenter-currentSlideIndex', 0);
      
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
   * Handle drag & drop events
   */
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = true;
  }
  
  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
  }
  
  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    isDragging = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      await processPDFFile(file);
    }
  }
  
  /**
   * Trigger file input click for manual file selection
   */
  function openFileDialog() {
    fileInputRef?.click();
  }
  
  /**
   * Clear all data (slides, notes, timing, etc.)
   */
  async function clearAllData() {
    const confirmed = confirm(
      'This will clear all data including:\n' +
      '• Current presentation slides\n' +
      '• Speaker notes\n' +
      '• Timing information\n' +
      '• Saved state\n\n' +
      'This action cannot be undone. Continue?'
    );
    
    if (!confirmed) return;
    
    try {
      console.log('Clearing all data...');
      
      // Clear presentation state
      resetPresentation();
      
      // Clear timing
      resetTimer();
      setTargetTimes({});
      
      // Clear notes
      speakerNotes.set({});
      
      // Clear IndexedDB
      await clearSlides();
      
      // Clear localStorage
      removeFromStorage('WebSlidePresenter-currentPdfName');
      removeFromStorage('WebSlidePresenter-currentSlideIndex');
      
      console.log('All data cleared successfully');
    } catch (error) {
      console.error('Failed to clear all data:', error);
      alert('Failed to clear some data. Please check the console for details.');
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
   * Also save current slide index to localStorage
   */
  $: {
    if ($currentSlide >= 0 && $totalSlides > 0) {
      sendSlideChange($currentSlide);
      // Save current slide index for persistence
      saveToStorage('WebSlidePresenter-currentSlideIndex', $currentSlide);
    }
  }
  
  // Setup keyboard listeners and restore slides on mount
  onMount(async () => {
    window.addEventListener('keydown', handleKeyPress);
    console.log('Presenter view mounted');
    
    // Restore slides from storage if available
    await restoreSlidesFromStorage();
  });
  
  onDestroy(() => {
    window.removeEventListener('keydown', handleKeyPress);
    console.log('Presenter view unmounted');
  });
</script>

<svelte:head>
  <title>WebSlidePresenter - Presenter View</title>
</svelte:head>

<!-- Hidden file input for PDF upload -->
<input
  bind:this={fileInputRef}
  type="file"
  accept=".pdf"
  on:change={handlePDFUpload}
  class="hidden"
/>

<div class="min-h-screen bg-gray-900 text-gray-100 p-2 sm:p-4">
  <!-- Presenter interface - always visible -->
    <div class="flex flex-col gap-2 sm:gap-4 h-screen max-h-screen">
      <!-- Top bar -->
      <div class="space-y-2">
        <!-- Header row -->
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg sm:text-xl font-bold text-white whitespace-nowrap">🧭 WebSlidePresenter</h1>
            <button
              on:click={openFileDialog}
              class="px-2 sm:px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap"
              title="Change PDF file"
            >
              {$totalSlides > 0 ? '📁 Change PDF' : '📁 Load PDF'}
            </button>
            {#if $totalSlides > 0}
              <button
                on:click={loadConfig}
                class="px-2 sm:px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap"
                title="Load timing and notes from file"
              >
                📂 Config
              </button>
              <button
                on:click={saveConfig}
                class="px-2 sm:px-3 py-1 bg-gray-700 hover:bg-gray-600 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap"
                title="Save timing and notes to file"
              >
                💾 Save
              </button>
              <button
                on:click={clearAllData}
                class="px-2 sm:px-3 py-1 bg-red-600 hover:bg-red-700 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap"
                title="Clear all data (slides, notes, timing)"
              >
                🗑️ Clear All
              </button>
            {/if}
          </div>
          
          <div class="flex items-center gap-2 flex-wrap">
            <a 
              href="https://github.com/glowingkitty/WebSlidePresenter" 
              target="_blank"
              rel="noopener noreferrer"
              class="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              title="View on GitHub"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
              </svg>
              GitHub
            </a>
            {#if $totalSlides > 0}
              <button
                on:click={openAudienceWindow}
                class="px-2 sm:px-4 py-2 bg-green-600 hover:bg-green-700 text-xs sm:text-sm text-white rounded transition-colors whitespace-nowrap"
              >
                👥 Audience
              </button>
            {/if}
            <button
              on:click={() => showKeyboardShortcuts = !showKeyboardShortcuts}
              class="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              title="Keyboard shortcuts"
            >
              ?
            </button>
          </div>
        </div>
        
        <!-- Progress bar - only show when slides are loaded -->
        {#if $totalSlides > 0}
          <ProgressBar />
        {/if}
      </div>
      
      <!-- Main content area - responsive grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-4 flex-1 overflow-hidden">
        <!-- Left/Main column (slides and notes) -->
        <div class="lg:col-span-8 flex flex-col gap-2 sm:gap-4 overflow-hidden">
          
          <!-- Current slide area with drop zone -->
          <div 
            class="flex-1 bg-gray-800 rounded-lg p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden relative min-h-[200px] {isDragging ? 'ring-4 ring-blue-500 ring-opacity-50' : ''}"
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            on:drop={handleDrop}
            role="button"
            tabindex="0"
            on:click={$totalSlides === 0 ? openFileDialog : undefined}
            on:keydown={(e) => { if (($totalSlides === 0) && (e.key === 'Enter' || e.key === ' ')) openFileDialog(); }}
          >
            {#if isLoadingPDF}
              <!-- Loading state -->
              <div class="text-center">
                <div class="text-lg sm:text-xl text-gray-300 mb-2">Processing PDF...</div>
                <div class="text-sm text-gray-400 mb-4">
                  {loadingProgress.current} / {loadingProgress.total} slides
                </div>
                <div class="text-xs text-gray-500">Filename: {$pdfFileName}</div>
                <!-- Loading progress bar -->
                <div class="w-64 max-w-full mx-auto mt-4 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    class="bg-blue-500 h-full transition-all duration-300"
                    style="width: {loadingProgress.total > 0 ? (loadingProgress.current / loadingProgress.total * 100) : 0}%"
                  ></div>
                </div>
              </div>
            {:else if $totalSlides === 0}
              <!-- Empty state with drop zone -->
              <div class="text-center cursor-pointer hover:bg-gray-700/50 rounded-lg p-4 sm:p-8 transition-colors w-full h-full flex flex-col items-center justify-center">
                <div class="text-4xl sm:text-6xl mb-4">📄</div>
                <div class="text-base sm:text-lg text-gray-300 mb-2">Select or Drop PDF</div>
                <div class="text-xs sm:text-sm text-gray-500">
                  Click here or drag & drop a PDF file to start
                </div>
              </div>
            {:else}
              <!-- Slide display with navigation -->
              <div class="relative w-full h-full flex items-center justify-center">
                {#if $slides[$currentSlide]}
                  <PDFSlide
                    slideDataUrl={$slides[$currentSlide]}
                    slideNumber={$currentSlide + 1}
                    className="max-h-full max-w-full"
                  />
                {/if}
                
                <!-- Navigation buttons overlay -->
                <div class="absolute inset-x-0 bottom-2 sm:bottom-4 flex items-center justify-center gap-2 sm:gap-4 px-2">
                  <button
                    on:click={firstSlide}
                    disabled={$currentSlide === 0}
                    class="px-2 sm:px-3 py-1 sm:py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
                    title="First slide (Home)"
                  >
                    ⏮️
                  </button>
                  <button
                    on:click={previousSlide}
                    disabled={$currentSlide === 0}
                    class="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
                    title="Previous slide (←)"
                  >
                    ◀️ Prev
                  </button>
                  <span class="px-2 sm:px-3 py-1 bg-gray-900/90 text-white rounded text-xs sm:text-sm whitespace-nowrap">
                    {$currentSlide + 1} / {$totalSlides}
                  </span>
                  <button
                    on:click={nextSlide}
                    disabled={$currentSlide >= $totalSlides - 1}
                    class="px-3 sm:px-4 py-1 sm:py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
                    title="Next slide (→ or Space)"
                  >
                    Next ▶️
                  </button>
                  <button
                    on:click={lastSlide}
                    disabled={$currentSlide >= $totalSlides - 1}
                    class="px-2 sm:px-3 py-1 sm:py-2 bg-gray-900/90 hover:bg-gray-800 text-white rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed text-xs sm:text-sm"
                    title="Last slide (End)"
                  >
                    ⏭️
                  </button>
                </div>
                
                <!-- Mini next slide preview (top right corner) - only show on larger screens -->
                {#if nextSlideIndex !== null && $slides[nextSlideIndex]}
                  <div class="hidden md:block absolute top-2 sm:top-6 right-2 sm:right-6 w-32 sm:w-48 bg-gray-900 rounded border-2 border-gray-700 shadow-xl p-1 sm:p-2">
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
            {/if}
          </div>
          
          <!-- Notes editor - only show when slides are loaded -->
          {#if $totalSlides > 0}
            <div class="bg-gray-800 rounded-lg p-2 sm:p-4 max-h-[30vh] lg:max-h-[25vh] overflow-hidden">
              <NotesEditor slideIndex={$currentSlide} />
            </div>
          {/if}
        </div>
        
        <!-- Right sidebar - only show when slides are loaded -->
        {#if $totalSlides > 0}
        <div class="lg:col-span-4 flex flex-col gap-2 sm:gap-4 overflow-y-auto scrollbar-thin max-h-[40vh] lg:max-h-full">
          <!-- Timer panel -->
          <Timer />
          
          <!-- Navigation help - hide on smaller screens -->
          <div class="hidden md:block bg-gray-800 rounded-lg p-3 sm:p-4 text-sm">
            <h3 class="font-semibold text-gray-300 mb-2 text-xs sm:text-sm">Quick Navigation</h3>
            <div class="space-y-1 text-gray-400 text-xs">
              <div><kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">→</kbd> <kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Space</kbd> Next</div>
              <div><kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">←</kbd> Previous</div>
              <div><kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">Home</kbd> First</div>
              <div><kbd class="px-1.5 py-0.5 bg-gray-700 rounded text-[10px]">End</kbd> Last</div>
            </div>
          </div>
          
          <!-- File info -->
          <div class="bg-gray-800 rounded-lg p-3 sm:p-4 text-sm">
            <h3 class="font-semibold text-gray-300 mb-2 text-xs sm:text-sm">Presentation Info</h3>
            <div class="space-y-1 text-gray-400 text-xs mb-3">
              <div class="truncate" title={$pdfFileName}>
                <span class="text-gray-500">File:</span> {$pdfFileName}
              </div>
              <div>
                <span class="text-gray-500">Slides:</span> {$totalSlides}
              </div>
              {#if Object.keys($targetTimes).length > 0}
                <div>
                  <span class="text-gray-500">Duration:</span> {Math.round(($targetTimes as Record<number, number>)[$totalSlides - 1] || 0)} min
                </div>
              {/if}
            </div>
            
            {#if Object.keys($targetTimes).length > 0}
              <div class="border-t border-gray-700 pt-3">
                <h4 class="font-semibold text-gray-300 mb-2 text-xs">Timing Overview</h4>
                <div class="max-h-32 sm:max-h-48 overflow-y-auto scrollbar-thin space-y-1">
                  {#each Array($totalSlides) as _, i}
                    {@const targetTime = ($targetTimes as Record<number, number>)[i]}
                    {@const isExplicit = isExplicitTime(i, $explicitTargetTimes)}
                    {@const isCurrent = i === $currentSlide}
                    {#if targetTime !== undefined}
                      <div 
                        class="flex justify-between text-xs px-2 py-1 rounded transition-colors cursor-pointer {isCurrent ? 'bg-blue-600/30 text-blue-200' : 'text-gray-400 hover:bg-gray-700/50'}"
                        on:click={() => currentSlide.set(i)}
                        on:keydown={(e) => { if (e.key === 'Enter') currentSlide.set(i); }}
                        role="button"
                        tabindex="0"
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
        {/if}
      </div>
    </div>
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
