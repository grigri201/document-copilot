'use client';

import * as React from 'react';

import { WandSparklesIcon, CopyIcon } from 'lucide-react';
import { AIChatPlugin } from '@platejs/ai/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { useEditorPlugin } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toolbar } from './toolbar';
import { editPrompt } from '@/lib/prompts/editPrompt';

export function AIFloatingToolbar({
  className,
  ...props
}: React.ComponentProps<typeof Toolbar>) {
  const { editor } = useEditorPlugin(AIChatPlugin);
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get selected text and create placeholder
  const getPlaceholder = React.useCallback(() => {
    try {
      // Use Plate/Slate API to get selected text
      if (editor.selection && editor.api.isExpanded()) {
        const selectedText = editor.api.string(editor.selection) || '';
        
        if (selectedText && selectedText.length > 0) {
          // Keep 10 characters before and after, add ellipsis if needed
          if (selectedText.length > 23) {
            const start = selectedText.slice(0, 10);
            const end = selectedText.slice(-10);
            return `Ask AI about "${start}...${end}"`;
          }
          return `Ask AI about "${selectedText}"`;
        }
      }
    } catch (e) {
      // Fallback if selection is not available
      console.debug('Error getting selection text:', e);
    }
    return 'Ask AI';
  }, [editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      try {
        // Get selected text
        let selectedText = '';
        if (editor.selection && editor.api.isExpanded()) {
          selectedText = editor.api.string(editor.selection) || '';
        }
        
        // Get whole content
        const wholeContent = editor.getApi(MarkdownPlugin).markdown.serialize();
        
        // Format content with editPrompt
        const formattedContent = editPrompt(wholeContent, selectedText, input.trim());
        
        // Copy to clipboard
        await navigator.clipboard.writeText(formattedContent);
        
        // Open ChatGPT in new tab
        window.open('https://chatgpt.com', '_blank');
        
        // Clear the input
        setInput('');
        
        // Optional: Show success feedback
        console.log('Content copied to clipboard and ChatGPT opened');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        // Fallback: try using execCommand
        const textarea = document.createElement('textarea');
        textarea.value = editPrompt(
          editor.getApi(MarkdownPlugin).markdown.serialize(),
          editor.selection && editor.api.isExpanded() ? editor.api.string(editor.selection) || '' : '',
          input.trim()
        );
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        window.open('https://chatgpt.com', '_blank');
        setInput('');
      }
    }
  };

  // Save and restore selection when floating toolbar appears
  React.useEffect(() => {
    // Save the current selection when component mounts
    const savedSelection = editor.selection;
    
    const timer = setTimeout(() => {
      inputRef.current?.focus();
      
      // Restore the selection after focusing
      if (savedSelection) {
        // Use setSelection to update existing selection without changing focus
        editor.tf.setSelection(savedSelection);
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, []); // Remove editor dependency to only run on mount

  return (
    <Toolbar
      {...props}
      className={`${className}`}
      onMouseDown={(e) => {
        // Prevent default to maintain text selection
        e.preventDefault();
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        // Also handle pointer events
        e.preventDefault();
      }}
    >
      <form onSubmit={handleSubmit} className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-2">
          <WandSparklesIcon className="size-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={getPlaceholder()}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-7 w-64 border-0 bg-transparent px-2 placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            onFocus={(e) => {
              // Prevent focus from clearing selection
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              // Prevent default to maintain selection
              e.preventDefault();
              // Focus without losing selection
              setTimeout(() => {
                e.currentTarget.focus();
              }, 0);
            }}
            onKeyDown={(e) => {
              // Prevent toolbar from closing on certain keys
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
                e.stopPropagation();
              }
            }}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="h-7 px-3 flex items-center gap-1"
          disabled={!input.trim()}
          onMouseDown={(e) => {
            // Prevent default to maintain text selection
            e.preventDefault();
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            // Also handle pointer events
            e.preventDefault();
          }}
        >
          <CopyIcon className="h-3 w-3" />
          Copy
        </Button>
      </form>
    </Toolbar>
  );
}