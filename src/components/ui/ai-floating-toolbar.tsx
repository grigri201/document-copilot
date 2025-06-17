'use client';

import * as React from 'react';

import { WandSparklesIcon } from 'lucide-react';
import { AIChatPlugin } from '@platejs/ai/react';
import { MarkdownPlugin } from '@platejs/markdown';
import { useEditorPlugin } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toolbar } from './toolbar';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Store current selection before submitting
      const currentSelection = editor.selection;
      
      // Get selected text
      let selectedText = '';
      if (editor.selection && editor.api.isExpanded()) {
        selectedText = editor.api.string(editor.selection) || '';
      }
      
      // Get whole content
      const wholeContent = editor.getApi(MarkdownPlugin).markdown.serialize();
      
      // Print to console
      console.log('=== AI Floating Toolbar Submission ===');
      console.log('User Input:', input);
      console.log('Selected Text:', selectedText);
      console.log('Whole Content:', wholeContent);
      console.log('=====================================');
      
      // Clear the input
      setInput('');
      
      // Restore selection if it was lost
      if (currentSelection && !editor.selection) {
        editor.tf.select(currentSelection);
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
          className="h-7 px-3"
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
          Submit
        </Button>
      </form>
    </Toolbar>
  );
}