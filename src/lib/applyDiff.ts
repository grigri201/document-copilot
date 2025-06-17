export interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
}

export interface DiffHunk {
  lines: DiffLine[];
}

/**
 * Parse a unified diff patch into hunks
 */
export function parseDiff(diffText: string): DiffHunk[] {
  const lines = diffText.split('\n');
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let inDiffBlock = false;

  for (const line of lines) {
    // Check if we're entering a diff code block
    if (line.trim() === '```diff') {
      inDiffBlock = true;
      continue;
    }
    
    // Check if we're exiting a diff code block
    if (line.trim() === '```' && inDiffBlock) {
      if (currentHunk && currentHunk.lines.length > 0) {
        hunks.push(currentHunk);
        currentHunk = null;
      }
      inDiffBlock = false;
      continue;
    }

    if (!inDiffBlock) continue;

    // Start a new hunk on @@
    if (line.startsWith('@@')) {
      if (currentHunk && currentHunk.lines.length > 0) {
        hunks.push(currentHunk);
      }
      currentHunk = { lines: [] };
      continue;
    }

    if (!currentHunk) continue;

    // Parse diff lines
    if (line.startsWith('+')) {
      currentHunk.lines.push({ type: 'add', content: line.substring(1) });
    } else if (line.startsWith('-')) {
      currentHunk.lines.push({ type: 'remove', content: line.substring(1) });
    } else if (line.trim() !== '') {
      // Context line (no prefix)
      currentHunk.lines.push({ type: 'context', content: line });
    }
  }

  // Add the last hunk if exists
  if (currentHunk && currentHunk.lines.length > 0) {
    hunks.push(currentHunk);
  }

  return hunks;
}

/**
 * Apply a diff patch to content
 */
export function applyDiff(content: string, diffText: string): string {
  const hunks = parseDiff(diffText);
  if (hunks.length === 0) return content;

  let result = content;

  // Process each hunk
  for (const hunk of hunks) {
    // Group consecutive remove/add operations
    let i = 0;
    while (i < hunk.lines.length) {
      const line = hunk.lines[i];
      
      if (line.type === 'remove') {
        // Find all consecutive removes followed by adds
        const removes: string[] = [];
        const adds: string[] = [];
        
        let j = i;
        // Collect removes
        while (j < hunk.lines.length && hunk.lines[j].type === 'remove') {
          removes.push(hunk.lines[j].content);
          j++;
        }
        
        // Collect adds
        while (j < hunk.lines.length && hunk.lines[j].type === 'add') {
          adds.push(hunk.lines[j].content);
          j++;
        }
        
        if (removes.length > 0) {
          // Replace the removed content with added content
          const removeText = removes.join('\n');
          const addText = adds.join('\n');
          
          // Try to find and replace the text
          if (result.includes(removeText)) {
            result = result.replace(removeText, addText);
          } else {
            // If exact match not found, try line by line
            for (let k = 0; k < removes.length; k++) {
              if (result.includes(removes[k])) {
                result = result.replace(removes[k], adds[k] || '');
              }
            }
            // Add any remaining adds
            if (adds.length > removes.length) {
              const remainingAdds = adds.slice(removes.length).join('\n');
              result += '\n' + remainingAdds;
            }
          }
        }
        
        i = j;
      } else if (line.type === 'add') {
        // Pure addition (no preceding remove)
        const adds: string[] = [line.content];
        let j = i + 1;
        
        while (j < hunk.lines.length && hunk.lines[j].type === 'add') {
          adds.push(hunk.lines[j].content);
          j++;
        }
        
        // Add to the end of content
        result += '\n' + adds.join('\n');
        i = j;
      } else {
        i++;
      }
    }
  }

  return result;
}