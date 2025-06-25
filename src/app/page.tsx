'use client';

import { useEffect } from 'react';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useDiffHandlers } from '@/hooks/useDiffHandlers';
import { useClipboardHandlers } from '@/hooks/useClipboardHandlers';
import { EditorLayout } from '@/components/layouts/EditorLayout';

export default function MyEditorPage() {
  const { editor, editorRef, getContent } = useDocumentEditor();
  const { attachHandlers } = useDiffHandlers(editorRef);
  const { handleAsk, handlePaste } = useClipboardHandlers({ 
    editorRef, 
    getContent 
  });

  // Attach diff handlers to editor
  useEffect(() => {
    attachHandlers(editor);
  }, [editor, attachHandlers]);

  return (
    <EditorLayout 
      editor={editor}
      onAsk={handleAsk}
      onPaste={handlePaste}
    />
  );
}