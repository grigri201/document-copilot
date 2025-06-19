'use client';

import * as React from 'react';
import { cn } from '@udecode/cn';
import {
  type SlateElementProps,
  type TElement,
  SlateElement,
} from 'platejs';
import { useEditorRef } from 'platejs/react';
import { Button } from '@/components/ui/button';
import { Path } from 'slate';

export interface TGitPatchBlockElement extends TElement {
  type: 'git-patch-block';
  children: TGitPatchLineElement[];
}

export interface TGitPatchLineElement extends TElement {
  type: 'git-patch-line';
  lineType: 'addition' | 'deletion' | 'context';
  children: Array<{ text: string }>;
  isLastInAdditionGroup?: boolean;
}

// Context to manage hover state across addition groups
const GitPatchHoverContext = React.createContext<{
  hoveredGroupId: string | null;
  setHoveredGroupId: (id: string | null) => void;
}>({
  hoveredGroupId: null,
  setHoveredGroupId: () => {},
});

export function GitPatchBlockElement(
  props: SlateElementProps<TGitPatchBlockElement>
) {
  const [hoveredGroupId, setHoveredGroupId] = React.useState<string | null>(null);
  
  return (
    <GitPatchHoverContext.Provider value={{ hoveredGroupId, setHoveredGroupId }}>
      <SlateElement
        className="my-4 overflow-hidden rounded-md border border-border bg-muted/30"
        {...props}
      >
        <div className="font-mono text-sm">
          {props.children}
        </div>
      </SlateElement>
    </GitPatchHoverContext.Provider>
  );
}

GitPatchBlockElement.displayName = 'GitPatchBlockElement';

