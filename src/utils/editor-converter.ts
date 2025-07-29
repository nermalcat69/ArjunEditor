import { EditorData, EditorBlock } from '../types';

export function markdownToEditorJS(markdown: string): EditorData {
  const blocks: EditorBlock[] = [];
  const lines = markdown.split('\n');
  let blockId = 0;
  let i = 0;

  function createBlock(type: string, data: any): EditorBlock {
    return {
      id: `block_${blockId++}`,
      type,
      data,
    };
  }

  while (i < lines.length) {
    const line = lines[i];
    
    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headers
    if (line.match(/^#{1,6}\s/)) {
      const level = line.match(/^#+/)?.[0].length || 1;
      const text = line.replace(/^#+\s*/, '').trim();
      blocks.push(createBlock('header', { text, level }));
      i++;
      continue;
    }

    // Code blocks
    if (line.trim().startsWith('```')) {
      const language = line.trim().substring(3).trim();
      const codeLines: string[] = [];
      i++; // Skip opening ```
      
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      
      if (i < lines.length) i++; // Skip closing ```
      
      blocks.push(createBlock('code', { 
        code: codeLines.join('\n'),
        language: language || undefined
      }));
      continue;
    }

    // Block quotes
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) {
        if (lines[i].startsWith('>')) {
          quoteLines.push(lines[i].substring(1).trim());
        } else if (lines[i].trim() === '' && quoteLines.length > 0) {
          quoteLines.push('');
        }
        i++;
      }
      
      const text = quoteLines.join('\n').trim();
      blocks.push(createBlock('quote', { 
        text, 
        caption: '',
        alignment: 'left'
      }));
      continue;
    }

    // Lists (unordered)
    if (line.match(/^[-*+]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].match(/^[-*+]\s/) || lines[i].trim() === '')) {
        if (lines[i].match(/^[-*+]\s/)) {
          listItems.push(lines[i].replace(/^[-*+]\s/, '').trim());
        }
        i++;
      }
      
      blocks.push(createBlock('list', {
        style: 'unordered',
        items: listItems
      }));
      continue;
    }

    // Lists (ordered)
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && (lines[i].match(/^\d+\.\s/) || lines[i].trim() === '')) {
        if (lines[i].match(/^\d+\.\s/)) {
          listItems.push(lines[i].replace(/^\d+\.\s/, '').trim());
        }
        i++;
      }
      
      blocks.push(createBlock('list', {
        style: 'ordered',
        items: listItems
      }));
      continue;
    }

    // Horizontal rule
    if (line.match(/^[-*_]{3,}$/)) {
      blocks.push(createBlock('delimiter', {}));
      i++;
      continue;
    }

    // Paragraph (collect consecutive non-special lines)
    const paragraphLines: string[] = [];
    while (i < lines.length && 
           !lines[i].match(/^#{1,6}\s/) && 
           !lines[i].trim().startsWith('```') &&
           !lines[i].startsWith('>') &&
           !lines[i].match(/^[-*+]\s/) &&
           !lines[i].match(/^\d+\.\s/) &&
           !lines[i].match(/^[-*_]{3,}$/)) {
      
      if (lines[i].trim() !== '') {
        paragraphLines.push(lines[i]);
      } else if (paragraphLines.length > 0) {
        // Empty line breaks paragraph
        break;
      }
      i++;
    }
    
    if (paragraphLines.length > 0) {
      const text = paragraphLines.join('\n').trim();
      blocks.push(createBlock('paragraph', { text }));
    }
  }

  return {
    time: Date.now(),
    blocks,
    version: '2.28.2',
  };
}

export function convertEditorDataToMarkdown(data: EditorData): string {
  if (!data || !data.blocks) {
    return '';
  }

  return data.blocks.map(block => {
    switch (block.type) {
      case 'header': {
        const headerData = block.data as { text: string; level: number };
        return `${'#'.repeat(headerData.level)} ${headerData.text}`;
      }
      
      case 'paragraph': {
        const paragraphData = block.data as { text: string };
        return paragraphData.text || '';
      }
      
      case 'list': {
        const listData = block.data as { style: string; items: string[] };
        return listData.items.map((item: string, index: number) => {
          const prefix = listData.style === 'ordered' ? `${index + 1}. ` : '- ';
          return `${prefix}${item}`;
        }).join('\n');
      }
      
      case 'quote': {
        const quoteData = block.data as { text: string; caption?: string };
        const lines = quoteData.text.split('\n');
        return lines.map((line: string) => `> ${line}`).join('\n');
      }
      
      case 'code': {
        const codeData = block.data as { code: string; language?: string };
        const lang = codeData.language || '';
        return `\`\`\`${lang}\n${codeData.code}\n\`\`\``;
      }
      
      case 'delimiter':
        return '---';
      
      case 'linkTool': {
        const linkData = block.data as { link: string; meta?: { title?: string; description?: string } };
        const title = linkData.meta?.title || linkData.link;
        return `[${title}](${linkData.link})`;
      }
      
      case 'image': {
        const imageData = block.data as { 
          file?: { url: string }; 
          caption?: string; 
          url?: string;
          withBorder?: boolean;
          withBackground?: boolean;
          stretched?: boolean;
        };
        const imageUrl = imageData.file?.url || imageData.url || '';
        const caption = imageData.caption || '';
        return `![${caption}](${imageUrl})`;
      }
      
      case 'embed': {
        const embedData = block.data as { service: string; source: string; embed: string; caption?: string };
        return embedData.source || embedData.embed || '';
      }
      
      default:
        // Fallback for unknown block types
        return block.data?.text || '';
    }
  }).join('\n\n');
} 