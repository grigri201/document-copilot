# Document Copilot Refactoring Plan

This document outlines a comprehensive refactoring plan for the Document Copilot project, organized by priority and impact.

## Executive Summary

The Document Copilot codebase shows signs of rapid prototyping with significant technical debt in two main areas:
1. **Code duplication** - ~85% duplication between main and demo pages
2. **Type safety** - 42 instances of TypeScript `any` types

This refactoring plan prioritizes addressing these critical issues first, followed by improvements to code organization, error handling, and user experience.

## High Priority Refactoring Tasks

### 1. Extract Shared Editor Logic and Eliminate Duplication ✅

**Problem**: `src/app/page.tsx` (382 lines) and `src/app/demo/page.tsx` (437 lines) share ~85% identical code.

**Solution**: Extract shared logic into reusable hooks and components.

**Action Items**:
- [x] Create `src/hooks/useDocumentEditor.ts` to manage editor state and initialization
- [x] Create `src/hooks/useDiffHandlers.ts` for diff acceptance/rejection logic
- [x] Create `src/hooks/useClipboardHandlers.ts` for clipboard operations
- [x] Extract common UI layouts into `src/components/layouts/EditorLayout.tsx`
- [x] Reduce both page components to ~50 lines each

**Completed Impact**: 
- Reduced `page.tsx` from 382 lines to 29 lines (92% reduction)
- Reduced `demo/page.tsx` from 437 lines to 54 lines (88% reduction)
- Eliminated ~700 lines of duplicate code
- Created reusable hooks for editor logic
- Single source of truth for all editor functionality

**Note**: The refactoring revealed 27 TypeScript `any` type violations in the new hooks/components that need to be addressed in Task #2.

### 2. Fix TypeScript Type Safety ✅

**Problem**: 42 instances of `any` type across the codebase, reducing type safety and IDE support.

**Solution**: Create proper type definitions and replace all `any` types.

**Action Items**:
- [x] Create `src/types/editor.ts` with comprehensive type definitions
- [x] Create `src/types/diff.ts` for diff-related types
- [x] Type all editor references properly (currently using `any`)
- [x] Type all event handlers and callbacks
- [x] Add proper types for Plate.js operations

**Completed Impact**:
- Eliminated all 42 `any` type violations
- Created comprehensive type system with:
  - `CustomEditor` extending PlateEditor with diff handlers
  - `CustomElement` union type for all element types
  - `CustomText` for text nodes with formatting
  - Type guards for runtime type checking
- Full TypeScript support with proper autocomplete
- Zero ESLint warnings or errors
- Type-safe editor operations and event handlers

### 3. Refactor Complex Diff Acceptance Logic

**Problem**: The `onAccept` handler is over 150 lines with deeply nested conditionals.

**Solution**: Break down into smaller, focused functions.

**Action Items**:
- [ ] Create `src/lib/diff-operations.ts` with:
  - `findDeletionNodes(editor, startLine, endLine): NodeEntry[]`
  - `applyInlineReplacement(editor, node, oldText, newText): void`
  - `applyBlockReplacement(editor, nodes, newContent): void`
  - `insertAdditions(editor, path, additions): void`
- [ ] Create `src/lib/editor-utils.ts` for common editor operations
- [ ] Reduce the handler to ~20 lines by delegating to these functions
- [ ] Add unit tests for each function

**Expected Impact**:
- Easier to understand and modify
- Testable individual functions
- Reusable logic for future features

## Medium Priority Refactoring Tasks

### 4. Improve State Management Architecture

**Problem**: Using refs and manual state management with hacky patterns like `(editor as any).diffHandlers`.

**Solution**: Implement proper React patterns for state management.

**Action Items**:
- [ ] Create `src/contexts/EditorContext.tsx` with:
  ```typescript
  interface EditorContextValue {
    editor: PlateEditor;
    diffHandlers: DiffHandlers;
    // ... other shared state
  }
  ```
- [ ] Create `EditorProvider` component
- [ ] Remove all `(editor as any)` patterns
- [ ] Use context for editor-to-component communication

