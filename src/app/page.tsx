'use client';
import { PlateEditor } from '@/components/editor/plate-editor';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Document Editor</h1>
          <Link 
            href="/git-patch-demo" 
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Git Patch Demo
          </Link>
        </div>
        <PlateEditor />
      </div>
    </div>
  );
}
