import { NextRequest, NextResponse } from 'next/server';
import { handleGetMarkdown, handleSaveMarkdown, handleFetchUrl } from '../server/api-handlers';
import { generateEditorHTML } from '../server/editor-page';
import { getAllMarkdownFiles } from '../utils/file-utils';
import { EditorConfig } from '../types';
import { generateWidgetScript } from '../utils/widget-injector';

// Auto-detect all markdown files in the project
function findAllMarkdownFiles(rootDir: string = './'): string[] {
  const fs = require('fs');
  const path = require('path');
  const markdownFiles: string[] = [];
  
  function scanDirectory(dir: string) {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        // Skip node_modules, .git, .next, dist, build directories
        if (stat.isDirectory() && !item.startsWith('.') && 
            !['node_modules', 'dist', 'build', '.next', 'out'].includes(item)) {
          scanDirectory(fullPath);
        } else if (stat.isFile() && /\.(md|mdx)$/i.test(item)) {
          markdownFiles.push(path.relative(rootDir, fullPath));
        }
      }
    } catch (error) {
      // Ignore permission errors or inaccessible directories
    }
  }
  
  scanDirectory(rootDir);
  return markdownFiles;
}

export function createEditorMiddleware(config: EditorConfig = { contentDir: './', framework: 'next' as const }) {
  return async function middleware(request: NextRequest) {
    // Only run in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    try {
      // API endpoints for saving markdown
      if (pathname === '/api/_arjun_edit/save' && request.method === 'POST') {
        const body = await request.json();
        const result = await handleSaveMarkdown({
          ...body,
          contentDir: './' // Always use project root for scanning
        });
        return NextResponse.json(result);
      }

      // API endpoint for fetching URLs (for link tool)
      if (pathname === '/api/_arjun_edit/fetch' && request.method === 'POST') {
        const { url: fetchUrl } = await request.json();
        const result = await handleFetchUrl(fetchUrl);
        return NextResponse.json(result);
      }

      // API endpoint for ping (widget detection)
      if (pathname === '/api/_arjun_edit/ping') {
        return NextResponse.json({
          success: true,
          port: 3000, // Same as dev server
          contentDir: './',
          integrated: true
        });
      }

      // Dashboard page - list all markdown files
      if (pathname === '/_arjun_edit') {
        const files = findAllMarkdownFiles('./');
        const html = generateDashboardHTML(files);
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Editor pages for specific files
      if (pathname.startsWith('/_arjun_edit/') && pathname.endsWith('/_edit')) {
        const filePath = pathname.replace('/_arjun_edit/', '').replace('/_edit', '');
        
        const result = await handleGetMarkdown('./', filePath);
        
        if (!result.success) {
          return new NextResponse('Markdown file not found', { status: 404 });
        }

        const html = generateEditorHTML(filePath, './', result.data);
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      }

      // Inject edit widget into HTML responses
      const response = NextResponse.next();
      
      // Check if this is an HTML response
      const accept = request.headers.get('accept');
      if (accept?.includes('text/html')) {
        // Inject widget script
        const widgetScript = generateWidgetScript({
          port: 3000, // Same as dev server
          apiBase: '/api/_arjun_edit',
          editorBase: '/_arjun_edit'
        });
        
        // Note: In practice, you'd modify the HTML response here
        // This is a simplified version - full implementation would use
        // response transformation
      }

    } catch (error) {
      console.error('Arjun Editor middleware error:', error);
    }

    return NextResponse.next();
  };
}

// Generate dashboard HTML
function generateDashboardHTML(files: string[]): string {
  const fileList = files.map(file => {
    const editUrl = `/_arjun_edit/${file.replace(/\.(md|mdx)$/, '')}/_edit`;
    const fileName = require('path').basename(file, require('path').extname(file));
    const fileDir = require('path').dirname(file);
    const displayPath = fileDir === '.' ? fileName : `${fileDir}/${fileName}`;
    
    return `
      <div class="file-item">
        <div class="file-info">
          <h3 class="file-name">${displayPath}</h3>
          <p class="file-path">${file}</p>
        </div>
        <a href="${editUrl}" class="edit-btn">Edit</a>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>arjun-editor - Project Files</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
            background: #ffffff; color: #1a1a1a; line-height: 1.6; padding: 2rem; min-height: 100vh;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .header { margin-bottom: 3rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e5e5; }
        h1 { font-size: 1.5rem; font-weight: 400; color: #1a1a1a; margin-bottom: 0.5rem; }
        .subtitle { color: #6b7280; font-size: 0.875rem; }
        .integration-info { 
            margin: 1rem 0; padding: 1rem; background: #f0f9ff; border: 1px solid #e0f2fe; 
            border-radius: 4px; font-size: 0.875rem; color: #0c4a6e;
        }
        .files { background: #ffffff; border: 1px solid #e5e5e5; border-radius: 4px; }
        .file-item { 
            display: flex; justify-content: space-between; align-items: center; 
            padding: 1.25rem 1.5rem; border-bottom: 1px solid #f3f4f6; transition: background-color 0.15s ease;
        }
        .file-item:hover { background: #f9fafb; }
        .file-item:last-child { border-bottom: none; }
        .file-info { flex: 1; min-width: 0; }
        .file-name { color: #1a1a1a; font-weight: 400; font-size: 1rem; margin-bottom: 0.25rem; }
        .file-path { color: #6b7280; font-size: 0.8125rem; }
        .edit-btn { 
            background: #1a1a1a; color: #ffffff; padding: 0.5rem 1rem; border: 1px solid #1a1a1a; 
            border-radius: 4px; text-decoration: none; font-size: 0.8125rem; transition: all 0.15s ease;
        }
        .edit-btn:hover { background: #374151; border-color: #374151; }
        .empty { padding: 4rem 2rem; text-align: center; color: #6b7280; font-style: italic; }
        .stats { 
            margin: 1rem 0; padding: 1rem; background: #f9fafb; border: 1px solid #e5e7eb; 
            border-radius: 4px; font-size: 0.875rem; color: #374151;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>arjun-editor</h1>
            <p class="subtitle">Integrated with your dev server</p>
        </div>
        
        <div class="integration-info">
            🔗 Running on the same port as your app - no separate server needed!
        </div>
        
        ${files.length > 0 ? `
        <div class="stats">
            ${files.length} markdown file${files.length === 1 ? '' : 's'} found in your project
        </div>
        ` : ''}
        
        <div class="files">
            ${files.length > 0 ? fileList : '<div class="empty">No markdown files found in this project</div>'}
        </div>
    </div>
</body>
</html>
  `;
}

// Mount the editor - sets up the middleware
export function mountMarkdownEditor(config: EditorConfig = { contentDir: './', framework: 'next' as const }) {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  console.log('✨ arjun-editor: Integrated with your Next.js dev server');
  console.log('📂 Visit http://localhost:3000/_arjun_edit to see all markdown files');
  console.log('🎯 Edit any file at http://localhost:3000/_arjun_edit/[file-path]/_edit');
} 