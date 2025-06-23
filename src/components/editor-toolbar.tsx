'use client';

import { Button } from '@/components/ui/button';
import { ClipboardPaste } from 'lucide-react';

interface EditorToolbarProps {
  onPaste: () => void;
}

export function EditorToolbar({ onPaste }: EditorToolbarProps) {
  return (
    <div className="border-b bg-background p-2 flex items-center gap-2">
      <Button
        onClick={onPaste}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <ClipboardPaste className="h-4 w-4" />
        Paste Diff
      </Button>
    </div>
  );
}