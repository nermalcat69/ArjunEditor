# arjun-editor

A **zero-fluff, Ghost-style live markdown editor** for Next.js, SvelteKit, and Astro apps.

**Just like Ghost**: Open `/my-post/_edit`, see a live editor powered by Editor.js, auto-save changes while typing, and edit any markdown file in your project.

## ✨ Features

- **Ultra-fast live editing** - 50ms auto-save with performance metrics
- **One-liner setup** - Works with any blog template 
- **Ghost-style interface** - Clean Editor.js with no distractions
- **Smart scanning** - Finds all `.md`/`.mdx` files automatically
- **⌨Keyboard shortcuts** - Ctrl+Z undo, Ctrl+Y redo built-in
- **Floating widget** - Edit button on every page
- **Dev-only** - Automatically disabled in production

## Quick Setup

```bash
pnpm add -D arjun-editor
```

## Next.js Integration (Blog Templates)

Perfect for any Next.js blog: **Vercel's blog template**, **Nextra**, **Contentlayer**, etc.

### Step 1: Create Middleware

Create `middleware.ts` in your project root:

```typescript
// middleware.ts
import { createEditorMiddleware } from 'arjun-editor/nextjs';
import { NextResponse } from 'next/server';

const editorMiddleware = createEditorMiddleware({
  contentDir: './content', // 👈 Change this to match your content folder
  // Common paths: './posts', './blog', './content', './data', './docs'
});

export async function middleware(request) {
  // Only run in development
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

### Step 2: Add the Edit Widget

Add to your root layout to show the floating edit button:

```tsx
// app/layout.tsx (App Router)
import { ArjunWidget } from 'arjun-editor';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        {/* 🎯 This adds the floating edit button */}
        <ArjunWidget />
      </body>
    </html>
  );
}
```

```tsx
// pages/_app.tsx (Pages Router)
import { ArjunWidget } from 'arjun-editor';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      {/* 🎯 This adds the floating edit button */}
      <ArjunWidget />
    </>
  );
}
```

### Step 3: That's It! 🎉

Your blog now has live editing:

- **Dashboard**: `http://localhost:3000/_arjun_edit`
- **Direct editing**: `http://localhost:3000/my-post/_edit`
- **Floating widget**: Click ✏️ on any page

---

## SvelteKit Integration (Blog Templates)

Works with **SvelteKit blogs**, **mdsvex**, **Svelte Society templates**, etc.

### Step 1: Add Server Hook

```typescript
// src/hooks.server.ts
import { createEditorHandle } from 'arjun-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(
  createEditorHandle({ 
    contentDir: './src/content', // 👈 Adjust to your content path
    // Common SvelteKit paths: './src/posts', './src/blog', './content'
  })
);
```

### Step 2: Add Widget to Layout

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { dev } from '$app/environment';
  import { ArjunWidget } from 'arjun-editor';
</script>

<main>
  <slot />
</main>

