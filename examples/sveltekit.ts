// examples/sveltekit.ts
// Complete setup example for SvelteKit

// 1. Install the package
// pnpm add dev-md-editor

// 2. Setup in src/hooks.server.ts
import { createEditorHandle, mountMarkdownEditor } from 'dev-md-editor/sveltekit';
import { sequence } from '@sveltejs/kit/hooks';

// Mount the editor (only in development)
if (process.env.NODE_ENV !== 'production') {
  mountMarkdownEditor({
    contentDir: './content',
    editorPath: '/_edit',
    allowedExtensions: ['.md', '.mdx'],
  });
}

// Create the handle function
const editorHandle = createEditorHandle();

// Sequence with your other handles
export const handle = sequence(
  editorHandle,
  // Your other handles here...
  async ({ event, resolve }) => {
    // Your custom logic
    return resolve(event);
  }
);

// 3. Manual route setup (alternative to hooks)
// Create: src/routes/[slug]/_edit/+page.server.ts
import { createEditorPageHandler } from 'dev-md-editor/sveltekit';

export const GET = createEditorPageHandler;

// Create: src/routes/api/_edit/save/+server.ts
import { createSaveHandler } from 'dev-md-editor/sveltekit';

export const POST = createSaveHandler;

// Create: src/routes/api/_edit/fetchUrl/+server.ts
import { createFetchUrlHandler } from 'dev-md-editor/sveltekit';

export const POST = createFetchUrlHandler;

// 4. Optional: Add to your layout (src/app.html or +layout.svelte)
// This is handled automatically by the hooks, no additional setup needed

// 5. Usage
// Now you can edit any markdown file by visiting:
// http://localhost:5173/my-blog-post/_edit
// This will edit content/my-blog-post.md

// 6. Integration with your existing SvelteKit app
// Create: src/routes/blog/[slug]/+page.svelte
/*
<script lang="ts">
  import { page } from '$app/stores';
  
  export let data;
  
  // Add edit link in development
  $: editUrl = `/${$page.params.slug}/_edit`;
</script>

<article>
  <h1>{data.title}</h1>
  
  {#if process.env.NODE_ENV !== 'production'}
    <a href={editUrl} class="edit-link">✏️ Edit this post</a>
  {/if}
  
  <div class="content">
    {@html data.content}
  </div>
</article>

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