# arjun-editor

A **zero-fluff, Ghost-style live markdown editor** for any project with markdown files.

**Just like Ghost**: Run `pnpm run editor`, open `/my-post/_edit`, see a live editor powered by Editor.js, auto-save changes while typing.

## ✨ Features

- **Ultra-fast live editing** - 50ms auto-save with performance metrics
- **One command setup** - Just `pnpm run editor` and you're editing
- **Ghost-style interface** - Clean Editor.js with no distractions
- **Smart scanning** - Finds all `.md`/`.mdx` files automatically
- **⌨Keyboard shortcuts** - Ctrl+Z undo, Ctrl+Y redo built-in
- **Zero configuration** - Works with any project structure
- **Dev-only** - Perfect for development workflow

## Quick Setup

```bash
pnpm add -D arjun-editor
```

### Add Script to package.json

```json
{
  "scripts": {
    "editor": "arjun-editor"
  }
}
```

### Start Editing

```bash
pnpm run editor
```

That's it! 🎉

- **Dashboard**: `http://localhost:3456` - See all your markdown files
- **Direct editing**: `http://localhost:3456/my-post/_edit` - Edit any file
- **Auto-save**: Changes save in 50ms as you type

---

## How It Works

### 🚀 **One Command Workflow**

1. **Run the editor**: `pnpm run editor`
2. **Open any file**: Click from dashboard or go to `[filename]/_edit`
3. **Start writing**: Ultra-fast auto-save handles the rest

### 📁 **Works With Any Project Structure**

ArjunEditor automatically scans and finds markdown files:

```
your-project/
├── blog/
│   ├── post-1.md          # /blog/post-1/_edit
│   └── post-2.mdx         # /blog/post-2/_edit
├── docs/
│   ├── getting-started.md # /docs/getting-started/_edit
│   └── api.md             # /docs/api/_edit
├── content/
│   └── about.md           # /content/about/_edit
└── README.md              # /README/_edit
```

### ⚡ **Ultra-Fast Auto-Save**

- **50ms response time** - Changes save almost instantly
- **Performance metrics** - See actual save times in the UI
- **Queue system** - Handles rapid typing without data loss
- **Visual feedback** - Live status indicator shows save progress

### ⌨️ **Keyboard Shortcuts**

- **Ctrl+Z** - Undo last change
- **Ctrl+Y** - Redo change  
- **Ctrl+Shift+Z** - Alternative redo
- **Ctrl+S** - Force immediate save (auto-saves already)

---

## Popular Use Cases

### **Blog Projects**
```bash
# Works with any blog structure
your-blog/
├── posts/           # All your blog posts
├── pages/           # Static pages  
└── content/         # Any content directory
```

### **Documentation Sites**
```bash
# Perfect for docs
your-docs/
├── docs/            # Documentation files
├── guides/          # Tutorial guides
└── api/             # API documentation
```

### **Next.js Projects**
```bash
# Vercel blog template, Contentlayer, etc.
nextjs-blog/
├── posts/           # Blog posts
├── content/         # Content files
└── app/blog/        # App router blogs
```

### **Astro Projects**
```bash
# Astro blog, content collections
astro-site/
├── src/content/     # Astro content collections
└── src/pages/       # Page-based routing
```

### **SvelteKit Projects**
```bash
# SvelteKit blogs, mdsvex
sveltekit-blog/
├── src/posts/       # Blog posts
└── src/content/     # Content files
```

---

## Configuration (Optional)

Create `arjun.config.js` in your project root for custom settings:

```javascript
// arjun.config.js (optional)
export default {
  contentDir: './content',           // Scan specific directory only
  port: 3456,                       // Custom port
  allowedExtensions: ['.md', '.mdx'], // File types to edit
  autoSave: true,                   // Enable auto-save
  saveDelay: 50,                    // Auto-save delay (50ms default)
}
```

**Without config**: Scans entire project for `.md`/`.mdx` files (recommended).

---

## Editor Features

### 📝 **Rich Text Editing**

Editor.js blocks for beautiful content:
- **Headers** (H1-H6)
- **Paragraphs** with rich text formatting
- **Lists** (ordered/unordered)
- **Code blocks** with syntax highlighting
- **Quotes** and callouts
- **Links** with auto-preview
- **Images** and media support

