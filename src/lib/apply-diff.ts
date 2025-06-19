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
  console.log('[parseDiff] Starting to parse diff text of length:', diffText.length);
  const lines = diffText.split('\n');
  console.log('[parseDiff] Total lines:', lines.length);
  
  const hunks: DiffHunk[] = [];
  let currentHunk: DiffHunk | null = null;
  let inDiffBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a diff code block
    if (line.trim() === '```diff') {
      console.log(`[parseDiff] Line ${i}: Found diff block start`);
      inDiffBlock = true;
      continue;
    }
    
    // Check if we're exiting a diff code block
    if (line.trim() === '```' && inDiffBlock) {
      console.log(`[parseDiff] Line ${i}: Found diff block end`);
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
      console.log(`[parseDiff] Line ${i}: Found hunk header:`, line);
      if (currentHunk && currentHunk.lines.length > 0) {
        hunks.push(currentHunk);
      }
      currentHunk = { lines: [] };
      continue;
    }

    if (!currentHunk) {
      console.log(`[parseDiff] Line ${i}: Creating implicit hunk for diff content`);
      currentHunk = { lines: [] };
    }

    // Parse diff lines
    if (line.startsWith('+')) {
      console.log(`[parseDiff] Line ${i}: Add line:`, line);
      currentHunk.lines.push({ type: 'add', content: line.substring(1) });
    } else if (line.startsWith('-')) {
      console.log(`[parseDiff] Line ${i}: Remove line:`, line);
      currentHunk.lines.push({ type: 'remove', content: line.substring(1) });
    } else if (line.trim() !== '') {
      // Context line (no prefix)
      console.log(`[parseDiff] Line ${i}: Context line:`, line);
      currentHunk.lines.push({ type: 'context', content: line });
    }
  }

  // Add the last hunk if exists
  if (currentHunk && currentHunk.lines.length > 0) {
    hunks.push(currentHunk);
  }

  console.log('[parseDiff] Total hunks found:', hunks.length);
  hunks.forEach((hunk, idx) => {
    console.log(`[parseDiff] Hunk ${idx}: ${hunk.lines.length} lines`);
  });

  return hunks;
}

/**
 * Apply a diff patch to content
 */
export function applyDiff(content: string, diffText: string): string {
  console.log('[applyDiff] Starting diff application');
  console.log('[applyDiff] Original content length:', content.length);
  console.log('[applyDiff] Diff text length:', diffText.length);
  
  const hunks = parseDiff(diffText);
  if (hunks.length === 0) {
    console.log('[applyDiff] No hunks found, returning original content');
    return content;
  }

  let result = content;
  console.log('[applyDiff] Processing', hunks.length, 'hunks');

  // Process each hunk
  for (let hunkIdx = 0; hunkIdx < hunks.length; hunkIdx++) {
    const hunk = hunks[hunkIdx];
    console.log(`[applyDiff] Processing hunk ${hunkIdx} with ${hunk.lines.length} lines`);
    
    // Group consecutive remove/add operations
    let i = 0;
    while (i < hunk.lines.length) {
      const line = hunk.lines[i];
      
      if (line.type === 'remove') {
        console.log(`[applyDiff] Processing remove operation at line ${i}`);
        // Find all consecutive removes followed by adds
        const removes: string[] = [];
        const adds: string[] = [];
        
        let j = i;
        // Collect removes
        while (j < hunk.lines.length && hunk.lines[j].type === 'remove') {
          removes.push(hunk.lines[j].content);
          j++;
        }
        console.log(`[applyDiff] Collected ${removes.length} remove lines`);
        
        // Collect adds
        while (j < hunk.lines.length && hunk.lines[j].type === 'add') {
          adds.push(hunk.lines[j].content);
          j++;
        }
        console.log(`[applyDiff] Collected ${adds.length} add lines`);
        
        if (removes.length > 0) {
          // Replace the removed content with added content
          const removeText = removes.join('\n');
          const addText = adds.join('\n');
          
          console.log('[applyDiff] Attempting to replace:', removeText.substring(0, 50) + '...');
          console.log('[applyDiff] With:', addText.substring(0, 50) + '...');
          
          // Try to find and replace the text
          if (result.includes(removeText)) {
            console.log('[applyDiff] Found exact match, replacing');
            result = result.replace(removeText, addText);
          } else {
            console.log('[applyDiff] No exact match found, trying line by line');
            // If exact match not found, try line by line
            let replacedCount = 0;
            for (let k = 0; k < removes.length; k++) {
              // Try with and without trailing newline
              const lineToFind = removes[k];
              const lineToFindTrimmed = lineToFind.replace(/\n$/, '');
              const replacement = adds[k] || '';
              
              if (result.includes(lineToFind)) {
                console.log(`[applyDiff] Replacing line ${k}: "${lineToFind}" with "${replacement}"`);
                result = result.replace(lineToFind, replacement);
                replacedCount++;
              } else if (result.includes(lineToFindTrimmed)) {
                console.log(`[applyDiff] Replacing line ${k} (trimmed): "${lineToFindTrimmed}" with "${replacement}"`);
                result = result.replace(lineToFindTrimmed, replacement);
                replacedCount++;
              } else {
                console.log(`[applyDiff] Line ${k} not found: "${lineToFind}"`);
                console.log(`[applyDiff] Also tried trimmed version: "${lineToFindTrimmed}"`);
              }
            }
            console.log(`[applyDiff] Replaced ${replacedCount} out of ${removes.length} lines`);
            
            // Add any remaining adds
            if (adds.length > removes.length) {
              const remainingAdds = adds.slice(removes.length).join('\n');
              console.log(`[applyDiff] Adding ${adds.length - removes.length} remaining lines`);
              result += '\n' + remainingAdds;
            }
          }
        }
        
        i = j;
      } else if (line.type === 'add') {
        console.log(`[applyDiff] Processing pure add operation at line ${i}`);
        // Pure addition (no preceding remove)
        const adds: string[] = [line.content];
        let j = i + 1;
        
        while (j < hunk.lines.length && hunk.lines[j].type === 'add') {
          adds.push(hunk.lines[j].content);
          j++;
        }
        
        console.log(`[applyDiff] Adding ${adds.length} new lines to end`);
        // Add to the end of content
        result += '\n' + adds.join('\n');
        i = j;
      } else {
        i++;
      }
    }
  }

  console.log('[applyDiff] Diff application complete');
  console.log('[applyDiff] Result length:', result.length);
  console.log('[applyDiff] Content changed:', result !== content);
  
  return result;
}