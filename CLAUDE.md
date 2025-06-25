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
- **TypeScript** with strict mode and comprehensive type system
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

### Type System

The codebase uses a comprehensive type system defined in `/src/types/`:

#### Editor Types (`/src/types/editor.ts`)
- `CustomEditor` - Extends PlateEditor with diff handlers
- `CustomElement` - Union type: `ParagraphElement | CodeBlockElement | DiffBlockElement`
- `CustomText` - Text nodes with formatting properties
- `PlateRenderElementProps` - Props for Plate.js components
- Type guards: `isParagraphElement()`, `isCodeBlockElement()`, `isDiffBlockElement()`

#### Diff Types (`/src/types/diff.ts`)
- `DiffOperationType` - 'delete' | 'add' | 'replace'
- `DiffHandlers` - Interface for accept/reject operations
- Re-exports `DiffHunk` and `DiffBlockElement`

### Key Components and Architecture

#### Pages (Minimal after refactoring)
- `/src/app/page.tsx` - Main editor page (29 lines, composition of hooks)
- `/src/app/demo/page.tsx` - Demo page with sample content (54 lines, includes demo data)

#### Custom Hooks (Core Logic)
- `/src/hooks/useDocumentEditor.ts` - Editor initialization and state management
  - Configures Plate.js plugins
  - Manages editor ref
  - Provides `getContent()` method
- `/src/hooks/useDiffHandlers.ts` - Diff acceptance/rejection logic
  - `onAccept()` - Handles inline replacements and block deletions
  - `onReject()` - Removes diff blocks
  - `attachHandlers()` - Attaches handlers to editor instance
- `/src/hooks/useClipboardHandlers.ts` - Clipboard and AI integration
  - `handleAsk()` - Generates prompt and opens AI chat
  - `handlePaste()` - Parses and inserts diff blocks

#### Layout Components
- `/src/components/layouts/EditorLayout.tsx` - Common UI structure for all editor pages

#### Core Components
- `/src/components/diff-block.tsx` - Visual diff rendering with accept/reject buttons
- `/src/components/editor-toolbar.tsx` - Toolbar with paste functionality
- `/src/components/floating-input-bar.tsx` - AI question input interface

#### Library Files
- `/src/lib/diff-plugin.tsx` - Plate.js plugin for diff block elements
- `/src/lib/diff-parser.ts` - Parses unified diff format
- `/src/lib/prompts.ts` - AI prompt generation with strict formatting rules

### Important Patterns
1. **Component Styling**: Use `cn()` utility from `@/lib/utils` for className merging
2. **Path Aliases**: Use `@/` to import from `src/` directory
3. **Editor State**: Client-side only, no backend/API
4. **Diff Integration**: Diffs are void elements in Plate.js editor tree
5. **Clipboard Workflow**: Copy prompt → paste AI response
6. **Type Safety**: All hooks and components are fully typed (zero `any` types)

### Plate.js Editor Configuration
- Plugins: Bold, Italic, Underline, Strikethrough, Code, CodeBlock, Markdown, DiffBlock
- Custom diff block component registered as void element
- Editor instance typed as `CustomEditor` with diff handlers
- State managed through React hooks pattern

### Development Notes
- Turbopack for fast development builds
- No test framework configured yet
- ESLint 9 with Next.js rules
- All components use `'use client'` directive
- Font optimization with Geist Sans and Geist Mono

### Current Technical Debt (From refactor.md)

**Completed (High Priority):**
- ✅ Code duplication eliminated (reduced by ~90%)
- ✅ TypeScript type safety fixed (zero `any` types)

**Remaining Tasks:**
1. **Complex Diff Logic** (Task #3) - Break down 150+ line `onAccept` handler
2. **State Management** (Task #4) - Replace `editor.diffHandlers` pattern with Context
3. **Error Handling** (Task #5) - Replace `alert()` with toast notifications
4. **Diff Parser** (Task #6) - Add tests and edge case handling
5. **Component Interfaces** (Task #7) - Add JSDoc and discriminated unions
6. **Accessibility** (Task #8) - Add ARIA labels and keyboard navigation
7. **Performance** (Task #9) - Memoization and virtualization
8. **Developer Experience** (Task #10) - Add testing framework
9. **UI/UX** (Task #11) - Dark mode, mobile responsiveness, undo/redo

### Working with the Codebase

When making changes:
1. Follow the established hook pattern for new features
2. Add types to `/src/types/` for new data structures
3. Use the existing `CustomEditor` and `CustomElement` types
4. Maintain the separation between UI components and logic hooks
5. Keep page components minimal - extract logic to hooks

For diff-related features:
- Diff blocks are void elements - they cannot contain editable content
- Use `editor.diffHandlers` to access accept/reject functions
- The diff parser expects unified diff format with context lines

See `refactor.md` for the complete refactoring roadmap and detailed task descriptions.