'use client';

import * as React from 'react';
import { ClipboardPasteIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { ToolbarButton } from '@/components/ui/toolbar';
import { applyDiff } from '@/lib/applyDiff';
import { plateToMarkdown } from '@/lib/plateToMarkdown';

export function PasteToolbarButton() {
  const editor = useEditorRef();

  const handlePaste = async () => {
    try {
      console.log('[PasteToolbar] Starting paste operation...');
      
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();
      console.log('[PasteToolbar] Clipboard text length:', clipboardText?.length || 0);
      console.log('[PasteToolbar] Clipboard preview:', clipboardText?.substring(0, 100) + '...');
      
      if (!clipboardText) {
        console.log('[PasteToolbar] Clipboard is empty, aborting');
        return;
      }

      // Get current content as markdown using custom serializer
      const currentContent = plateToMarkdown(editor.children);
      console.log('[PasteToolbar] Current content length:', currentContent.length);
      console.log('[PasteToolbar] Current content preview:', currentContent.substring(0, 100) + '...');
      
      // Apply the diff
      console.log('[PasteToolbar] Applying diff...');
      const updatedContent = applyDiff(currentContent, clipboardText);
      console.log('[PasteToolbar] Updated content length:', updatedContent.length);
      const contentChanged = currentContent !== updatedContent;
      console.log('[PasteToolbar] Content changed:', contentChanged);
      
      if (contentChanged) {
        // Clear existing content and replace with updated markdown
        console.log('[PasteToolbar] Content changed, resetting editor...');
        editor.tf.reset();
        console.log('[PasteToolbar] Deserializing new content...');
        editor.getApi(MarkdownPlugin).markdown.deserialize(updatedContent);
        console.log('[PasteToolbar] Diff applied successfully');
      } else {
        console.log('[PasteToolbar] No changes detected, skipping editor update');
        alert('No changes were found to apply from the clipboard diff.');
      }
    } catch (error) {
      console.error('[PasteToolbar] Error applying diff:', error);
      console.error('[PasteToolbar] Error stack:', error.stack);
      
      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        document.execCommand('paste');
        const clipboardText = textarea.value;
        document.body.removeChild(textarea);
        
        if (clipboardText) {
          const currentContent = plateToMarkdown(editor.children);
          const updatedContent = applyDiff(currentContent, clipboardText);
          
          if (currentContent !== updatedContent) {
            editor.tf.reset();
            editor.getApi(MarkdownPlugin).markdown.deserialize(updatedContent);
          } else {
            alert('No changes were found to apply from the clipboard diff.');
          }
        }
      } catch (fallbackError) {
        console.error('Fallback paste also failed:', fallbackError);
        alert('Unable to access clipboard. Please check browser permissions.');
      }
    }
  };

  return (
    <ToolbarButton
      onClick={handlePaste}
      tooltip="Apply diff from clipboard"
    >
      <ClipboardPasteIcon className="h-4 w-4" />
    </ToolbarButton>
  );
}