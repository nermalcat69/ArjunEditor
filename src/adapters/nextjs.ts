import { NextRequest, NextResponse } from 'next/server';
import { EditorConfig } from '../types';
import { handleGetMarkdown, handleSaveMarkdown, handleFetchUrl } from '../server/api-handlers';
import { generateEditorHTML } from '../server/editor-page';
import { generateWidgetMiddleware, WidgetConfig } from '../utils/widget-injector';

// Global configuration storage
let currentConfig: EditorConfig & { framework: 'next' } | null = null;

export function mountMarkdownEditor(config: EditorConfig) {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  currentConfig = {
    ...config,
    editorPath: config.editorPath || '/_edit',
    allowedExtensions: config.allowedExtensions || ['.md', '.mdx'],
    framework: 'next' as const,
  };

  console.log('🚀 dev-md-editor mounted for Next.js');
  console.log(`📁 Content directory: ${currentConfig!.contentDir}`);
  console.log(`🔗 Editor available at: [slug]${currentConfig!.editorPath}`);
}

export function createEditorMiddleware() {
  return async (request: NextRequest) => {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.next();
    }

    if (!currentConfig) {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    // Handle editor routes
    if (pathname.endsWith(currentConfig.editorPath!)) {
      const slug = pathname.replace(currentConfig.editorPath!, '').substring(1);
      
      if (!slug) {
        return new NextResponse('Invalid slug', { status: 400 });
      }

      try {
        const result = await handleGetMarkdown(currentConfig.contentDir, slug);
        
        if (!result.success) {
          return new NextResponse('Markdown file not found', { status: 404 });
        }

        const html = generateEditorHTML(slug, currentConfig.contentDir, result.data);
        return new NextResponse(html, {
          headers: { 'Content-Type': 'text/html' },
        });
      } catch (error) {
        console.error('Editor middleware error:', error);
        return new NextResponse('Internal server error', { status: 500 });
      }
    }

    // Handle API routes
    if (pathname === '/api/_edit/save' && request.method === 'POST') {
      try {
        const data = await request.json();
        const result = await handleSaveMarkdown({
          ...data,
          contentDir: currentConfig.contentDir,
        });
        
        return NextResponse.json(result);
      } catch (error) {
        console.error('Save API error:', error);
        return NextResponse.json(
          { success: false, error: (error as Error).message },
          { status: 500 }
        );
      }
    }

    if (pathname === '/api/_edit/fetch' && request.method === 'POST') {
      try {
        const { url } = await request.json();
        const result = await handleFetchUrl(url);
        
        return NextResponse.json(result);
      } catch (error) {
        console.error('Fetch API error:', error);
        return NextResponse.json(
          { success: false, error: (error as Error).message },
          { status: 500 }
        );
      }
    }

    return NextResponse.next();
  };
}

export function createAppRouteHandler(type: 'editor' | 'save' | 'fetchUrl') {
  switch (type) {
    case 'editor':
      return async (request: Request, context: { params: Promise<{ slug: string }> | { slug: string } }) => {
        if (process.env.NODE_ENV === 'production') {
          return new Response('Not found', { status: 404 });
        }

        if (!currentConfig) {
          return new Response('Editor not configured', { status: 500 });
        }

        try {
          const params = await context.params;
          const slug = params.slug;

          if (!slug) {
            return new Response('Invalid slug', { status: 400 });
          }

          const result = await handleGetMarkdown(currentConfig.contentDir, slug);
          
          if (!result.success) {
            return new Response('Markdown file not found', { status: 404 });
          }

          const html = generateEditorHTML(slug, currentConfig.contentDir, result.data);
          return new Response(html, {
            headers: { 'Content-Type': 'text/html' },
          });
        } catch (error) {
          console.error('Editor route error:', error);
          return new Response('Internal server error', { status: 500 });
        }
      };

    case 'save':
      return async (request: Request) => {
        if (process.env.NODE_ENV === 'production') {
          return Response.json({ success: false, error: 'Not available in production' }, { status: 403 });
        }

        if (!currentConfig) {
          return Response.json({ success: false, error: 'Editor not configured' }, { status: 500 });
        }

        try {
          const data = await request.json();
          const result = await handleSaveMarkdown({
            ...data,
            contentDir: currentConfig.contentDir,
          });
          
          return Response.json(result);
        } catch (error) {
          console.error('Save API error:', error);
          return Response.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
          );
        }
      };

    case 'fetchUrl':
      return async (request: Request) => {
        if (process.env.NODE_ENV === 'production') {
          return Response.json({ success: false, error: 'Not available in production' }, { status: 403 });
        }

        try {
          const { url } = await request.json();
          const result = await handleFetchUrl(url);
          
          return Response.json(result);
        } catch (error) {
          console.error('Fetch API error:', error);
          return Response.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
          );
        }
      };

    default:
      throw new Error(`Unknown route handler type: ${type}`);
  }
}

// Widget injection utilities
export function createWidgetMiddleware(widgetConfig?: Partial<WidgetConfig>) {
  const config: WidgetConfig = {
    contentDir: './content',
    editorPort: 3456,
    autoInject: true,
    ...widgetConfig,
  };

  const injectWidget = generateWidgetMiddleware(config);

  return (request: NextRequest) => {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.next();
    }

    // Skip widget injection on API routes and editor pages
    const pathname = request.nextUrl.pathname;
    if (pathname.startsWith('/api') || pathname.includes('/_edit')) {
      return NextResponse.next();
    }

    return NextResponse.next();
  };
}

export function injectWidgetIntoHTML(html: string, config?: Partial<WidgetConfig>): string {
  if (process.env.NODE_ENV === 'production') {
    return html;
  }

  const widgetConfig: WidgetConfig = {
    contentDir: './content',
    editorPort: 3456,
    autoInject: true,
    ...config,
  };

  const injectWidget = generateWidgetMiddleware(widgetConfig);
  return injectWidget(html);
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