<script>
  /**
   * Timer Component
   * 
   * Displays timer information with pacing indicators
   * Shows:
   * - Elapsed time (minutes only until last minute)
   * - Target time for current slide
   * - Remaining time with color coding
   * - Play/pause controls
   */
  
  import { globalTimer, isRunning, pacingStatus, remainingTime, formatTime, toggleTimer, resetTimer } from '../stores/timing.js';
  import { currentSlide, totalSlides } from '../stores/presentation.js';
  import { targetTimes } from '../stores/timing.js';
  
  // Get current target time for the slide
  $: currentTargetTime = $targetTimes[$currentSlide];
  
  // Format elapsed time
  $: elapsedDisplay = formatTime($globalTimer, false);
  
  // Format remaining time (show seconds if under 1 minute)
  $: remainingDisplay = (() => {
    if ($remainingTime === null) return '--';
    
    const remainingMs = $remainingTime * 60 * 1000;
    const isLastMinute = remainingMs < 60000 && remainingMs >= 0;
    
    if (remainingMs < 0) {
      // Over time - show as negative
      return '-' + formatTime(Math.abs(remainingMs), false);
    }
    
    return formatTime(remainingMs, isLastMinute);
  })();
  
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
  <div class="flex items-center justify-between">
    <h3 class="text-sm font-semibold text-gray-300">Timer</h3>
    <div class="flex gap-2">
      <button
        on:click={toggleTimer}
        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
      >
        {$isRunning ? 'Pause' : 'Start'}
      </button>
      <button
        on:click={resetTimer}
        class="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
      >
        Reset
      </button>
    </div>
  </div>
  
  <!-- Elapsed time -->
  <div class="text-center">
    <div class="text-sm text-gray-400 mb-1">Elapsed</div>
    <div class="text-3xl font-bold text-white">
      {elapsedDisplay}
    </div>
  </div>
  
  <!-- Target time for current slide -->
  {#if currentTargetTime !== undefined && currentTargetTime !== null}
    <div class="text-center">
      <div class="text-sm text-gray-400 mb-1">Target</div>
      <div class="text-xl font-semibold text-gray-200">
        {Math.round(currentTargetTime)} min
      </div>
    </div>
  {/if}
  
  <!-- Remaining time with pacing indicator -->
  {#if $remainingTime !== null}
    <div class="text-center p-3 rounded {statusBgColor}">
      <div class="text-sm text-gray-400 mb-1">Remaining</div>
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
  
  <!-- Progress indicator -->
  <div class="text-center text-xs text-gray-400">
    Slide {$currentSlide + 1} of {$totalSlides}
  </div>
</div>

