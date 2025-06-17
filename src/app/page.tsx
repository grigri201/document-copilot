'use client';

import { PlateEditor } from '@/components/editor/plate-editor';

export default function Home() {
  return (
    <div className="relative min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold">Document Editor</h1>
        <PlateEditor />
      </div>
    </div>
  );
}
