/**
 * Presentation Store
 * 
 * Manages the PDF document state, slide data, and navigation
 * - pdfDocument: Loaded PDF.js document object
 * - slides: Array of rendered slide data URLs
 * - currentSlide: Current slide index (0-based)
 * - totalSlides: Total number of slides in the presentation
 * - pdfFileName: Name of the loaded PDF file for identification
 */

import { writable, derived, get } from 'svelte/store';

// Core presentation state
export const pdfDocument = writable(null);
export const slides = writable(/** @type {string[]} */ ([]));
export const currentSlide = writable(0);
export const pdfFileName = writable('');

// Derived store for total slide count
export const totalSlides = derived(
  slides,
  $slides => $slides.length
);

/**
 * Navigate to a specific slide index
 * @param {number} index - Target slide index (0-based)
 */
export function goToSlide(index) {
  totalSlides.subscribe(total => {
    if (index >= 0 && index < total) {
      currentSlide.set(index);
    }
  })();
}

/**
 * Navigate to the next slide
 */
export function nextSlide() {
  currentSlide.update(current => {
    const total = get(totalSlides);
    return current < total - 1 ? current + 1 : current;
  });
}

/**
 * Navigate to the previous slide
 */
export function previousSlide() {
  currentSlide.update(current => current > 0 ? current - 1 : 0);
}

/**
 * Navigate to the first slide
 */
export function firstSlide() {
  currentSlide.set(0);
}

/**
 * Navigate to the last slide
 */
export function lastSlide() {
  totalSlides.subscribe(total => {
    if (total > 0) {
      currentSlide.set(total - 1);
    }
  })();
}

/**
 * Reset the presentation state
 */
export function resetPresentation() {
  pdfDocument.set(null);
  slides.set([]);
  currentSlide.set(0);
  pdfFileName.set('');
}

