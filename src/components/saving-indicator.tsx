'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingIndicatorProps {
  isVisible: boolean;
}

export function SavingIndicator({ isVisible }: SavingIndicatorProps) {
  return (
    <div
      className={cn(
        'fixed bottom-20 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-lg px-3 py-2 shadow-md transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Saving...</span>
    </div>
  );
}