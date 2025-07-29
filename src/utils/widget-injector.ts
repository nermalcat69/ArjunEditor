import * as fs from 'fs';
import * as path from 'path';

export interface WidgetConfig {
  port?: number;
  apiBase?: string;
  editorBase?: string;
  contentDir?: string;
}

export function generateWidgetScript(config: WidgetConfig = {}): string {
  const {
    port = 3000, // Default to same port as dev server
    apiBase = '/api/_arjun_edit',
    editorBase = '/_arjun_edit',
    contentDir = './'
  } = config;

  // Try to read the widget injector file, fallback to inline script
  try {
    const widgetPath = path.join(__dirname, '../client/WidgetInjector.js');
    if (fs.existsSync(widgetPath)) {
      let script = fs.readFileSync(widgetPath, 'utf8');
      // Replace placeholders with actual config
      script = script.replace(/ARJUN_EDITOR_PORT/g, port.toString());
      script = script.replace(/ARJUN_EDITOR_API_BASE/g, apiBase);
      script = script.replace(/ARJUN_EDITOR_BASE/g, editorBase);
      return script;
    }
  } catch (error) {
    console.warn('Could not read widget injector file, using inline script');
  }

  // Fallback inline script
  return `
(function() {
  if (typeof window === 'undefined' || window.arjunEditorInjected) return;
  window.arjunEditorInjected = true;

  // Only run in development
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
  
  // Detect current page slug for editing
  function detectSlug() {
    const path = window.location.pathname;
    // Convert URL path to potential markdown file path
    return path === '/' ? 'index' : path.replace(/^\//, '').replace(/\/$/, '');
  }

  // Check if editor is available on same port
  async function checkEditor() {
    try {
      const response = await fetch('${apiBase}/ping');
      const data = await response.json();
      return data.success && data.integrated;
    } catch {
      return false;
    }
  }

  // Create and inject the edit widget
  function createWidget() {
    const widget = document.createElement('div');
    widget.id = 'arjun-edit-widget';
    widget.innerHTML = \`
      <style>
        #arjun-edit-widget {
          position: fixed !important;
          bottom: 20px !important;
          right: 20px !important;
          z-index: 999999 !important;
          background: rgba(26, 26, 26, 0.9) !important;
          backdrop-filter: blur(10px) !important;
          color: white !important;
          padding: 8px 12px !important;
          border-radius: 20px !important;
          font-family: ui-monospace, monospace !important;
          font-size: 13px !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        #arjun-edit-widget:hover {
          background: rgba(55, 65, 81, 0.9) !important;
          transform: translateY(-2px) !important;
        }
        #arjun-edit-widget.auto-hide {
          opacity: 0.3 !important;
        }
        #arjun-edit-widget svg {
          width: 14px !important;
          height: 14px !important;
          fill: currentColor !important;
        }
      </style>
      <svg viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      Edit
    \`;

    widget.addEventListener('click', () => {
      const slug = detectSlug();
      const editUrl = \`${editorBase}/\${slug}/_edit\`;
      window.open(editUrl, '_blank');
    });

    // Auto-hide after 15 seconds, show on mouse movement
    let hideTimeout;
    function resetHideTimer() {
      clearTimeout(hideTimeout);
      widget.classList.remove('auto-hide');
      hideTimeout = setTimeout(() => {
        widget.classList.add('auto-hide');
      }, 15000);
    }

    document.addEventListener('mousemove', resetHideTimer);
    resetHideTimer();

    document.body.appendChild(widget);
  }

  // Initialize widget if editor is available
  checkEditor().then(available => {
    if (available) {
      createWidget();
    }
  });
})();
  `;
}

export function generateWidgetScriptTag(config: WidgetConfig = {}): string {
  return `<script>${generateWidgetScript(config)}</script>`;
}

export function generateWidgetMiddleware(config: WidgetConfig = {}) {
  const script = generateWidgetScript(config);
  
  return function injectWidget(html: string): string {
    // Inject the widget script before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `<script>${script}</script></body>`);
    }
    return html;
  };
}

// Generate the widget injection code for different frameworks
export const widgetInjectors = {
  nextjs: (config: WidgetConfig) => `
import { generateWidgetMiddleware } from 'dev-md-editor/utils/widget-injector';

const injectWidget = generateWidgetMiddleware(${JSON.stringify(config)});

// Use in your middleware or layout
export function injectEditWidget(html: string): string {
  return injectWidget(html);
}
  `,

  sveltekit: (config: WidgetConfig) => `
import { generateWidgetScript } from 'dev-md-editor/utils/widget-injector';

const widgetScript = generateWidgetScript(${JSON.stringify(config)});

// Add to your app.html or component
// {@html widgetScript}
  `,

  astro: (config: WidgetConfig) => `
---
import { generateWidgetScriptTag } from 'dev-md-editor/utils/widget-injector';

const widgetScript = generateWidgetScriptTag(${JSON.stringify(config)});
---

<!-- Add to your layout -->
<Fragment set:html={widgetScript} />
  `,

  vanilla: (config: WidgetConfig) => generateWidgetScriptTag(config)
}; 