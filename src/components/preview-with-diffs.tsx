'use client';

import { useState, useEffect } from 'react';
import { MarkdownPreview } from './markdown-preview';
import { DiffBlock } from './diff-block';
import type { DiffHunk } from '@/types/diff';

interface PreviewWithDiffsProps {
  content: string;
  diffs: DiffHunk[];
  onAccept: (hunk: DiffHunk) => void;
  onReject: (hunk: DiffHunk) => void;
}

export function PreviewWithDiffs({ content, diffs, onAccept, onReject }: PreviewWithDiffsProps) {
  const [processedContent, setProcessedContent] = useState(content);
  const [activeDiffs, setActiveDiffs] = useState<DiffHunk[]>(diffs);

  useEffect(() => {
    setActiveDiffs(diffs);
  }, [diffs]);

  const handleAccept = (hunk: DiffHunk) => {
    // Apply the diff to the content
    let newContent = processedContent;
    
    // Simple implementation: replace deletions with additions
    if (hunk.deletions.length > 0 && hunk.additions.length > 0) {
      hunk.deletions.forEach((deletion, index) => {
        if (hunk.additions[index]) {
          newContent = newContent.replace(deletion, hunk.additions[index]);
        }
      });
    } else if (hunk.additions.length > 0) {
      // Pure addition - insert after context
      if (hunk.contextBefore.length > 0) {
        const contextLine = hunk.contextBefore[hunk.contextBefore.length - 1];
        const insertIndex = newContent.indexOf(contextLine) + contextLine.length;
        newContent = newContent.slice(0, insertIndex) + '\n' + hunk.additions.join('\n') + newContent.slice(insertIndex);
      }
    }
    
    setProcessedContent(newContent);
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onAccept(hunk);
  };

  const handleReject = (hunk: DiffHunk) => {
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onReject(hunk);
  };

  return (
    <div className="relative">
      <MarkdownPreview content={processedContent} />
      {activeDiffs.map((hunk, index) => (
        <div key={index} className="my-4 mx-auto max-w-4xl px-8">
          <DiffBlock
            hunk={hunk}
            onAccept={() => handleAccept(hunk)}
            onReject={() => handleReject(hunk)}
          />
        </div>
      ))}
    </div>
  );
}