<!-- 🎯 Only show edit widget in development -->
{#if dev}
  <ArjunWidget />
{/if}
```

### Step 3: Done! ✨

Your SvelteKit blog now supports live editing with the same URLs.

---

## Astro Integration (Blog Templates)

Perfect for **Astro's blog template**, **Starlight docs**, **Astro Paper**, etc.

### Step 1: Update Astro Config

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import { markdownEditor } from 'arjun-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({ 
      contentDir: './src/content', // 👈 Match your content collection path
      // Common Astro paths: './src/content', './src/pages', './content'
    }),
    // ... your other integrations
  ],
});
```

### Step 2: Add Widget to Layout

```astro
---
// src/layouts/Layout.astro
import { ArjunWidget } from 'arjun-editor';
---

<html lang="en">
  <head>
    <!-- your head content -->
  </head>
  <body>
    <slot />
    
    <!-- 🎯 Only in development -->
    {import.meta.env.DEV && <ArjunWidget />}
  </body>
</html>
```

### Step 3: Ready to Edit! 🚀

Your Astro blog is now editable with live saving.

---

## Common Content Directory Structures

ArjunEditor automatically scans and works with any structure:

### Blog Templates
```
your-blog/
├── content/
│   ├── blog/
│   │   ├── first-post.md      # /first-post/_edit
│   │   └── second-post.mdx     # /second-post/_edit
│   └── pages/
│       └── about.md           # /about/_edit
```

### Documentation Sites
```
your-docs/
├── docs/
│   ├── getting-started.md     # /getting-started/_edit
│   ├── api/
│   │   └── reference.md       # /api/reference/_edit
│   └── guides/
│       └── deployment.md      # /guides/deployment/_edit
```

### Multi-language
```
your-site/
├── content/
│   ├── en/
│   │   └── posts/
│   │       └── hello.md       # /en/posts/hello/_edit
│   └── es/
│       └── posts/
│           └── hola.md        # /es/posts/hola/_edit
```

---

## How the Live Editing Works

### 🎯 Ultra-Fast Auto-Save

- **50ms response time** - Changes save almost instantly
- **Performance metrics** - See actual save times in the UI
- **Queue system** - Handles rapid typing without data loss
- **Visual feedback** - Live status indicator shows save progress

### ⌨️ Keyboard Shortcuts

- **Ctrl+Z** - Undo last change
- **Ctrl+Y** - Redo change  
- **Ctrl+Shift+Z** - Alternative redo
- **Ctrl+S** - Force immediate save (auto-saves already)

### 📝 Editor Tools

Rich editing with Editor.js blocks:
- **Headers** (H1-H6)
- **Paragraphs** with rich text
- **Lists** (ordered/unordered)  
- **Code blocks** with syntax highlighting
- **Quotes** and callouts
- **Links** with auto-preview
- **Images** and media support

### 📱 Smart Widget

The floating edit button appears on pages with corresponding markdown files:

- Detects current page URL
- Maps to markdown file automatically
- One-click access to editor
- Only visible in development

---

## Configuration Options

```typescript
// Advanced configuration for all frameworks
{
  contentDir: './content',           // Where your markdown files live
  mountPath: '/_arjun_edit',        // Editor dashboard path
  autoSave: true,                   // Enable ultra-fast auto-save
  saveDelay: 50,                    // Auto-save delay (50ms default)
  allowedExtensions: ['.md', '.mdx'], // File types to edit
  scanMode: 'project-wide',         // Scan entire project or contentDir only
}
```

---

## Standalone CLI (Alternative)

Don't want framework integration? Use the standalone server:

```bash
# Add script to package.json
{
  "scripts": {
    "edit": "arjun-editor"
  }
}

# Run on separate port  
pnpm run edit  # Runs on localhost:3456
```

Perfect for:
- Testing the editor
- Static site generators
- Any project with markdown files

---

## Real-World Examples

### Vercel Blog Template
```typescript
// Works out of the box with:
contentDir: './posts'  // Vercel's default structure
```

### Contentlayer Projects
```typescript  
// Works with Contentlayer blogs:
contentDir: './content'  // Standard Contentlayer setup
```

### Nextra Documentation
```typescript
// Works with Nextra docs:
contentDir: './pages'  // Nextra's pages directory
```

### Astro Content Collections
```typescript
// Works with Astro's content collections:
contentDir: './src/content'  // Astro's standard path
```

---

## Security (Built-in)

- ✅ **Dev-only** - Automatically disabled in production
- ✅ **Local-only** - Only works on localhost/127.0.0.1  
- ✅ **Path validation** - Prevents directory traversal
- ✅ **Zero production impact** - No security risks

---

## API Endpoints

When integrated, these endpoints become available:

- `GET /_arjun_edit` - Dashboard with all markdown files
- `GET /_arjun_edit/[path]/_edit` - Edit specific file
- `POST /api/_arjun_edit/save` - Ultra-fast save endpoint
- `GET /api/_arjun_edit/ping` - Widget detection

---

## Troubleshooting

### Widget Not Showing?
- Check that `<ArjunWidget />` is in your layout
- Ensure you're in development mode (`NODE_ENV !== 'production'`)
- Widget only appears on pages with corresponding markdown files

### Can't Edit Files?
- Verify `contentDir` path in your configuration
- Check that markdown files exist in the specified directory
- Ensure file extensions match `allowedExtensions` setting

### Save Not Working?
- Check browser console for errors
- Verify middleware is properly configured
- Ensure the save endpoint is accessible

---

## Why ArjunEditor?

- **Zero configuration** - Works with any blog template
- **Same-port integration** - No port juggling required  
- **Ghost-style UX** - Familiar, polished editing experience
- **Framework agnostic** - Next.js, SvelteKit, Astro support
- **Ultra-fast saves** - 50ms response time with metrics
- **Live feedback** - See exactly what's happening

---

## License

MIT

---

**Built for developers who want to edit markdown as smoothly as they write code.**