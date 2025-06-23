'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FloatingInputBarProps {
  onAsk: (question: string) => void;
}

export function FloatingInputBar({ onAsk }: FloatingInputBarProps) {
  const [question, setQuestion] = useState('');

  const handleAsk = () => {
    if (question.trim()) {
      onAsk(question);
      setQuestion('');
    }
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
          disabled={!question.trim()}
        >
          Ask
        </Button>
      </div>
    </div>
  );
}