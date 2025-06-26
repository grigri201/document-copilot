'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useDiffHandlers } from '@/hooks/useDiffHandlers';
import { useClipboardHandlers } from '@/hooks/useClipboardHandlers';
import { useAutoSave } from '@/hooks/useAutoSave';
import { EditorLayout } from '@/components/layouts/EditorLayout';
import { SavingIndicator } from '@/components/saving-indicator';

export default function MyEditorPage() {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { editor, editorRef, getContent, setContent } = useDocumentEditor();
  const { attachHandlers } = useDiffHandlers(editorRef);
  const { handleAsk, handlePaste } = useClipboardHandlers({ 
    editorRef, 
    getContent 
  });
  const { isSaving, loadFromStorage, clearStorage } = useAutoSave({ editor, getContent });

  // Load content from storage on mount
  useEffect(() => {
    if (editor) {
      const savedContent = loadFromStorage();
      if (savedContent) {
        setContent(savedContent);
      }
    }
  }, [editor, loadFromStorage, setContent]);

  // Attach diff handlers to editor
  useEffect(() => {
    attachHandlers(editor);
  }, [editor, attachHandlers]);

  const handleClear = useCallback(() => {
    if (!editor) return;
    
    // Clear the editor content
    setContent('');
    
    // Clear localStorage
    clearStorage();
    
    // Focus back on the editor
    if (editor.focus && typeof editor.focus === 'function') {
      editor.focus();
    }
  }, [editor, setContent, clearStorage]);

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  return (
    <>
      <EditorLayout 
        editor={editor}
        onAsk={handleAsk}
        onPaste={handlePaste}
        onClear={handleClear}
        onTogglePreview={handleTogglePreview}
        isPreviewMode={isPreviewMode}
        content={getContent()}
      />
      <SavingIndicator isVisible={isSaving} />
    </>
  );
}