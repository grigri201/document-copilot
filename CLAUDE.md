# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server with Turbopack (fast refresh)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Install dependencies
npm install

# Add a new shadcn/ui component
npx shadcn@latest add [component-name]
```

## Architecture

Document Copilot is an AI-assisted document editor built with Next.js 15. It allows users to edit documents with markdown support and apply AI-suggested changes through a diff-based system.

### Key Technical Stack
- **Next.js 15.3.4** with App Router and Turbopack
- **React 19** with React DOM 19
- **TypeScript** with strict mode
- **Tailwind CSS v4** using PostCSS plugin approach
- **shadcn/ui** component library (new-york style, neutral colors)
- **Plate.js** for rich text editing with Slate.js foundation

### Core Application Flow
1. User writes in the Plate.js editor (supports markdown, code blocks, basic formatting)
2. User asks questions via the floating input bar (`floating-input-bar.tsx`)
3. App generates a prompt with document content and question (copies to clipboard)
4. User pastes AI-generated diff response back into the editor toolbar
5. Diff parser (`lib/diff-parser.ts`) processes unified diff format
6. Diff blocks render as interactive elements with accept/reject buttons
7. Accepted changes are applied inline to the document

### Key Components and Architecture

#### Pages (Refactored)
- `/src/app/page.tsx` - Main editor page (29 lines, uses hooks)
- `/src/app/demo/page.tsx` - Demo page with sample content (54 lines, uses hooks)

#### Custom Hooks (New)
- `/src/hooks/useDocumentEditor.ts` - Manages editor state, initialization, and content extraction
- `/src/hooks/useDiffHandlers.ts` - Handles diff acceptance/rejection logic
- `/src/hooks/useClipboardHandlers.ts` - Manages clipboard operations and AI integration

#### Layout Components (New)
- `/src/components/layouts/EditorLayout.tsx` - Common UI layout for editor pages

#### Core Components
- `/src/components/diff-block.tsx` - Renders diff changes with accept/reject UI
- `/src/components/editor-toolbar.tsx` - Toolbar with paste functionality for diffs
- `/src/components/floating-input-bar.tsx` - Input interface for AI questions

#### Library Files
- `/src/lib/diff-plugin.tsx` - Plate.js plugin for diff block rendering
- `/src/lib/diff-parser.ts` - Parses unified diff format into structured data
- `/src/lib/prompts.ts` - Generates structured prompts for AI interactions

### Important Patterns
1. **Component Styling**: Use the `cn()` utility from `@/lib/utils` for merging classNames
2. **Path Aliases**: Use `@/` to import from the `src/` directory
3. **Editor State**: All editor functionality is client-side only (no backend/API)
4. **Diff Integration**: Diffs are void elements in the Plate.js editor tree
5. **Clipboard Workflow**: Uses clipboard for AI interaction (copy prompt, paste response)

### Plate.js Editor Configuration
- Configured with markdown shortcuts, code blocks, and basic formatting plugins
- Custom diff block plugin for rendering suggested changes
- Two editor variants: dynamic (`editor.tsx`) and static (`editor-static.tsx`)
- Editor state managed through `useDocumentEditor` hook
- Diff handlers attached via `useDiffHandlers` hook

### Development Notes
- The project uses Turbopack for faster development builds
- No test framework currently configured
- ESLint 9 with Next.js rules for code quality
- All components are client-side rendered (`'use client'` directive)
- Font optimization with Geist Sans and Geist Mono from next/font

### Current Technical Debt
- 27 TypeScript `any` type violations (mostly in hooks and diff handling)
- Error handling uses `alert()` and `console.error()` - needs proper toast notifications
- Complex diff acceptance logic needs further decomposition
- State management uses patterns like `(editor as any).diffHandlers` that need improvement

### Refactoring Status
The codebase recently underwent major refactoring to eliminate code duplication:
- Extracted shared editor logic into reusable hooks
- Reduced page components by ~90% (from 382/437 lines to 29/54 lines)
- Created single source of truth for editor functionality
- See `refactor.md` for complete refactoring plan and progress