### 💾 **Smart Saving**

- **Frontmatter preservation** - Keeps your YAML metadata intact
- **Automatic backups** - Never lose your work
- **Real-time status** - See exactly when saves happen
- **Error handling** - Clear feedback if something goes wrong

---

## Framework Integration (Advanced)

Want the editor integrated into your dev server? Use these adapters:

### Next.js Middleware

```typescript
// middleware.ts
import { createEditorMiddleware } from 'arjun-editor/nextjs';

const editorMiddleware = createEditorMiddleware();

export async function middleware(request) {
  if (process.env.NODE_ENV !== 'production') {
    const response = await editorMiddleware(request);
    if (response) return response;
  }
  return NextResponse.next();
}
```

### SvelteKit Hooks

```typescript
// src/hooks.server.ts
import { createEditorHandle } from 'arjun-editor/sveltekit';

export const handle = createEditorHandle();
```

### Astro Integration

```javascript
// astro.config.mjs
import { markdownEditor } from 'arjun-editor/astro';

export default defineConfig({
  integrations: [markdownEditor()],
});
```

---

## CLI Options

```bash
# Basic usage
pnpm run editor

# Custom port
arjun-editor --port 4000

# Specific directory
arjun-editor --content ./blog

# Scan mode
arjun-editor --scan project-wide  # (default)
arjun-editor --scan content-only
```

---

## Security

- ✅ **Development only** - Designed for local development
- ✅ **Local access only** - Binds to localhost/127.0.0.1
- ✅ **Path validation** - Prevents directory traversal attacks
- ✅ **No production risk** - Separate dev dependency

---

## API Endpoints

When running, these endpoints are available:

- `GET /` - Dashboard with all markdown files
- `GET /[path]/_edit` - Edit specific file
- `POST /api/save` - Ultra-fast save endpoint
- `GET /api/ping` - Health check

---

## Real-World Examples

### **Vercel Blog Template**
```bash
pnpm add -D arjun-editor
# Add "editor": "arjun-editor" to scripts
pnpm run editor
# Edit posts from posts/ directory
```

### **Contentlayer Project**
```bash
pnpm add -D arjun-editor
# Works with content/ directory automatically
pnpm run editor
```

### **Astro Blog**
```bash
pnpm add -D arjun-editor  
# Finds src/content/ automatically
pnpm run editor
```

### **Documentation Site**
```bash
pnpm add -D arjun-editor
# Scans docs/, guides/, any markdown
pnpm run editor
```

---

## Troubleshooting

### **No markdown files found?**
- Check that `.md` or `.mdx` files exist in your project
- Try specifying `--content ./your-content-dir`
- Ensure files aren't in `.gitignore`

### **Port already in use?**
- ArjunEditor automatically finds next available port
- Or specify custom port: `arjun-editor --port 4000`

### **Save not working?**
- Check browser console for errors
- Ensure you have write permissions to the files
- Verify the file path is correct

### **Editor not loading?**
- Check that JavaScript is enabled
- Try refreshing the page
- Look for console errors

---

## Why ArjunEditor?

- **Zero configuration** - Works with any project structure
- **One command setup** - `pnpm run editor` and you're editing
- **Ghost-style UX** - Familiar, polished editing experience
- **Ultra-fast saves** - 50ms response time with metrics
- **Framework agnostic** - Works with any tech stack
- **Live feedback** - See exactly what's happening

---

## License

MIT

---

**Built for developers who want to edit markdown as smoothly as they write code.**

---

Arjun Aditya is building Gray Cup - a company which is around tea, coffee, and softwares. You can explore more below

• [https://graycup.org](https://graycup.org)

• [https://graycup.com](https://graycup.com)

• [https://arjunaditya.xyz](https://arjunaditya.xyz)

He still writes code, designs interfaces, and somehow keeps moving forward with a cup of tea or coffee in hand [ the ritual that keeps him sane when the burnout starts creeping in ]

Buy coffee or tea:

[https://graycup.in](https://graycup.in)

Bulk coffee or tea:

[https://b2b.graycup.in](https://b2b.graycup.in)

[https://bulkgreencoffee.com](https://bulkgreencoffee.com)

[https://bulkctc.com](https://bulkctc.com)
