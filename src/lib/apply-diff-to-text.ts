import type { DiffHunk } from '@/types/diff';

/**
 * Normalize text by removing markdown formatting symbols for comparison
 */
function normalizeForComparison(text: string): string {
  // First trim the text and remove any trailing newlines/carriage returns
  let normalized = text.trim().replace(/[\r\n]+$/, '');
  
  // Remove leading dashes that might be from diff format (e.g., "- " at the start)
  normalized = normalized.replace(/^-\s+/, '');
  
  // Remove list markers (-, *, +, numbers with dots)
  normalized = normalized.replace(/^[-*+]\s+/, '');
  normalized = normalized.replace(/^\d+\.\s+/, '');
  
  // Remove heading markers
  normalized = normalized.replace(/^#+\s+/, '');
  
  // Remove bold/italic markers
  normalized = normalized.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
  normalized = normalized.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');
  
  // Remove code markers
  normalized = normalized.replace(/`([^`]+)`/g, '$1');
  
  // Remove any remaining leading/trailing whitespace and normalize internal whitespace
  normalized = normalized.trim().replace(/\s+/g, ' ');
  
  return normalized;
}

/**
 * Check if two lines match after normalization
 */
function linesMatch(line1: string, line2: string): boolean {
  return normalizeForComparison(line1) === normalizeForComparison(line2);
}

/**
 * Apply a diff hunk to plain text content
 */
export function applyDiffToText(content: string, hunk: DiffHunk): string {
  console.log('=== applyDiffToText ===');
  console.log('Hunk:', JSON.stringify(hunk, null, 2));
  console.log('Content lines:');
  const lines = content.split('\n');
  lines.slice(0, 10).forEach((line, i) => {
    console.log(`  ${i}: "${line}"`);
  });
  
  // For pure additions (no deletions)
  if (hunk.deletions.length === 0 && hunk.additions.length > 0) {
    // Find where to insert based on context
    if (hunk.contextBefore.length > 0) {
      const lastContextLine = hunk.contextBefore[hunk.contextBefore.length - 1];
      console.log(`Looking for context line: "${lastContextLine}"`);
      let contextIndex = -1;
      
      // Find matching line using normalized comparison
      for (let i = 0; i < lines.length; i++) {
        if (linesMatch(lines[i], lastContextLine)) {
          contextIndex = i;
          console.log(`Found context match at line ${contextIndex}: "${lines[contextIndex]}" matches "${lastContextLine}"`);
          break;
        }
      }
      
      if (contextIndex !== -1) {
        // Insert after the context line, preserving original formatting
        lines.splice(contextIndex + 1, 0, ...hunk.additions);
        return lines.join('\n');
      } else {
        console.log(`No match found for context line: "${lastContextLine}"`);
      }
    }
    
    // If no context or context not found, append to end
    return content + '\n' + hunk.additions.join('\n');
  }
  
  // For replacements (deletions and additions)
  if (hunk.deletions.length > 0) {
    // Handle inline replacements first (single line partial replacement)
    if (hunk.deletions.length === 1 && hunk.additions.length === 1) {
      const deletionText = hunk.deletions[0];
      const additionText = hunk.additions[0];
      
      // Check if this is a partial line replacement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(deletionText)) {
          // Inline replacement
          lines[i] = lines[i].replace(deletionText, additionText);
          return lines.join('\n');
        }
      }
    }
    
    // Find the start of deletions
    let deletionStartIndex = -1;
    const firstDeletion = hunk.deletions[0];
    
    for (let i = 0; i < lines.length; i++) {
      if (linesMatch(lines[i], firstDeletion)) {
        console.log(`Found deletion match at line ${i}: "${lines[i]}" matches "${firstDeletion}"`);
        // Verify subsequent deletions match
        let allMatch = true;
        for (let j = 1; j < hunk.deletions.length; j++) {
          if (i + j >= lines.length || !linesMatch(lines[i + j], hunk.deletions[j])) {
            allMatch = false;
            break;
          }
        }
        
        if (allMatch) {
          deletionStartIndex = i;
          break;
        }
      }
    }
    
    if (deletionStartIndex !== -1) {
      // Remove the deletion lines and insert additions
      lines.splice(deletionStartIndex, hunk.deletions.length, ...hunk.additions);
      return lines.join('\n');
    }
  }
  
  // For pure deletions (no additions)
  if (hunk.deletions.length > 0 && hunk.additions.length === 0) {
    // Find and remove the deletion lines
    const firstDeletion = hunk.deletions[0];
    
    for (let i = 0; i < lines.length; i++) {
      if (linesMatch(lines[i], firstDeletion)) {
        // Verify subsequent deletions match
        let allMatch = true;
        for (let j = 1; j < hunk.deletions.length; j++) {
          if (i + j >= lines.length || !linesMatch(lines[i + j], hunk.deletions[j])) {
            allMatch = false;
            break;
          }
        }
        
        if (allMatch) {
          lines.splice(i, hunk.deletions.length);
          return lines.join('\n');
        }
      }
    }
  }
  
  // If we couldn't apply the diff, return original content
  console.warn('Could not apply diff hunk:', hunk);
  return content;
}