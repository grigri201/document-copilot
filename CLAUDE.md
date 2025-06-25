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

### Core Application Flow
1. User writes in the Plate.js editor (supports markdown, code blocks, basic formatting)
2. User asks questions via the floating input bar (`floating-input-bar.tsx`)
3. App generates a prompt with document content and question (copies to clipboard)
4. User pastes AI-generated diff response back into the editor toolbar
5. Diff parser (`lib/diff-parser.ts`) processes unified diff format
6. Diff blocks render as interactive elements with accept/reject buttons
7. Accepted changes are applied inline to the document

### Key Components and Files
- `/src/app/page.tsx` - Main editor page with state management
- `/src/components/diff-block.tsx` - Renders diff changes with accept/reject UI
- `/src/components/editor-toolbar.tsx` - Toolbar with paste functionality for diffs
- `/src/lib/diff-plugin.tsx` - Plate.js plugin for diff block rendering
- `/src/lib/diff-parser.ts` - Parses unified diff format into structured data

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
- Editor state managed in the main page component

### Development Notes
- The project uses Turbopack for faster development builds
- Jest for unit testing, Playwright for E2E testing
- ESLint 9 with Next.js rules for code quality
- All components are client-side rendered (`'use client'` directive)
- Font optimization with Geist Sans and Geist Mono from next/font