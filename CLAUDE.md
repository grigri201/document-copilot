# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Document Copilot is a Next.js 15 application for AI-powered markdown document editing. It provides a rich WYSIWYG editing experience using Plate.js framework with AI assistance features including contextual suggestions and document enhancement.

## Commands

```bash
# Development
npm run dev          # Start development server with Turbopack

# Build & Production
npm run build        # Create production build
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run test         # Run Jest unit tests
```

## Architecture

### Core Technology Stack

- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui components (New York style)
- **Editor**: Plate.js v49 with extensive plugin ecosystem
- **Markdown**: `marked` for parsing, `isomorphic-dompurify` for sanitization
- **AI Integration**: Vercel AI SDK with OpenAI and WebLLM providers
- **TypeScript**: Strict mode enabled with path alias `@/*` for src imports

### Key Components

1. **Editor System** (src/components/editor/):
   - Markdown-only editor configuration as main editor
   - Plugin-based architecture with modular features
   - AI floating toolbar for contextual assistance
   - Support for code blocks, tables, media, and rich formatting

2. **AI Integration** (src/lib/providers/):
   - Abstract LLM provider pattern for extensibility
   - OpenAI API and WebLLM implementations
   - Diff-based content updates using unified patches
   - Edit prompts in src/lib/prompts/

3. **API Routes** (src/app/api/):
   - `/api/ai/command` - AI command processing
   - `/api/ai/copilot` - Copilot functionality
   - Stream-based responses for real-time updates

### File Organization

- **Naming Convention**: Files use kebab-case (e.g., `ai-floating-toolbar.tsx`)
- **Component Structure**: Server Components by default, "use client" for interactive components
- **Import Paths**: Use `@/` alias for src directory imports

### Current State

The project is actively transitioning to a markdown-only editor configuration with ongoing refactoring:
- AI floating toolbar implementation in progress
- Diff application logic being rewritten (src/lib/apply-diff.ts)
- File naming standardization from camelCase to kebab-case

## Important Rules

- **DO NOT MODIFY** any files in the `src/components` directory unless specifically working on active features
- Follow kebab-case naming convention for new files
- Maintain TypeScript strict mode compliance
- Use Server Components by default, Client Components only when necessary
- Apply AI edits using diff patches, not direct content replacement