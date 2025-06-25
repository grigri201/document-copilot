'use client';

import { ReactNode } from 'react';
import { Plate } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingInputBar } from '@/components/floating-input-bar';
import { EditorToolbar } from '@/components/editor-toolbar';

interface EditorLayoutProps {
  editor: any;
  onAsk: (question: string) => void;
  onPaste: () => void;
  placeholder?: string;
  children?: ReactNode;
}

export function EditorLayout({ 
  editor, 
  onAsk, 
  onPaste, 
  placeholder = "Type your markdown content here...",
  children 
}: EditorLayoutProps) {
  return (
    <div className="flex flex-col h-screen w-full">
      <EditorToolbar onPaste={onPaste} />
      <Plate editor={editor}>
        <EditorContainer className="flex-1 overflow-auto pb-20">
          <Editor placeholder={placeholder} />
          {children}
        </EditorContainer>
      </Plate>
      <FloatingInputBar onAsk={onAsk} />
    </div>
  );
}