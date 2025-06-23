import { createPlatePlugin } from 'platejs/react';
import { DiffBlock } from '@/components/diff-block';
import type { DiffHunk } from './diff-parser';

export const ELEMENT_DIFF_BLOCK = 'diff-block';

export interface DiffBlockElement {
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

export function DiffBlockComponent({ element, attributes, children, editor }: any) {
  const handleAccept = () => {
    // This will be implemented in the main component
    if (editor && (editor as any).diffHandlers?.onAccept) {
      (editor as any).diffHandlers.onAccept(element);
    }
  };
  
  const handleReject = () => {
    // This will be implemented in the main component
    if (editor && (editor as any).diffHandlers?.onReject) {
      (editor as any).diffHandlers.onReject(element);
    }
  };
  
  return (
    <div {...attributes} contentEditable={false} style={{ userSelect: 'none' }}>
      <DiffBlock
        hunk={element.hunk}
        onAccept={handleAccept}
        onReject={handleReject}
      />
      <div style={{ display: 'none' }}>{children}</div>
    </div>
  );
}