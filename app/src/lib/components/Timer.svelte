<script lang="ts">
  /**
   * Timer Component
   * 
   * Displays timer information with pacing indicators
   * Shows:
   * - Elapsed time (minutes only until last minute)
   * - Target time for current slide (editable when not running)
   * - Remaining time with color coding
   * - Play/pause controls
   */
  
  import { globalTimer, isRunning, pacingStatus, remainingTime, formatTime, toggleTimer, resetTimer, explicitTargetTimes, setTargetTime, setTargetTimes } from '../stores/timing.js';
  import { currentSlide, totalSlides } from '../stores/presentation.js';
  import { targetTimes } from '../stores/timing.js';
  import { isExplicitTime } from '../services/timingInterpolation.js';
  
  // Get current target time for the slide
  $: currentTargetTime = ($targetTimes as Record<number, number>)[$currentSlide] as number | undefined;
  
  // Check if current slide has explicit timing
  $: isExplicit = isExplicitTime($currentSlide, $explicitTargetTimes);
  
  /**
   * Handle timing edit for current slide
   */
  function handleTimingEdit(value: string) {
    const numValue = parseFloat(value);
    if (value === '' || isNaN(numValue)) {
      setTargetTime($currentSlide, null as any);
    } else if (numValue >= 0) {
      setTargetTime($currentSlide, numValue);
    }
  }
  
  /**
   * Auto-fill all slides with equal distribution
   */
  function autoFillTiming() {
    const totalMinutes = parseFloat(prompt('Total presentation duration (minutes):') || '0');
    if (totalMinutes <= 0) return;
    
    const minutesPerSlide = totalMinutes / $totalSlides;
    const newTimes: Record<number, number> = {};
    
    for (let i = 0; i < $totalSlides; i++) {
      newTimes[i] = Math.round((i + 1) * minutesPerSlide);
    }
    
    setTargetTimes(newTimes);
    console.log('Auto-filled timing for all slides');
  }
  
  /**
   * Clear all target times
   */
  function clearAllTiming() {
    if (confirm('Clear all timing? This cannot be undone.')) {
      setTargetTimes({});
      console.log('All timing cleared');
    }
  }
  
  /**
   * Stop presentation and return to edit mode
   */
  function stopPresentation() {
    resetTimer(); // This pauses and resets to 0
  }
  
  // Format elapsed time
  $: elapsedDisplay = formatTime($globalTimer, false);
  
  // Format remaining time (show seconds if under 1 minute)
  $: remainingDisplay = (() => {
    if ($remainingTime === null) return '--';
    
    const remainingMs = $remainingTime * 60 * 1000;
    const isLastMinute = remainingMs < 60000 && remainingMs >= 0;
    
    if (remainingMs < 0) {
      // Over time - show as positive with "Over by" label
      const overMs = Math.abs(remainingMs);
      return formatTime(overMs, false);
    }
    
    return formatTime(remainingMs, isLastMinute);
  })();
  
  // Check if over time
  $: isOverTime = $remainingTime !== null && $remainingTime < 0;
  
  // Determine color based on pacing status
  $: statusColor = (() => {
    switch ($pacingStatus.status) {
      case 'toofast': return 'text-orange-400';
      case 'ahead': return 'text-ahead';
      case 'ontime': return 'text-ontime';
      case 'behind': return 'text-behind';
      default: return 'text-gray-400';
    }
  })();
  
  $: statusBgColor = (() => {
    switch ($pacingStatus.status) {
      case 'toofast': return 'bg-orange-400/20';
      case 'ahead': return 'bg-ahead/20';
      case 'ontime': return 'bg-ontime/20';
      case 'behind': return 'bg-behind/20';
      default: return 'bg-gray-800';
    }
  })();
  
  // Status message
  $: statusMessage = (() => {
    switch ($pacingStatus.status) {
      case 'toofast': return '⚠️ Slow down!';
      case 'ahead': return '✓ Ahead of schedule';
      case 'ontime': return '≈ On schedule';
      case 'behind': return '⚠ Behind schedule';
      default: return '';
    }
  })();
</script>

