import type { AstroIntegration } from 'astro';
import { EditorConfig } from '../types';
import { handleGetMarkdown, handleSaveMarkdown, handleFetchUrl } from '../server/api-handlers';
import { generateEditorHTML } from '../server/editor-page';
import * as path from 'path';

let currentConfig: EditorConfig | null = null;

export function mountMarkdownEditor(config: EditorConfig) {
  // Only mount in development
  if (process.env.NODE_ENV === 'production') {
    console.warn('dev-md-editor: Editor is disabled in production mode');
    return;
  }

  currentConfig = {
    ...config,
    contentDir: path.resolve(config.contentDir),
    editorPath: config.editorPath || '/_edit',
    allowedExtensions: config.allowedExtensions || ['.md', '.mdx'],
    framework: 'astro',
  };

  console.log('🚀 dev-md-editor: Mounted for Astro');
  console.log(`📁 Content directory: ${currentConfig.contentDir}`);
  console.log(`🔗 Editor path: [slug]${currentConfig.editorPath}`);
}

// Astro integration
export function markdownEditor(config: EditorConfig): AstroIntegration {
  return {
    name: 'dev-md-editor',
    hooks: {
      'astro:config:setup': ({ command, injectRoute, addMiddleware }) => {
        // Only add in development
        if (command === 'dev') {
          mountMarkdownEditor(config);

          // Note: For production use, create manual routes instead of using integration
          console.log('🚀 dev-md-editor: Setting up editor routes in development mode');
          console.log('📝 Editor will be available at: [slug]/_edit');
        }
      }
    }
  };
}

// Middleware for manual setup
export function createEditorMiddleware() {
  return async function(context: any, next: () => Promise<Response>) {
    if (process.env.NODE_ENV === 'production' || !currentConfig) {
      return next();
    }

    const { request, url } = context;
    const pathname = url.pathname;

    // Handle API routes
    if (pathname === '/api/_edit/save' && request.method === 'POST') {
      return handleSaveAPI(context);
    }

    if (pathname === '/api/_edit/fetchUrl' && request.method === 'POST') {
      return handleFetchUrlAPI(context);
    }

    // Handle editor routes - pattern: /[slug]/_edit
    if (pathname.endsWith('/_edit') && request.method === 'GET') {
      const slug = pathname.slice(1, -6); // Remove leading / and trailing /_edit
      if (slug && !slug.includes('/')) {
        return handleEditorPage(slug);
      }
    }

    return next();
  };
}

// API endpoints for manual setup
export async function handleEditorEndpoint(context: any) {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response('Not Found', { status: 404 });
  }

  const slug = context.params.slug;
  return handleEditorPage(slug);
}

export async function handleSaveEndpoint(context: any) {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response(JSON.stringify({ success: false, error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleSaveAPI(context);
}

export async function handleFetchUrlEndpoint(context: any) {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response(JSON.stringify({ success: 0, error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleFetchUrlAPI(context);
}

async function handleEditorPage(slug: string): Promise<Response> {
  if (!currentConfig) {
    return new Response('Editor not configured', { status: 500 });
  }

  try {
    const result = await handleGetMarkdown(currentConfig.contentDir, slug);
    
    if (!result.success) {
      return new Response(result.error, { status: 500 });
    }

    const html = generateEditorHTML(slug, currentConfig.contentDir, result.data);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error serving editor page:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

async function handleSaveAPI(context: any): Promise<Response> {
  if (!currentConfig) {
    return new Response(JSON.stringify({ success: false, error: 'Editor not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await context.request.json();
    const result = await handleSaveMarkdown({
      slug: body.slug,
      content: body.content,
      contentDir: currentConfig.contentDir,
    });

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving markdown:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function handleFetchUrlAPI(context: any): Promise<Response> {
  try {
    const body = await context.request.json();
    const result = await handleFetchUrl(body.url);
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching URL:', error);
    return new Response(JSON.stringify({
      success: 0,
      error: 'Failed to fetch URL data',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Helper to generate route files for manual setup
export function generateAstroRoutes() {
  const routes = {
    'src/pages/[slug]/_edit.ts': `import { handleEditorEndpoint } from 'dev-md-editor/astro';

export const GET = handleEditorEndpoint;`,

    'src/pages/api/_edit/save.ts': `import { handleSaveEndpoint } from 'dev-md-editor/astro';

export const POST = handleSaveEndpoint;`,

    'src/pages/api/_edit/fetchUrl.ts': `import { handleFetchUrlEndpoint } from 'dev-md-editor/astro';

export const POST = handleFetchUrlEndpoint;`,

    'src/middleware.ts': `import { createEditorMiddleware } from 'dev-md-editor/astro';

const editorMiddleware = createEditorMiddleware();

export const onRequest = editorMiddleware;`,
  };

  return routes;
}

// Configuration example
export const astroConfig = {
  // For astro.config.mjs
  integration: `import { markdownEditor } from 'dev-md-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({
      contentDir: './content',
    }),
    // Your other integrations...
  ],
});`,

  // For manual setup
  manual: `import { mountMarkdownEditor } from 'dev-md-editor/astro';

if (import.meta.env.DEV) {
  mountMarkdownEditor({
    contentDir: './content',
  });
}`
}; 