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
  let contentDir = './content';
  let preferredPort = 3456;
  let host = 'localhost';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--content' || arg === '-c') {
      contentDir = args[++i];
    } else if (arg === '--port' || arg === '-p') {
      preferredPort = parseInt(args[++i]) || 3456;
    } else if (arg === '--host' || arg === '-h') {
      host = args[++i];
      // Force localhost only for security
      if (host !== 'localhost' && host !== '127.0.0.1') {
        console.warn('⚠️  Security: Host forced to localhost for development safety');
        host = 'localhost';
      }
    } else if (arg === '--help') {
      console.log(`
dev-md-editor CLI

Usage: dev-md-editor [options]

Options:
  -c, --content <dir>   Content directory (default: ./content)
  -p, --port <port>     Preferred port number (default: 3456)
  --help                Show this help message

Examples:
  dev-md-editor
  dev-md-editor --content ./docs --port 4000
  dev-md-editor -c ./blog -p 8080

Note: Always runs on localhost only for security.
      `);
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      contentDir = arg;
    }
  }

  return { contentDir, preferredPort, host: 'localhost' };
}

// Auto-detect content directory
function findContentDir(): string {
  const possibleDirs = [
    './content',
    './src/content', 
    './docs',
    './posts',
    './blog',
    './articles',
    './markdown'
  ];
  
  for (const dir of possibleDirs) {
    try {
      const resolvedPath = path.resolve(dir);
      if (fs.existsSync(resolvedPath)) {
        return dir;
      }
    } catch {}
  }
  
  return './content';
}

// Create a simple HTTP server
function createServer(config: CLIConfig) {
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
          contentDir: config.contentDir 
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
            const result = await handleSaveMarkdown({
              ...data,
              contentDir: config.contentDir
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
        const slug = pathname.replace('/_edit', '').substring(1);
        
        if (!slug) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Invalid slug');
          return;
        }

        const result = await handleGetMarkdown(config.contentDir, slug);
        
        if (!result.success) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('Markdown file not found');
          return;
        }

        const html = generateEditorHTML(slug, config.contentDir, result.data);
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
      }

      // File list page (home)
      if (pathname === '/' || pathname === '/index.html') {
        const files = getAllMarkdownFiles(config.contentDir);
        const html = generateFileListHTML(files, config);
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
function generateFileListHTML(files: string[], config: CLIConfig): string {
  const fileList = files.map(file => {
    const slug = file.replace(/\.(md|mdx)$/, '').replace(/\\/g, '/');
    const editUrl = `/${slug}/_edit`;
    return `
      <div class="file-item">
        <h3>${file}</h3>
        <a href="${editUrl}" target="_blank" class="edit-btn">Edit</a>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>dev-md-editor</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #f5f5f5;
            padding: 2rem;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        h1 { color: #333; margin-bottom: 0.5rem; }
        .subtitle { color: #666; }
        .files { background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .file-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            border-bottom: 1px solid #eee;
        }
        .file-item:last-child { border-bottom: none; }
        h3 { color: #333; font-weight: 500; }
        .edit-btn {
            background: #007bff;
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.9rem;
            transition: background 0.2s;
        }
        .edit-btn:hover { background: #0056b3; }
        .empty {
            padding: 3rem 2rem;
            text-align: center;
            color: #666;
        }
        .dev-only {
            background: #fff3cd;
            color: #856404;
            padding: 1rem 2rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            border: 1px solid #ffeaa7;
        }
        .widget-info {
            background: #e7f3ff;
            color: #0066cc;
            padding: 1rem 2rem;
            border-radius: 4px;
            margin-bottom: 2rem;
            border: 1px solid #b3d9ff;
            font-size: 14px;
        }
        .widget-info code {
            background: rgba(0,0,0,0.1);
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="dev-only">
            🔒 Development Mode Only - This editor is automatically disabled in production
        </div>
        <div class="widget-info">
            💡 <strong>Pro tip:</strong> Visit your website pages while this editor is running to see the floating edit widget! 
            Add <code>&lt;script&gt;/* widget script */&lt;/script&gt;</code> to your pages for instant edit access.
        </div>
        <div class="header">
            <h1>dev-md-editor</h1>
            <p class="subtitle">Content directory: ${config.contentDir}</p>
            <p class="subtitle">Server running on port: ${config.port}</p>
        </div>
        <div class="files">
            ${files.length > 0 ? fileList : '<div class="empty">No markdown files found</div>'}
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
    console.error('🚫 SECURITY: dev-md-editor is disabled in production environments');
    console.error('   This tool is for development only and should never run in production');
    process.exit(1);
  }

  const { contentDir, preferredPort, host } = parseArgs();
  
  // Auto-detect content directory if default doesn't exist
  let finalContentDir = contentDir;
  if (contentDir === './content' && !fs.existsSync(path.resolve(contentDir))) {
    const detected = findContentDir();
    if (detected !== contentDir) {
      finalContentDir = detected;
      console.log(`📁 Auto-detected content directory: ${finalContentDir}`);
    }
  }

  // Ensure content directory exists
  if (!fs.existsSync(path.resolve(finalContentDir))) {
    console.log(`📁 Creating content directory: ${finalContentDir}`);
    fs.mkdirSync(path.resolve(finalContentDir), { recursive: true });
  }

  // Find available port
  console.log(`🔍 Finding available port starting from ${preferredPort}...`);
  const port = await findAvailablePort(preferredPort);
  
  if (port !== preferredPort) {
    console.log(`⚠️  Port ${preferredPort} was busy, using port ${port} instead`);
  }

  const config: CLIConfig = {
    contentDir: finalContentDir,
    port,
    host
  };

  const server = createServer(config);
  
  server.listen(config.port, config.host, () => {
    console.log(`
🚀 dev-md-editor is running!

📁 Content directory: ${config.contentDir}
🌐 Server: http://${config.host}:${config.port}
✏️  Edit files: http://${config.host}:${config.port}/[slug]/_edit
🎯 Widget detection: http://${config.host}:${config.port}/api/_edit/ping

Examples:
  http://${config.host}:${config.port}/hello-world/_edit
  http://${config.host}:${config.port}/blog/my-post/_edit

💡 Visit your website pages to see the floating edit widget!
🔒 Development mode only - automatically disabled in production
Press Ctrl+C to stop
    `);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down dev-md-editor...');
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