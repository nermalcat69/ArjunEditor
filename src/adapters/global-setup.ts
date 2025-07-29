import { EditorConfig } from '../types';

// Global state to track if setup has been called
let isSetupCalled = false;
let globalConfig: EditorConfig | null = null;

export function setGlobalConfig(config: EditorConfig) {
  if (isSetupCalled) {
    return; // Already setup
  }
  
  globalConfig = config;
  isSetupCalled = true;
  
  // Auto-register based on framework
  if (config.framework === 'next') {
    setupNextJS();
  } else if (config.framework === 'sveltekit') {
    setupSvelteKit();
  } else if (config.framework === 'astro') {
    setupAstro();
  }
}

export function getGlobalConfig(): EditorConfig | null {
  return globalConfig;
}

function setupNextJS() {
  // For Next.js, we need to hook into the request cycle
  // This will be handled by middleware that the user creates
  // or by our auto-middleware injection
}

function setupSvelteKit() {
  // For SvelteKit, hook into the handle function
  // This will be handled by hooks that the user creates
  // or by our auto-hooks injection
}

function setupAstro() {
  // For Astro, register with the integration system
  // This will be handled by integration that user adds
  // or by our auto-integration
} 