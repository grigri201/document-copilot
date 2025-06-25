import {
  findDeletionNodes,
  applyInlineReplacement,
  removeDeletedNodes,
  removeDiffBlock,
  insertAdditions,
  findElementPath
} from '../diff-operations';
import type { CustomEditor, CustomElement } from '@/types/editor';
import type { DiffHunk } from '../diff-parser';

// Mock editor apply function
const mockApply = jest.fn();
const createMockEditor = (children: CustomElement[]): CustomEditor => ({
  children,
  apply: mockApply,
} as any);

describe('diff-operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findDeletionNodes', () => {
    it('should find exact line match', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        { type: 'p', children: [{ text: 'line to delete' }] },
        { type: 'p', children: [{ text: 'line 3' }] },
      ]);

      const hunk: DiffHunk = {
        deletions: ['line to delete'],
        additions: [],
        contextBefore: [],
        contextAfter: [],
      };

      const result = findDeletionNodes(editor, hunk, 0, 3);
      
      expect(result).toEqual({
        foundDeletionStart: 1,
        isInlineReplacement: false,
        inlineNodeIndex: -1,
      });
    });

    it('should find inline replacement', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'This is a line with old text here' }] },
      ]);

      const hunk: DiffHunk = {
        deletions: ['old text'],
        additions: ['new text'],
        contextBefore: [],
        contextAfter: [],
      };

      const result = findDeletionNodes(editor, hunk, 0, 1);
      
      expect(result).toEqual({
        foundDeletionStart: -1,
        isInlineReplacement: true,
        inlineNodeIndex: 0,
      });
    });

    it('should return not found when no match', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        { type: 'p', children: [{ text: 'line 2' }] },
      ]);

      const hunk: DiffHunk = {
        deletions: ['non-existent line'],
        additions: [],
        contextBefore: [],
        contextAfter: [],
      };

      const result = findDeletionNodes(editor, hunk, 0, 2);
      
      expect(result).toEqual({
        foundDeletionStart: -1,
        isInlineReplacement: false,
        inlineNodeIndex: -1,
      });
    });
  });

  describe('applyInlineReplacement', () => {
    it('should replace text within a node', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'This is old text here' }] },
      ]);

      applyInlineReplacement(editor, 0, 'old text', 'new text');

      expect(mockApply).toHaveBeenCalledWith({
        type: 'set_node',
        path: [0],
        properties: {},
        newProperties: {
          children: [{ text: 'This is new text here' }]
        }
      });
    });

    it('should handle non-paragraph nodes gracefully', () => {
      const editor = createMockEditor([
        { type: 'code_block', children: [{ text: 'code' }] },
      ]);

      applyInlineReplacement(editor, 0, 'old', 'new');

      expect(mockApply).not.toHaveBeenCalled();
    });
  });

  describe('removeDeletedNodes', () => {
    it('should remove matching nodes and update element path', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        { type: 'p', children: [{ text: 'line 2' }] },
        { type: 'p', children: [{ text: 'line 3' }] },
        { type: 'p', children: [{ text: 'diff block' }] },
      ]);

      const deletions = ['line 2', 'line 3'];
      const elementPath = [3]; // diff block position

      const updatedPath = removeDeletedNodes(editor, deletions, 1, elementPath);

      // Should remove nodes in reverse order
      expect(mockApply).toHaveBeenCalledTimes(2);
      expect(mockApply).toHaveBeenNthCalledWith(1, {
        type: 'remove_node',
        path: [2],
        node: editor.children[2],
      });
      expect(mockApply).toHaveBeenNthCalledWith(2, {
        type: 'remove_node',
        path: [1],
        node: editor.children[1],
      });

      // Element path should be adjusted
      expect(updatedPath).toEqual([1]); // 3 - 2 removed nodes
    });

    it('should skip non-matching nodes', () => {
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        { type: 'p', children: [{ text: 'different line' }] },
      ]);

      const deletions = ['line 2'];
      const elementPath = [1];

      removeDeletedNodes(editor, deletions, 1, elementPath);

      expect(mockApply).not.toHaveBeenCalled();
    });
  });

  describe('removeDiffBlock', () => {
    it('should remove diff block element', () => {
      const element: CustomElement = {
        type: 'diff-block' as const,
        hunk: {} as DiffHunk,
        children: [{ text: '' }],
      };
      const editor = createMockEditor([element]);

      removeDiffBlock(editor, [0], element);

      expect(mockApply).toHaveBeenCalledWith({
        type: 'remove_node',
        path: [0],
        node: element,
      });
    });
  });

  describe('insertAdditions', () => {
    it('should insert multiple lines', () => {
      const editor = createMockEditor([]);
      const additions = ['new line 1', 'new line 2', 'new line 3'];

      insertAdditions(editor, [2], additions);

      expect(mockApply).toHaveBeenCalledTimes(3);
      expect(mockApply).toHaveBeenNthCalledWith(1, {
        type: 'insert_node',
        path: [2],
        node: { type: 'p', children: [{ text: 'new line 1' }] },
      });
      expect(mockApply).toHaveBeenNthCalledWith(2, {
        type: 'insert_node',
        path: [3],
        node: { type: 'p', children: [{ text: 'new line 2' }] },
      });
      expect(mockApply).toHaveBeenNthCalledWith(3, {
        type: 'insert_node',
        path: [4],
        node: { type: 'p', children: [{ text: 'new line 3' }] },
      });
    });
  });

  describe('findElementPath', () => {
    it('should find element path when element exists', () => {
      const targetElement: CustomElement = { type: 'p', children: [{ text: 'target' }] };
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        targetElement,
        { type: 'p', children: [{ text: 'line 3' }] },
      ]);

      const path = findElementPath(editor, targetElement);

      expect(path).toEqual([1]);
    });

    it('should return null when element not found', () => {
      const targetElement: CustomElement = { type: 'p', children: [{ text: 'target' }] };
      const editor = createMockEditor([
        { type: 'p', children: [{ text: 'line 1' }] },
        { type: 'p', children: [{ text: 'line 2' }] },
      ]);

      const path = findElementPath(editor, targetElement);

      expect(path).toBeNull();
    });
  });
});