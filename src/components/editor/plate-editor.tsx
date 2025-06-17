'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';

// Use markdown-only editor for pure markdown editing
import { MarkdownOnlyEditorKit } from '@/components/editor/markdown-only-editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: MarkdownOnlyEditorKit,
    value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor 
          variant="demo" 
          placeholder="Type in markdown..." 
          className="markdown-only"
        />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

const value = [
  {
    children: [{ text: 'Getting Started with Document Copilot' }],
    type: 'h1',
  },
  {
    children: [{ text: 'Welcome to Document Copilot, your AI-powered writing assistant. This document demonstrates various formatting options and features available in the editor.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Introduction' }],
    type: 'h2',
  },
  {
    children: [{ text: 'Document Copilot is a powerful markdown editor that combines the simplicity of plain text with the flexibility of rich formatting. Whether you\'re writing technical documentation, creative content, or academic papers, this editor provides all the tools you need to create professional documents.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Key Features' }],
    type: 'h2',
  },
  {
    children: [{ text: 'Here are some of the main features that make Document Copilot stand out:' }],
    type: 'p',
  },
  {
    children: [
      { children: [{ text: 'AI-powered writing assistance with intelligent suggestions' }], type: 'li' },
      { children: [{ text: 'Real-time markdown preview and editing' }], type: 'li' },
      { children: [{ text: 'Support for code blocks with syntax highlighting' }], type: 'li' },
      { children: [{ text: 'Rich text formatting including bold, italic, and underline' }], type: 'li' },
      { children: [{ text: 'Table creation and editing capabilities' }], type: 'li' },
      { children: [{ text: 'Collaborative features for team writing' }], type: 'li' },
    ],
    type: 'ul',
  },
  {
    children: [{ text: 'Text Formatting Options' }],
    type: 'h3',
  },
  {
    children: [
      { text: 'The editor supports various text formatting options. You can make text ' },
      { text: 'bold', bold: true },
      { text: ', ' },
      { text: 'italic', italic: true },
      { text: ', ' },
      { text: 'underlined', underline: true },
      { text: ', or even ' },
      { text: 'combine multiple styles', bold: true, italic: true },
      { text: '. The formatting toolbar provides quick access to all these options.' },
    ],
    type: 'p',
  },
  {
    children: [{ text: 'Working with Code' }],
    type: 'h3',
  },
  {
    children: [{ text: 'Document Copilot excels at handling code snippets. Here\'s an example of JavaScript code:' }],
    type: 'p',
  },
  {
    children: [{ text: '// Function to calculate factorial\nfunction factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\n// Example usage\nconsole.log(factorial(5)); // Output: 120' }],
    type: 'code_block',
    lang: 'javascript',
  },
  {
    children: [{ text: 'And here\'s a Python example:' }],
    type: 'p',
  },
  {
    children: [{ text: 'def fibonacci(n):\n    """Generate Fibonacci sequence up to n terms"""\n    fib_sequence = []\n    a, b = 0, 1\n    \n    for _ in range(n):\n        fib_sequence.append(a)\n        a, b = b, a + b\n    \n    return fib_sequence\n\n# Print first 10 Fibonacci numbers\nprint(fibonacci(10))' }],
    type: 'code_block',
    lang: 'python',
  },
  {
    children: [{ text: 'Creating Lists' }],
    type: 'h4',
  },
  {
    children: [{ text: 'Lists are essential for organizing information. Document Copilot supports both ordered and unordered lists:' }],
    type: 'p',
  },
  {
    children: [{ text: 'Steps to create a document:' }],
    type: 'p',
  },
  {
    children: [
      { children: [{ text: 'Open Document Copilot' }], type: 'li' },
      { children: [{ text: 'Choose a template or start from scratch' }], type: 'li' },
      { children: [{ text: 'Write your content using markdown or the visual editor' }], type: 'li' },
      { children: [{ text: 'Use AI assistance for suggestions and improvements' }], type: 'li' },
      { children: [{ text: 'Export your document in your preferred format' }], type: 'li' },
    ],
    type: 'ol',
  },
  {
    children: [{ text: 'Advanced Features' }],
    type: 'h4',
  },
  {
    children: [{ text: 'Document Copilot includes several advanced features for power users:' }],
    type: 'p',
  },
  {
    children: [
      { children: [{ text: 'Keyboard shortcuts for efficient editing' }], type: 'li' },
      { children: [{ text: 'Custom themes and styling options' }], type: 'li' },
      { children: [{ text: 'Plugin system for extending functionality' }], type: 'li' },
      { children: [{ text: 'Version control integration' }], type: 'li' },
      { children: [{ text: 'Export to multiple formats (PDF, HTML, DOCX)' }], type: 'li' },
    ],
    type: 'ul',
  },
  {
    children: [{ text: 'Best Practices' }],
    type: 'h5',
  },
  {
    children: [{ text: 'To get the most out of Document Copilot, consider these best practices. First, take advantage of the AI suggestions but always review them for accuracy and relevance. The AI is a powerful tool, but human judgment is still essential for creating high-quality content.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Second, use the markdown shortcuts to speed up your writing. Once you learn the basic markdown syntax, you\'ll find it much faster than clicking through menus. For example, typing ## followed by a space automatically creates a heading.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Third, organize your documents with a clear hierarchy using headings. This not only makes your content more readable but also allows for automatic table of contents generation and better navigation.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Conclusion' }],
    type: 'h5',
  },
  {
    children: [{ text: 'Document Copilot represents the future of document editing, combining the power of AI with the flexibility of markdown. Whether you\'re a developer documenting code, a writer crafting stories, or a student preparing assignments, this editor adapts to your needs and helps you create better content faster.' }],
    type: 'p',
  },
  {
    children: [{ text: 'Start exploring the features today and discover how Document Copilot can transform your writing workflow. With continuous updates and improvements, we\'re committed to making this the best writing tool available.' }],
    type: 'p',
  },
];