<div class="timer-panel bg-gray-800 rounded-lg p-4 space-y-4">
  <!-- Timer controls -->
  <div class="space-y-2">
    <h3 class="text-sm font-semibold text-gray-300">
      {#if $isRunning}
        ⏱️ Presenting
      {:else if $globalTimer > 0}
        ✏️ Edit Mode (Paused: {elapsedDisplay})
      {:else}
        ✏️ Edit Mode
      {/if}
    </h3>
    <div class="flex flex-wrap gap-2">
      {#if !$isRunning}
        <!-- Edit mode buttons (fresh start or paused) -->
        <button
          on:click={autoFillTiming}
          class="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm transition-colors whitespace-nowrap"
          title="Distribute timing evenly across all slides"
        >
          Auto-fill
        </button>
        {#if Object.keys($explicitTargetTimes).length > 0}
          <button
            on:click={clearAllTiming}
            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors whitespace-nowrap"
            title="Clear all target times"
          >
            Clear All
          </button>
        {/if}
        {#if $globalTimer > 0}
          <!-- Paused - show Resume and Stop -->
          <button
            on:click={toggleTimer}
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors whitespace-nowrap"
            title="Resume presentation"
          >
            Resume
          </button>
          <button
            on:click={stopPresentation}
            class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors whitespace-nowrap"
            title="Stop and reset timer to 0"
          >
            Stop
          </button>
        {:else}
          <!-- Fresh start - show Start only -->
          <button
            on:click={toggleTimer}
            class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors whitespace-nowrap"
          >
            Start
          </button>
        {/if}
      {:else}
        <!-- Presentation mode - only Pause button -->
        <button
          on:click={toggleTimer}
          class="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors whitespace-nowrap"
          title="Pause and return to edit mode (keeps elapsed time)"
        >
          Pause
        </button>
      {/if}
    </div>
  </div>
  
  <!-- Elapsed time - show during presentation mode (running or paused) -->
  {#if $isRunning || $globalTimer > 0}
    <div class="text-center">
      <div class="text-sm text-gray-400 mb-1">Elapsed</div>
      <div class="text-3xl font-bold text-white">
        {elapsedDisplay}
      </div>
    </div>
  {/if}
  
  <!-- Target time for current slide - editable when not running -->
  <div class="text-center">
    <div class="text-sm text-gray-400 mb-1">
      Target {isExplicit ? '📍' : '🔄'}
    </div>
    {#if !$isRunning}
      <!-- Edit mode - can edit (even when paused) -->
      <div class="flex items-center justify-center gap-2">
        <input
          type="number"
          min="0"
          step="1"
          value={($explicitTargetTimes as Record<number, number>)[$currentSlide] || ''}
          on:input={(e) => handleTimingEdit((e.target as HTMLInputElement).value)}
          placeholder={currentTargetTime !== undefined ? `${Math.round(currentTargetTime)}` : '0'}
          class="w-20 px-2 py-1 text-center bg-gray-700 border border-gray-600 rounded text-white text-lg focus:outline-none focus:border-blue-500"
        />
        <span class="text-sm text-gray-400">min</span>
      </div>
      <div class="text-xs text-gray-500 mt-1">
        {isExplicit ? 'Milestone' : 'Auto-calc'}
      </div>
    {:else}
      <!-- Presenting - locked -->
      <div class="text-xl font-semibold text-gray-200">
        {Math.round(currentTargetTime || 0)} min
      </div>
      <div class="text-xs text-gray-500 mt-1">🔒 Locked</div>
    {/if}
  </div>
  
  <!-- Remaining/Over time with pacing indicator - show during presentation (running or paused) -->
  {#if ($isRunning || $globalTimer > 0) && $remainingTime !== null}
    <div class="text-center p-3 rounded {statusBgColor}">
      <div class="text-sm text-gray-400 mb-1">
        {isOverTime ? '⏰ Over by' : 'Remaining'}
      </div>
      <div class="text-2xl font-bold {statusColor}">
        {remainingDisplay}
      </div>
      {#if $pacingStatus.status !== 'unknown'}
      <div class="text-xs mt-2 {statusColor} font-semibold">
        {statusMessage}
      </div>
      {/if}
    </div>
  {/if}
  
  {#if !$isRunning && $globalTimer === 0}
    <!-- Edit mode help text (only when fresh) -->
    <div class="text-center p-3 bg-gray-700/50 rounded">
      <div class="text-xs text-gray-400">
        💡 Navigate slides and set target times<br/>
        Use 📍 milestones or Auto-fill for quick setup
      </div>
    </div>
  {:else if !$isRunning && $globalTimer > 0}
    <!-- Paused mode help text -->
    <div class="text-center p-3 bg-yellow-900/30 rounded">
      <div class="text-xs text-yellow-200">
        ⏸️ Paused - You can adjust target times<br/>
        Press Resume to continue or Stop to reset
      </div>
    </div>
  {/if}
  
  <!-- Progress indicator -->
  <div class="text-center text-xs text-gray-400">
    Slide {$currentSlide + 1} of {$totalSlides}
  </div>
</div>

