'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FloatingInputBarProps {
  onAsk: (question: string) => void;
  onPaste: () => void;
}

export function FloatingInputBar({ onAsk, onPaste }: FloatingInputBarProps) {
  const [question, setQuestion] = useState('');
  const hasContent = question.trim().length > 0;

  const handleAsk = () => {
    if (hasContent) {
      onAsk(question);
      // Don't clear input after submit
    }
  };

  const handlePaste = () => {
    onPaste();
    // Clear input after paste
    setQuestion('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAsk();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 shadow-lg">
      <div className="max-w-3xl mx-auto flex gap-2">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask for changes to your document..."
          className="flex-1"
        />
        <Button 
          onClick={handleAsk}
          disabled={!hasContent}
        >
          Ask
        </Button>
        <Button 
          onClick={handlePaste}
          disabled={!hasContent}
          variant="outline"
        >
          Paste
        </Button>
      </div>
    </div>
  );
}