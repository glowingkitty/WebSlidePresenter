<script>
  /**
   * TimingSetupModal Component
   * 
   * Modal for setting up target times for each slide
   * Allows users to specify cumulative target times
   * Import/Export YAML timing files
   */
  
  import { totalSlides } from '../stores/presentation.js';
  import { explicitTargetTimes, targetTimes, setTargetTimes } from '../stores/timing.js';
  import { speakerNotes } from '../stores/notes.js';
  import { pdfFileName } from '../stores/presentation.js';
  import { exportConfigToYAML, downloadYAML, readYAMLFile } from '../services/yamlService.js';
  import { isExplicitTime } from '../services/timingInterpolation.js';
  
  export let isOpen = false;
  
  // Local copy of target times for editing
  let localTargetTimes = {};
  
  // Initialize local times when modal opens (use explicit times only)
  $: if (isOpen) {
    localTargetTimes = { ...$explicitTargetTimes };
  }
  
  // Get interpolated times for display
  $: interpolatedTimes = $targetTimes;
  
  /**
   * Close modal
   */
  function close() {
    isOpen = false;
  }
  
  /**
   * Save target times
   */
  function save() {
    setTargetTimes(localTargetTimes);
    console.log('Target times saved:', localTargetTimes);
    close();
  }
  
  /**
   * Handle input change for a slide's target time
   */
  function handleTimeChange(slideIndex, event) {
    const value = event.target.value;
    
    // If empty string, null, or undefined, remove the milestone
    if (value === '' || value === null || value === undefined) {
      const newTimes = { ...localTargetTimes };
      delete newTimes[slideIndex];
      localTargetTimes = newTimes;
      return;
    }
    
    // Otherwise, parse and set the value
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      localTargetTimes = {
        ...localTargetTimes,
        [slideIndex]: numValue
      };
    }
  }
  
  /**
   * Auto-fill times with equal distribution
   */
  function autoFillEqual() {
    const totalMinutes = parseFloat(prompt('Total presentation duration (minutes):') || '0');
    if (totalMinutes <= 0) return;
    
    const minutesPerSlide = totalMinutes / $totalSlides;
    localTargetTimes = {};
    
    for (let i = 0; i < $totalSlides; i++) {
      localTargetTimes[i] = Math.round((i + 1) * minutesPerSlide);
    }
  }
  
  /**
   * Clear all timing data
   */
  function clearAllTimes() {
    if (confirm('Clear all timing data? This cannot be undone.')) {
      localTargetTimes = {};
      console.log('All timing data cleared');
    }
  }
  
  /**
   * Export config (timing + notes) to YAML
   */
  function exportConfig() {
    try {
      const yamlString = exportConfigToYAML(localTargetTimes, $speakerNotes, $pdfFileName);
      const baseFileName = $pdfFileName.replace(/\.pdf$/i, '');
      downloadYAML(yamlString, baseFileName);
      console.log('Config (timing + notes) exported');
    } catch (error) {
      alert(`Failed to save config: ${error.message}`);
    }
  }
  
  /**
   * Import config (timing + notes) from YAML
   */
  async function importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.yml,.yaml';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      try {
        const data = await readYAMLFile(file);
        localTargetTimes = data.targetTimes || {};
        
        // Also import notes if present
        if (data.speakerNotes) {
          speakerNotes.set(data.speakerNotes);
          console.log('Notes imported:', Object.keys(data.speakerNotes).length, 'slides');
        }
        
        console.log('Config imported - Timing:', localTargetTimes);
      } catch (error) {
        alert(`Failed to load config: ${error.message}`);
      }
    };
    
    input.click();
  }
  
  /**
   * Handle click on backdrop
   */
  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      close();
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
    on:click={handleBackdropClick}
  >
    <div class="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-700">
        <h2 class="text-xl font-bold text-white">Setup Slide Timing</h2>
        <button
          on:click={close}
          class="text-gray-400 hover:text-white transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Actions -->
      <div class="px-6 py-4 border-b border-gray-700 flex gap-2 flex-wrap">
        <button
          on:click={autoFillEqual}
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
        >
          Auto-fill Equal
        </button>
        <button
          on:click={clearAllTimes}
          class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors"
        >
          Clear All
        </button>
        <div class="flex-1"></div>
        <button
          on:click={importConfig}
          class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title="Load timing and notes from file"
        >
          📂 Load Config
        </button>
        <button
          on:click={exportConfig}
          class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
          title="Save timing and notes to file"
        >
          💾 Save Config
        </button>
      </div>
      
      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <div class="bg-blue-900/30 border border-blue-700/50 rounded p-3 mb-4">
          <p class="text-sm text-blue-200 font-semibold mb-1">✨ Smart Timing - Set Milestones Only!</p>
          <p class="text-xs text-blue-300">
            📍 <strong>Set timing for KEY slides only</strong> (e.g., section starts, major transitions)
            <br/>🔄 Times for other slides are <strong>automatically calculated</strong> (interpolated)
            <br/><br/>Example: Set Slide 1 = 0, Slide 5 = 10, Slide 10 = 20
            <br/>→ System calculates: Slide 2 = 2.5, Slide 3 = 5, Slide 4 = 7.5, etc.
          </p>
        </div>
        
        <div class="space-y-2">
          {#each Array($totalSlides) as _, i}
            {@const isExplicit = isExplicitTime(i, localTargetTimes)}
            {@const interpolated = interpolatedTimes[i]}
            <div class="flex items-center gap-2">
              <label class="text-sm w-28 {isExplicit ? 'text-blue-300 font-semibold' : 'text-gray-400'}">
                {isExplicit ? '📍' : '🔄'} Slide {i + 1}:
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={localTargetTimes[i] || ''}
                on:input={(e) => handleTimeChange(i, e)}
                placeholder={interpolated !== undefined ? `Auto: ${Math.round(interpolated)}` : (i === 0 ? '0' : 'Auto')}
                class="flex-1 px-3 py-2 rounded text-white focus:outline-none transition-colors {isExplicit ? 'bg-blue-900/50 border-2 border-blue-500' : 'bg-gray-700 border border-gray-600 focus:border-blue-500'}"
              />
              <span class="text-sm text-gray-400 w-12">min</span>
              {#if isExplicit && i !== 0}
                <button
                  on:click={() => handleTimeChange(i, { target: { value: '' } })}
                  class="text-xs px-2 py-1 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove milestone"
                >
                  ✕
                </button>
              {:else}
                <div class="w-8"></div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Footer -->
      <div class="flex justify-end gap-3 p-6 border-t border-gray-700">
        <button
          on:click={close}
          class="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
        >
          Cancel
        </button>
        <button
          on:click={save}
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

