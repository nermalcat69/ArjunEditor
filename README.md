# arjun-editor

A localhost only markdown editor for Next.js, SvelteKit, and Astro apps.

**Integrates directly with your dev server** - no separate ports or servers needed!

## Features

- **Same-port integration** - runs on your existing dev server (e.g., localhost:3000)
- **Project-wide scanning** - finds all .md/.mdx files in your codebase
- Zero-config setup
- Beautiful Editor.js interface
- Floating edit widget on your pages
- Dev-only (disabled in production)

## Quick Setup

```bash
pnpm add -D arjun-editor
```

### Next.js Setup

Create `middleware.ts`:
```ts
import { createEditorMiddleware } from 'arjun-editor/nextjs';
import { NextResponse } from 'next/server';

const editorMiddleware = createEditorMiddleware();

export async function middleware(request) {
  if (process.env.NODE_ENV !== 'production') {
    const response = await editorMiddleware(request);
    if (response) return response;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

Add to your layout/page:
```tsx
import { mountMarkdownEditor } from 'arjun-editor/nextjs';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor();
}
```

### SvelteKit Setup

Update `src/hooks.server.ts`:
```ts
import { createEditorHandle, mountMarkdownEditor } from 'arjun-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor();
}

export const handle = sequence(createEditorHandle());
```

### Astro Setup

Update `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import { markdownEditor } from 'arjun-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor(),
  ],
});
```

## Usage

Start your dev server as usual:
```bash
# Next.js
pnpm dev

# SvelteKit  
pnpm dev

# Astro
pnpm dev
```

**That's it!** 

- Visit `http://localhost:3000/_arjun_edit` to see **all markdown files** in your project
- Visit any page to see the floating edit widget
- Click any file to edit it (e.g., `docs/api/getting-started.md`, `blog/my-post.md`)
- Everything runs on the same port as your dev server!

## API Endpoints

When integrated, these endpoints are available on your dev server:

- `GET /_arjun_edit` - Dashboard with all markdown files
- `GET /_arjun_edit/[file-path]/_edit` - Edit specific file
- `POST /api/_arjun_edit/save` - Save markdown content
- `GET /api/_arjun_edit/ping` - Check if editor is available

## Standalone CLI (Alternative)

If you prefer a separate server:

```bash
# Add script to package.json
{
  "scripts": {
    "edit:start": "arjun-editor"
  }
}

# Run standalone
pnpm run edit:start  # Runs on localhost:3456
```

## License

MIT

ps: i made this for personal usage only because not everybody likes stuff like this :c