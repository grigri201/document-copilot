import { useCallback } from 'react';
import { type DiffBlockElement } from '@/lib/diff-plugin';

export function useDiffHandlers(editorRef: React.MutableRefObject<any>) {
  const onAccept = useCallback((element: DiffBlockElement) => {
    try {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;
      
      // Find the element in the editor
      let elementPath: number[] | null = null;
      currentEditor.children.forEach((node: any, index: number) => {
        if (node === element) {
          elementPath = [index];
        }
      });
      
      if (!elementPath) return;
      
      const hunk = element.hunk;
      
      // First, find and remove the lines that match the deletions
      if (hunk.deletions.length > 0) {
        // Search for the context or deletion lines before the diff block
        let searchStartIndex = Math.max(0, elementPath[0] - 10); // Look up to 10 lines before
        let foundDeletionStart = -1;
        let isInlineReplacement = false;
        let inlineNodeIndex = -1;
        
        for (let i = searchStartIndex; i < elementPath[0]; i++) {
          const node = currentEditor.children[i];
          if (node && node.type === 'p' && node.children) {
            const nodeText = node.children.map((child: any) => child.text || '').join('');
            const firstDeletion = hunk.deletions[0].trim();
            
            // Check for exact match (full line replacement)
            if (nodeText.trim() === firstDeletion) {
              foundDeletionStart = i;
              break;
            }
            // Check for inline match (partial line replacement)
            else if (nodeText.includes(firstDeletion)) {
              isInlineReplacement = true;
              inlineNodeIndex = i;
              break;
            }
          }
        }
        
        if (isInlineReplacement && inlineNodeIndex !== -1) {
          // Handle inline replacement within a single paragraph
          const node = currentEditor.children[inlineNodeIndex];
          if (node && node.type === 'p' && node.children) {
            const nodeText = node.children.map((child: any) => child.text || '').join('');
            
            // Apply all replacements
            let newText = nodeText;
            if (hunk.deletions.length > 0 && hunk.additions.length > 0) {
              const deletionText = hunk.deletions[0];
              const additionText = hunk.additions[0];
              newText = nodeText.replace(deletionText, additionText);
              
              // Update the node with the new text
              currentEditor.apply({
                type: 'set_node',
                path: [inlineNodeIndex],
                properties: {},
                newProperties: {
                  children: [{ text: newText }]
                }
              });
              
              // Remove the diff block
              currentEditor.apply({
                type: 'remove_node',
                path: elementPath,
                node: element,
              });
              
              return;
            }
          }
        } else if (foundDeletionStart !== -1) {
          // Remove all deletion lines
          for (let i = hunk.deletions.length - 1; i >= 0; i--) {
            const nodeIndex = foundDeletionStart + i;
            if (nodeIndex < currentEditor.children.length) {
              const node = currentEditor.children[nodeIndex];
              if (node && node.type === 'p' && node.children) {
                const nodeText = node.children.map((child: any) => child.text || '').join('').trim();
                const deletionText = hunk.deletions[i].trim();
                
                if (nodeText === deletionText) {
                  currentEditor.apply({
                    type: 'remove_node',
                    path: [nodeIndex],
                    node: node,
                  });
                  
                  // Adjust the elementPath since we removed a node before it
                  if (nodeIndex < elementPath[0]) {
                    elementPath[0]--;
                  }
                }
              }
            }
          }
          
          // Now remove the diff block itself
          currentEditor.apply({
            type: 'remove_node',
            path: elementPath,
            node: element,
          });
          
          // Insert the additions at the position where deletions were
          hunk.additions.forEach((line, index) => {
            const newNode = {
              type: 'p',
              children: [{ text: line }]
            };
            
            currentEditor.apply({
              type: 'insert_node',
              path: [foundDeletionStart + index],
              node: newNode,
            });
          });
          
          return;
        }
      }
      
      // If no deletions or couldn't find them, just remove diff block and insert additions
      currentEditor.apply({
        type: 'remove_node',
        path: elementPath,
        node: element,
      });
      
      // Insert the accepted changes as new paragraphs
      hunk.additions.forEach((line, index) => {
        const newNode = {
          type: 'p',
          children: [{ text: line }]
        };
        
        currentEditor.apply({
          type: 'insert_node',
          path: [elementPath![0] + index],
          node: newNode,
        });
      });
    } catch (error) {
      console.error('Error accepting diff:', error);
    }
  }, [editorRef]);

  const onReject = useCallback((element: DiffBlockElement) => {
    try {
      const currentEditor = editorRef.current;
      if (!currentEditor) return;
      
      // Find the element in the editor
      let elementPath: number[] | null = null;
      currentEditor.children.forEach((node: any, index: number) => {
        if (node === element) {
          elementPath = [index];
        }
      });
      
      if (elementPath) {
        currentEditor.apply({
          type: 'remove_node',
          path: elementPath,
          node: element,
        });
      }
    } catch (error) {
      console.error('Error rejecting diff:', error);
    }
  }, [editorRef]);

  // Attach handlers to editor
  const attachHandlers = (editor: any) => {
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