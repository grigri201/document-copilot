'use client';

import { Button } from '@/components/ui/button';
import { ClipboardPaste, Trash2, Eye, Edit } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EditorToolbarProps {
  onPaste: () => void;
  onClear: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

export function EditorToolbar({ onPaste, onClear, onTogglePreview, isPreviewMode }: EditorToolbarProps) {
  return (
    <div className="border-b bg-background p-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          onClick={onPaste}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={isPreviewMode}
        >
          <ClipboardPaste className="h-4 w-4" />
          Paste Diff
        </Button>
        
        <Button
          onClick={onTogglePreview}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isPreviewMode ? (
            <>
              <Edit className="h-4 w-4" />
              Edit
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              Preview
            </>
          )}
        </Button>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all content in the editor and clear the saved data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onClear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Clear Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}