import type { DiffHunk } from '@/lib/diff-parser';

// Diff operation types
export type DiffOperationType = 'delete' | 'add' | 'replace';

export interface DiffOperation {
  type: DiffOperationType;
  lineNumber: number;
  content: string;
}

// Handler function types
export interface DiffHandlers {
  onAccept: (element: DiffBlockElement) => void;
  onReject: (element: DiffBlockElement) => void;
}

// Import the DiffBlockElement type from the plugin
import type { DiffBlockElement } from '@/lib/diff-plugin';

// Re-export for convenience
export type { DiffHunk, DiffBlockElement };