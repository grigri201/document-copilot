'use client';

import { Button } from '@/components/ui/button';
import { Trash2, Eye, Edit, Download, Copy } from 'lucide-react';
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
  onClear: () => void;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
  onDownload?: () => void;
  onCopy?: () => void;
}

export function EditorToolbar({ onClear, onTogglePreview, isPreviewMode, onDownload, onCopy }: EditorToolbarProps) {
  return (
    <div className="border-b bg-background p-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
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
      
      <div className="flex items-center gap-2">
        {isPreviewMode && onDownload && (
          <Button
            onClick={onDownload}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
        {!isPreviewMode && onCopy && (
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy
          </Button>
        )}
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
    </div>
  );
}