'use client';

import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { DiffHunk } from '@/lib/diff-parser';

interface DiffBlockProps {
  hunk: DiffHunk;
  onAccept: () => void;
  onReject: () => void;
}

export function DiffBlock({ hunk, onAccept, onReject }: DiffBlockProps) {
  return (
    <div className="my-4 border rounded-lg overflow-hidden bg-muted/30">
      <div className="font-mono text-sm">
        {/* Context before */}
        {hunk.contextBefore.map((line, i) => (
          <div key={`before-${i}`} className="px-4 py-1 bg-muted/50">
            <span className="text-muted-foreground select-none mr-3"> </span>
            {line}
          </div>
        ))}
        
        {/* Deletions */}
        {hunk.deletions.map((line, i) => (
          <div key={`del-${i}`} className="px-4 py-1 bg-red-500/20 text-red-700 dark:text-red-400">
            <span className="select-none mr-3">-</span>
            {line}
          </div>
        ))}
        
        {/* Additions */}
        {hunk.additions.map((line, i) => (
          <div key={`add-${i}`} className="px-4 py-1 bg-green-500/20 text-green-700 dark:text-green-400">
            <span className="select-none mr-3">+</span>
            {line}
          </div>
        ))}
        
        {/* Context after */}
        {hunk.contextAfter.map((line, i) => (
          <div key={`after-${i}`} className="px-4 py-1 bg-muted/50">
            <span className="text-muted-foreground select-none mr-3"> </span>
            {line}
          </div>
        ))}
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-2 p-3 bg-muted/50 border-t">
        <Button
          onClick={onReject}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
        <Button
          onClick={onAccept}
          variant="default"
          size="sm"
          className="gap-2"
        >
          <Check className="h-4 w-4" />
          Accept
        </Button>
      </div>
    </div>
  );
}