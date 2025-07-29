// examples/nextjs-app-router.ts
// Complete setup example for Next.js with App Router

// 1. Install the package
// pnpm add dev-md-editor

// 2. Setup in app/layout.tsx
import { mountMarkdownEditor } from 'dev-md-editor/nextjs';

// Mount the editor (only in development)
if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
    editorPath: '/_edit', // Optional: custom path
    allowedExtensions: ['.md', '.mdx'], // Optional: file extensions
  });
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// 3. Create middleware.ts (optional for advanced routing)
import { createEditorMiddleware } from 'dev-md-editor/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const editorMiddleware = createEditorMiddleware();

export function middleware(request: NextRequest) {
  // Handle editor routes first
  const editorResponse = editorMiddleware(request);
  if (editorResponse.status !== 200) {
    return editorResponse;
  }

  // Your other middleware logic here...
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

// 4. Manual route setup (alternative to middleware)
// Create: app/[slug]/_edit/page.tsx
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

const GET = createAppRouteHandler('editor');
export { GET };

// Create: app/api/_edit/save/route.ts
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export const POST = createAppRouteHandler('save');

// Create: app/api/_edit/fetchUrl/route.ts
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export const POST = createAppRouteHandler('fetchUrl');

// 5. Usage
// Now you can edit any markdown file by visiting:
// http://localhost:3000/my-blog-post/_edit
// This will edit content/my-blog-post.md 