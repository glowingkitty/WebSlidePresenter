<script>
  /**
   * Audience View
   * 
   * Fullscreen slide display for the audience
   * - Listens to BroadcastChannel for slide changes
   * - Displays current slide in fullscreen
   * - Minimal UI, professional appearance
   */
  
  import { onMount, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { onMessage, closeChannel } from '$lib/services/broadcast.js';
  import { loadSlides } from '$lib/services/indexedDBService.js';
  import PDFSlide from '$lib/components/PDFSlide.svelte';
  
  // Local state for audience view
  let slides = writable([]);
  let currentSlide = writable(0);
  let isFullscreen = false;
  
  // Cleanup function for broadcast listener
  let cleanupBroadcast = null;
  
  /**
   * Handle messages from presenter view
   */
  function handleBroadcastMessage(message) {
    console.log('Audience view received:', message);
    
    switch (message.type) {
      case 'SLIDE_CHANGE':
        currentSlide.set(message.slideIndex);
        break;
      
      case 'PRESENTATION_LOADED':
        console.log(`Presentation loaded: ${message.totalSlides} slides`);
        // Note: Audience view shares the same origin, so it can access
        // the slides from the presenter's localStorage or we need to
        // pass slide data through BroadcastChannel
        break;
    }
  }
  
  /**
   * Toggle fullscreen mode
   */
  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        isFullscreen = true;
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    } else {
      try {
        await document.exitFullscreen();
        isFullscreen = false;
      } catch (error) {
        console.error('Failed to exit fullscreen:', error);
      }
    }
  }
  
  /**
   * Handle keyboard events
   */
  function handleKeyPress(event) {
    if (event.key === 'f' || event.key === 'F') {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === 'Escape' && isFullscreen) {
      isFullscreen = false;
    }
  }
  
  /**
   * Load slides from IndexedDB
   * Both windows access shared IndexedDB to get slide data
   */
  async function loadSlidesFromDB() {
    try {
      const loadedSlides = await loadSlides();
      if (loadedSlides.length > 0) {
        slides.set(loadedSlides);
        console.log(`Audience: Loaded ${loadedSlides.length} slides from IndexedDB`);
      } else {
        console.log('Audience: No slides in IndexedDB yet');
      }
    } catch (error) {
      console.error('Audience: Failed to load slides from IndexedDB:', error);
    }
  }
  
  onMount(() => {
    console.log('Audience view mounted');
    
    // Setup broadcast listener
    cleanupBroadcast = onMessage(handleBroadcastMessage);
    
    // Setup keyboard listener
    window.addEventListener('keydown', handleKeyPress);
    
    // Load slides from IndexedDB
    loadSlidesFromDB();
    
    // Poll for slide updates (in case presenter loads PDF after audience view opens)
    const pollInterval = setInterval(loadSlidesFromDB, 2000);
    
    return () => {
      clearInterval(pollInterval);
    };
  });
  
  onDestroy(() => {
    console.log('Audience view unmounted');
    
    // Cleanup broadcast listener
    if (cleanupBroadcast) {
      cleanupBroadcast();
    }
    
    // Cleanup keyboard listener
    window.removeEventListener('keydown', handleKeyPress);
    
    // Close broadcast channel
    closeChannel();
  });
  
  // Export slides to sessionStorage whenever they change in presenter
  // This is a workaround since BroadcastChannel can't send large data easily
  // We'll update this to work with the presenter view
</script>

<svelte:head>
  <title>PresentPilot - Audience View</title>
</svelte:head>

<div class="h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
  {#if $slides.length > 0 && $slides[$currentSlide]}
    <!-- Display current slide -->
    <div class="w-full h-full flex items-center justify-center p-8">
      <PDFSlide
        slideDataUrl={$slides[$currentSlide]}
        slideNumber={$currentSlide + 1}
        className="max-w-full max-h-full"
      />
    </div>
    
    <!-- Minimal UI overlay -->
    <div class="fixed bottom-4 right-4 flex items-center gap-2 bg-gray-900 bg-opacity-75 px-4 py-2 rounded text-sm text-gray-300">
      <span>{$currentSlide + 1} / {$slides.length}</span>
      <button
        on:click={toggleFullscreen}
        class="ml-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs transition-colors"
      >
        {isFullscreen ? 'Exit' : 'Fullscreen'} (F)
      </button>
    </div>
  {:else}
    <!-- Waiting for presentation -->
    <div class="text-center">
      <div class="text-white text-2xl mb-4">🧭 PresentPilot</div>
      <div class="text-gray-400">Waiting for presentation...</div>
      <div class="text-gray-500 text-sm mt-2">
        Load a PDF in the presenter view to begin
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    overflow: hidden;
  }
</style>

