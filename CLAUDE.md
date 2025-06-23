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

This is a Next.js 15 application using the App Router with TypeScript and Tailwind CSS v4.

### Key Technical Stack
- **Next.js 15.3.4** with App Router and Turbopack
- **React 19** with React DOM 19
- **TypeScript** with strict mode
- **Tailwind CSS v4** using PostCSS plugin approach
- **shadcn/ui** component library (new-york style, neutral colors)
- **Plate.js** for rich text editing

### Project Structure
- `/src/app/` - Next.js App Router pages and layouts
- `/src/components/ui/` - UI components (shadcn/ui based)
- `/src/lib/utils.ts` - Utility functions including `cn()` for className merging
- `components.json` - shadcn/ui configuration

### Important Patterns
1. **Component Styling**: Use the `cn()` utility from `@/lib/utils` for merging classNames with Tailwind
2. **Path Aliases**: Use `@/` to import from the `src/` directory
3. **Editor Components**: Two Plate.js editor variants exist - dynamic (`editor.tsx`) and static (`editor-static.tsx`)
4. **Theming**: CSS variables are configured for light/dark mode support

### Development Notes
- The project uses Turbopack for faster development builds
- Tailwind CSS v4 is configured with the new PostCSS plugin approach
- Font setup uses Geist Sans and Geist Mono from next/font
- ESLint 9 is configured with Next.js rules