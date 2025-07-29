// Main exports
export * from './types';
export * from './utils/file-utils';
export * from './utils/editor-converter';
export * from './utils/widget-injector';
export * from './server/api-handlers';
export * from './server/editor-page';

// React components
export { ArjunWidget } from './client/ArjunWidget';

// Framework adapters
export * as nextjs from './adapters/nextjs';
export * as sveltekit from './adapters/sveltekit';
export * as astro from './adapters/astro';

// Unified API for simple setup
import { EditorConfig } from './types';

export function integrateEditor(config: EditorConfig & { framework: 'next' | 'sveltekit' | 'astro' }) {
  switch (config.framework) {
    case 'next': {
      const { mountMarkdownEditor } = require('./adapters/nextjs');
      return mountMarkdownEditor(config);
    }
    case 'sveltekit': {
      const { mountMarkdownEditor } = require('./adapters/sveltekit');
      return mountMarkdownEditor(config);
    }
    case 'astro': {
      const { mountMarkdownEditor } = require('./adapters/astro');
      return mountMarkdownEditor(config);
    }
    default:
      throw new Error(`Unsupported framework: ${config.framework}`);
  }
}

// Helper to detect framework automatically
export function autoDetectFramework(): 'next' | 'sveltekit' | 'astro' | null {
  // Try to detect Next.js
  try {
    require.resolve('next');
    return 'next';
  } catch {
    // Next.js not found
  }

  // Try to detect SvelteKit
  try {
    require.resolve('@sveltejs/kit');
    return 'sveltekit';
  } catch {
    // SvelteKit not found
  }

  // Try to detect Astro
  try {
    require.resolve('astro');
    return 'astro';
  } catch {
    // Astro not found
  }

  return null;
}

// ONE-LINE SETUP - This is what most users will use
export function setup(contentDir: string, options?: Partial<EditorConfig>) {
  if (process.env.NODE_ENV === 'production') {
    return; // Do nothing in production
  }

  const framework = autoDetectFramework();
  
  if (!framework) {
    throw new Error('Could not detect framework. Make sure you have Next.js, SvelteKit, or Astro installed.');
  }

  const config: EditorConfig & { framework: 'next' | 'sveltekit' | 'astro' } = {
    contentDir,
    editorPath: '/_edit',
    allowedExtensions: ['.md', '.mdx'],
    framework,
    ...options,
  };

  console.log(`🚀 dev-md-editor: Auto-detected ${framework}, setting up editor...`);
  console.log(`📁 Content directory: ${config.contentDir}`);
  console.log(`🔗 Editor available at: [slug]${config.editorPath}`);
  
  return integrateEditor(config);
}

// Auto-setup function (experimental) - kept for backwards compatibility
export function autoSetup(config: Omit<EditorConfig, 'framework'>) {
  const framework = autoDetectFramework();
  
  if (!framework) {
    throw new Error('Could not detect framework. Please specify framework manually using integrateEditor()');
  }

  console.log(`🔍 Auto-detected framework: ${framework}`);
  
  return integrateEditor({
    ...config,
    framework,
  });
}

// Development utilities
export const devUtils = {
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV !== 'production',
  
  logSetup: (config: EditorConfig) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🚀 dev-md-editor setup:');
      console.log(`📁 Content directory: ${config.contentDir}`);
      console.log(`🔗 Editor path: [slug]${config.editorPath || '/_edit'}`);
      console.log(`📝 Allowed extensions: ${(config.allowedExtensions || ['.md', '.mdx']).join(', ')}`);
    }
  },
  
  getEditorUrl: (slug: string, config: EditorConfig) => {
    const editorPath = config.editorPath || '/_edit';
    return `/${slug}${editorPath}`;
  },
};

// Default configuration
export const defaultConfig: Partial<EditorConfig> = {
  editorPath: '/_edit',
  allowedExtensions: ['.md', '.mdx'],
};

// Version info
export const version = '1.0.0';

// Quick start helpers
export const quickStart = {
  nextjs: () => ({
    setup: `import { setup } from 'dev-md-editor';

setup('./content');`,
    middleware: `import { createEditorMiddleware } from 'dev-md-editor/nextjs';

const editorMiddleware = createEditorMiddleware();

export function middleware(request: NextRequest) {
  return editorMiddleware(request);
}`,
    widget: `import { injectWidgetIntoHTML } from 'dev-md-editor/nextjs';

// In your layout or page component
const htmlWithWidget = injectWidgetIntoHTML(originalHtml);`,
  }),
  
  sveltekit: () => ({
    setup: `import { setup } from 'dev-md-editor';

setup('./content');`,
    hooks: `import { createEditorHandle } from 'dev-md-editor/sveltekit';

export const handle = createEditorHandle();`,
  }),
  
  astro: () => ({
    setup: `import { setup } from 'dev-md-editor';

setup('./content');`,
    integration: `import { markdownEditor } from 'dev-md-editor/astro';

export default defineConfig({
  integrations: [
    markdownEditor({ contentDir: './content' }),
  ],
});`,
  }),
}; 