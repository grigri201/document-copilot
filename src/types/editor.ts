import type { TText, TElement } from '@udecode/plate-core';
import type { TPlateEditor } from '@udecode/plate-core/react';
import { type DiffBlockElement, ELEMENT_DIFF_BLOCK } from '@/lib/diff-plugin';

// Text nodes
export interface CustomText extends TText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
}

// Element types
export interface ParagraphElement extends TElement {
  type: 'p';
  children: CustomText[];
}

export interface CodeBlockElement extends TElement {
  type: 'code_block';
  children: CustomText[];
  language?: string;
}

// Union of all element types
export type CustomElement = ParagraphElement | CodeBlockElement | DiffBlockElement;

// Editor value type
export type CustomValue = CustomElement[];

// Extended editor type with our custom handlers
export type CustomEditor = TPlateEditor<CustomValue> & {
  diffHandlers?: {
    onAccept: (element: DiffBlockElement) => void;
    onReject: (element: DiffBlockElement) => void;
  };
};

// Node type for iterating over editor children
export type EditorNode = CustomElement;

// Type for Plate component props
export interface PlateRenderElementProps {
  element: CustomElement;
  attributes: Record<string, unknown>;
  children: React.ReactNode;
  editor: CustomEditor;
}

// Type for editor operations
export interface EditorOperation {
  type: 'insert_node' | 'remove_node' | 'set_node';
  path: number[];
  node?: CustomElement;
  properties?: Partial<CustomElement>;
  newProperties?: Partial<CustomElement>;
}

// Helper type to extract text from nodes
export type NodeText = {
  text: string;
};

// Type guard functions
export function isParagraphElement(element: CustomElement): element is ParagraphElement {
  return element.type === 'p';
}

export function isCodeBlockElement(element: CustomElement): element is CodeBlockElement {
  return element.type === 'code_block';
}

export function isDiffBlockElement(element: CustomElement): element is DiffBlockElement {
  return element.type === ELEMENT_DIFF_BLOCK;
}