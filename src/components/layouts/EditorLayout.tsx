'use client';

import { ReactNode } from 'react';
import { Plate } from '@udecode/plate-core/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingInputBar } from '@/components/floating-input-bar';
import { EditorToolbar } from '@/components/editor-toolbar';
import { MarkdownPreview } from '@/components/markdown-preview';
import { PreviewWithDiffs } from '@/components/preview-with-diffs';
import type { CustomEditor } from '@/types/editor';
import type { DiffHunk } from '@/types/diff';

interface EditorLayoutProps {
  editor: CustomEditor;
  onAsk: (question: string) => void;
  onPaste: () => void;
  onClear: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  content: string;
  placeholder?: string;
  children?: ReactNode;
  previewDiffs?: DiffHunk[];
  onPreviewDiffAccept?: (hunk: DiffHunk) => void;
  onPreviewDiffReject?: (hunk: DiffHunk) => void;
  onDownload?: () => void;
  onCopy?: () => void;
}

export function EditorLayout({ 
  editor, 
  onAsk, 
  onPaste, 
  onClear,
  onTogglePreview,
  isPreviewMode,
  content,
  placeholder = "Type your markdown content here...",
  children,
  previewDiffs = [],
  onPreviewDiffAccept,
  onPreviewDiffReject,
  onDownload,
  onCopy
}: EditorLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full">
      <EditorToolbar 
        onClear={onClear} 
        onTogglePreview={onTogglePreview}
        isPreviewMode={isPreviewMode}
        onDownload={onDownload}
        onCopy={onCopy}
      />
      {isPreviewMode ? (
        <div className="flex-1 overflow-auto pb-20">
          {previewDiffs.length > 0 && onPreviewDiffAccept && onPreviewDiffReject ? (
            <PreviewWithDiffs 
              content={content} 
              diffs={previewDiffs}
              onAccept={onPreviewDiffAccept}
              onReject={onPreviewDiffReject}
            />
          ) : (
            <MarkdownPreview content={content} />
          )}
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Plate editor={editor as any}>
            <EditorContainer className="flex-1 overflow-auto pb-20">
              <Editor placeholder={placeholder} />
              {children}
            </EditorContainer>
          </Plate>
        </>
      )}
      <FloatingInputBar onAsk={onAsk} onPaste={onPaste} />
    </div>
  );
}