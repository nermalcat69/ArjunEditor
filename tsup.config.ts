import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
    'auto-setup': 'src/auto-setup.ts',
    'utils/widget-injector': 'src/utils/widget-injector.ts',
    'adapters/nextjs': 'src/adapters/nextjs.ts',
    'adapters/sveltekit': 'src/adapters/sveltekit.ts',
    'adapters/astro': 'src/adapters/astro.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['next', '@sveltejs/kit', 'astro', 'react', 'svelte'],
  noExternal: ['@editorjs/editorjs', 'editorjs-html'],
  // Make CLI executable
  esbuildOptions(options) {
    if (options.entryPoints && typeof options.entryPoints === 'object' && 'cli' in options.entryPoints) {
      options.banner = {
        js: '#!/usr/bin/env node',
      };
    }
  },
}); 