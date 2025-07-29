# dev-md-editor

A plug-and-play dev-only markdown editor for Next.js, SvelteKit, and Astro apps. Add a beautiful Editor.js-powered markdown editor to your content with zero configuration.

### Next.js

```bash
pnpm add dev-md-editor
```

In your `app/layout.tsx` or `middleware.ts`:

```tsx
import { mountMarkdownEditor } from 'dev-md-editor/nextjs';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
  });
}
```

### SvelteKit

```bash
pnpm add dev-md-editor
```

In your `src/hooks.server.ts`:

```ts
import { createEditorHandle, mountMarkdownEditor } from 'dev-md-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
  });
}

export const handle = sequence(
  createEditorHandle(),
  // Your other handles...
);
```

### Astro

```bash
pnpm add dev-md-editor
```

In your `astro.config.mjs`:

```js
import { markdownEditor } from 'dev-md-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({
      contentDir: './content',
    }),
    // Your other integrations...
  ],
});
```

## 🎯 How It Works

Once installed, you can edit any markdown file by visiting:

```
http://localhost:3000/[slug]/_edit
```

For example:
- `/hello-world/_edit` - Edits `content/hello-world.md`
- `/blog/my-post/_edit` - Edits `content/blog/my-post.md`

## 📖 Usage Examples

### Basic Setup

```ts
import { mountMarkdownEditor } from 'dev-md-editor/nextjs';

mountMarkdownEditor({
  contentDir: './content',
});
```

### Custom Configuration

```ts
import { mountMarkdownEditor } from 'dev-md-editor/nextjs';

mountMarkdownEditor({
  contentDir: './posts',
  editorPath: '/admin/edit',
  allowedExtensions: ['.md', '.mdx'],
});
```

### Auto-detection (Experimental)

```ts
import { autoSetup } from 'dev-md-editor';

autoSetup({
  contentDir: './content',
});
```

## 🔧 Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `contentDir` | `string` | **Required** | Path to your markdown files |
| `editorPath` | `string` | `/_edit` | URL suffix for editor routes |
| `allowedExtensions` | `string[]` | `['.md', '.mdx']` | File extensions to handle |

## ⚙️ Manual Setup (Advanced)

> **Most users can skip this!** The Quick Start above handles everything automatically.

These manual routes are only needed if you want custom route patterns or need fine-grained control:

### Next.js Manual Routes

```tsx
// app/[slug]/_edit/page.tsx
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

const GET = createAppRouteHandler('editor');
export { GET };
```

```ts
// app/api/_edit/save/route.ts
import { createAppRouteHandler } from 'dev-md-editor/nextjs';

export const POST = createAppRouteHandler('save');
```

### SvelteKit Manual Routes

```ts
// src/routes/[slug]/_edit/+page.server.ts
import { createEditorPageHandler } from 'dev-md-editor/sveltekit';

export const GET = createEditorPageHandler;
```

### Astro Manual Routes

```ts
// src/pages/[slug]/_edit.ts
import { handleEditorEndpoint } from 'dev-md-editor/astro';

export const GET = handleEditorEndpoint;
```



## 🛡️ Security

- **Development-only**: Automatically disabled in production (`NODE_ENV === 'production'`)
- **No external access**: Only works on localhost during development
- **File system isolation**: Only accesses files within your specified `contentDir`

## 🎨 Editor Features

The editor includes these Editor.js blocks:

- **Headers** (H1-H6)
- **Paragraphs** with rich text
- **Lists** (ordered and unordered)
- **Quotes** with captions
- **Code blocks** with syntax highlighting
- **Links** with automatic URL parsing

## 📝 File Support

- Preserves frontmatter
- Supports `.md` and `.mdx` files
- Maintains file structure
- Auto-creates missing files

## 🔄 API Reference

### Core Functions

```ts
// Mount editor for specific framework
mountMarkdownEditor(config: EditorConfig): void

// Auto-detect framework and setup
autoSetup(config: Omit<EditorConfig, 'framework'>): void

// Manual framework integration
integrateEditor(config: EditorConfig & { framework: string }): void
```

### Utility Functions

```ts
// File operations
parseMarkdownFile(filePath: string): MarkdownFile
writeMarkdownFile(filePath: string, data: MarkdownFile): void
findMarkdownFile(contentDir: string, slug: string): string | null

// Content conversion
markdownToEditorJS(markdown: string): EditorData
editorJSToMarkdown(data: EditorData): string
```

## 🐛 Troubleshooting

### Editor not loading?

1. Make sure you're in development mode (`NODE_ENV !== 'production'`)
2. Check that your `contentDir` path is correct
3. Verify the URL pattern: `/[slug]/_edit`

### Can't save files?

1. Ensure your `contentDir` has write permissions
2. Check that the directory exists
3. Look for error messages in the browser console

### Framework not detected?

1. Make sure your framework dependency is installed
2. Use the specific adapter instead of auto-detection:
   ```ts
   import { mountMarkdownEditor } from 'dev-md-editor/nextjs';
   ```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit a pull request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Editor.js Documentation](https://editorjs.io/)
- [GitHub Repository](https://github.com/nermalcat69/dev-md-editor)
- [NPM Package](https://www.npmjs.com/package/dev-md-editor)

---

Made with ❤️ for developers who love markdown but need a better editing experience.