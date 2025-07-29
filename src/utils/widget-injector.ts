import * as fs from 'fs';
import * as path from 'path';

export interface WidgetConfig {
  contentDir: string;
  editorPort?: number;
  autoInject?: boolean;
  domains?: string[];
}

// Generate the widget injection script
export function generateWidgetScript(config: WidgetConfig): string {
  const editorPort = config.editorPort || 3456;
  
  // Read the base widget injector script
  const widgetScriptPath = path.join(__dirname, '../client/WidgetInjector.js');
  let widgetScript = '';
  
  try {
    widgetScript = fs.readFileSync(widgetScriptPath, 'utf8');
  } catch (error) {
    // Fallback inline script if file not found
    widgetScript = `
(function() {
  'use strict';
  
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return;
  }

  if (window.__devMdEditorWidgetInjected || 
      window.location.pathname.includes('/_edit') ||
      document.querySelector('.dev-md-editor-widget')) {
    return;
  }

  window.__devMdEditorWidgetInjected = true;

  function detectSlug() {
    const pathname = window.location.pathname;
    let slug = pathname.substring(1);
    slug = slug.replace(/\\.(html|php|aspx?)$/i, '');
    if (!slug || slug === 'index') {
      slug = 'index';
    }
    return slug;
  }

  function createWidget(slug, editorPort) {
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'dev-md-editor-widget';
    widgetContainer.style.cssText = \`
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      transform: translateY(0);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 1;
    \`;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = \`
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 12px 20px;
      border-radius: 28px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-weight: 500;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      user-select: none;
      min-height: 20px;
    \`;

    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.style.cssText = 'flex-shrink: 0; opacity: 0.9;';

    const pencilPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pencilPath.setAttribute('d', 'm18 2 4 4-14 14H4v-4L18 2z');
    
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', 'm14.5 5.5 4 4');

    icon.appendChild(pencilPath);
    icon.appendChild(linePath);

    const text = document.createElement('span');
    text.textContent = 'Edit';
    text.style.cssText = \`
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
      letter-spacing: 0.01em;
    \`;

    toolbar.appendChild(icon);
    toolbar.appendChild(text);
    widgetContainer.appendChild(toolbar);

    toolbar.addEventListener('click', () => {
      const editUrl = \`http://localhost:\${editorPort}/\${slug}/_edit\`;
      window.open(editUrl, '_blank');
    });

    toolbar.addEventListener('mouseenter', () => {
      toolbar.style.transform = 'translateY(-2px) scale(1.02)';
      toolbar.style.background = 'rgba(0, 0, 0, 0.9)';
      toolbar.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4), 0 6px 20px rgba(0, 0, 0, 0.3)';
    });

    toolbar.addEventListener('mouseleave', () => {
      toolbar.style.transform = 'translateY(0) scale(1)';
      toolbar.style.background = 'rgba(0, 0, 0, 0.85)';
      toolbar.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)';
    });

    document.body.appendChild(widgetContainer);
  }

  function init() {
    const slug = detectSlug();
    createWidget(slug, ${editorPort});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
    `;
  }

  return widgetScript;
}

// Generate script tag for HTML injection
export function generateWidgetScriptTag(config: WidgetConfig): string {
  const script = generateWidgetScript(config);
  return `<script type="text/javascript">${script}</script>`;
}

// Generate middleware script for Next.js/Express
export function generateWidgetMiddleware(config: WidgetConfig) {
  const scriptTag = generateWidgetScriptTag(config);
  
  return (html: string): string => {
    // Only inject in development
    if (process.env.NODE_ENV === 'production') {
      return html;
    }

    // Don't inject on editor pages
    if (html.includes('dev-md-editor-widget') || html.includes('/_edit')) {
      return html;
    }

    // Try to inject before closing body tag
    if (html.includes('</body>')) {
      return html.replace('</body>', `${scriptTag}</body>`);
    }

    // Fallback: inject before closing html tag
    if (html.includes('</html>')) {
      return html.replace('</html>', `${scriptTag}</html>`);
    }

    // Fallback: append to end
    return html + scriptTag;
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