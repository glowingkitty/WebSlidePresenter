/**
 * IndexedDB Service
 * 
 * Handles IndexedDB operations for storing large PDF slide data
 * Used to share slides between presenter and audience windows
 * without exceeding localStorage/sessionStorage quota
 */

const DB_NAME = 'WebSlidePresenter-db';
const DB_VERSION = 1;
const STORE_NAME = 'slides';

let dbInstance = null;

/**
 * Initialize and open IndexedDB
 * @returns {Promise<IDBDatabase>}
 */
async function openDB() {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB: Failed to open database', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      console.log('IndexedDB: Database opened successfully');
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create object store for slides
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('IndexedDB: Object store created');
      }
    };
  });
}

/**
 * Save slides to IndexedDB
 * @param {Array<string>} slides - Array of slide data URLs
 * @returns {Promise<void>}
 */
export async function saveSlides(slides) {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing slides
    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Save new slides
    for (let i = 0; i < slides.length; i++) {
      await new Promise((resolve, reject) => {
        const putRequest = store.put({
          id: i,
          dataUrl: slides[i]
        });
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      });
    }

    console.log(`IndexedDB: Saved ${slides.length} slides`);
  } catch (error) {
    console.error('IndexedDB: Failed to save slides', error);
    throw error;
  }
}

/**
 * Load slides from IndexedDB
 * @returns {Promise<Array<string>>} Array of slide data URLs
 */
export async function loadSlides() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        const results = getAllRequest.result;
        // Sort by ID and extract dataUrls
        const slides = results
          .sort((a, b) => a.id - b.id)
          .map(item => item.dataUrl);
        
        console.log(`IndexedDB: Loaded ${slides.length} slides`);
        resolve(slides);
      };
      
      getAllRequest.onerror = () => {
        console.error('IndexedDB: Failed to load slides', getAllRequest.error);
        reject(getAllRequest.error);
      };
    });
  } catch (error) {
    console.error('IndexedDB: Failed to load slides', error);
    return [];
  }
}

/**
 * Clear all slides from IndexedDB
 * @returns {Promise<void>}
 */
export async function clearSlides() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    await new Promise((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    console.log('IndexedDB: Cleared all slides');
  } catch (error) {
    console.error('IndexedDB: Failed to clear slides', error);
    throw error;
  }
}

/**
 * Get the number of slides stored
 * @returns {Promise<number>}
 */
export async function getSlideCount() {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const countRequest = store.count();
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => reject(countRequest.error);
    });
  } catch (error) {
    console.error('IndexedDB: Failed to get slide count', error);
    return 0;
  }
}

