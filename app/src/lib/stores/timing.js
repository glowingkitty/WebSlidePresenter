/**
 * Timing Store
 * 
 * Manages presentation timing, pacing, and target times
 * - globalTimer: Total elapsed time since presentation start (milliseconds)
 * - slideTimers: Time spent on each slide (milliseconds per slide)
 * - targetTimes: Target cumulative time for each slide (minutes)
 * - isRunning: Whether the timer is currently running
 * - startTime: Timestamp when timer was started
 * - pacingStatus: Derived pacing indicator (ahead/ontime/behind)
 */

import { writable, derived, get } from 'svelte/store';
import { currentSlide, totalSlides } from './presentation.js';
import { interpolateTiming } from '../services/timingInterpolation.js';

// Timer state
export const globalTimer = writable(0); // milliseconds
export const slideTimers = writable({}); // { slideIndex: milliseconds }
export const explicitTargetTimes = writable({}); // { slideIndex: minutes } - user-set milestones only
export const isRunning = writable(false);
export const startTime = writable(null);
export const pausedTime = writable(0); // Time accumulated before pause

// Derived store: interpolated times for all slides
export const targetTimes = derived(
  [explicitTargetTimes, totalSlides],
  ([$explicitTargetTimes, $totalSlides]) => {
    return interpolateTiming($explicitTargetTimes, $totalSlides);
  }
);

let timerInterval = null;

/**
 * Start the presentation timer
 */
export function startTimer() {
  if (get(isRunning)) return;
  
  const now = Date.now();
  const paused = get(pausedTime);
  
  startTime.set(now - paused);
  isRunning.set(true);
  
  // Update timer every 100ms for smooth display
  timerInterval = setInterval(() => {
    const elapsed = Date.now() - get(startTime);
    globalTimer.set(elapsed);
  }, 100);
}

/**
 * Pause the presentation timer
 */
export function pauseTimer() {
  if (!get(isRunning)) return;
  
  isRunning.set(false);
  pausedTime.set(get(globalTimer));
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

/**
 * Reset the presentation timer
 */
export function resetTimer() {
  pauseTimer();
  globalTimer.set(0);
  slideTimers.set({});
  startTime.set(null);
  pausedTime.set(0);
}

/**
 * Toggle timer state (play/pause)
 */
export function toggleTimer() {
  if (get(isRunning)) {
    pauseTimer();
  } else {
    startTimer();
  }
}

/**
 * Set target time for a specific slide (creates a milestone)
 * @param {number} slideIndex - Slide index (0-based)
 * @param {number} minutes - Target start time in minutes (null to remove)
 * @param {boolean} autoAdjust - If true, automatically adjust subsequent slides if they're lower than the new time (default: true)
 */
export function setTargetTime(slideIndex, minutes, autoAdjust = true) {
  explicitTargetTimes.update(times => {
    const newTimes = { ...times };
    if (minutes === null || minutes === undefined || minutes === '') {
      delete newTimes[slideIndex];
    } else {
      newTimes[slideIndex] = minutes;
      
      // Auto-adjust subsequent explicit times if they're lower than the new time
      if (autoAdjust && minutes > 0) {
        const sortedIndices = Object.keys(newTimes)
          .map(Number)
          .filter(idx => idx > slideIndex) // Only check slides after current one
          .sort((a, b) => a - b);
        
        // Track the minimum allowed time for each subsequent slide
        let minAllowedTime = minutes;
        
        for (const idx of sortedIndices) {
          const existingTime = newTimes[idx];
          
          // If the existing time is lower than the minimum allowed, update it
          if (existingTime < minAllowedTime) {
            console.debug(`Auto-adjusting slide ${idx + 1} from ${existingTime} to ${minAllowedTime} minutes`);
            newTimes[idx] = minAllowedTime;
          }
          
          // Update minimum for next iteration
          minAllowedTime = Math.max(minAllowedTime, newTimes[idx]);
        }
      }
    }
    return newTimes;
  });
}

/**
 * Set multiple explicit target times at once (milestones)
 * @param {Object} times - Object mapping slide indices to target minutes
 */
export function setTargetTimes(times) {
  explicitTargetTimes.set(times);
}

/**
 * Calculate pacing status for the current slide
 * Returns: { status: 'toofast'|'ahead'|'ontime'|'behind', difference: minutes }
 * 
 * Status definitions:
 * - toofast: More than 2 minutes ahead (rushing!)
 * - ahead: 0.5-2 minutes ahead (good pace)
 * - ontime: Within ±0.5 minutes (perfect)
 * - behind: More than 0.5 minutes behind (need to speed up)
 */
export const pacingStatus = derived(
  [globalTimer, currentSlide, targetTimes],
  ([$globalTimer, $currentSlide, $targetTimes]) => {
    // Current elapsed time in minutes
    const elapsedMinutes = $globalTimer / 1000 / 60;
    
    // Target time for current slide (start time)
    const targetMinutes = $targetTimes[$currentSlide];
    
    // If no target set, return unknown
    if (targetMinutes === undefined || targetMinutes === null) {
      return { status: 'unknown', difference: 0 };
    }
    
    // Calculate difference (negative = ahead, positive = behind)
    const difference = elapsedMinutes - targetMinutes;
    
    // Determine status with thresholds
    let status;
    if (difference < -2.0) {
      // More than 2 minutes ahead = too fast (rushing)
      status = 'toofast';
    } else if (difference < -0.5) {
      // 0.5-2 minutes ahead = good pace
      status = 'ahead';
    } else if (difference <= 0.5) {
      // Within ±0.5 minutes = on time
      status = 'ontime';
    } else {
      // More than 0.5 minutes behind = behind schedule
      status = 'behind';
    }
    
    return { status, difference };
  }
);

/**
 * Calculate remaining time until end of presentation
 * Returns remaining minutes (can be negative if over time)
 */
export const remainingTime = derived(
  [globalTimer, targetTimes, currentSlide],
  ([$globalTimer, $targetTimes, $currentSlide]) => {
    const elapsedMinutes = $globalTimer / 1000 / 60;
    
    // Find the last target time (end of presentation)
    const slideIndices = Object.keys($targetTimes).map(Number).sort((a, b) => a - b);
    const lastSlideIndex = slideIndices[slideIndices.length - 1];
    
    if (lastSlideIndex === undefined) {
      return null;
    }
    
    const totalTargetMinutes = $targetTimes[lastSlideIndex];
    return totalTargetMinutes - elapsedMinutes;
  }
);

/**
 * Format milliseconds to display format
 * Minutes only until last minute, then show seconds
 * @param {number} ms - Milliseconds
 * @param {boolean} isRemaining - If true and less than 1 minute, show seconds
 * @returns {string} Formatted time string
 */
export function formatTime(ms, isRemaining = false) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  // If remaining time and less than 1 minute, show seconds
  if (isRemaining && minutes < 1) {
    return `0:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Otherwise show minutes only
  return `${minutes} min`;
}