### 5. Enhance Error Handling and User Feedback

**Problem**: Using `alert()` and `console.error()` for error handling.

**Solution**: Implement proper error handling with user-friendly feedback.

**Action Items**:
- [ ] Install and configure shadcn/ui toast component
- [ ] Create `src/hooks/useToast.ts` for standardized notifications
- [ ] Replace all `alert()` calls with toast notifications
- [ ] Add error boundaries for graceful error recovery
- [ ] Implement loading states for async operations

### 6. Modularize and Test Diff Parser

**Problem**: Diff parser lacks tests and doesn't handle edge cases.

**Solution**: Add comprehensive tests and error handling.

**Action Items**:
- [ ] Set up Jest/Vitest testing framework
- [ ] Add unit tests for `src/lib/diff-parser.ts`
- [ ] Handle malformed diff input gracefully
- [ ] Support additional diff formats
- [ ] Add input validation with clear error messages

### 7. Improve Component Props and Interfaces

**Problem**: Components use loose typing and implicit contracts.

**Solution**: Define strict interfaces for all components.

**Action Items**:
- [ ] Create proper prop interfaces for each component
- [ ] Use discriminated unions for operation types
- [ ] Add JSDoc comments for complex functions
- [ ] Ensure all callbacks are properly typed

## Low Priority Refactoring Tasks

### 8. Add Accessibility Features

**Action Items**:
- [ ] Add ARIA labels to all interactive elements
- [ ] Implement keyboard shortcuts (Ctrl+Z for undo, etc.)
- [ ] Ensure proper focus management
- [ ] Add screen reader support for diff blocks
- [ ] Test with accessibility tools

### 9. Optimize Performance

**Action Items**:
- [ ] Memoize expensive diff calculations
- [ ] Use React.memo for pure components
- [ ] Implement virtualization for large documents
- [ ] Add debouncing to clipboard operations
- [ ] Profile and optimize re-renders

### 10. Enhance Developer Experience

**Action Items**:
- [ ] Set up pre-commit hooks with Husky
- [ ] Add Storybook for component development
- [ ] Create comprehensive development docs
- [ ] Update metadata in `layout.tsx`
- [ ] Add environment variable validation

### 11. UI/UX Improvements

**Action Items**:
- [ ] Implement dark mode toggle
- [ ] Improve mobile responsiveness
- [ ] Add undo/redo functionality
- [ ] Show diff statistics (lines added/removed)
- [ ] Enhance syntax highlighting for code blocks

## Implementation Strategy

### Phase 1: Critical Foundation (Week 1-2)
1. Extract shared editor logic (#1)
2. Fix TypeScript types (#2)
3. Refactor diff acceptance logic (#3)

### Phase 2: Code Quality (Week 3-4)
4. Improve state management (#4)
5. Enhance error handling (#5)
6. Modularize diff parser (#6)
7. Improve component interfaces (#7)

### Phase 3: Polish and Enhancement (Week 5-6)
8. Add accessibility features (#8)
9. Optimize performance (#9)
10. Enhance developer experience (#10)
11. UI/UX improvements (#11)

## Success Metrics

- **Code duplication**: Reduce from ~85% to <5%
- **Type safety**: Eliminate all 42 `any` types
- **Test coverage**: Achieve >80% coverage for critical paths
- **Bundle size**: Maintain or reduce current size
- **Performance**: <100ms for diff operations
- **Accessibility**: WCAG 2.1 AA compliance

## Risks and Mitigation

1. **Risk**: Breaking existing functionality during refactor
   - **Mitigation**: Add comprehensive tests before refactoring
   
2. **Risk**: Scope creep leading to incomplete refactor
   - **Mitigation**: Strict phase-based approach with clear deliverables

3. **Risk**: Performance regression from new abstractions
   - **Mitigation**: Profile before and after each major change

## Conclusion

This refactoring plan addresses the most critical technical debt while laying a foundation for future feature development. By following this structured approach, the Document Copilot codebase will become more maintainable, type-safe, and developer-friendly.