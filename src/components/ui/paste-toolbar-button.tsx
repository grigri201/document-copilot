'use client';

import * as React from 'react';
import { ClipboardPasteIcon } from 'lucide-react';
import { useEditorRef } from 'platejs/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { ToolbarButton } from '@/components/ui/toolbar';
import { applyDiff } from '@/lib/applyDiff';

export function PasteToolbarButton() {
  const editor = useEditorRef();

  const handlePaste = async () => {
    try {
      // Read from clipboard
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText) {
        console.log('Clipboard is empty');
        return;
      }

      // Get current content as markdown
      const currentContent = editor.getApi(MarkdownPlugin).markdown.serialize();
      
      // Apply the diff
      const updatedContent = applyDiff(currentContent, clipboardText);
      
      // Replace editor content
      editor.tf.removeNodes({
        at: [],
        mode: 'highest',
      });
      
      // Parse and insert the updated markdown
      editor.getApi(MarkdownPlugin).markdown.deserialize(updatedContent);
      
      console.log('Diff applied successfully');
    } catch (error) {
      console.error('Error applying diff:', error);
      
      // Fallback for browsers that don't support clipboard API
      try {
        const textarea = document.createElement('textarea');
        document.body.appendChild(textarea);
        textarea.focus();
        document.execCommand('paste');
        const clipboardText = textarea.value;
        document.body.removeChild(textarea);
        
        if (clipboardText) {
          const currentContent = editor.getApi(MarkdownPlugin).markdown.serialize();
          const updatedContent = applyDiff(currentContent, clipboardText);
          
          editor.tf.removeNodes({
            at: [],
            mode: 'highest',
          });
          
          editor.getApi(MarkdownPlugin).markdown.deserialize(updatedContent);
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