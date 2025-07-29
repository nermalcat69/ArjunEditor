import type { RequestHandler } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';
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
    framework: 'sveltekit',
  };

  console.log('🚀 dev-md-editor: Mounted for SvelteKit');
  console.log(`📁 Content directory: ${currentConfig.contentDir}`);
  console.log(`🔗 Editor path: [slug]${currentConfig.editorPath}`);
}

// Handle function for hooks.server.ts
export function createEditorHandle(): Handle {
  return async ({ event, resolve }) => {
    if (process.env.NODE_ENV === 'production' || !currentConfig) {
      return resolve(event);
    }

    const { url, request } = event;
    const pathname = url.pathname;

    // Handle API routes
    if (pathname === '/api/_edit/save' && request.method === 'POST') {
      return handleSaveAPI(event);
    }

    if (pathname === '/api/_edit/fetchUrl' && request.method === 'POST') {
      return handleFetchUrlAPI(event);
    }

    // Handle editor routes - pattern: /[slug]/_edit
    if (pathname.endsWith('/_edit') && request.method === 'GET') {
      const slug = pathname.slice(1, -6); // Remove leading / and trailing /_edit
      if (slug && !slug.includes('/')) {
        return handleEditorPage(slug);
      }
    }

    return resolve(event);
  };
}

// Route handlers for manual setup
export const createSaveHandler: RequestHandler = async ({ request }) => {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response(JSON.stringify({ success: false, error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleSaveAPI({ request } as any);
};

export const createFetchUrlHandler: RequestHandler = async ({ request }) => {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response(JSON.stringify({ success: 0, error: 'Not available in production' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return handleFetchUrlAPI({ request } as any);
};

export const createEditorPageHandler: RequestHandler = async ({ params }) => {
  if (process.env.NODE_ENV === 'production' || !currentConfig) {
    return new Response('Not Found', { status: 404 });
  }

  const slug = (params as { slug: string }).slug;
  return handleEditorPage(slug);
};

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

async function handleSaveAPI(event: any): Promise<Response> {
  if (!currentConfig) {
    return new Response(JSON.stringify({ success: false, error: 'Editor not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const body = await event.request.json();
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

async function handleFetchUrlAPI(event: any): Promise<Response> {
  try {
    const body = await event.request.json();
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
export function generateSvelteKitRoutes() {
  const routes = {
    'src/routes/[slug]/_edit/+page.server.ts': `import { createEditorPageHandler } from 'dev-md-editor/sveltekit';

export const GET = createEditorPageHandler;`,

    'src/routes/api/_edit/save/+server.ts': `import { createSaveHandler } from 'dev-md-editor/sveltekit';

export const POST = createSaveHandler;`,

    'src/routes/api/_edit/fetchUrl/+server.ts': `import { createFetchUrlHandler } from 'dev-md-editor/sveltekit';

export const POST = createFetchUrlHandler;`,

    'src/hooks.server.ts': `import { createEditorHandle } from 'dev-md-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

const editorHandle = createEditorHandle();

export const handle = sequence(
  editorHandle,
  // Your other handles here...
);`,
  };

  return routes;
}

// Configuration example
export const svelteKitConfig = {
  // For hooks.server.ts
  hooks: `import { createEditorHandle, mountMarkdownEditor } from 'dev-md-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

// Mount the editor
if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
  });
}

const editorHandle = createEditorHandle();

export const handle = sequence(
  editorHandle,
  // Your other handles...
);`,

  // For app.html or layout
  setup: `import { mountMarkdownEditor } from 'dev-md-editor/sveltekit';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
  });
}`
}; 