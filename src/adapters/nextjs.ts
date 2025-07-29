import { NextRequest, NextResponse } from 'next/server';
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
    framework: 'next',
  };

  console.log('🚀 dev-md-editor: Mounted for Next.js');
  console.log(`📁 Content directory: ${currentConfig.contentDir}`);
  console.log(`🔗 Editor path: [slug]${currentConfig.editorPath}`);
}

// Middleware function to handle editor routes
export function createEditorMiddleware() {
  return async function middleware(request: NextRequest) {
    if (process.env.NODE_ENV === 'production' || !currentConfig) {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    // Handle API routes
    if (pathname === '/api/_edit/save') {
      return handleSaveAPI(request);
    }

    if (pathname === '/api/_edit/fetchUrl') {
      return handleFetchUrlAPI(request);
    }

    // Handle editor routes - pattern: /[slug]/_edit
    if (pathname.endsWith('/_edit')) {
      const slug = pathname.slice(1, -6); // Remove leading / and trailing /_edit
      if (slug && !slug.includes('/')) {
        return handleEditorPage(slug);
      }
    }

    return NextResponse.next();
  };
}

// Route handler for App Router
export function createAppRouteHandler(type: 'editor' | 'save' | 'fetchUrl') {
  switch (type) {
    case 'editor':
      return async function GET(
        request: NextRequest,
        context: { params: Promise<{ slug: string }> }
      ) {
        if (process.env.NODE_ENV === 'production' || !currentConfig) {
          return new NextResponse('Not Found', { status: 404 });
        }

        const params = await context.params;
        return handleEditorPage(params.slug);
      };

    case 'save':
      return async function POST(request: NextRequest) {
        if (process.env.NODE_ENV === 'production' || !currentConfig) {
          return NextResponse.json({ success: false, error: 'Not available in production' });
        }

        return handleSaveAPI(request);
      };

    case 'fetchUrl':
      return async function POST(request: NextRequest) {
        if (process.env.NODE_ENV === 'production' || !currentConfig) {
          return NextResponse.json({ success: 0, error: 'Not available in production' });
        }

        return handleFetchUrlAPI(request);
      };

    default:
      throw new Error(`Unknown route handler type: ${type}`);
  }
}

async function handleEditorPage(slug: string): Promise<NextResponse> {
  if (!currentConfig) {
    return new NextResponse('Editor not configured', { status: 500 });
  }

  try {
    const result = await handleGetMarkdown(currentConfig.contentDir, slug);
    
    if (!result.success) {
      return new NextResponse(result.error, { status: 500 });
    }

    const html = generateEditorHTML(slug, currentConfig.contentDir, result.data);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error serving editor page:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function handleSaveAPI(request: NextRequest): Promise<NextResponse> {
  if (!currentConfig) {
    return NextResponse.json({ success: false, error: 'Editor not configured' });
  }

  try {
    const body = await request.json();
    const result = await handleSaveMarkdown({
      slug: body.slug,
      content: body.content,
      contentDir: currentConfig.contentDir,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving markdown:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleFetchUrlAPI(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const result = await handleFetchUrl(body.url);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching URL:', error);
    return NextResponse.json({
      success: 0,
      error: 'Failed to fetch URL data',
    });
  }
}

// Helper to generate route files for manual setup
export function generateNextJSRoutes() {
  const routes = {
    // App Router
    'app/[slug]/_edit/page.tsx': `import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export default createAppRouteHandler('editor');`,

    'app/api/_edit/save/route.ts': `import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export const POST = createAppRouteHandler('save');`,

    'app/api/_edit/fetchUrl/route.ts': `import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export const POST = createAppRouteHandler('fetchUrl');`,

    // Pages Router
    'pages/[slug]/_edit.tsx': `import { GetServerSideProps } from 'next';
import { handleGetMarkdown } from 'dev-md-editor/nextjs';

export default function EditorPage() {
  return null; // Content is served directly
}

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  // This will be handled by the package
  return { props: {} };
};`,

    'pages/api/_edit/save.ts': `import { NextApiRequest, NextApiResponse } from 'next';
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

const handler = createAppRouteHandler('save');

export default async function(req: NextApiRequest, res: NextApiResponse) {
  return handler(req as any);
};`,

    'pages/api/_edit/fetchUrl.ts': `import { NextApiRequest, NextApiResponse } from 'next';
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

const handler = createAppRouteHandler('fetchUrl');

export default async function(req: NextApiRequest, res: NextApiResponse) {
  return handler(req as any);
};`,
  };

  return routes;
}

// Configuration example
export const nextJSConfig = {
  // For middleware.ts
  middleware: `import { createEditorMiddleware } from 'dev-md-editor/nextjs';

const editorMiddleware = createEditorMiddleware();

export function middleware(request: NextRequest) {
  // Your existing middleware logic here...
  
  // Add editor middleware
  const editorResponse = await editorMiddleware(request);
  if (editorResponse && editorResponse.status !== 200) {
    return editorResponse;
  }
  
  return NextResponse.next();
}`,

  // For app layout or component
  setup: `import { mountMarkdownEditor } from 'dev-md-editor/nextjs';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
  });
}`
}; 