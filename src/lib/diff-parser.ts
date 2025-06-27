export interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  lineNumber?: number;
}

export interface DiffHunk {
  contextBefore: string[];
  deletions: string[];
  additions: string[];
  contextAfter: string[];
  startLine: number;
}

export function parseDiff(diffText: string): DiffHunk[] {
  console.log('=== DIFF PARSER DEBUG ===');
  console.log('Input text:', diffText);
  console.log('========================');
  
  const lines = diffText.split('\n');
  const hunks: DiffHunk[] = [];
  
  let currentHunk: DiffHunk | null = null;
  let inDiff = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    console.log(`Line ${i}: "${line}" (starts with: "${line[0]}")`);
    
    // Skip empty lines and @@ markers
    if (!line.trim() || line.trim() === '@@') {
      console.log('  -> Skipping empty or @@ line');
      continue;
    }
    
    // Trim leading spaces and check for diff markers
    const trimmedLine = line.trimStart();
    const leadingSpaces = line.length - trimmedLine.length;
    
    // Check if line starts with diff markers (after trimming leading spaces)
    if (trimmedLine.startsWith('-') && !trimmedLine.startsWith('---')) {
      console.log('  -> Detected deletion line');
      if (!currentHunk) {
        currentHunk = {
          contextBefore: [],
          deletions: [],
          additions: [],
          contextAfter: [],
          startLine: 0
        };
      }
      inDiff = true;
      // Preserve the indentation by keeping the leading spaces
      currentHunk.deletions.push(' '.repeat(leadingSpaces) + trimmedLine.substring(1));
    } else if (trimmedLine.startsWith('+') && !trimmedLine.startsWith('+++')) {
      console.log('  -> Detected addition line');
      if (!currentHunk) {
        currentHunk = {
          contextBefore: [],
          deletions: [],
          additions: [],
          contextAfter: [],
          startLine: 0
        };
      }
      inDiff = true;
      // Preserve the indentation by keeping the leading spaces
      currentHunk.additions.push(' '.repeat(leadingSpaces) + trimmedLine.substring(1));
    } else if (line.startsWith(' ') || line.startsWith('*')) {
      // Context line (can start with space or asterisk)
      const contextLine = line.startsWith('*') ? line.substring(1).trimStart() : line.substring(1);
      console.log('  -> Detected context line');
      
      if (currentHunk) {
        if (inDiff) {
          // This is context after the diff
          currentHunk.contextAfter.push(contextLine);
          // If we have enough context (just 1 line), finalize this hunk
          if (currentHunk.contextAfter.length >= 1) {
            hunks.push(currentHunk);
            currentHunk = null;
            inDiff = false;
          }
        } else {
          // This is context before the diff
          currentHunk.contextBefore.push(contextLine);
        }
      } else if (contextLine.trim()) {
        // Start a new hunk with context
        currentHunk = {
          contextBefore: [contextLine],
          deletions: [],
          additions: [],
          contextAfter: [],
          startLine: 0
        };
      }
    } else {
      // Unknown line format - treat as context if we're in a hunk
      if (currentHunk) {
        if (inDiff) {
          // This is context after the diff
          currentHunk.contextAfter.push(line);
          // If we have enough context (just 1 line), finalize this hunk
          if (currentHunk.contextAfter.length >= 1) {
            hunks.push(currentHunk);
            currentHunk = null;
            inDiff = false;
          }
        } else {
          // This is context before the diff
          currentHunk.contextBefore.push(line);
        }
      } else if (line.trim()) {
        // Start a new hunk with context
        currentHunk = {
          contextBefore: [line],
          deletions: [],
          additions: [],
          contextAfter: [],
          startLine: 0
        };
      }
    }
  }
  
  // Add the last hunk if any
  if (currentHunk && (currentHunk.deletions.length > 0 || currentHunk.additions.length > 0)) {
    hunks.push(currentHunk);
  }
  
  console.log('=== PARSED HUNKS ===');
  console.log('Total hunks:', hunks.length);
  hunks.forEach((hunk, index) => {
    console.log(`Hunk ${index}:`, {
      contextBefore: hunk.contextBefore,
      deletions: hunk.deletions,
      additions: hunk.additions,
      contextAfter: hunk.contextAfter
    });
  });
  console.log('==================');
  
  return hunks;
}

export function findDiffPosition(editorContent: string, hunk: DiffHunk): number {
  const lines = editorContent.split('\n');
  
  // If we have context before, use the last line of it to position
  if (hunk.contextBefore.length > 0) {
    const contextLine = hunk.contextBefore[hunk.contextBefore.length - 1].trim();
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === contextLine) {
        return i + 1; // Insert after the context line
      }
    }
  }
  
  // If we have deletions, search for them
  if (hunk.deletions.length > 0) {
    const firstDeletion = hunk.deletions[0].trim();
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === firstDeletion) {
        return i; // Insert at the deletion position
      }
    }
  }
  
  return -1; // Not found
}