import { useCallback } from 'react';
import { type DiffBlockElement } from '@/lib/diff-plugin';
import type { CustomEditor } from '@/types/editor';
import {
  findDeletionNodes,
  applyInlineReplacement,
  removeDeletedNodes,
  removeDiffBlock,
  insertAdditions,
  findElementPath
} from '@/lib/diff-operations';
import { getEditorFromRef, calculateSearchRange } from '@/lib/editor-utils';

export function useDiffHandlers(editorRef: React.MutableRefObject<CustomEditor | null>) {
  const onAccept = useCallback((element: DiffBlockElement) => {
    try {
      const editor = getEditorFromRef(editorRef);
      if (!editor) return;

      const elementPath = findElementPath(editor, element);
      if (!elementPath) return;

      const { hunk } = element;

      // Handle deletions if present
      if (hunk.deletions.length > 0) {
        const searchRange = calculateSearchRange(elementPath);
        const deletionResult = findDeletionNodes(
          editor,
          hunk,
          searchRange.start,
          searchRange.end
        );

        if (deletionResult.isInlineReplacement && deletionResult.inlineNodeIndex !== -1) {
          // Handle inline replacement
          if (hunk.additions.length > 0) {
            applyInlineReplacement(
              editor,
              deletionResult.inlineNodeIndex,
              hunk.deletions[0],
              hunk.additions[0]
            );
            removeDiffBlock(editor, elementPath, element);
            return;
          }
        } else if (deletionResult.foundDeletionStart !== -1) {
          // Handle block replacement
          const updatedPath = removeDeletedNodes(
            editor,
            hunk.deletions,
            deletionResult.foundDeletionStart,
            elementPath
          );
          removeDiffBlock(editor, updatedPath, element);
          insertAdditions(editor, [deletionResult.foundDeletionStart], hunk.additions);
          return;
        }
      }

      // Default case: just remove diff block and insert additions
      removeDiffBlock(editor, elementPath, element);
      insertAdditions(editor, elementPath, hunk.additions);
    } catch (error) {
      console.error('Error accepting diff:', error);
    }
  }, [editorRef]);

  const onReject = useCallback((element: DiffBlockElement) => {
    try {
      const editor = getEditorFromRef(editorRef);
      if (!editor) return;

      const elementPath = findElementPath(editor, element);
      if (elementPath) {
        removeDiffBlock(editor, elementPath, element);
      }
    } catch (error) {
      console.error('Error rejecting diff:', error);
    }
  }, [editorRef]);

  const attachHandlers = (editor: CustomEditor) => {
    if (editor) {
      editor.diffHandlers = {
        onAccept,
        onReject,
      };
    }
  };

  return {
    onAccept,
    onReject,
    attachHandlers,
  };
}