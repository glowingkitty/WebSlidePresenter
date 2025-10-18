<script>
  /**
   * NotesEditor Component
   * 
   * Editable speaker notes for the current slide
   * Auto-saves to localStorage on blur
   * 
   * Props:
   * - slideIndex: Current slide index (0-based)
   */
  
  import { speakerNotes, setNote, saveNotes } from '../stores/notes.js';
  import { pdfFileName } from '../stores/presentation.js';
  
  export let slideIndex = 0;
  
  // Local note text for current slide
  $: noteText = $speakerNotes[slideIndex] || '';
  
  // Debounced save
  let saveTimeout;
  
  /**
   * Handle note text change
   */
  function handleInput(event) {
    const newText = event.target.value;
    setNote(slideIndex, newText);
    
    // Debounced save to localStorage
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
      saveNotes($pdfFileName);
      console.log(`Notes saved for slide ${slideIndex + 1}`);
    }, 500);
  }
  
  /**
   * Handle blur - immediate save
   */
  function handleBlur() {
    clearTimeout(saveTimeout);
    saveNotes($pdfFileName);
    console.log(`Notes saved on blur for slide ${slideIndex + 1}`);
  }
</script>

<div class="notes-editor">
  <label for="notes-textarea" class="block text-sm font-semibold text-gray-300 mb-2">
    Speaker Notes (Slide {slideIndex + 1})
  </label>
  <textarea
    id="notes-textarea"
    value={noteText}
    on:input={handleInput}
    on:blur={handleBlur}
    placeholder="Add your speaker notes here..."
    class="w-full h-40 p-3 bg-gray-800 border border-gray-700 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none scrollbar-thin"
  ></textarea>
  <div class="text-xs text-gray-500 mt-1">
    Notes auto-save as you type
  </div>
</div>

<style>
  textarea {
    font-family: inherit;
    line-height: 1.5;
  }
</style>

