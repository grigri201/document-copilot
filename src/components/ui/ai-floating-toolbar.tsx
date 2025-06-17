'use client';

import * as React from 'react';

import { WandSparklesIcon } from 'lucide-react';
import { AIChatPlugin } from '@platejs/ai/react';
import { useEditorPlugin } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toolbar } from './toolbar';

export function AIFloatingToolbar({
  className,
  ...props
}: React.ComponentProps<typeof Toolbar>) {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const [input, setInput] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Get selected text and create placeholder
  const getPlaceholder = () => {
    try {
      // Use Plate/Slate API to get selected text
      if (editor.selection && editor.api.isExpanded()) {
        const selectedText = editor.api.string() || '';
        
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
    }
    return 'Ask AI';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Submit the prompt directly to the AI chat
      void api.aiChat.submit({
        prompt: input,
      });
      // Clear the input
      setInput('');
    }
  };

  // Focus the input when the toolbar is shown
  React.useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Toolbar
      {...props}
      className={className}
      onMouseDown={(e) => {
        // Prevent default to maintain text selection
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
            onMouseDown={(e) => {
              // Prevent default but allow focus
              e.preventDefault();
              e.currentTarget.focus();
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
          }}
        >
          Submit
        </Button>
      </form>
    </Toolbar>
  );
}