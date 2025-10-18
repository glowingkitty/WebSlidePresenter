/**
 * YAML Service
 * 
 * Handles YAML export/import for presentation configuration (timing + notes)
 * Format:
 * ```yaml
 * presentation: "filename.pdf"
 * slides:
 *   - slide: 1
 *     target_time: 2
 *     notes: "Introduction slide"
 *   - slide: 2
 *     target_time: 5
 *     notes: "Main content"
 * ```
 */

import * as yaml from 'js-yaml';

/**
 * Export presentation config (timing + notes) to YAML string
 * @param {Object} targetTimes - Object mapping slide indices to target minutes
 * @param {Object} speakerNotes - Object mapping slide indices to note text
 * @param {string} pdfFileName - PDF file name
 * @returns {string} YAML string
 */
export function exportConfigToYAML(targetTimes, speakerNotes, pdfFileName) {
  // Get all unique slide indices from both timing and notes
  const allIndices = new Set([
    ...Object.keys(targetTimes).map(Number),
    ...Object.keys(speakerNotes).map(Number)
  ]);
  
  // Convert to array format with timing and notes
  const slides = Array.from(allIndices)
    .sort((a, b) => a - b)
    .map(index => {
      const slideData = {
        slide: index + 1 // Convert 0-based to 1-based for user-friendly display
      };
      
      // Add timing if set
      if (targetTimes[index] !== undefined && targetTimes[index] !== null) {
        slideData.target_time = targetTimes[index];
      }
      
      // Add notes if set
      if (speakerNotes[index] && speakerNotes[index].trim() !== '') {
        slideData.notes = speakerNotes[index];
      }
      
      return slideData;
    })
    .filter(slide => slide.target_time !== undefined || slide.notes !== undefined); // Only include slides with data
  
  const data = {
    presentation: pdfFileName,
    slides: slides
  };
  
  try {
    const yamlString = yaml.dump(data, {
      indent: 2,
      lineWidth: -1 // Disable line wrapping
    });
    console.log('Presentation config (timing + notes) exported to YAML');
    return yamlString;
  } catch (error) {
    console.error('Failed to export config to YAML:', error);
    throw new Error(`Failed to export config: ${error.message}`);
  }
}

// Keep old function name for backward compatibility
export const exportTimingToYAML = exportConfigToYAML;

/**
 * Import presentation config (timing + notes) from YAML string
 * @param {string} yamlString - YAML content
 * @returns {Object} Object with targetTimes, speakerNotes, and pdfFileName
 */
export function importConfigFromYAML(yamlString) {
  try {
    const data = yaml.load(yamlString);
    
    if (!data || !data.slides || !Array.isArray(data.slides)) {
      throw new Error('Invalid config format: missing slides array');
    }
    
    // Convert array format back to objects
    const targetTimes = {};
    const speakerNotes = {};
    
    data.slides.forEach(slideData => {
      if (slideData.slide !== undefined) {
        // Convert 1-based to 0-based index
        const index = slideData.slide - 1;
        
        // Import timing if present
        if (slideData.target_time !== undefined && slideData.target_time !== null) {
          targetTimes[index] = slideData.target_time;
        }
        
        // Import notes if present
        if (slideData.notes && slideData.notes.trim() !== '') {
          speakerNotes[index] = slideData.notes;
        }
      }
    });
    
    console.log('Config imported from YAML - Timing:', targetTimes, 'Notes:', Object.keys(speakerNotes).length, 'slides');
    
    return {
      targetTimes,
      speakerNotes,
      pdfFileName: data.presentation || ''
    };
  } catch (error) {
    console.error('Failed to import config from YAML:', error);
    throw new Error(`Failed to import config: ${error.message}`);
  }
}

// Keep old function name for backward compatibility
export const importTimingFromYAML = importConfigFromYAML;

/**
 * Download YAML string as file
 * @param {string} yamlString - YAML content
 * @param {string} fileName - File name (without extension)
 */
export function downloadYAML(yamlString, fileName) {
  try {
    // Create blob
    const blob = new Blob([yamlString], { type: 'text/yaml;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.yml`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`YAML file downloaded: ${fileName}.yml`);
  } catch (error) {
    console.error('Failed to download YAML:', error);
    throw new Error(`Failed to download YAML: ${error.message}`);
  }
}

/**
 * Read YAML file from File input
 * @param {File} file - YAML file
 * @returns {Promise<Object>} Parsed timing data
 */
export async function readYAMLFile(file) {
  try {
    const text = await file.text();
    return importTimingFromYAML(text);
  } catch (error) {
    console.error('Failed to read YAML file:', error);
    throw new Error(`Failed to read YAML file: ${error.message}`);
  }
}

