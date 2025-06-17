'use client';

import { type Value, TrailingBlockPlugin } from 'platejs';
import { type TPlateEditor, useEditorRef } from 'platejs/react';

// Core markdown functionality
import { MarkdownKit } from '@/components/editor/plugins/markdown-kit';
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit';
import { CodeBlockKit } from '@/components/editor/plugins/code-block-kit';
import { ListKit } from '@/components/editor/plugins/list-kit';
import { LinkKit } from '@/components/editor/plugins/link-kit';

// Essential editing features
import { ExitBreakKit } from '@/components/editor/plugins/exit-break-kit';
import { CursorOverlayKit } from '@/components/editor/plugins/cursor-overlay-kit';
import { BlockPlaceholderKit } from '@/components/editor/plugins/block-placeholder-kit';

// Use existing autoformat kit which includes markdown conversion rules
import { AutoformatKit } from '@/components/editor/plugins/autoformat-kit';

// AI features
import { AIFloatingToolbarKit } from '@/components/editor/plugins/ai-floating-toolbar-kit';

// Toolbar
import { MarkdownToolbarKit } from '@/components/editor/plugins/markdown-toolbar-kit';

/**
 * Markdown-only editor configuration
 * This configuration only supports markdown syntax without rich text editing
 */
export const MarkdownOnlyEditorKit = [
  // Core markdown elements
  ...BasicBlocksKit, // Headings, paragraphs, blockquotes
  ...CodeBlockKit,   // Code blocks with syntax highlighting
  ...ListKit,        // Ordered and unordered lists
  ...LinkKit,        // Links
  
  // Essential editing features
  ...ExitBreakKit,   // Exit from code blocks, lists, etc.
  TrailingBlockPlugin, // Ensure there's always a paragraph at the end
  
  // Markdown parser - this is the key plugin for markdown-only editing
  ...MarkdownKit,
  
  // Markdown autoformat for live conversion (includes all markdown syntax)
  ...AutoformatKit,
  
  // UI enhancements
  ...CursorOverlayKit,
  ...BlockPlaceholderKit,
  
  // Toolbar
  ...MarkdownToolbarKit,
  
  // AI features
  ...AIFloatingToolbarKit,
];

export type MarkdownOnlyEditor = TPlateEditor<Value, (typeof MarkdownOnlyEditorKit)[number]>;

export const useMarkdownOnlyEditor = () => useEditorRef<MarkdownOnlyEditor>();