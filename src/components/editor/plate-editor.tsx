'use client';

import * as React from 'react';

import { Plate, usePlateEditor } from 'platejs/react';
import { Editor, EditorContainer } from '@/components/ui/editor';

import { EditorKit } from '@/components/editor/editor-kit';
import { SettingsDialog } from '@/components/editor/settings-dialog';

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant="demo" placeholder="try ask AI to write something" />
      </EditorContainer>

      <SettingsDialog />
    </Plate>
  );
}

const value = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
];
