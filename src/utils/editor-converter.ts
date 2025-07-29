import { EditorData, EditorBlock } from '../types';

export function markdownToEditorJS(markdown: string): EditorData {
  const blocks: EditorBlock[] = [];
  const lines = markdown.split('\n');
  let currentBlock: string[] = [];
  let blockType = 'paragraph';
  let blockId = 0;

  function createBlock(type: string, content: string[]): EditorBlock {
    const data: any = {};
    
    switch (type) {
      case 'header':
        const headerText = content[0].replace(/^#+\s*/, '');
        const level = content[0].match(/^#+/)?.[0].length || 1;
        data.text = headerText;
        data.level = Math.min(level, 6);
        break;
        
      case 'list':
        data.style = content[0].startsWith('- ') ? 'unordered' : 'ordered';
        data.items = content.map(line => line.replace(/^[-*+]\s*/, '').replace(/^\d+\.\s*/, ''));
        break;
        
      case 'quote':
        data.text = content.map(line => line.replace(/^>\s*/, '')).join('\n');
        data.caption = '';
        data.alignment = 'left';
        break;
        
      case 'code':
        data.code = content.join('\n');
        break;
        
      case 'paragraph':
      default:
        data.text = content.join('\n');
        break;
    }
    
    return {
      id: `block_${blockId++}`,
      type,
      data,
    };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Empty line - finish current block
    if (!line.trim()) {
      if (currentBlock.length > 0) {
        blocks.push(createBlock(blockType, currentBlock));
        currentBlock = [];
        blockType = 'paragraph';
      }
      continue;
    }
    
    // Headers
    if (line.match(/^#+\s/)) {
      if (currentBlock.length > 0) {
        blocks.push(createBlock(blockType, currentBlock));
        currentBlock = [];
      }
      blockType = 'header';
      currentBlock = [line];
      blocks.push(createBlock(blockType, currentBlock));
      currentBlock = [];
      blockType = 'paragraph';
      continue;
    }
    
    // Lists
    if (line.match(/^[-*+]\s/) || line.match(/^\d+\.\s/)) {
      if (blockType !== 'list') {
        if (currentBlock.length > 0) {
          blocks.push(createBlock(blockType, currentBlock));
          currentBlock = [];
        }
        blockType = 'list';
      }
      currentBlock.push(line);
      continue;
    }
    
    // Quotes
    if (line.match(/^>\s/)) {
      if (blockType !== 'quote') {
        if (currentBlock.length > 0) {
          blocks.push(createBlock(blockType, currentBlock));
          currentBlock = [];
        }
        blockType = 'quote';
      }
      currentBlock.push(line);
      continue;
    }
    
    // Code blocks
    if (line.trim() === '```') {
      if (blockType === 'code') {
        blocks.push(createBlock(blockType, currentBlock));
        currentBlock = [];
        blockType = 'paragraph';
      } else {
        if (currentBlock.length > 0) {
          blocks.push(createBlock(blockType, currentBlock));
          currentBlock = [];
        }
        blockType = 'code';
      }
      continue;
    }
    
    // Regular paragraph content
    if (blockType === 'list' || blockType === 'quote') {
      // Finish the special block type
      blocks.push(createBlock(blockType, currentBlock));
      currentBlock = [];
      blockType = 'paragraph';
    }
    
    currentBlock.push(line);
  }
  
  // Handle remaining content
  if (currentBlock.length > 0) {
    blocks.push(createBlock(blockType, currentBlock));
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
        return paragraphData.text;
      }
      case 'list': {
        const listData = block.data as { style: string; items: string[] };
        const style = listData.style === 'ordered' ? 'ordered' : 'unordered';
        return listData.items.map((item: string, index: number) => {
          const prefix = style === 'ordered' ? `${index + 1}. ` : '- ';
          return `${prefix}${item}`;
        }).join('\n');
      }
      case 'quote': {
        const quoteData = block.data as { text: string; caption?: string };
        return quoteData.text.split('\n').map((line: string) => `> ${line}`).join('\n');
      }
      case 'code': {
        const codeData = block.data as { code: string; language?: string };
        return `\`\`\`${codeData.language || ''}\n${codeData.code}\n\`\`\``;
      }
      case 'linkTool': {
        const linkData = block.data as { link: string; meta?: { title?: string } };
        return `[${linkData.meta?.title || linkData.link}](${linkData.link})`;
      }
      case 'image': {
        const imageData = block.data as { file?: { url: string }; caption?: string; url?: string };
        const imageUrl = imageData.file?.url || imageData.url || '';
        const caption = imageData.caption || '';
        return `![${caption}](${imageUrl})`;
      }
      default:
        return block.data?.text || '';
    }
  }).join('\n\n');
} 