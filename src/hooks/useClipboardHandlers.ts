import { useCallback } from 'react';
import { Transforms } from 'slate';
import { parseDiff } from '@/lib/diff-parser';
import { ELEMENT_DIFF_BLOCK } from '@/lib/diff-plugin';
import { generatePrompt } from '@/lib/prompts';
import type { CustomEditor, CustomElement } from '@/types/editor';
import type { DiffBlockElement } from '@/types/diff';

interface UseClipboardHandlersOptions {
  editorRef: React.MutableRefObject<CustomEditor | null>;
  getContent: () => string;
  openAIUrl?: string;
}

export function useClipboardHandlers({ 
  editorRef, 
  getContent,
  openAIUrl = 'https://chatgpt.com'
}: UseClipboardHandlersOptions) {
  const handleAsk = useCallback((question: string) => {
    const content = getContent();
    const promptTemplate = generatePrompt(content, question);

    // Copy to clipboard
    navigator.clipboard.writeText(promptTemplate);
    
    // Open AI chat in new tab
    window.open(openAIUrl, '_blank');
  }, [getContent, openAIUrl]);

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const hunks = parseDiff(clipboardText);
      
      if (hunks.length === 0) {
        alert('No valid diff found in clipboard');
        return;
      }
      
      // Get the current editor instance
      if (!editorRef.current) {
        console.error('Editor not initialized');
        return;
      }
      const currentEditor = editorRef.current;
      
      // Insert diff blocks at the appropriate position in the document
      hunks.forEach((hunk) => {
        const diffBlock: DiffBlockElement = {
          type: ELEMENT_DIFF_BLOCK,
          hunk,
          children: [{ text: '' }],
        };
        
        // Find the position to insert based on context
        let insertPath = [currentEditor.children.length]; // Default to end
        let foundInlineMatch = false;
        let matchingNodeIndex = -1;
        
        // For pure insertions (no deletions), position between context lines
        if (hunk.deletions.length === 0 && hunk.contextBefore.length > 0) {
          const contextBeforeLine = hunk.contextBefore[hunk.contextBefore.length - 1].trim();
          
          currentEditor.children.forEach((node: CustomElement, index: number) => {
            if (node.type === 'p' && node.children) {
              const nodeText = node.children.map((child) => child.text || '').join('').trim();
              if (nodeText === contextBeforeLine) {
                // This is a pure insertion - position after the context before line
                insertPath = [index + 1];
              }
            }
          });
        } 
        // For replacements or modifications
        else if (hunk.contextBefore.length > 0 || hunk.deletions.length > 0) {
          // First, try to find the deletion line
          if (hunk.deletions.length > 0) {
            const firstDeletion = hunk.deletions[0].trim();
            
            currentEditor.children.forEach((node: CustomElement, index: number) => {
              if (node.type === 'p' && node.children) {
                const nodeText = node.children.map((child) => child.text || '').join('');
                
                // Check for inline replacement (deletion text is part of a larger line)
                if (nodeText.includes(firstDeletion) && nodeText.trim() !== firstDeletion) {
                  foundInlineMatch = true;
                  matchingNodeIndex = index;
                }
                // Check for exact line match
                else if (nodeText.trim() === firstDeletion) {
                  // Position at the deletion line
                  insertPath = [index + 1];
                }
              }
            });
          }
          
          // If we didn't find deletion, use context before
          if (insertPath[0] === currentEditor.children.length && hunk.contextBefore.length > 0) {
            const contextLine = hunk.contextBefore[hunk.contextBefore.length - 1].trim();
            
            currentEditor.children.forEach((node: CustomElement, index: number) => {
              if (node.type === 'p' && node.children) {
                const nodeText = node.children.map((child) => child.text || '').join('');
                if (nodeText.includes(contextLine)) {
                  // Insert after the context line
                  insertPath = [index + 1];
                }
              }
            });
          }
        }
        
        // Handle inline replacements within a single paragraph
        if (foundInlineMatch && matchingNodeIndex !== -1) {
          const node = currentEditor.children[matchingNodeIndex];
          if (node.type === 'p' && node.children) {
            const nodeText = node.children.map((child) => child.text || '').join('');
            
            // Apply the inline replacement
            let newText = nodeText;
            if (hunk.deletions.length > 0 && hunk.additions.length > 0) {
              const deletionText = hunk.deletions[0];
              const additionText = hunk.additions[0];
              newText = nodeText.replace(deletionText, additionText);
              
              // Update the node with the new text
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (currentEditor as any).apply({
                type: 'set_node',
                path: [matchingNodeIndex],
                properties: {},
                newProperties: {
                  children: [{ text: newText }]
                }
              });
              
              // Don't insert the diff block for inline replacements
              return;
            }
          }
        }
        
        // Insert the diff block using Slate Transforms
        
        try {
          // Use Transforms API for proper node insertion
          Transforms.insertNodes(currentEditor, diffBlock, { at: insertPath });
        } catch (error) {
          console.error('Error inserting node with Transforms:', error);
          // Try alternative insertion method
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (currentEditor as any).insertNode(diffBlock, { at: insertPath });
          } catch (altError) {
            console.error('Alternative insertion also failed:', altError);
            // Last resort: direct apply
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (currentEditor as any).apply({
              type: 'insert_node',
              path: insertPath,
              node: diffBlock,
            });
          }
        }
      });
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Make sure you have copied the diff text.');
    }
  }, [editorRef]);

  return {
    handleAsk,
    handlePaste,
  };
}