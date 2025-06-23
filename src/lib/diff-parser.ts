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
  const lines = diffText.split('\n');
  const hunks: DiffHunk[] = [];
  
  let currentHunk: DiffHunk | null = null;
  let inDiff = false;
  
  for (const line of lines) {
    // Skip empty lines
    if (!line.trim()) continue;
    
    // Check if line starts with diff markers
    if (line.startsWith('-') && !line.startsWith('---')) {
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
      currentHunk.deletions.push(line.substring(1));
    } else if (line.startsWith('+') && !line.startsWith('+++')) {
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
      currentHunk.additions.push(line.substring(1));
    } else {
      // Context line or end of diff
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