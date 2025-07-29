#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as url from 'url';
import * as net from 'net';
import { handleGetMarkdown, handleSaveMarkdown, handleFetchUrl } from './server/api-handlers';
import { generateEditorHTML } from './server/editor-page';
import { getAllMarkdownFiles } from './utils/file-utils';

interface CLIConfig {
  contentDir: string;
  port: number;
  host: string;
}

// Check if port is available
function isPortAvailable(port: number, host: string = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, host, () => {
      server.close(() => {
        resolve(true);
      });
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Find an available port starting from the preferred port
async function findAvailablePort(startPort: number, host: string = 'localhost'): Promise<number> {
  let port = startPort;
  const maxPort = startPort + 100; // Try up to 100 ports
  
  while (port <= maxPort) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
    port++;
  }
  
  throw new Error(`No available ports found between ${startPort} and ${maxPort}`);
}

// Parse command line arguments
function parseArgs(): Omit<CLIConfig, 'port'> & { preferredPort: number } {
  const args = process.argv.slice(2);
  let contentDir = '';
  let preferredPort = 3456;
  let host = 'localhost';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--port' || arg === '-p') {
      preferredPort = parseInt(args[++i]) || 3456;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
arjun-editor - Dev-only markdown editor

Usage: arjun-editor [directory] [options]

Options:
  -p, --port <port>     Port number (default: 3456)
  -h, --help            Show this help

Examples:
  arjun-editor                    # Auto-detect content directory
  arjun-editor ./docs             # Use specific directory
  arjun-editor -p 4000            # Use specific port
  arjun-editor ./blog -p 8080     # Directory + port

Auto-detects content in: ./content, ./src/content, ./docs, ./posts, ./blog
      `);
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      contentDir = arg; // Positional argument for content directory
    }
  }

  return { contentDir, preferredPort, host: 'localhost' };
}

// Auto-detect content directory - now scans entire project
function findAllMarkdownFiles(rootDir: string = './'): string[] {
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

// Create a simple HTTP server
function createServer(config: CLIConfig, scanMode: string = 'content-directory') {
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url || '', true);
    const pathname = parsedUrl.pathname || '/';

    // CORS headers for development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      // Ping endpoint for widget detection
      if (pathname === '/api/_edit/ping') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          port: config.port,
          contentDir: config.contentDir,
          scanMode
        }));
        return;
      }

      // Handle API routes
      if (pathname.startsWith('/api/_edit/save') && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const data = JSON.parse(body);
            // For project-wide mode, handle relative paths
            const result = await handleSaveMarkdown({
              ...data,
              contentDir: scanMode === 'project-wide' ? './' : config.contentDir
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

      if (pathname.startsWith('/api/_edit/fetch') && req.method === 'POST') {
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

      // Handle editor routes
      if (pathname.endsWith('/_edit')) {
        const filePath = pathname.replace('/_edit', '').substring(1);

        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid file path');
          return;
        }

        // For project-wide mode, treat the slug as a relative file path
        const result = await handleGetMarkdown(
          scanMode === 'project-wide' ? './' : config.contentDir, 
          filePath
        );

        if (!result.success) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Markdown file not found');
          return;
        }

        const html = generateEditorHTML(filePath, config.contentDir, result.data);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }

      // File list page (home)
      if (pathname === '/' || pathname === '/index.html') {
        const files = scanMode === 'project-wide' 
          ? findAllMarkdownFiles('./') 
          : getAllMarkdownFiles(config.contentDir);
        const html = generateFileListHTML(files, config, scanMode);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');

    } catch (error) {
      console.error('Server error:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal server error');
    }
  });

  return server;
}

// Generate file list HTML
function generateFileListHTML(files: string[], config: CLIConfig, scanMode: string = 'content-directory'): string {
  const fileList = files.map(file => {
    const editUrl = `/${file.replace(/\.(md|mdx)$/, '')}/_edit`;
    const fileName = path.basename(file, path.extname(file));
    const fileDir = path.dirname(file);
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

  const scopeDescription = scanMode === 'project-wide' 
    ? 'Scanning entire project for markdown files'
    : `Content directory: ${config.contentDir}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>arjun-editor</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
            padding: 2rem;
            min-height: 100vh;
        }
        
        .container { 
            max-width: 900px; 
            margin: 0 auto; 
        }
        
        .header {
            margin-bottom: 3rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e5e5;
        }
        
        h1 { 
            font-size: 1.5rem;
            font-weight: 400;
            color: #1a1a1a;
            margin-bottom: 0.5rem;
            letter-spacing: -0.02em;
        }
        
        .subtitle { 
            color: #6b7280;
            font-size: 0.875rem;
            font-family: inherit;
        }
        
        .scope-info {
            margin: 1rem 0;
            padding: 1rem;
            background: ${scanMode === 'project-wide' ? '#f0f9ff' : '#f9fafb'};
            border: 1px solid ${scanMode === 'project-wide' ? '#e0f2fe' : '#e5e7eb'};
            border-radius: 4px;
            font-size: 0.875rem;
            color: ${scanMode === 'project-wide' ? '#0c4a6e' : '#374151'};
        }
        
        .stats {
            margin: 1rem 0;
            padding: 1rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            font-size: 0.875rem;
            color: #374151;
        }
        
        .files { 
            background: #ffffff;
            border: 1px solid #e5e5e5;
            border-radius: 4px;
        }
        
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.25rem 1.5rem;
            border-bottom: 1px solid #f3f4f6;
            transition: background-color 0.15s ease;
        }
        
        .file-item:hover {
            background: #f9fafb;
        }
        
        .file-item:last-child { 
            border-bottom: none; 
        }
        
        .file-info {
            flex: 1;
            min-width: 0;
        }
        
        .file-name { 
            color: #1a1a1a;
            font-weight: 400;
            font-size: 1rem;
            margin-bottom: 0.25rem;
        }
        
        .file-path {
            color: #6b7280;
            font-size: 0.8125rem;
            font-family: inherit;
        }
        
        .edit-btn {
            background: #1a1a1a;
            color: #ffffff;
            padding: 0.5rem 1rem;
            border: 1px solid #1a1a1a;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.8125rem;
            font-family: inherit;
            transition: all 0.15s ease;
            font-weight: 400;
            white-space: nowrap;
        }
        
        .edit-btn:hover { 
            background: #374151;
            border-color: #374151;
        }
        
        .empty {
            padding: 4rem 2rem;
            text-align: center;
            color: #6b7280;
            font-style: italic;
        }
        
        .dev-info {
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            color: #0c4a6e;
            padding: 1rem 1.5rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            font-size: 0.875rem;
        }
        
        .footer {
            margin-top: 3rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            color: #6b7280;
            font-size: 0.8125rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="dev-info">
            🔒 Development Mode - This editor is automatically disabled in production
        </div>
        
        <div class="header">
            <h1>arjun-editor</h1>
            <p class="subtitle">Server: http://localhost:${config.port}</p>
        </div>
        
        <div class="scope-info">
            📂 ${scopeDescription}
        </div>
        
        ${files.length > 0 ? `
        <div class="stats">
            ${files.length} markdown file${files.length === 1 ? '' : 's'} found
        </div>
        ` : ''}
        
        <div class="files">
            ${files.length > 0 ? fileList : '<div class="empty">No markdown files found</div>'}
        </div>
        
        <div class="footer">
            Visit your website pages to see the floating edit widget
        </div>
    </div>
</body>
</html>
  `;
}

// Main function
async function main() {
  // STRICT production check - multiple ways to detect production
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.NETLIFY_ENV === 'production' ||
    process.env.AWS_EXECUTION_ENV ||
    process.env.HEROKU_APP_NAME ||
    process.env.CF_PAGES ||
    process.env.RENDER ||
    process.env.RAILWAY_ENVIRONMENT === 'production';

  if (isProduction) {
    console.error('🚫 SECURITY: arjun-editor is disabled in production environments');
    console.error('   This tool is for development only and should never run in production');
    process.exit(1);
  }

  const { contentDir, preferredPort, host } = parseArgs();

  // If contentDir is specified, use it; otherwise scan entire project
  let workingDir = './';
  let scanMode = 'project-wide';
  
  if (contentDir && fs.existsSync(path.resolve(contentDir))) {
    workingDir = contentDir;
    scanMode = 'content-directory';
    console.log(`📁 Using content directory: ${contentDir}`);
  } else if (contentDir) {
    console.log(`📁 Content directory "${contentDir}" not found, scanning entire project...`);
    scanMode = 'project-wide';
  } else {
    console.log(`📁 Scanning entire project for markdown files...`);
    scanMode = 'project-wide';
  }

  // Find available port
  console.log(`🔍 Finding available port starting from ${preferredPort}...`);
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`⚠️  Port ${preferredPort} was busy, using port ${port} instead`);
  }

  const config: CLIConfig = {
    contentDir: workingDir,
    port,
    host
  };

  const server = createServer(config, scanMode);

  server.listen(config.port, config.host, () => {
    console.log(`
🚀 arjun-editor is running!

📁 ${scanMode === 'project-wide' ? 'Scanning entire project' : `Content directory: ${config.contentDir}`}
🌐 Editor dashboard: http://${config.host}:${config.port}
✏️  Edit any markdown file: http://${config.host}:${config.port}/[relative-path]/_edit

💡 Visit your website pages to see the floating edit widget!
🔒 Development mode only - automatically disabled in production
Press Ctrl+C to stop
    `);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down arjun-editor...');
    server.close(() => {
      process.exit(0);
    });
  });
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection:', reason);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
}

export { main as runCLI }; 