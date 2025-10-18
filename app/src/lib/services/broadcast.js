/**
 * Broadcast Service
 * 
 * Manages BroadcastChannel communication between presenter and audience windows
 * 
 * Message types:
 * - SLIDE_CHANGE: Notify slide navigation { type: 'SLIDE_CHANGE', slideIndex: number }
 * - PRESENTATION_LOADED: Notify when new PDF is loaded { type: 'PRESENTATION_LOADED', totalSlides: number }
 * - TIMER_STATE: Notify timer state changes { type: 'TIMER_STATE', isRunning: boolean }
 */

// Singleton BroadcastChannel instance
let channel = null;

/**
 * Initialize the broadcast channel
 * Creates a new BroadcastChannel if not already initialized
 * @returns {BroadcastChannel} The channel instance
 */
export function initChannel() {
  if (!channel) {
    try {
      channel = new BroadcastChannel('presentpilot-sync');
      console.log('BroadcastChannel initialized');
    } catch (error) {
      console.error('Failed to initialize BroadcastChannel:', error);
      // BroadcastChannel might not be supported in some browsers
      // In that case, we'll gracefully degrade (no sync between windows)
    }
  }
  return channel;
}

/**
 * Send a slide change notification to all listening windows
 * @param {number} slideIndex - New slide index (0-based)
 */
export function sendSlideChange(slideIndex) {
  const ch = initChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'SLIDE_CHANGE',
        slideIndex,
        timestamp: Date.now()
      });
      console.log(`Broadcast: SLIDE_CHANGE to slide ${slideIndex}`);
    } catch (error) {
      console.error('Failed to broadcast slide change:', error);
    }
  }
}

/**
 * Send a presentation loaded notification
 * @param {number} totalSlides - Total number of slides
 */
export function sendPresentationLoaded(totalSlides) {
  const ch = initChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'PRESENTATION_LOADED',
        totalSlides,
        timestamp: Date.now()
      });
      console.log(`Broadcast: PRESENTATION_LOADED with ${totalSlides} slides`);
    } catch (error) {
      console.error('Failed to broadcast presentation loaded:', error);
    }
  }
}

/**
 * Send timer state change notification
 * @param {boolean} isRunning - Timer running state
 */
export function sendTimerState(isRunning) {
  const ch = initChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: 'TIMER_STATE',
        isRunning,
        timestamp: Date.now()
      });
      console.log(`Broadcast: TIMER_STATE - ${isRunning ? 'running' : 'paused'}`);
    } catch (error) {
      console.error('Failed to broadcast timer state:', error);
    }
  }
}

/**
 * Register a message handler callback
 * @param {function} callback - Callback function to handle incoming messages
 * @returns {function} Cleanup function to unregister the handler
 */
export function onMessage(callback) {
  const ch = initChannel();
  if (ch) {
    const handler = (event) => {
      console.log('Broadcast received:', event.data);
      callback(event.data);
    };
    
    ch.addEventListener('message', handler);
    
    // Return cleanup function
    return () => {
      ch.removeEventListener('message', handler);
    };
  }
  
  // Return no-op cleanup if channel unavailable
  return () => {};
}

/**
 * Close the broadcast channel
 * Should be called when the window/component is unmounting
 */
export function closeChannel() {
  if (channel) {
    try {
      channel.close();
      console.log('BroadcastChannel closed');
    } catch (error) {
      console.error('Failed to close BroadcastChannel:', error);
    }
    channel = null;
  }
}

