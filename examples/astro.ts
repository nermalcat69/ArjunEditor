// examples/astro.ts
// Complete setup example for Astro

// 1. Install the package
// pnpm add dev-md-editor

// 2. Setup in astro.config.mjs (Integration method - recommended)
import { defineConfig } from 'astro/config';
import { markdownEditor } from 'dev-md-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({
      contentDir: './content',
      editorPath: '/_edit',
      allowedExtensions: ['.md', '.mdx'],
    }),
    // Your other integrations...
  ],
});

// 3. Alternative: Manual setup in src/middleware.ts
import { createEditorMiddleware, mountMarkdownEditor } from 'dev-md-editor/astro';

// Mount the editor
if (import.meta.env.DEV) {
  mountMarkdownEditor({
    contentDir: './content',
  });
}

const editorMiddleware = createEditorMiddleware();

export const onRequest = editorMiddleware;

// 4. Manual route setup (if not using integration)
// Create: src/pages/[slug]/_edit.ts
import { handleEditorEndpoint } from 'dev-md-editor/astro';

export const GET = handleEditorEndpoint;

// Create: src/pages/api/_edit/save.ts
import { handleSaveEndpoint } from 'dev-md-editor/astro';

export const POST = handleSaveEndpoint;

// Create: src/pages/api/_edit/fetchUrl.ts
import { handleFetchUrlEndpoint } from 'dev-md-editor/astro';

export const POST = handleFetchUrlEndpoint;

// 5. Integration with your existing Astro site
// Create: src/pages/blog/[slug].astro
/*
---
import Layout from '../layouts/Layout.astro';

const { slug } = Astro.params;
const post = await Astro.glob('../../content/*.md').find(
  (post) => post.file.split('/').pop()?.replace('.md', '') === slug
);

if (!post) {
  return Astro.redirect('/404');
}

const { Content, frontmatter } = post;
const editUrl = `/${slug}/_edit`;
---

<Layout title={frontmatter.title}>
  <article>
    <h1>{frontmatter.title}</h1>
    
    {import.meta.env.DEV && (
      <a href={editUrl} class="edit-link">✏️ Edit this post</a>
    )}
    
    <Content />
  </article>
</Layout>

<style>
  .edit-link {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #007bff;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    text-decoration: none;
    font-size: 14px;
    z-index: 1000;
  }
</style>
*/

// 6. Usage
// Now you can edit any markdown file by visiting:
// http://localhost:4321/my-blog-post/_edit
// This will edit content/my-blog-post.md

// 7. Content Collections integration
/*
// Create: src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.string().optional(),
  }),
});

export const collections = { blog };
*/ 