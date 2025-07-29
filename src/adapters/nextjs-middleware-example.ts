// middleware.ts - Next.js 15 compatible example
import { NextRequest, NextResponse } from 'next/server';
import { createEditorMiddleware } from 'dev-md-editor/nextjs';

// Create the editor middleware
const editorMiddleware = createEditorMiddleware();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle dev-md-editor routes in development only
  if (process.env.NODE_ENV !== 'production') {
    const editorResponse = await editorMiddleware(request);
    
    // If the editor middleware handled the request, return its response
    if (editorResponse && editorResponse.status !== 200) {
      return editorResponse;
    }
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