'use client';

import { createPlatePlugin } from 'platejs/react';
import { FixedToolbar } from '@/components/ui/fixed-toolbar';
import { PasteToolbarButton } from '@/components/ui/paste-toolbar-button';

export const MarkdownToolbarKit = [
  createPlatePlugin({
    key: 'markdown-toolbar',
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <PasteToolbarButton />
        </FixedToolbar>
      ),
    },
  }),
];