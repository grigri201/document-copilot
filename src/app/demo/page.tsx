'use client';

import { useEffect, useState, useCallback } from 'react';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { useDiffHandlers } from '@/hooks/useDiffHandlers';
import { useClipboardHandlers } from '@/hooks/useClipboardHandlers';
import { EditorLayout } from '@/components/layouts/EditorLayout';
import { parseDiff } from '@/lib/diff-parser';
import { downloadAsHtml, generateHtmlDocument } from '@/lib/download-utils';
import { applyDiffToText } from '@/lib/apply-diff-to-text';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import type { CustomValue } from '@/types/editor';
import type { DiffHunk } from '@/types/diff';

const DEMO_CONTENT = `# Document Copilot Demo

This is a **demonstration** of the markdown preview with GitHub-style rendering.

## Features

The editor supports various markdown elements:

### Text Formatting

- **Bold text** for emphasis
- *Italic text* for subtle emphasis
- ~~Strikethrough~~ for deleted content
- \`inline code\` for code snippets
- Keyboard shortcuts like <kbd>Ctrl</kbd> + <kbd>S</kbd>

### Lists

#### Unordered Lists
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered Lists
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

#### Task Lists
- [x] Completed task
- [ ] Pending task
- [ ] Another pending task

### Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
  return true;
}
\`\`\`

\`\`\`python
def calculate_sum(a, b):
    """Calculate the sum of two numbers."""
    return a + b
\`\`\`

### Blockquotes

> This is a blockquote. It can contain multiple lines
> and even **formatted text**.

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Markdown Parsing | ✅ Complete | Using remark |
| Syntax Highlighting | ✅ Complete | Using Prism |
| GitHub Styles | ✅ Complete | Custom CSS |
| Dark Mode | ✅ Complete | Auto-detect |

### Links and Images

Here's a [link to GitHub](https://github.com) and some text.

### Horizontal Rule

Above the line

---

Below the line

## Story Example

今天也是和平的一天，飞天小女警要去上学了。清晨阳光透过窗帘，把木质课桌镀上一层金边。

花花抱着科学书，泡泡踮脚塞储物柜，毛毛绕操场飞两圈才落地。`;

const DEMO_DIFF = `-刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。她们对视一眼，书包还没放好便旋转变身。
+刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。那是一只狡猾灵活的改造猴，披着破斗篷，眼里闪烁着诡计的光。她们对视一眼，书包还没放好便旋转变身。`;

const DEMO_INSERTION_DIFF = `花花抱着科学书，泡泡踮脚塞储物柜，毛毛绕操场飞两圈才落地。
+教室里充满了早晨的活力，同学们三三两两地聊着天。
刚坐定，警报器尖锐响起——恶霸猴闯入市政厅偷市长的午餐券。她们对视一眼，书包还没放好便旋转变身。`;

export default function DemoPage() {
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [previewDiffs, setPreviewDiffs] = useState<DiffHunk[]>([]);
  const initialValue: CustomValue = DEMO_CONTENT.split('\n').map(line => ({
    type: 'p' as const,
    children: [{ text: line }]
  }));

  const { editor, editorRef, getContent } = useDocumentEditor({ initialValue });
  const { attachHandlers } = useDiffHandlers(editorRef);
  const { handleAsk, handlePaste } = useClipboardHandlers({ 
    editorRef, 
    getContent,
    openAIUrl: 'https://chat.openai.com'
  });

  // Attach diff handlers to editor
  useEffect(() => {
    attachHandlers(editor);
  }, [editor, attachHandlers]);

  // Auto-paste demo diffs on load (optional - you can remove this if not needed)
  useEffect(() => {
    // You could add buttons to trigger these demo diffs instead
    console.log('Demo diffs available:', { DEMO_DIFF, DEMO_INSERTION_DIFF });
  }, []);

  // Clear handler that just resets to demo content
  const handleClear = () => {
    // For demo page, we don't actually clear storage
    // Just reset to initial demo content
    if (editor && editor.children) {
      editor.children = initialValue;
      if (editor.onChange && typeof editor.onChange === 'function') {
        editor.onChange({ editor });
      }
    }
  };

  const handleTogglePreview = () => {
    setIsPreviewMode(prev => !prev);
    setPreviewDiffs([]);
  };

  // Handle paste in preview mode
  const handlePreviewPaste = useCallback(async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const hunks = parseDiff(clipboardText);
      
      if (hunks.length === 0) {
        alert('No valid diff found in clipboard');
        return;
      }
      
      setPreviewDiffs(hunks);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
      alert('Failed to read clipboard. Make sure you have copied the diff text.');
    }
  }, []);

  // Handle diff accept/reject in preview mode
  const handlePreviewDiffAccept = useCallback((hunk: DiffHunk) => {
    // Apply the diff to the actual content
    const currentContent = getContent();
    const newContent = applyDiffToText(currentContent, hunk);
    
    // Update the editor content
    if (editor && editor.children) {
      const newLines = newContent.split('\n');
      const newValue: CustomValue = newLines.map(line => ({
        type: 'p' as const,
        children: [{ text: line }]
      }));
      
      editor.children = newValue;
      if (editor.onChange && typeof editor.onChange === 'function') {
        editor.onChange({ editor });
      }
    }
    
    setPreviewDiffs(previewDiffs.filter(d => d !== hunk));
  }, [previewDiffs, getContent, editor]);

  const handlePreviewDiffReject = useCallback((hunk: DiffHunk) => {
    setPreviewDiffs(previewDiffs.filter(d => d !== hunk));
  }, [previewDiffs]);

  // Use different paste handler based on mode
  const currentPasteHandler = isPreviewMode ? handlePreviewPaste : handlePaste;

  // Handle download in preview mode
  const handleDownload = useCallback(async () => {
    const markdownContent = getContent();
    
    // Convert markdown to HTML
    const result = await remark()
      .use(remarkHtml)
      .process(markdownContent);
    
    const htmlContent = result.toString();
    const fullHtml = generateHtmlDocument(htmlContent);
    
    // Download as HTML (browsers can print HTML to PDF)
    downloadAsHtml(fullHtml, 'demo-document.html');
  }, [getContent]);

  // Handle copy in edit mode
  const handleCopy = useCallback(() => {
    const content = getContent();
    navigator.clipboard.writeText(content)
      .then(() => {
        console.log('Content copied to clipboard');
      })
      .catch((err) => {
        console.error('Failed to copy:', err);
        alert('Failed to copy content to clipboard');
      });
  }, [getContent]);

  return (
    <EditorLayout 
      editor={editor}
      onAsk={handleAsk}
      onPaste={currentPasteHandler}
      onClear={handleClear}
      onTogglePreview={handleTogglePreview}
      isPreviewMode={isPreviewMode}
      content={getContent()}
      previewDiffs={previewDiffs}
      onPreviewDiffAccept={handlePreviewDiffAccept}
      onPreviewDiffReject={handlePreviewDiffReject}
      onDownload={handleDownload}
      onCopy={handleCopy}
    />
  );
}