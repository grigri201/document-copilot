/**
 * Applies a patch in the format:
 * @@
 * -deleted line 1
 * -deleted line 2
 * +added line 1
 * +added line 2
 * 
 * Or wrapped in a diff code block:
 * ```diff
 * @@
 * -deleted line
 * +added line
 * ```
 * 
 * @param content The original content
 * @param patch The patch to apply
 * @returns The patched content with special symbols removed
 */
export function applyPatch(content: string, patch: string): string {
  const trimmedPatch = patch.trim();
  
  // Check if patch is wrapped in diff code block
  const diffMatch = trimmedPatch.match(/```diff\n([\s\S]*?)\n```/);
  let patchContent = trimmedPatch;
  
  if (diffMatch) {
    patchContent = diffMatch[1].trim();
  }
  console.log("patchContent", patchContent);
  console.log("start with @@", patchContent.startsWith('@@'));

  // Extract patch hunks - split by @@ markers
  const hunks = patchContent.split(/@@\s*\n/).filter(hunk => hunk.trim());
  
  if (hunks.length === 0) {
    return content;
  }

  // Process content line by line for better efficiency
  let contentLines = content.split('\n');
  
  // Process each hunk
  for (const hunk of hunks) {
    const hunkLines = hunk.split('\n').filter(line => line.length > 0);
    
    // Separate deletions and additions
    const deletions: string[] = [];
    const additions: string[] = [];
    
    for (const line of hunkLines) {
      console.log("line", line);
      if (line.startsWith('-')) {
        // Remove the '-' symbol and any leading space
        deletions.push(line.substring(1));
      } else if (line.startsWith('+')) {
        console.log("line starts with +", line);
        // Remove the '+' symbol and any leading space
        console.log("line substring", line.substring(1));
        additions.push(line.substring(1));
      }
    }
    
    if (deletions.length === 0 && additions.length > 0) {
      // Only additions, append to the end
      contentLines = contentLines.concat(additions);
    } else if (deletions.length > 0) {
      // Find and replace the deletion block
      const matchIndex = findBlockIndex(contentLines, deletions);
      
      if (matchIndex !== -1) {
        // Replace the deletion block with additions
        contentLines = [
          ...contentLines.slice(0, matchIndex),
          ...additions,
          ...contentLines.slice(matchIndex + deletions.length)
        ];
      } else {
        // If exact match not found, try fuzzy matching for single line replacements
        if (deletions.length === 1 && additions.length === 1) {
          const lineIndex = contentLines.findIndex(line => 
            line.trim() === deletions[0].trim()
          );
          if (lineIndex !== -1) {
            contentLines[lineIndex] = additions[0];
          } else {
            // If still not found, append additions
            contentLines = contentLines.concat(additions);
          }
        } else {
          console.warn('Could not find deletion block in content, appending additions');
          contentLines = contentLines.concat(additions);
        }
      }
    }
  }
  
  return contentLines.join('\n');
}

/**
 * Finds the starting index of a block of lines in the content
 * @param contentLines Array of content lines
 * @param targetBlock Array of lines to find
 * @returns Starting index of the block, or -1 if not found
 */
function findBlockIndex(contentLines: string[], targetBlock: string[]): number {
  if (targetBlock.length === 0) return -1;
  
  // Try to find exact match first
  for (let i = 0; i <= contentLines.length - targetBlock.length; i++) {
    let match = true;
    for (let j = 0; j < targetBlock.length; j++) {
      if (contentLines[i + j] !== targetBlock[j]) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  
  // Try with trimmed comparison as fallback
  for (let i = 0; i <= contentLines.length - targetBlock.length; i++) {
    let match = true;
    for (let j = 0; j < targetBlock.length; j++) {
      if (contentLines[i + j].trim() !== targetBlock[j].trim()) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  
  return -1;
}