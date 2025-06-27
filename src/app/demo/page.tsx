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

const DEMO_CONTENT = `# 记单词 WebApp 功能模板

## 1. 用户管理
- 注册/登录（邮箱、第三方）
- 个人资料
- 学习进度同步

## 2. 单词库管理
- 预置词表选择（例如 CET4、GRE）
- 自定义单词本
- 导入/导出（CSV、Excel）

## 3. 学习模式
- **闪卡**（正面: 单词，背面: 释义/例句）
- **拼写测试**（听写、填空）
- **选择题**（同义/反义词）
- **例句填空**

## 4. 记忆算法
- 基于 **Spaced Repetition（间隔重复）** 算法
- 学习阶段（新词、熟悉、巩固、掌握）
- 自动生成每日复习列表

## 5. 统计与反馈
- 每日/每周学习记录
- 记忆曲线可视化
- 词汇掌握度评分

## 6. 设置与个性化
- 每日目标（新词量/复习量）
- 通知提醒（邮件/推送）
- 主题模式（浅色/深色）
- 语言设置

## 7. 多端支持
- 响应式 Web
- PWA 离线功能
- 数据同步（本地缓存 + 云端）

## 8. 辅助功能
- 发音（TTS）
- 例句与词根词缀
- 生词本一键重学
- 学习排行榜/成就徽章

## 9. 后台管理（可选）
- 词库维护
- 用户统计
- 内容审核`;


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

  // Clear handler that just resets to demo content
  const handleClear = () => {
    // For demo page, we don't actually clear storage
    // Just reset to initial demo content
    if (editor && editor.children) {
      // Use type assertion to avoid TypeScript issues
      editor.children = initialValue as any;
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
      
      // Use type assertion to avoid TypeScript issues
      editor.children = newValue as any;
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
    <>
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
    </>
  );
}