interface LexicalNode {
  type: string;
  children?: LexicalNode[];
  text?: string;
  tag?: string;
  direction?: string;
  format?: string;
  indent?: number;
  version?: number;
}

interface LexicalEditorState {
  root: LexicalNode;
}

export function markdownToLexical(markdown: string): LexicalEditorState {
  const lines = markdown.split('\n');
  const nodes: LexicalNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    
    if (!line) {
      i++;
      continue;
    }

    // Headers
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '').trim();
      nodes.push({
        type: 'heading',
        tag: `h${level}`,
        children: [{
          type: 'text',
          text: text
        }]
      });
      i++;
      continue;
    }

    // Code blocks
    if (line.startsWith('```')) {
      const language = line.substring(3).trim();
      i++; // Move past opening ```
      let codeContent = '';
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeContent += lines[i] + '\n';
        i++;
      }
      
      if (i < lines.length) i++; // Move past closing ```
      
      nodes.push({
        type: 'code',
        children: [{
          type: 'text',
          text: codeContent.replace(/\n$/, '') // Remove trailing newline
        }]
      });
      continue;
    }

    // Blockquotes
    if (line.startsWith('>')) {
      const text = line.substring(1).trim();
      nodes.push({
        type: 'quote',
        children: [{
          type: 'text',
          text: text
        }]
      });
      i++;
      continue;
    }

    // Lists (unordered)
    if (line.match(/^[-*+]\s/)) {
      const listItems: LexicalNode[] = [];
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^[-*+]\s/)) {
          const text = currentLine.replace(/^[-*+]\s*/, '');
          listItems.push({
            type: 'listitem',
            children: [{
              type: 'text',
              text: text
            }]
          });
          i++;
        } else if (currentLine === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      
      nodes.push({
        type: 'list',
        children: listItems
      });
      continue;
    }

    // Lists (ordered)
    if (line.match(/^\d+\.\s/)) {
      const listItems: LexicalNode[] = [];
      
      while (i < lines.length) {
        const currentLine = lines[i].trim();
        if (currentLine.match(/^\d+\.\s/)) {
          const text = currentLine.replace(/^\d+\.\s*/, '');
          listItems.push({
            type: 'listitem',
            children: [{
              type: 'text',
              text: text
            }]
          });
          i++;
        } else if (currentLine === '') {
          i++;
          break;
        } else {
          break;
        }
      }
      
      nodes.push({
        type: 'list',
        children: listItems
      });
      continue;
    }

    // Regular paragraphs
    nodes.push({
      type: 'paragraph',
      children: [{
        type: 'text',
        text: line
      }]
    });
    i++;
  }

  // If no content, add a default paragraph
  if (nodes.length === 0) {
    nodes.push({
      type: 'paragraph',
      children: [{
        type: 'text',
        text: ''
      }]
    });
  }

  return {
    root: {
      type: 'root',
      children: nodes,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1
    }
  };
}

export function lexicalToMarkdown(editorState: LexicalEditorState): string {
  let markdown = '';
  
  function processNode(node: LexicalNode): string {
    let result = '';
    
    switch (node.type) {
      case 'heading':
        const level = parseInt(node.tag?.substring(1) || '1');
        const headerPrefix = '#'.repeat(level) + ' ';
        const headerText = node.children?.[0]?.text || '';
        result = headerPrefix + headerText + '\n\n';
        break;
        
      case 'paragraph':
        const paragraphText = node.children?.[0]?.text || '';
        if (paragraphText.trim()) {
          result = paragraphText + '\n\n';
        }
        break;
        
      case 'code':
        const codeText = node.children?.[0]?.text || '';
        result = '```\n' + codeText + '\n```\n\n';
        break;
        
      case 'quote':
        const quoteText = node.children?.[0]?.text || '';
        result = '> ' + quoteText + '\n\n';
        break;
        
      case 'list':
        if (node.children) {
          node.children.forEach((item, index) => {
            const itemText = item.children?.[0]?.text || '';
            result += `- ${itemText}\n`;
          });
          result += '\n';
        }
        break;
        
      default:
        // For unknown node types, try to process children
        if (node.children) {
          node.children.forEach(child => {
            result += processNode(child);
          });
        }
        break;
    }
    
    return result;
  }
  
  if (editorState.root.children) {
    editorState.root.children.forEach(node => {
      markdown += processNode(node);
    });
  }
  
  return markdown.trim();
}

// For backward compatibility with the old EditorJS format
export function editorJSToMarkdown(data: any): string {
  if (!data || !data.blocks) {
    return '';
  }

  let markdown = '';

  for (const block of data.blocks) {
    switch (block.type) {
      case 'header':
        const level = block.data?.level || 2;
        const headerText = block.data?.text || '';
        markdown += '#'.repeat(level) + ' ' + headerText + '\n\n';
        break;

      case 'paragraph':
        const paragraphText = block.data?.text || '';
        markdown += paragraphText + '\n\n';
        break;

      case 'list':
        const items = block.data?.items || [];
        const isOrdered = block.data?.style === 'ordered';
        
        items.forEach((item: string, index: number) => {
          if (isOrdered) {
            markdown += `${index + 1}. ${item}\n`;
          } else {
            markdown += `- ${item}\n`;
          }
        });
        markdown += '\n';
        break;

      case 'code':
        const code = block.data?.code || '';
        markdown += '```\n' + code + '\n```\n\n';
        break;

      case 'quote':
        const quote = block.data?.text || '';
        markdown += '> ' + quote + '\n\n';
        break;

      default:
        // For unknown blocks, try to extract text
        const text = block.data?.text || '';
        if (text) {
          markdown += text + '\n\n';
        }
        break;
    }
  }

  return markdown.trim();
} 