<script>
  /**
   * ProgressBar Component
   * 
   * Visual progress indicator showing current position in presentation
   * Color-coded based on pacing status
   */
  
  import { currentSlide, totalSlides } from '../stores/presentation.js';
  import { pacingStatus } from '../stores/timing.js';
  
  // Calculate progress percentage
  $: progress = $totalSlides > 0 ? (($currentSlide + 1) / $totalSlides) * 100 : 0;
  
  // Color based on pacing
  $: barColor = (() => {
    switch ($pacingStatus.status) {
      case 'toofast': return 'bg-orange-400';
      case 'ahead': return 'bg-ahead';
      case 'ontime': return 'bg-ontime';
      case 'behind': return 'bg-behind';
      default: return 'bg-blue-500';
    }
  })();
</script>

<div class="progress-bar-container">
  <div class="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
    <div
      class="h-full {barColor} transition-all duration-300 ease-out"
      style="width: {progress}%"
    />
  </div>
  <div class="flex justify-between text-xs text-gray-400 mt-1">
    <span>Slide {$currentSlide + 1} / {$totalSlides}</span>
    <span>{Math.round(progress)}%</span>
  </div>
</div>

