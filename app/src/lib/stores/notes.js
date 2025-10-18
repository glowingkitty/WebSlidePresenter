/**
 * Notes Store
 * 
 * Manages speaker notes and checkpoints for slides
 * - speakerNotes: Object mapping slide indices to note text
 * - checkpoints: Array of slide indices marked as important milestones
 */

import { writable, derived } from 'svelte/store';
import { pdfFileName } from './presentation.js';
import { saveToStorage, loadFromStorage } from '../services/storage.js';

// Speaker notes state
export const speakerNotes = writable({});
export const checkpoints = writable([]);

/**
 * Set speaker note for a specific slide
 * @param {number} slideIndex - Slide index (0-based)
 * @param {string} text - Note text
 */
export function setNote(slideIndex, text) {
  speakerNotes.update(notes => ({
    ...notes,
    [slideIndex]: text
  }));
}

/**
 * Get speaker note for a specific slide
 * @param {number} slideIndex - Slide index (0-based)
 * @returns {string} Note text or empty string
 */
export function getNote(slideIndex) {
  let note = '';
  speakerNotes.subscribe(notes => {
    note = notes[slideIndex] || '';
  })();
  return note;
}

/**
 * Toggle checkpoint for a slide
 * @param {number} slideIndex - Slide index (0-based)
 */
export function toggleCheckpoint(slideIndex) {
  checkpoints.update(points => {
    if (points.includes(slideIndex)) {
      return points.filter(p => p !== slideIndex);
    } else {
      return [...points, slideIndex].sort((a, b) => a - b);
    }
  });
}

/**
 * Check if a slide is a checkpoint
 * @param {number} slideIndex - Slide index (0-based)
 * @returns {boolean}
 */
export function isCheckpoint(slideIndex) {
  let result = false;
  checkpoints.subscribe(points => {
    result = points.includes(slideIndex);
  })();
  return result;
}

/**
 * Save notes to localStorage
 * @param {string} fileName - PDF file name for identification
 */
export function saveNotes(fileName) {
  if (!fileName) return;
  
  let notesData;
  speakerNotes.subscribe(notes => {
    notesData = notes;
  })();
  
  saveToStorage(`presentpilot-notes-${fileName}`, notesData);
}

/**
 * Load notes from localStorage
 * @param {string} fileName - PDF file name for identification
 */
export function loadNotes(fileName) {
  if (!fileName) return;
  
  const notes = loadFromStorage(`presentpilot-notes-${fileName}`);
  if (notes) {
    speakerNotes.set(notes);
  }
}

/**
 * Reset all notes and checkpoints
 */
export function resetNotes() {
  speakerNotes.set({});
  checkpoints.set([]);
}

// Auto-save notes when PDF file name changes
pdfFileName.subscribe(fileName => {
  if (fileName) {
    loadNotes(fileName);
  }
});

