import * as fs from 'fs';
import * as path from 'path';
import { markdownToEditorJS, convertEditorDataToMarkdown } from '../utils/editor-converter';
import { findMarkdownFile, parseMarkdownFile, writeMarkdownFile } from '../utils/file-utils';
import { SaveRequest, SaveResponse, EditorData } from '../types';

export async function handleGetMarkdown(
  contentDir: string, 
  slug: string
): Promise<{ success: boolean; data?: EditorData; error?: string }> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Editor only available in development mode' };
    }

    const filePath = findMarkdownFile(contentDir, slug);
    
    if (!filePath) {
      // Create a new file with empty content
      const editorData: EditorData = {
        time: Date.now(),
        blocks: [
          {
            id: 'block_0',
            type: 'paragraph',
            data: { text: `Start writing your content for "${slug}"...` }
          }
        ],
        version: '2.28.2'
      };
      
      return { success: true, data: editorData };
    }

    const markdownFile = parseMarkdownFile(filePath);
    const editorData = markdownToEditorJS(markdownFile.content);

    return { success: true, data: editorData };
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function handleSaveMarkdown(
  request: SaveRequest
): Promise<SaveResponse> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Editor only available in development mode' };
    }

    const { slug, content, contentDir } = request;
    
    // Convert editor data back to markdown
    const markdown = convertEditorDataToMarkdown(content);
    
    // Find existing file or create new path
    let filePath = findMarkdownFile(contentDir, slug);
    
    if (!filePath) {
      // Create new file
      filePath = path.join(contentDir, `${slug}.md`);
    }

    // Parse existing file to preserve frontmatter
    let frontmatter = {};
    if (filePath && require('fs').existsSync(filePath)) {
      const existingFile = parseMarkdownFile(filePath);
      frontmatter = existingFile.frontmatter || {};
    }

    // Write the file
    writeMarkdownFile(filePath, {
      slug,
      content: markdown,
      frontmatter,
    });

    return { 
      success: true, 
      message: `Successfully saved ${slug}.md` 
    };
  } catch (error) {
    console.error('Error saving markdown file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// URL fetching handler for link tool
export async function handleFetchUrl(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    
    // Basic meta extraction (you might want to use a proper library like jsdom)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/i) || 
                           html.match(/<meta property="og:description" content="(.*?)"/i);
    const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/i);

    return {
      success: 1,
      meta: {
        title: titleMatch ? titleMatch[1] : url,
        description: descriptionMatch ? descriptionMatch[1] : '',
        image: {
          url: imageMatch ? imageMatch[1] : ''
        }
      }
    };
  } catch (error) {
    return {
      success: 0,
      error: 'Failed to fetch URL data'
    };
  }
} 