import { usePlateEditor } from '@udecode/plate-core/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { 
  BoldPlugin, 
  ItalicPlugin, 
  UnderlinePlugin, 
  StrikethroughPlugin, 
  CodePlugin 
} from '@udecode/plate-basic-marks/react';
import { DiffBlockPlugin, DiffBlockComponent, ELEMENT_DIFF_BLOCK } from '@/lib/diff-plugin';
import { useRef, useEffect, useCallback } from 'react';
import type { CustomEditor, CustomValue, CustomElement } from '@/types/editor';

interface UseDocumentEditorOptions {
  initialValue?: CustomValue;
}

export function useDocumentEditor(options: UseDocumentEditorOptions = {}) {
  const editorRef = useRef<CustomEditor | null>(null);
  
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
    value: options.initialValue,
  }) as unknown as CustomEditor;

  // Store editor ref when it's available
  useEffect(() => {
    if (editor && !editorRef.current) {
      editorRef.current = editor;
    }
  }, [editor]);

  // Extract content from editor
  const getContent = useCallback(() => {
    if (!editor || !editor.children) return '';
    
    return editor.children.map((node: CustomElement) => {
      if (node.type === 'p' && node.children) {
        return node.children.map((child) => child.text || '').join('');
      } else if (node.type === 'code_block' && node.children) {
        return node.children.map((child) => child.text || '').join('');
      }
      return '';
    }).filter(line => line !== '').join('\n');
  }, [editor]);

  // Set content in editor
  const setContent = useCallback((content: string) => {
    if (!editor) return;
    
    const lines = content.split('\n');
    const nodes: CustomValue = lines.map(line => ({
      type: 'p',
      children: [{ text: line }],
    }));
    
    // Reset editor with new content
    editor.children = nodes.length > 0 ? nodes : [{ type: 'p', children: [{ text: '' }] }];
    // Force re-render by triggering onChange
    editor.onChange({ editor });
  }, [editor]);

  return {
    editor,
    editorRef,
    getContent,
    setContent,
  };
}