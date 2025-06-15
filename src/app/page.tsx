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
    <div className="relative min-h-screen p-4 flex justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex w-full gap-2">
          <input
            type="text"
            className="flex-grow bg-transparent border rounded-lg p-2"
          />
          <button className="bg-blue-600 text-white rounded-lg px-4 py-2">
            Send
          </button>
        </div>
        <Article content={sample} />
      </div>
    </div>
  );
}
