import { createPlatePlugin } from '@udecode/plate-core/react';
import { DiffBlock } from '@/components/diff-block';
import type { DiffHunk } from './diff-parser';
import type { PlateRenderElementProps } from '@/types/editor';
import type { TElement } from '@udecode/plate-core';

export const ELEMENT_DIFF_BLOCK = 'diff-block' as const;

export interface DiffBlockElement extends TElement {
  type: typeof ELEMENT_DIFF_BLOCK;
  hunk: DiffHunk;
  children: [{ text: '' }];
}

export const DiffBlockPlugin = createPlatePlugin({
  key: ELEMENT_DIFF_BLOCK,
  node: {
    isElement: true,
    isVoid: true,
  },
});

export function DiffBlockComponent({ element, attributes, children, editor }: PlateRenderElementProps) {
  const handleAccept = () => {
    // This will be implemented in the main component
    if (editor && editor.diffHandlers?.onAccept) {
      editor.diffHandlers.onAccept(element as DiffBlockElement);
    }
  };
  
  const handleReject = () => {
    // This will be implemented in the main component
    if (editor && editor.diffHandlers?.onReject) {
      editor.diffHandlers.onReject(element as DiffBlockElement);
    }
  };
  
  return (
    <div {...attributes} contentEditable={false} style={{ userSelect: 'none' }}>
      <DiffBlock
        hunk={(element as DiffBlockElement).hunk}
        onAccept={handleAccept}
        onReject={handleReject}
      />
      <div style={{ display: 'none' }}>{children}</div>
    </div>
  );
}