/**
 * Storage Service
 * 
 * Handles localStorage operations for persisting:
 * - Speaker notes
 * - Target timing data
 * - Presentation preferences
 * 
 * All operations are wrapped in try-catch to handle localStorage unavailability
 */

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to save (will be JSON stringified)
 * @returns {boolean} Success status
 */
export function saveToStorage(key, data) {
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
    return true;
  } catch (error) {
    console.error(`Failed to save to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @returns {any|null} Parsed data or null if not found/error
 */
export function loadFromStorage(key) {
  try {
    const jsonData = localStorage.getItem(key);
    if (jsonData === null) {
      return null;
    }
    return JSON.parse(jsonData);
  } catch (error) {
    console.error(`Failed to load from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 * @returns {boolean} Success status
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Check if localStorage is available
 * @returns {boolean} True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generate a simple hash from a string for file identification
 * @param {string} str - String to hash
 * @returns {string} Simple hash
 */
export function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Generate storage key for a PDF file
 * @param {string} fileName - PDF file name
 * @param {string} type - Data type (e.g., 'notes', 'timing')
 * @returns {string} Storage key
 */
export function getPdfStorageKey(fileName, type) {
  const hash = simpleHash(fileName);
  return `presentpilot-${type}-${hash}`;
}

