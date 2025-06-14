'use client';

import Article from '@/components/Article';

const sample = `# Sample Article

This is a paragraph.

- item 1
- item 2

> quote line 1
> quote line 2

---

\`\`\`
code block
\`\`\`
`;

export default function Home() {
  return (
    <div className="relative min-h-screen p-4">
      <Article content={sample} />
    </div>
  );
}
