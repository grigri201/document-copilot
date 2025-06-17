'use client';

import * as React from 'react';

import {
  ArrowUpToLineIcon,
} from 'lucide-react';

import { ExportToolbarButton } from './export-toolbar-button';
import { ImportToolbarButton } from './import-toolbar-button';
import { ToolbarGroup } from './toolbar';

export function FixedToolbarButtons() {
  return (
    <div className="flex w-full">
      <ToolbarGroup>
        <ImportToolbarButton />
        <ExportToolbarButton>
          <ArrowUpToLineIcon />
        </ExportToolbarButton>
      </ToolbarGroup>

      <div className="grow" />
    </div>
  );
}
