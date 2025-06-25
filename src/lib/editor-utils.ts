import type { CustomEditor, CustomElement } from '@/types/editor';

/**
 * Get text content from a node
 */
export function getNodeText(node: CustomElement): string {
  if (node.type === 'p' && node.children) {
    return node.children.map((child) => child.text || '').join('');
  }
  if (node.type === 'code_block' && node.children) {
    return node.children.map((child) => child.text || '').join('');
  }
  return '';
}

/**
 * Check if a node is a paragraph element
 */
export function isParagraphNode(node: CustomElement): boolean {
  return node.type === 'p';
}

/**
 * Create a paragraph node with the given text
 */
export function createParagraphNode(text: string): CustomElement {
  return {
    type: 'p',
    children: [{ text }]
  };
}

/**
 * Apply an operation to the editor
 * This is a wrapper to centralize the type casting
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function applyOperation(editor: CustomEditor, operation: any): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (editor as any).apply(operation);
}

/**
 * Get the editor instance from a ref, with null check
 */
export function getEditorFromRef(
  editorRef: React.MutableRefObject<CustomEditor | null>
): CustomEditor | null {
  return editorRef.current;
}

/**
 * Calculate the search range for finding deletion nodes
 */
export function calculateSearchRange(
  elementPath: number[],
  maxLookback: number = 10
): { start: number; end: number } {
  return {
    start: Math.max(0, elementPath[0] - maxLookback),
    end: elementPath[0]
  };
}