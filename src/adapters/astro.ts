import type { AstroIntegration } from 'astro';
import { handleGetMarkdown, handleSaveMarkdown, handleFetchUrl } from '../server/api-handlers';
import { generateEditorHTML } from '../server/editor-page';
import { EditorConfig } from '../types';

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
        
        // Skip node_modules, .git, dist, build directories
        if (stat.isDirectory() && !item.startsWith('.') && 
            !['node_modules', 'dist', 'build', '.astro', 'out'].includes(item)) {
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

export function markdownEditor(userConfig: EditorConfig = { contentDir: './', framework: 'astro' as const }): AstroIntegration {
  return {
    name: 'arjun-editor',
    hooks: {
      'astro:config:setup': ({ addMiddleware }) => {
        // Only run in development
        if (process.env.NODE_ENV === 'production') {
          return;
        }

        // Add middleware to handle editor routes
        addMiddleware({
          order: 'pre',
          entrypoint: '@arjun-editor/middleware'
        });

        console.log('✨ arjun-editor: Integrated with your Astro dev server');
        console.log('📂 Visit http://localhost:4321/_arjun_edit to see all markdown files');
        console.log('🎯 Edit any file at http://localhost:4321/_arjun_edit/[file-path]/_edit');
      },

      'astro:server:setup': ({ server }) => {
        // Only run in development
        if (process.env.NODE_ENV === 'production') {
          return;
        }

        // Add API routes
        server.middlewares.use('/api/_arjun_edit', async (req, res, next) => {
          try {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            
            // Ping endpoint
            if (url.pathname === '/api/_arjun_edit/ping') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                success: true,
                port: 4321, // Astro default dev port
                contentDir: './',
                integrated: true
              }));
              return;
            }

            // Save endpoint
            if (url.pathname === '/api/_arjun_edit/save' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', async () => {
                try {
                  const data = JSON.parse(body);
                  const result = await handleSaveMarkdown({
                    ...data,
                    contentDir: './' // Always use project root
                  });
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: false,
                    error: (error as Error).message
                  }));
                }
              });
              return;
            }

            // Fetch URL endpoint
            if (url.pathname === '/api/_arjun_edit/fetch' && req.method === 'POST') {
              let body = '';
              req.on('data', chunk => body += chunk);
              req.on('end', async () => {
                try {
                  const { url: fetchUrl } = JSON.parse(body);
                  const result = await handleFetchUrl(fetchUrl);
                  res.writeHead(200, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(result));
                } catch (error) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({
                    success: false,
                    error: (error as Error).message
                  }));
                }
              });
              return;
            }

            next();
          } catch (error) {
            console.error('Arjun Editor API error:', error);
            next();
          }
        });

        // Add editor routes
        server.middlewares.use('/_arjun_edit', async (req, res, next) => {
          try {
            const url = new URL(req.url!, `http://${req.headers.host}`);
            
            // Dashboard
            if (url.pathname === '/_arjun_edit' || url.pathname === '/_arjun_edit/') {
              const files = findAllMarkdownFiles('./');
              const html = generateDashboardHTML(files);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(html);
              return;
            }

            // Editor for specific file
            if (url.pathname.endsWith('/_edit')) {
              const filePath = url.pathname.replace('/_arjun_edit/', '').replace('/_edit', '');
              
              const result = await handleGetMarkdown('./', filePath);
              
              if (!result.success) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Markdown file not found');
                return;
              }

              const html = generateEditorHTML(filePath, './', result.data);
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(html);
              return;
            }

            next();
          } catch (error) {
            console.error('Arjun Editor route error:', error);
            next();
          }
        });
      }
    }
  };
}

// Generate dashboard HTML for Astro
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
            <p class="subtitle">Integrated with your Astro dev server</p>
        </div>
        
        <div class="integration-info">
            🔗 Running on the same port as your Astro app - no separate server needed!
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

export function mountMarkdownEditor(config: EditorConfig = { contentDir: './', framework: 'astro' as const }) {
  // Only run in development
  if (process.env.NODE_ENV === 'production') {
    return;
  }
  
  console.log('✨ arjun-editor: Use the markdownEditor() integration in astro.config.mjs');
} 