'use client';

import { Plate, usePlateEditor } from 'platejs/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { BoldPlugin, ItalicPlugin, UnderlinePlugin, StrikethroughPlugin, CodePlugin } from '@udecode/plate-basic-marks/react';
import { useCallback, useRef } from 'react';

import { Editor, EditorContainer } from '@/components/ui/editor';
import { FloatingInputBar } from '@/components/floating-input-bar';
import { EditorToolbar } from '@/components/editor-toolbar';
import { DiffBlockPlugin, DiffBlockComponent, ELEMENT_DIFF_BLOCK, type DiffBlockElement } from '@/lib/diff-plugin';
import { parseDiff } from '@/lib/diff-parser';

export default function MyEditorPage() {
  const editorRef = useRef<any>(null);
  
  const editor = usePlateEditor({
    plugins: [
      BoldPlugin,
      ItalicPlugin,
      UnderlinePlugin,
      StrikethroughPlugin,
      CodePlugin,
      CodeBlockPlugin,
      MarkdownPlugin,
      DiffBlockPlugin,
    ],
    override: {
      components: {
        [ELEMENT_DIFF_BLOCK]: DiffBlockComponent,
      },
    },
  });

  // Store editor ref when it's available
  if (editor && !editorRef.current) {
    editorRef.current = editor;
  }

  const handleAsk = (question: string) => {
    // Get current content - handle both single-line paragraphs and multi-line content
    const content = editor.children.map((node: any) => {
      if (node.type === 'p' && node.children) {
        return node.children.map((child: any) => child.text || '').join('');
      } else if (node.type === 'code_block' && node.children) {
        return node.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).filter(line => line !== '').join('\n');

    const promptTemplate = `You are an expert editorial assistant.

TASK
• Take the current Markdown document (between <<<DOC_START … DOC_END>>>).
• Apply the user's instruction (between <<<INSTRUCTION … INSTRUCTION_END>>>).
• Return the result as a **unified‑diff patch**.

STRICT DIFF FORMAT
1. Show **exactly one** unchanged context line **above and below** every contiguous change block.
2. Prefix:  
   • unchanged context → " " (single space)  
   • deletions         → "-"  
   • additions         → "+"  
3. No other commentary, headings, or fences—**only the diff lines**.

EXAMPLE  
Before:
A  
B  
C  

Instruction: replace "B" with "B2"  
Return:
 A  
-B  
+B2  
 C  

DOCUMENT
<<<DOC_START
${content}
DOC_END>>>

INSTRUCTION
<<<INSTRUCTION
${question}
INSTRUCTION_END>>>`;

    // Copy to clipboard
    navigator.clipboard.writeText(promptTemplate);
    
    // Open ChatGPT in new tab
    window.open('https://chat.openai.com', '_blank');
  };

  const handlePaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const hunks = parseDiff(clipboardText);
      
      if (hunks.length === 0) {
        alert('No valid diff found in clipboard');
        return;
      }
      
      // Get the current editor instance
      const currentEditor = editorRef.current;
      if (!currentEditor) {
        console.error('Editor not initialized');
        return;
      }
      
      // Insert diff blocks at the appropriate position in the document
      hunks.forEach((hunk) => {
        const diffBlock = {
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
          
          currentEditor.children.forEach((node: any, index: number) => {
            if (node.type === 'p' && node.children) {
              const nodeText = node.children.map((child: any) => child.text || '').join('').trim();
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
            
            currentEditor.children.forEach((node: any, index: number) => {
              if (node.type === 'p' && node.children) {
                const nodeText = node.children.map((child: any) => child.text || '').join('');
                
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
            
            currentEditor.children.forEach((node: any, index: number) => {
              if (node.type === 'p' && node.children) {
                const nodeText = node.children.map((child: any) => child.text || '').join('');
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
            const nodeText = node.children.map((child: any) => child.text || '').join('');
            
            // Apply the inline replacement
            let newText = nodeText;
            if (hunk.deletions.length > 0 && hunk.additions.length > 0) {
              const deletionText = hunk.deletions[0];
              const additionText = hunk.additions[0];
              newText = nodeText.replace(deletionText, additionText);
              
              // Update the node with the new text
              currentEditor.apply({
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
        
        currentEditor.apply({
          type: 'insert_node',
          path: insertPath,
          node: diffBlock,
        });
      });
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Make sure you have copied the diff text.');
    }
  }, []);

  // Set up diff handlers
  if (editor) {
    (editor as any).diffHandlers = {
      onAccept: (element: DiffBlockElement) => {
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
      },
      
      onReject: (element: DiffBlockElement) => {
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
      }
    };
  }

  return (
    <div className="flex flex-col h-screen w-full">
      <EditorToolbar onPaste={handlePaste} />
      <Plate editor={editor}>
        <EditorContainer className="flex-1 overflow-auto pb-20">
          <Editor placeholder="Type your markdown content here..." />
        </EditorContainer>
      </Plate>
      <FloatingInputBar onAsk={handleAsk} />
    </div>
  );
}