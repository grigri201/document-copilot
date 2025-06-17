'use client';

import { createPlatePlugin } from 'platejs/react';

import { FloatingToolbar } from '@/components/ui/floating-toolbar';
import { AIFloatingToolbar } from '@/components/ui/ai-floating-toolbar';

export const AIFloatingToolbarKit = [
  createPlatePlugin({
    key: 'ai-floating-toolbar',
    render: {
      afterEditable: () => (
        <FloatingToolbar className='bg-white'>
          <AIFloatingToolbar />
        </FloatingToolbar>
      ),
    },
  }),
];