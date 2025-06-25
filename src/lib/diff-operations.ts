import type { CustomEditor, CustomElement } from '@/types/editor';
import type { DiffHunk } from './diff-parser';

interface DeletionSearchResult {
  foundDeletionStart: number;
  isInlineReplacement: boolean;
  inlineNodeIndex: number;
}

/**
 * Find nodes that match the deletion lines in the diff hunk
 */
export function findDeletionNodes(
  editor: CustomEditor,
  hunk: DiffHunk,
  startSearchIndex: number,
  endSearchIndex: number
): DeletionSearchResult {
  let foundDeletionStart = -1;
  let isInlineReplacement = false;
  let inlineNodeIndex = -1;

  const firstDeletion = hunk.deletions[0]?.trim();
  if (!firstDeletion) {
    return { foundDeletionStart, isInlineReplacement, inlineNodeIndex };
  }

  for (let i = startSearchIndex; i < endSearchIndex; i++) {
    const node = editor.children[i];
    if (node && node.type === 'p' && node.children) {
      const nodeText = node.children.map((child) => child.text || '').join('');
      
      // Check for exact match (full line replacement)
      if (nodeText.trim() === firstDeletion) {
        foundDeletionStart = i;
        break;
      }
      // Check for inline match (partial line replacement)
      else if (nodeText.includes(firstDeletion)) {
        isInlineReplacement = true;
        inlineNodeIndex = i;
        break;
      }
    }
  }

  return { foundDeletionStart, isInlineReplacement, inlineNodeIndex };
}

/**
 * Apply inline text replacement within a single node
 */
export function applyInlineReplacement(
  editor: CustomEditor,
  nodeIndex: number,
  oldText: string,
  newText: string
): void {
  const node = editor.children[nodeIndex];
  if (node && node.type === 'p' && node.children) {
    const nodeText = node.children.map((child) => child.text || '').join('');
    const updatedText = nodeText.replace(oldText, newText);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor as any).apply({
      type: 'set_node',
      path: [nodeIndex],
      properties: {},
      newProperties: {
        children: [{ text: updatedText }]
      }
    });
  }
}

/**
 * Remove multiple nodes that match deletion lines
 */
export function removeDeletedNodes(
  editor: CustomEditor,
  deletions: string[],
  startIndex: number,
  elementPath: number[]
): number[] {
  const updatedElementPath = [...elementPath];
  
  // Remove in reverse order to maintain correct indices
  for (let i = deletions.length - 1; i >= 0; i--) {
    const nodeIndex = startIndex + i;
    if (nodeIndex < editor.children.length) {
      const node = editor.children[nodeIndex];
      if (node && node.type === 'p' && node.children) {
        const nodeText = node.children.map((child) => child.text || '').join('').trim();
        const deletionText = deletions[i].trim();
        
        if (nodeText === deletionText) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (editor as any).apply({
            type: 'remove_node',
            path: [nodeIndex],
            node: node,
          });
          
          // Adjust the elementPath since we removed a node before it
          if (nodeIndex < updatedElementPath[0]) {
            updatedElementPath[0]--;
          }
        }
      }
    }
  }
  
  return updatedElementPath;
}

/**
 * Remove a diff block element from the editor
 */
export function removeDiffBlock(
  editor: CustomEditor,
  elementPath: number[],
  element: CustomElement
): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor as any).apply({
    type: 'remove_node',
    path: elementPath,
    node: element,
  });
}

/**
 * Insert addition lines at the specified position
 */
export function insertAdditions(
  editor: CustomEditor,
  path: number[],
  additions: string[]
): void {
  additions.forEach((line, index) => {
    const newNode = {
      type: 'p' as const,
      children: [{ text: line }]
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor as any).apply({
      type: 'insert_node',
      path: [path[0] + index],
      node: newNode,
    });
  });
}

/**
 * Find the path of an element in the editor
 */
export function findElementPath(
  editor: CustomEditor,
  element: CustomElement
): number[] | null {
  let elementPath: number[] | null = null;
  
  editor.children.forEach((node: CustomElement, index: number) => {
    if (node === element) {
      elementPath = [index];
    }
  });
  
  return elementPath;
}