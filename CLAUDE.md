# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Document Copilot is a Next.js 15 application for interactive markdown document editing with AI assistance. It allows users to write and edit markdown content in sections, with each section being independently editable via double-click interaction.

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

### Core Functionality

1. **Markdown Section Splitting**: The app uses `marked` lexer to split documents into logical sections (src/lib/splitSections.ts:3-34). Each paragraph, list, quote, or code block becomes an independent editable section.

2. **Interactive Editing**: MarkdownSection components (src/components/MarkdownSection.tsx) provide double-click-to-edit functionality. When editing, a prompt input appears for AI assistance.

3. **AI Integration**: Configuration page (src/app/config/page.tsx) allows setting up ChatGPT or OpenAI API credentials. Prompt templates in `prompts/` directory define AI interaction patterns.

### Tech Stack

- **Framework**: Next.js 15.3.3 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui components (New York style)
- **Markdown**: `marked` for parsing, `isomorphic-dompurify` for sanitization
- **TypeScript**: Strict mode enabled with path alias `@/*` for src imports

### Key Design Patterns

- Server Components by default, with "use client" for interactive components
- Tailwind CSS with CSS variables for theming
- Component composition using shadcn/ui primitives
- Markdown styles defined globally in src/app/globals.css

## Important Rules

- **DO NOT MODIFY** any files in the `src/components` directory. These components are stable and should not be changed.