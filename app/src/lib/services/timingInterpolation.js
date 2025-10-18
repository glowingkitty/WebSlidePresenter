/**
 * Timing Interpolation Service
 * 
 * Allows users to set timing for key slides only,
 * and automatically calculates times for slides in between
 * using linear interpolation.
 */

/**
 * Interpolate missing slide times based on key milestones
 * @param {Object} explicitTimes - Object with slide indices and their explicit times
 * @param {number} totalSlides - Total number of slides
 * @returns {Object} Complete timing object with all slides
 */
export function interpolateTiming(explicitTimes, totalSlides) {
  // Convert to array of [slideIndex, time] pairs and sort
  const milestones = Object.entries(explicitTimes)
    .map(([index, time]) => [parseInt(index), parseFloat(time)])
    .filter(([_, time]) => !isNaN(time))
    .sort((a, b) => a[0] - b[0]);
  
  // If no milestones set, return empty
  if (milestones.length === 0) {
    return {};
  }
  
  // Always ensure slide 0 has time 0 if not set
  if (milestones[0][0] !== 0) {
    milestones.unshift([0, 0]);
  }
  
  const result = {};
  
  // For each slide, calculate its time
  for (let slideIndex = 0; slideIndex < totalSlides; slideIndex++) {
    // Check if this slide has an explicit time
    const explicitTime = milestones.find(([idx]) => idx === slideIndex);
    if (explicitTime) {
      result[slideIndex] = explicitTime[1];
      continue;
    }
    
    // Find surrounding milestones for interpolation
    let prevMilestone = null;
    let nextMilestone = null;
    
    for (let i = 0; i < milestones.length; i++) {
      const [idx, time] = milestones[i];
      if (idx < slideIndex) {
        prevMilestone = [idx, time];
      } else if (idx > slideIndex && !nextMilestone) {
        nextMilestone = [idx, time];
        break;
      }
    }
    
    // Interpolate based on surrounding milestones
    if (prevMilestone && nextMilestone) {
      // Between two milestones - linear interpolation
      const [prevIdx, prevTime] = prevMilestone;
      const [nextIdx, nextTime] = nextMilestone;
      const ratio = (slideIndex - prevIdx) / (nextIdx - prevIdx);
      result[slideIndex] = prevTime + ratio * (nextTime - prevTime);
    } else if (prevMilestone) {
      // After last milestone - use last milestone's time
      // (user can still present, but no pacing feedback after this point)
      result[slideIndex] = prevMilestone[1];
    } else {
      // Before first milestone (shouldn't happen if we add slide 0 = 0)
      result[slideIndex] = 0;
    }
  }
  
  return result;
}

/**
 * Check if a slide has an explicit (user-set) time vs interpolated
 * @param {number} slideIndex - Slide index
 * @param {Object} explicitTimes - Original explicit times object
 * @returns {boolean} True if time was explicitly set by user
 */
export function isExplicitTime(slideIndex, explicitTimes) {
  return explicitTimes.hasOwnProperty(slideIndex) && 
         explicitTimes[slideIndex] !== null && 
         explicitTimes[slideIndex] !== undefined &&
         explicitTimes[slideIndex] !== '';
}

/**
 * Get formatted display of timing status
 * @param {number} slideIndex - Slide index
 * @param {Object} explicitTimes - Original explicit times
 * @returns {string} Display text
 */
export function getTimingLabel(slideIndex, explicitTimes) {
  return isExplicitTime(slideIndex, explicitTimes) 
    ? '📍 Milestone' 
    : '🔄 Auto-calculated';
}

