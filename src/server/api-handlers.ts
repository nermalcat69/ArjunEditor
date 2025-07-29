import * as fs from 'fs';
import * as path from 'path';
import { markdownToLexical, lexicalToMarkdown, editorJSToMarkdown } from '../utils/editor-converter';
import { findMarkdownFile, parseMarkdownFile, writeMarkdownFile } from '../utils/file-utils';
import { SaveRequest, SaveResponse, EditorData } from '../types';

export async function handleGetMarkdown(
  contentDir: string, 
  slug: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Editor only available in development mode' };
    }

    const filePath = findMarkdownFile(contentDir, slug);
    
    if (!filePath) {
      // Return raw markdown for new files
      return { 
        success: true, 
        data: { 
          content: `# ${slug}\n\nStart writing your content...`,
          frontmatter: {}
        }
      };
    }

    const markdownFile = parseMarkdownFile(filePath);
    
    return { 
      success: true, 
      data: {
        content: markdownFile.content,
        frontmatter: markdownFile.frontmatter || {}
      }
    };
  } catch (error) {
    console.error('Error reading markdown file:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

export async function handleSaveMarkdown(
  request: any
): Promise<SaveResponse> {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return { success: false, error: 'Editor only available in development mode' };
    }

    const { slug, content, contentDir, markdown } = request;
    
    // Determine which format we're receiving
    let finalMarkdown: string;
    
    if (markdown) {
      // Direct markdown from Koenig
      finalMarkdown = markdown;
    } else if (content && content.blocks) {
      // Legacy EditorJS format
      finalMarkdown = editorJSToMarkdown(content);
    } else if (content && content.root) {
      // Lexical format
      finalMarkdown = lexicalToMarkdown(content);
    } else {
      // Fallback
      finalMarkdown = String(content || '');
    }
    
    // Find existing file or create new path
    let filePath = findMarkdownFile(contentDir, slug);
    
    if (!filePath) {
      // Create new file - ensure contentDir exists
      if (!fs.existsSync(contentDir)) {
        fs.mkdirSync(contentDir, { recursive: true });
      }
      filePath = path.join(contentDir, `${slug}.md`);
    }

    // Parse existing file to preserve frontmatter
    let frontmatter = {};
    if (filePath && fs.existsSync(filePath)) {
      const existingFile = parseMarkdownFile(filePath);
      frontmatter = existingFile.frontmatter || {};
    }

    // Write the file
    writeMarkdownFile(filePath, {
      slug,
      content: finalMarkdown,
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