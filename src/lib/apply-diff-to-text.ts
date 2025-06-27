import type { DiffHunk } from '@/types/diff';

/**
 * Apply a diff hunk to plain text content
 */
export function applyDiffToText(content: string, hunk: DiffHunk): string {
  const lines = content.split('\n');
  
  // For pure additions (no deletions)
  if (hunk.deletions.length === 0 && hunk.additions.length > 0) {
    // Find where to insert based on context
    if (hunk.contextBefore.length > 0) {
      const lastContextLine = hunk.contextBefore[hunk.contextBefore.length - 1].trim();
      const contextIndex = lines.findIndex(line => line.trim() === lastContextLine);
      
      if (contextIndex !== -1) {
        // Insert after the context line
        lines.splice(contextIndex + 1, 0, ...hunk.additions);
        return lines.join('\n');
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
        if (lines[i].includes(deletionText) && lines[i].trim() !== deletionText.trim()) {
          // Inline replacement
          lines[i] = lines[i].replace(deletionText, additionText);
          return lines.join('\n');
        }
      }
    }
    
    // Find the start of deletions
    let deletionStartIndex = -1;
    const firstDeletion = hunk.deletions[0].trim();
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === firstDeletion) {
        // Verify subsequent deletions match
        let allMatch = true;
        for (let j = 1; j < hunk.deletions.length; j++) {
          if (i + j >= lines.length || lines[i + j].trim() !== hunk.deletions[j].trim()) {
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
    const firstDeletion = hunk.deletions[0].trim();
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === firstDeletion) {
        // Verify subsequent deletions match
        let allMatch = true;
        for (let j = 1; j < hunk.deletions.length; j++) {
          if (i + j >= lines.length || lines[i + j].trim() !== hunk.deletions[j].trim()) {
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