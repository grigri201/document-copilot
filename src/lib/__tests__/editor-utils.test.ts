import {
  getNodeText,
  isParagraphNode,
  createParagraphNode,
  applyOperation,
  getEditorFromRef,
  calculateSearchRange
} from '../editor-utils';
import type { CustomEditor, CustomElement } from '@/types/editor';
import React from 'react';

describe('editor-utils', () => {
  describe('getNodeText', () => {
    it('should get text from paragraph node', () => {
      const node: CustomElement = {
        type: 'p',
        children: [{ text: 'Hello ' }, { text: 'World' }]
      };

      const result = getNodeText(node);

      expect(result).toBe('Hello World');
    });

    it('should get text from code_block node', () => {
      const node: CustomElement = {
        type: 'code_block',
        children: [{ text: 'const x = 42;' }]
      };

      const result = getNodeText(node);

      expect(result).toBe('const x = 42;');
    });

    it('should handle empty text nodes', () => {
      const node: CustomElement = {
        type: 'p',
        children: [{ text: '' }]
      };

      const result = getNodeText(node);

      expect(result).toBe('');
    });

    it('should handle nodes without text property', () => {
      const node: CustomElement = {
        type: 'p',
        children: [{ text: 'Hello' }, {} as any, { text: 'World' }]
      };

      const result = getNodeText(node);

      expect(result).toBe('HelloWorld');
    });

    it('should return empty string for non-text nodes', () => {
      const node: CustomElement = {
        type: 'diff-block' as const,
        hunk: {} as any,
        children: [{ text: '' }]
      };

      const result = getNodeText(node);

      expect(result).toBe('');
    });

    it('should handle nodes without children', () => {
      const node: CustomElement = {
        type: 'p',
        children: []
      };

      const result = getNodeText(node);

      expect(result).toBe('');
    });
  });

  describe('isParagraphNode', () => {
    it('should return true for paragraph nodes', () => {
      const node: CustomElement = {
        type: 'p',
        children: [{ text: 'test' }]
      };

      expect(isParagraphNode(node)).toBe(true);
    });

    it('should return false for code_block nodes', () => {
      const node: CustomElement = {
        type: 'code_block',
        children: [{ text: 'test' }]
      };

      expect(isParagraphNode(node)).toBe(false);
    });

    it('should return false for diff-block nodes', () => {
      const node: CustomElement = {
        type: 'diff-block' as const,
        hunk: {} as any,
        children: [{ text: '' }]
      };

      expect(isParagraphNode(node)).toBe(false);
    });
  });

  describe('createParagraphNode', () => {
    it('should create a paragraph node with text', () => {
      const text = 'Hello World';
      const result = createParagraphNode(text);

      expect(result).toEqual({
        type: 'p',
        children: [{ text: 'Hello World' }]
      });
    });

    it('should handle empty text', () => {
      const result = createParagraphNode('');

      expect(result).toEqual({
        type: 'p',
        children: [{ text: '' }]
      });
    });

    it('should handle special characters', () => {
      const text = 'Line 1\nLine 2\tTabbed';
      const result = createParagraphNode(text);

      expect(result).toEqual({
        type: 'p',
        children: [{ text: 'Line 1\nLine 2\tTabbed' }]
      });
    });
  });

  describe('applyOperation', () => {
    it('should call apply on the editor', () => {
      const mockApply = jest.fn();
      const editor = {
        apply: mockApply
      } as any;

      const operation = { type: 'insert_text', text: 'hello' };

      applyOperation(editor, operation);

      expect(mockApply).toHaveBeenCalledWith(operation);
      expect(mockApply).toHaveBeenCalledTimes(1);
    });

    it('should handle complex operations', () => {
      const mockApply = jest.fn();
      const editor = {
        apply: mockApply
      } as any;

      const operation = {
        type: 'set_node',
        path: [0, 1],
        properties: {},
        newProperties: { bold: true }
      };

      applyOperation(editor, operation);

      expect(mockApply).toHaveBeenCalledWith(operation);
    });
  });

  describe('getEditorFromRef', () => {
    it('should return editor when ref has value', () => {
      const editor = { children: [] } as CustomEditor;
      const ref = { current: editor } as React.MutableRefObject<CustomEditor | null>;

      const result = getEditorFromRef(ref);

      expect(result).toBe(editor);
    });

    it('should return null when ref is null', () => {
      const ref = { current: null } as React.MutableRefObject<CustomEditor | null>;

      const result = getEditorFromRef(ref);

      expect(result).toBeNull();
    });
  });

  describe('calculateSearchRange', () => {
    it('should calculate range with default lookback', () => {
      const elementPath = [15];
      
      const result = calculateSearchRange(elementPath);

      expect(result).toEqual({
        start: 5,
        end: 15
      });
    });

    it('should calculate range with custom lookback', () => {
      const elementPath = [20];
      
      const result = calculateSearchRange(elementPath, 5);

      expect(result).toEqual({
        start: 15,
        end: 20
      });
    });

    it('should not go below zero', () => {
      const elementPath = [3];
      
      const result = calculateSearchRange(elementPath, 10);

      expect(result).toEqual({
        start: 0,
        end: 3
      });
    });

    it('should handle zero element path', () => {
      const elementPath = [0];
      
      const result = calculateSearchRange(elementPath);

      expect(result).toEqual({
        start: 0,
        end: 0
      });
    });

    it('should handle nested paths by using first element', () => {
      const elementPath = [5, 2, 1];
      
      const result = calculateSearchRange(elementPath);

      expect(result).toEqual({
        start: 0,
        end: 5
      });
    });
  });
});