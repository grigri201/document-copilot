import { usePlateEditor } from 'platejs/react';
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
import { useRef, useEffect } from 'react';

interface UseDocumentEditorOptions {
  initialValue?: any[];
}

export function useDocumentEditor(options: UseDocumentEditorOptions = {}) {
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
    value: options.initialValue,
  });

  // Store editor ref when it's available
  useEffect(() => {
    if (editor && !editorRef.current) {
      editorRef.current = editor;
    }
  }, [editor]);

  // Extract content from editor
  const getContent = () => {
    return editor.children.map((node: any) => {
      if (node.type === 'p' && node.children) {
        return node.children.map((child: any) => child.text || '').join('');
      } else if (node.type === 'code_block' && node.children) {
        return node.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).filter(line => line !== '').join('\n');
  };

  return {
    editor,
    editorRef,
    getContent,
  };
}