export function GitPatchLineElement(
  props: SlateElementProps<TGitPatchLineElement>
) {
  const { element, path } = props;
  const editor = useEditorRef();
  const lineType = element.lineType || 'context';
  const [showConfirm, setShowConfirm] = React.useState(true);
  const { hoveredGroupId, setHoveredGroupId } = React.useContext(GitPatchHoverContext);
  
  // Check if this is the last line in a continuous addition group
  // Recalculate dynamically to handle DOM changes
  const isLastInAdditionGroup = React.useMemo(() => {
    if (lineType !== 'addition') return false;
    
    // If explicitly set to false, respect that
    if (element.isLastInAdditionGroup === false) return false;
    
    // Otherwise, check dynamically
    if (!path || !editor) return true;
    
    try {
      // Get the parent node to check siblings
      const parentPath = Path.parent(path);
      const parent = editor.api.node(parentPath);
      if (!parent || !parent[0]) return true;
      
      const parentNode = parent[0] as TElement;
      const currentIndex = path[path.length - 1];
      const nextSibling = parentNode.children?.[currentIndex + 1] as TGitPatchLineElement | undefined;
      
      // If no next sibling or next sibling is not an addition, this is the last in group
      return !nextSibling || nextSibling.lineType !== 'addition';
    } catch {
      return element.isLastInAdditionGroup === undefined || element.isLastInAdditionGroup === true;
    }
  }, [lineType, element.isLastInAdditionGroup, path, editor]);
  
  // Check if this line is part of an addition group
  const isInAdditionGroup = lineType === 'addition';
  
  // Determine the prefix based on line type
  const getPrefix = () => {
    switch (lineType) {
      case 'addition':
        return '+';
      case 'deletion':
        return '-';
      default:
        return ' ';
    }
  };
  
  const handleConfirm = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!editor) return;
    
    // Store the element id before async operation
    const elementId = element.id;
    
    // Defer the editor operations to avoid DOM mapping issues
    setTimeout(() => {
      try {
        // Find all git-patch-blocks in the editor using the API
        const blockEntries: [TGitPatchBlockElement, Path][] = [];
        
        // Iterate through all nodes to find git-patch-blocks
        const allNodes = editor.api.nodes({
          at: [],
          mode: 'all',
        });
        
        for (const [node, path] of allNodes) {
          if ((node as TElement).type === 'git-patch-block') {
            blockEntries.push([node as TGitPatchBlockElement, path]);
          }
        }
        
        if (blockEntries.length === 0) {
          return;
        }
        
        // Find the block that contains our element
        let targetBlock: [TGitPatchBlockElement, Path] | null = null;
        let lineIndex = -1;
        
        for (const [blockNode, blockPath] of blockEntries) {
          const children = blockNode.children as TGitPatchLineElement[];
          const idx = children.findIndex(child => child.id === elementId);
          if (idx !== -1) {
            targetBlock = [blockNode, blockPath];
            lineIndex = idx;
            break;
          }
        }
        
        if (!targetBlock || lineIndex === -1) {
          return;
        }
        
        const [blockNode, blockPath] = targetBlock;
        const children = blockNode.children as TGitPatchLineElement[];
        
        const additionPaths: Path[] = [];
        const deletionPaths: Path[] = [];
        
        // Check if the current line is actually an addition
        const currentLine = children[lineIndex] as TGitPatchLineElement;
        if (!currentLine || currentLine.lineType !== 'addition') {
          return;
        }
        
        // Find the start of the addition group
        let startIndex = lineIndex;
        while (startIndex > 0 && children[startIndex - 1]?.lineType === 'addition') {
          startIndex--;
        }
        
        // Collect all additions in the group
        for (let i = startIndex; i <= lineIndex; i++) {
          if (children[i]?.lineType === 'addition') {
            additionPaths.push([...blockPath, i]);
          }
        }
        
        // Find deletions that should be removed (before the addition group)
        let checkIndex = startIndex - 1;
        while (checkIndex >= 0 && children[checkIndex]?.lineType === 'deletion') {
          deletionPaths.push([...blockPath, checkIndex]);
          checkIndex--;
        }
        
        // If no additions found, something went wrong
        if (additionPaths.length === 0) {
          return;
        }
        
        // Focus the editor first
        editor.tf.focus();
        
        // Perform the transformations
        // First, convert additions to context lines (these don't change indices)
        additionPaths.forEach((linePath) => {
          editor.tf.setNodes(
            { lineType: 'context' }, 
            { at: linePath, match: (n) => n.type === 'git-patch-line' }
          );
        });
        
        // Then remove deletion lines (in reverse order to maintain indices)
        // Sort deletion paths in descending order to remove from bottom to top
        const sortedDeletionPaths = [...deletionPaths].sort((a, b) => {
          const aIndex = a[a.length - 1];
          const bIndex = b[b.length - 1];
          return bIndex - aIndex;
        });
        
        sortedDeletionPaths.forEach((linePath) => {
          editor.tf.removeNodes({ at: linePath });
        });
      } catch (error) {
        console.error('Error in handleConfirm:', error);
      }
    }, 0);
    
    setShowConfirm(false);
  }, [editor, element.id]);
  
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);
  
  // Create a unique group identifier for addition groups
  const groupId = React.useMemo(() => {
    if (!isInAdditionGroup || !path) return null;
    
    try {
      const entries: [TElement, Path][] = [];
      let currentPath = path;
      
      // Manually traverse ancestors
      while (currentPath.length > 0) {
        const node = editor.api.node(currentPath);
        if (node) {
          entries.push([node[0] as TElement, currentPath]);
        }
        currentPath = Path.parent(currentPath);
      }
      
      const blockEntry = entries.find(([node]) => node.type === 'git-patch-block');
      if (!blockEntry) return null;
      
      const [blockNode, blockPath] = blockEntry;
      const children = blockNode.children as TGitPatchLineElement[];
      const relativePath = Path.relative(path, blockPath);
      const lineIndex = relativePath[0];
      
      // Find start of group
      let startIndex = lineIndex;
      while (startIndex > 0 && children[startIndex - 1]?.lineType === 'addition') {
        startIndex--;
      }
      
      return `${blockPath.join('-')}-group-${startIndex}`;
    } catch {
      return null;
    }
  }, [editor, path, isInAdditionGroup]);
  
  // Check if this group is currently hovered
  const isGroupHovered = hoveredGroupId === groupId;
  
  // Show button only for additions that are last in their group
  const shouldShowButton = lineType === 'addition' && isLastInAdditionGroup && showConfirm;
  
  const handleMouseEnter = React.useCallback(() => {
    if (groupId) {
      setHoveredGroupId(groupId);
    }
  }, [groupId, setHoveredGroupId]);
  
  const handleMouseLeave = React.useCallback(() => {
    if (groupId) {
      setHoveredGroupId(null);
    }
  }, [groupId, setHoveredGroupId]);
  
  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <SlateElement
        className={cn(
          'flex min-h-[1.5em] whitespace-pre px-4',
          {
            'bg-green-50 text-green-800 dark:bg-green-950/30 dark:text-green-400': lineType === 'addition',
            'bg-red-50 text-red-800 dark:bg-red-950/30 dark:text-red-400': lineType === 'deletion',
            'bg-muted/50 text-muted-foreground': lineType === 'context',
          },
          // Highlight effect when group is hovered
          isInAdditionGroup && isGroupHovered && 'ring-1 ring-green-300 dark:ring-green-700'
        )}
        {...props}
      >
        <span className={cn(
          'select-none mr-2',
          {
            'text-green-600 dark:text-green-400': lineType === 'addition',
            'text-red-600 dark:text-red-400': lineType === 'deletion',
          }
        )}>
          {getPrefix()}
        </span>
        <span>{props.children}</span>
      </SlateElement>
      
      {/* Confirm button for last addition in a group - visible on group hover */}
      {shouldShowButton && (
        <div 
          className={cn(
            "absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-200",
            isGroupHovered ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          contentEditable={false}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={handleConfirm}
            className="h-6 bg-white hover:bg-gray-100 px-2 text-xs shadow-sm border"
            onMouseDown={handleMouseDown}
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}

GitPatchLineElement.displayName = 'GitPatchLineElement';