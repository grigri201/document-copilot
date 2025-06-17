import { type Value } from 'platejs';

interface PlateNode {
  type?: string;
  text?: string;
  children?: PlateNode[];
  lang?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
}

/**
 * Custom Plate to Markdown serializer that properly handles lists
 */
export function plateToMarkdown(nodes: Value): string {
  const lines: string[] = [];
  const listStack: { type: 'ul' | 'ol'; depth: number }[] = [];

  function processNode(node: PlateNode, depth: number = 0) {

    switch (node.type) {
      case 'h1':
        lines.push(`# ${getNodeText(node)}`);
        break;
      case 'h2':
        lines.push(`## ${getNodeText(node)}`);
        break;
      case 'h3':
        lines.push(`### ${getNodeText(node)}`);
        break;
      case 'h4':
        lines.push(`#### ${getNodeText(node)}`);
        break;
      case 'h5':
        lines.push(`##### ${getNodeText(node)}`);
        break;
      case 'h6':
        lines.push(`###### ${getNodeText(node)}`);
        break;
      case 'p':
        const text = getNodeText(node);
        if (text) {
          lines.push(text);
        }
        break;
      case 'blockquote':
        const quoteText = getNodeText(node);
        lines.push(`> ${quoteText}`);
        break;
      case 'code_block':
        const lang = node.lang || '';
        lines.push(`\`\`\`${lang}`);
        lines.push(getNodeText(node));
        lines.push('```');
        break;
      case 'ul':
        listStack.push({ type: 'ul', depth });
        if (node.children) {
          node.children.forEach((child) => processNode(child, depth));
        }
        listStack.pop();
        break;
      case 'ol':
        listStack.push({ type: 'ol', depth });
        if (node.children) {
          node.children.forEach((child, index: number) => {
            if (child.type === 'li') {
              const orderIndex = index + 1;
              processListItem(child, depth, orderIndex);
            } else {
              processNode(child, depth);
            }
          });
        }
        listStack.pop();
        break;
      case 'li':
        // Handle list items based on parent list type
        const currentList = listStack[listStack.length - 1];
        if (currentList) {
          processListItem(node, currentList.depth);
        }
        break;
      default:
        // Handle nodes with children
        if (node.children) {
          node.children.forEach((child) => processNode(child, depth));
        }
    }

    // Add empty line after block elements (except in lists)
    if (node.type && ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'code_block', 'ul', 'ol'].includes(node.type) && listStack.length === 0) {
      lines.push('');
    }
  }

  function processListItem(node: PlateNode, depth: number, orderIndex?: number) {
    const indent = '  '.repeat(depth);
    const currentList = listStack[listStack.length - 1];
    const marker = currentList?.type === 'ol' ? `${orderIndex || 1}.` : '*';
    const itemText = getNodeText(node);
    
    lines.push(`${indent}${marker} ${itemText}`);
  }

  function getNodeText(node: PlateNode): string {
    if (node.text !== undefined) {
      let text = node.text;
      
      // Apply formatting
      if (node.bold) text = `**${text}**`;
      if (node.italic) text = `_${text}_`;
      if (node.underline) text = `<u>${text}</u>`;
      if (node.code) text = `\`${text}\``;
      
      return text;
    }

    if (node.children) {
      return node.children.map((child) => getNodeText(child)).join('');
    }

    return '';
  }

  // Process all nodes
  nodes.forEach((node) => processNode(node as PlateNode));

  // Clean up double empty lines
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}