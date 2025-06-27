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
  const [activeDiffs, setActiveDiffs] = useState<DiffHunk[]>(diffs);

  useEffect(() => {
    setActiveDiffs(diffs);
  }, [diffs]);

  const handleAccept = (hunk: DiffHunk) => {
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onAccept(hunk);
  };

  const handleReject = (hunk: DiffHunk) => {
    setActiveDiffs(activeDiffs.filter(d => d !== hunk));
    onReject(hunk);
  };

  return (
    <div className="relative pb-16">
      <MarkdownPreview content={content} />
      <div className="mt-8">
        {activeDiffs.map((hunk, index) => (
          <div key={index} className="mb-4 mx-auto max-w-4xl px-16 sm:px-[max(64px,calc(50%-350px))]">
            <DiffBlock
              hunk={hunk}
              onAccept={() => handleAccept(hunk)}
              onReject={() => handleReject(hunk)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}