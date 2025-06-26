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

# Run Jest unit tests
npm test                  # Run all tests once
npm run test:unit         # Same as npm test (explicit unit test command)
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage report

# Run Playwright E2E tests
npm run test:e2e          # Run all E2E tests
npm run test:e2e:ui       # Open Playwright UI
npm run test:e2e:debug    # Debug mode

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
- **@udecode/plate-*@49.0.0** packages for editor plugins (basic marks, code blocks, markdown)
- **react-markdown** with **react-syntax-highlighter** for GitHub-style markdown preview

### Core Application Flow
1. User writes in the Plate.js editor (supports markdown, code blocks, basic formatting)
2. User asks questions via the floating input bar (`floating-input-bar.tsx`)
3. App generates a prompt with document content and question using `lib/prompts.ts` (copies to clipboard)
4. User pastes AI-generated diff response back into the editor toolbar
5. Diff parser (`lib/diff-parser.ts`) processes unified diff format
6. Diff blocks render as interactive elements with accept/reject buttons
7. Accepted changes are applied inline to the document via `lib/diff-operations.ts`

### Key Features
- **Auto-save**: Uses localStorage with 30-second intervals (`hooks/useAutoSave.ts`)
- **Preview Mode**: Toggle between edit and GitHub-style markdown preview
- **Clear Function**: Removes all content and localStorage with confirmation dialog
- **Demo Page**: Available at `/demo` with pre-populated markdown examples

### State Management
- **Editor State**: Managed through `hooks/useDocumentEditor.ts` using Plate.js
- **Diff Handlers**: Managed through `hooks/useDiffHandlers.ts` for accept/reject operations
- **Clipboard Operations**: Handled by `hooks/useClipboardHandlers.ts`
- **Preview Mode**: Local state in page components, toggled via toolbar

### Important Patterns
1. **Component Styling**: Use the `cn()` utility from `@/lib/utils` for merging classNames
2. **Path Aliases**: Use `@/` to import from the `src/` directory
3. **Editor State**: All editor functionality is client-side only (no backend/API)
4. **Diff Integration**: Diffs are void elements in the Plate.js editor tree
5. **Clipboard Workflow**: Uses clipboard for AI interaction (copy prompt, paste response)
6. **Type Definitions**: Custom editor types defined in `types/editor.ts`

### Prompt Engineering
The `lib/prompts.ts` file contains the prompt template that instructs the AI to:
- Return unified diff format only
- Include exactly one context line above and below changes
- Add appropriate blank lines for readability
- Preserve document formatting patterns

### UI Components Structure
- **Editor Components**: Located in `components/ui/` (editor.tsx, button.tsx, etc.)
- **Layout Components**: Located in `components/layouts/` (EditorLayout.tsx)
- **Feature Components**: In `components/` root (diff-block.tsx, floating-input-bar.tsx, etc.)
- All UI components use `'use client'` directive for client-side rendering

### Development Notes
- The project uses Turbopack for faster development builds
- Jest for unit testing, Playwright for E2E testing
- ESLint 9 with Next.js rules for code quality
- All components are client-side rendered (`'use client'` directive)
- Font optimization with Geist Sans and Geist Mono from next/font
- Storage key for auto-save: `document-copilot-content`