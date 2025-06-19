'use client';

import * as React from 'react';
import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';
import { MarkdownOnlyEditorKit } from '@/components/editor/markdown-only-editor-kit';
import { GitPatchKit } from '@/components/editor/plugins/git-patch-kit';
import { type TGitPatchBlockElement, type TGitPatchLineElement } from '@/components/ui/git-patch-element';

// Create custom editor kit with git patch support
const GitPatchDemoEditorKit = [
  ...MarkdownOnlyEditorKit,
  ...GitPatchKit,
];

export default function GitPatchDemo() {
  const editor = usePlateEditor({
    plugins: GitPatchDemoEditorKit,
    value: demoValue,
  });

  return (
    <div className="relative min-h-screen p-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-bold">Git Patch Display Demo</h1>
        <p className="mb-4 text-muted-foreground">
          This demo shows how git patches are displayed in the editor with syntax highlighting for additions, deletions, and context lines.
        </p>
        
        <Plate editor={editor}>
          <EditorContainer>
            <Editor 
              variant="demo" 
              placeholder="Type to edit..." 
              className="min-h-[600px]"
            />
          </EditorContainer>
        </Plate>
      </div>
    </div>
  );
}

// Demo content showing git patch display
const demoValue = [
  {
    id: '1',
    children: [{ text: 'Example Git Patch Display' }],
    type: 'h2',
  },
  {
    id: '2',
    children: [{ text: 'Below is an example of how git patches are rendered in the editor with floating confirm buttons for additions:' }],
    type: 'p',
  },
  {
    id: '3',
    type: 'git-patch-block',
    children: [
      {
        id: '4',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: 'import React from \'react\';' }],
      } as TGitPatchLineElement,
      {
        id: '5',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: 'import { PlateEditor } from \'@platejs/react\';' }],
      } as TGitPatchLineElement,
      {
        id: '6',
        type: 'git-patch-line',
        lineType: 'deletion',
        children: [{ text: 'import { OldComponent } from \'./old-component\';' }],
      } as TGitPatchLineElement,
      {
        id: '7',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: 'import { NewComponent } from \'./new-component\';' }],
        isLastInAdditionGroup: false,
      } as TGitPatchLineElement,
      {
        id: '8',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: 'import { GitPatchDisplay } from \'./git-patch-display\';' }],
        isLastInAdditionGroup: true,
      } as TGitPatchLineElement,
      {
        id: '9',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '' }],
      } as TGitPatchLineElement,
      {
        id: '10',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: 'export function Editor() {' }],
      } as TGitPatchLineElement,
      {
        id: '11',
        type: 'git-patch-line',
        lineType: 'deletion',
        children: [{ text: '  const [value, setValue] = useState(null);' }],
      } as TGitPatchLineElement,
      {
        id: '12',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: '  const [value, setValue] = useState(initialValue);' }],
        isLastInAdditionGroup: false,
      } as TGitPatchLineElement,
      {
        id: '13',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: '  const [showPatch, setShowPatch] = useState(false);' }],
        isLastInAdditionGroup: true,
      } as TGitPatchLineElement,
      {
        id: '14',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '' }],
      } as TGitPatchLineElement,
      {
        id: '15',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '  return (' }],
      } as TGitPatchLineElement,
      {
        id: '16',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '    <div className="editor-container">' }],
      } as TGitPatchLineElement,
      {
        id: '17',
        type: 'git-patch-line',
        lineType: 'deletion',
        children: [{ text: '      <OldComponent />' }],
      } as TGitPatchLineElement,
      {
        id: '18',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: '      <NewComponent onTogglePatch={() => setShowPatch(!showPatch)} />' }],
        isLastInAdditionGroup: false,
      } as TGitPatchLineElement,
      {
        id: '19',
        type: 'git-patch-line',
        lineType: 'addition',
        children: [{ text: '      {showPatch && <GitPatchDisplay />}' }],
        isLastInAdditionGroup: true,
      } as TGitPatchLineElement,
      {
        id: '20',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '      <PlateEditor value={value} onChange={setValue} />' }],
      } as TGitPatchLineElement,
      {
        id: '21',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '    </div>' }],
      } as TGitPatchLineElement,
      {
        id: '22',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '  );' }],
      } as TGitPatchLineElement,
      {
        id: '23',
        type: 'git-patch-line',
        lineType: 'context',
        children: [{ text: '}' }],
      } as TGitPatchLineElement,
    ],
  } as TGitPatchBlockElement,
  {
    id: '24',
    children: [{ text: 'Features' }],
    type: 'h3',
  },
  {
    id: '25',
    children: [{ text: 'The git patch display component includes:' }],
    type: 'p',
  },
  {
    id: '26',
    children: [
      { id: '27', children: [{ text: 'Three line types: addition (green), deletion (red), and context (gray)' }], type: 'li' },
      { id: '28', children: [{ text: 'Confirm button displayed on the last line of continuous additions' }], type: 'li' },
      { id: '29', children: [{ text: 'Proper formatting with monospace font' }], type: 'li' },
      { id: '30', children: [{ text: 'Plus (+) and minus (-) prefixes for additions and deletions' }], type: 'li' },
      { id: '31', children: [{ text: 'Dark mode compatible styling' }], type: 'li' },
    ],
    type: 'ul',
  },
  {
    id: '32',
    children: [{ text: 'Notice how the confirm button only appears on the last line when there are multiple consecutive additions. Click it to confirm the addition group.' }],
    type: 'p',
  },
];