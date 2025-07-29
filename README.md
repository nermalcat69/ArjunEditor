# arjun-editor

A localhost only markdown editor for Next.js, SvelteKit, and Astro apps.

Specifically for people who don't want to use a CMS just for editing.

## Setup

```bash
pnpm add -D arjun-editor
```

Add to `package.json`:
```json
{
  "scripts": {
    "edit:start": "arjun-editor"
  }
}
```

## Usage

Start the editor:
```bash
pnpm run edit:start
# or
pnpm start  
# or
arjun-editor
```

**That's it!** Visit your website - you'll see a floating edit widget on every page.

## Commands

```bash
arjun-editor              # Auto-detect content directory
arjun-editor ./docs       # Use specific directory  
arjun-editor -p 4000      # Use specific port
arjun-editor ./blog -p 8080   # Directory + port
```

## Alternative Setup Options

**One-line setup:**
```ts
import { setup } from 'arjun-editor';
setup('./content');
```

**Auto-setup:**
```ts
import 'arjun-editor/auto';
```

**Manual framework integration:**

### Next.js Manual Setup

Create `middleware.ts`:
```ts
import { createEditorMiddleware } from 'arjun-editor/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const editorMiddleware = createEditorMiddleware();

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV !== 'production') {
    const response = await editorMiddleware(request);
    if (response && response.status !== 200) {
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

Mount in `app/layout.tsx`:
```tsx
import { mountMarkdownEditor } from 'arjun-editor/nextjs';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({ contentDir: './content' });
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### SvelteKit Manual Setup

Create/update `src/hooks.server.ts`:
```ts
import { createEditorHandle, mountMarkdownEditor } from 'arjun-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({ contentDir: './content' });
}

export const handle = sequence(createEditorHandle());
```

### Astro Manual Setup

Update `astro.config.mjs`:
```js
import { defineConfig } from 'astro/config';
import { markdownEditor } from 'arjun-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({ contentDir: './content' }),
  ],
});
```

## License

MIT

ps: i made this for personal usage only because not everybody likes stuff like this :c