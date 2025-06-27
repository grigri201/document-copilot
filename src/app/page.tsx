'use client';

import { useEffect, useCallback, useState } from 'react';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useDiffHandlers } from '@/hooks/useDiffHandlers';
import { useClipboardHandlers } from '@/hooks/useClipboardHandlers';
import { useAutoSave } from '@/hooks/useAutoSave';
import { EditorLayout } from '@/components/layouts/EditorLayout';
import { SavingIndicator } from '@/components/saving-indicator';
import { parseDiff } from '@/lib/diff-parser';
import { downloadAsHtml, generateHtmlDocument } from '@/lib/download-utils';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import type { DiffHunk } from '@/types/diff';

export default function MyEditorPage() {
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [previewDiffs, setPreviewDiffs] = useState<DiffHunk[]>([]);
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
    // Clear preview diffs when toggling modes
    setPreviewDiffs([]);
  }, []);

  // Handle paste in preview mode
  const handlePreviewPaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const hunks = parseDiff(clipboardText);
      
      if (hunks.length === 0) {
        alert('No valid diff found in clipboard');
        return;
      }
      
      setPreviewDiffs(hunks);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Make sure you have copied the diff text.');
    }
  }, []);

  // Handle diff accept/reject in preview mode
  const handlePreviewDiffAccept = useCallback((hunk: DiffHunk) => {
    // Apply the diff to the actual content
    let newContent = getContent();
    
    if (hunk.deletions.length > 0 && hunk.additions.length > 0) {
      hunk.deletions.forEach((deletion, index) => {
        if (hunk.additions[index]) {
          newContent = newContent.replace(deletion, hunk.additions[index]);
        }
      });
    } else if (hunk.additions.length > 0 && hunk.contextBefore.length > 0) {
      const contextLine = hunk.contextBefore[hunk.contextBefore.length - 1];
      const insertIndex = newContent.indexOf(contextLine) + contextLine.length;
      newContent = newContent.slice(0, insertIndex) + '\n' + hunk.additions.join('\n') + newContent.slice(insertIndex);
    }
    
    setContent(newContent);
    setPreviewDiffs(previewDiffs.filter(d => d !== hunk));
  }, [getContent, setContent, previewDiffs]);

  const handlePreviewDiffReject = useCallback((hunk: DiffHunk) => {
    setPreviewDiffs(previewDiffs.filter(d => d !== hunk));
  }, [previewDiffs]);

  // Use different paste handler based on mode
  const currentPasteHandler = isPreviewMode ? handlePreviewPaste : handlePaste;

  // Handle download in preview mode
  const handleDownload = useCallback(async () => {
    const markdownContent = getContent();
    
    // Convert markdown to HTML
    const result = await remark()
      .use(remarkHtml)
      .process(markdownContent);
    
    const htmlContent = result.toString();
    const fullHtml = generateHtmlDocument(htmlContent);
    
    // Download as HTML (browsers can print HTML to PDF)
    downloadAsHtml(fullHtml, 'document.html');
  }, [getContent]);

  // Handle copy in edit mode
  const handleCopy = useCallback(() => {
    const content = getContent();
    navigator.clipboard.writeText(content)
      .then(() => {
        // Could add a toast notification here
        console.log('Content copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy content to clipboard');
      });
  }, [getContent]);

  return (
    <>
      <EditorLayout 
        editor={editor}
        onAsk={handleAsk}
        onPaste={currentPasteHandler}
        onClear={handleClear}
        onTogglePreview={handleTogglePreview}
        isPreviewMode={isPreviewMode}
        content={getContent()}
        previewDiffs={previewDiffs}
        onPreviewDiffAccept={handlePreviewDiffAccept}
        onPreviewDiffReject={handlePreviewDiffReject}
        onDownload={handleDownload}
        onCopy={handleCopy}
      />
      <SavingIndicator isVisible={isSaving} />
    </>
  );
}