'use client';

import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { DiffBlock } from './diff-block';
import type { DiffHunk } from '@/types/diff';

interface PreviewWithDiffsProps {
  content: string;
  diffs: DiffHunk[];
  onAccept: (hunk: DiffHunk) => void;
  onReject: (hunk: DiffHunk) => void;
}

interface ContentSegment {
  type: 'content' | 'diff';
  content?: string;
  hunk?: DiffHunk;
  startLine: number;
  endLine: number;
}

export function PreviewWithDiffs({ content, diffs, onAccept, onReject }: PreviewWithDiffsProps) {
  const [activeDiffs, setActiveDiffs] = useState<DiffHunk[]>(diffs);
  const isDarkMode = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

  useEffect(() => {
    setActiveDiffs(diffs);
  }, [diffs]);

  // Find the line position for each diff
  const segments = useMemo(() => {
    const lines = content.split('\n');
    const segments: ContentSegment[] = [];
    const usedLines = new Set<number>();

    // For each diff, find where it should be positioned
    activeDiffs.forEach(hunk => {
      let targetLine = -1;

      // Try to find position based on context
      if (hunk.contextBefore.length > 0) {
        const lastContextLine = hunk.contextBefore[hunk.contextBefore.length - 1];
        // Find matching line
        for (let i = 0; i < lines.length; i++) {
          if (!usedLines.has(i) && linesMatch(lines[i], lastContextLine)) {
            targetLine = i + 1; // Insert after context
            break;
          }
        }
      }

      // If we have deletions and no context match, search for deletion lines
      if (targetLine === -1 && hunk.deletions.length > 0) {
        const firstDeletion = hunk.deletions[0];
        for (let i = 0; i < lines.length; i++) {
          if (!usedLines.has(i) && linesMatch(lines[i], firstDeletion)) {
            targetLine = i;
            break;
          }
        }
      }

      if (targetLine !== -1) {
        segments.push({
          type: 'diff',
          hunk,
          startLine: targetLine,
          endLine: targetLine
        });
        usedLines.add(targetLine);
      }
    });

    // Sort segments by line number
    segments.sort((a, b) => a.startLine - b.startLine);

    // Create content segments between diffs
    const finalSegments: ContentSegment[] = [];
    let lastLine = 0;

    segments.forEach(segment => {
      if (segment.startLine > lastLine) {
        // Add content before this diff
        finalSegments.push({
          type: 'content',
          content: lines.slice(lastLine, segment.startLine).join('\n'),
          startLine: lastLine,
          endLine: segment.startLine - 1
        });
      }
      finalSegments.push(segment);
      lastLine = segment.endLine + 1;
    });

    // Add remaining content
    if (lastLine < lines.length) {
      finalSegments.push({
        type: 'content',
        content: lines.slice(lastLine).join('\n'),
        startLine: lastLine,
        endLine: lines.length - 1
      });
    }

    // If no diffs could be positioned, just show content then diffs
    if (finalSegments.length === 0 || finalSegments.every(s => s.type === 'content')) {
      finalSegments.push({
        type: 'content',
        content: content,
        startLine: 0,
        endLine: lines.length - 1
      });
      activeDiffs.forEach((hunk, index) => {
        finalSegments.push({
          type: 'diff',
          hunk,
          startLine: lines.length + index,
          endLine: lines.length + index
        });
      });
    }

    return finalSegments;
  }, [content, activeDiffs]);

  const handleAccept = (hunk: DiffHunk) => {
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onAccept(hunk);
  };

  const handleReject = (hunk: DiffHunk) => {
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onReject(hunk);
  };

  return (
    <div className={cn(
      "markdown-body max-w-none",
      "px-16 pt-4 pb-8 sm:px-[max(64px,calc(50%-350px))]",
      "[&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
      "text-base text-foreground",
      "[&_input[type='checkbox']]:mr-2 [&_input[type='checkbox']]:mt-0 [&_input[type='checkbox']]:align-middle"
    )}>
      {segments.map((segment, index) => (
        <div key={index}>
          {segment.type === 'content' && segment.content ? (
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={getMarkdownComponents(isDarkMode)}
            >
              {segment.content}
            </ReactMarkdown>
          ) : segment.type === 'diff' && segment.hunk ? (
            <div className="my-4">
              <DiffBlock
                hunk={segment.hunk}
                onAccept={() => handleAccept(segment.hunk!)}
                onReject={() => handleReject(segment.hunk!)}
              />
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// Helper function to match lines (same as in apply-diff-to-text.ts)
function linesMatch(line1: string, line2: string): boolean {
  return normalizeForComparison(line1) === normalizeForComparison(line2);
}

function normalizeForComparison(text: string): string {
  let normalized = text.trim().replace(/[\r\n]+$/, '');
  normalized = normalized.replace(/^-\s+/, '');
  normalized = normalized.replace(/^[-*+]\s+/, '');
  normalized = normalized.replace(/^\d+\.\s+/, '');
  normalized = normalized.replace(/^#+\s+/, '');
  normalized = normalized.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1');
  normalized = normalized.replace(/_{1,2}([^_]+)_{1,2}/g, '$1');
  normalized = normalized.replace(/`([^`]+)`/g, '$1');
  normalized = normalized.trim().replace(/\s+/g, ' ');
  return normalized;
}

// Extract markdown components from MarkdownPreview
function getMarkdownComponents(isDarkMode: boolean) {
  return {
    h1: ({ children, ...props }: any) => (
      <h1 className="text-3xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props}>
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-2xl font-semibold mt-6 mb-4 pb-2 border-b border-border" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-xl font-semibold mt-6 mb-4" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-base font-semibold mt-6 mb-4" {...props}>
        {children}
      </h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 className="text-sm font-semibold mt-6 mb-4" {...props}>
        {children}
      </h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 className="text-sm font-semibold text-muted-foreground mt-6 mb-4" {...props}>
        {children}
      </h6>
    ),
    p: ({ children, ...props }: any) => (
      <p className="my-4 leading-7" {...props}>
        {children}
      </p>
    ),
    pre: ({ children, ...props }: any) => (
      <pre className="overflow-x-auto rounded-md bg-[#f6f8fa] dark:bg-[#161b22] p-4 my-4 text-sm leading-normal" {...props}>
        {children}
      </pre>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && match) {
        return (
          <SyntaxHighlighter
            style={isDarkMode ? oneDark : oneLight}
            language={language}
            PreTag="div"
            customStyle={{
              margin: 0,
              padding: '1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              backgroundColor: isDarkMode ? '#161b22' : '#f6f8fa',
            }}
            codeTagProps={{
              style: {
                fontSize: '0.875rem',
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }
            }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        );
      }
      
      return (
        <code className="rounded-md bg-[#afb8c133] dark:bg-[#6e768166] px-[0.3em] py-[0.2em] font-mono text-[85%]" {...props}>
          {children}
        </code>
      );
    },
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-muted-foreground/30 pl-4 py-1 my-4 text-muted-foreground" {...props}>
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto my-4">
        <table className="border-collapse w-full" {...props}>
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="border-t border-border" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-border px-3 py-1.5 text-left font-semibold bg-muted/50" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-border px-3 py-1.5" {...props}>
        {children}
      </td>
    ),
    a: ({ children, href, ...props }: any) => (
      <a href={href} className="text-[#0969da] dark:text-[#58a6ff] no-underline hover:underline" {...props}>
        {children}
      </a>
    ),
    hr: ({ ...props }: any) => (
      <hr className="my-6 h-[0.25em] border-0 bg-border" {...props} />
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="my-4 list-disc pl-8" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="my-4 list-decimal pl-8" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="my-0.5 pl-1" {...props}>
        {children}
      </li>
    ),
    img: ({ src, alt, ...props }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-md my-4 shadow-sm" 
        loading="lazy"
        {...props} 
      />
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic" {...props}>
        {children}
      </em>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold" {...props}>
        {children}
      </strong>
    ),
    del: ({ children, ...props }: any) => (
      <del className="line-through text-muted-foreground" {...props}>
        {children}
      </del>
    ),
    kbd: ({ children, ...props }: any) => (
      <kbd className="inline-block px-1.5 py-0.5 text-xs font-mono leading-none whitespace-nowrap align-middle bg-muted border border-border rounded shadow-sm" {...props}>
        {children}
      </kbd>
    ),
    input: ({ type, checked, ...props }: any) => {
      if (type === 'checkbox') {
        return (
          <input 
            type="checkbox" 
            checked={checked} 
            disabled={true}
            className="mr-2 align-middle"
            readOnly
            {...props} 
          />
        );
      }
      return <input type={type} {...props} />;
    },
  };
}