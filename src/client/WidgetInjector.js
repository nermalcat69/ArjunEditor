// Widget injector script that can be added to any page
// This script detects if it's running in development and injects the edit widget

(function() {
  'use strict';
  
  // Only run in development
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production') {
    return;
  }

  // Don't inject if already injected or if we're on the editor page
  if (window.__devMdEditorWidgetInjected || 
      window.location.pathname.includes('/_edit') ||
      document.querySelector('.dev-md-editor-widget')) {
    return;
  }

  window.__devMdEditorWidgetInjected = true;

  // Try to detect the current page slug
  function detectSlug() {
    const pathname = window.location.pathname;
    
    // Remove leading slash and file extensions
    let slug = pathname.substring(1);
    
    // Remove common extensions
    slug = slug.replace(/\.(html|php|aspx?)$/i, '');
    
    // Handle index pages
    if (!slug || slug === 'index') {
      slug = 'index';
    }
    
    return slug;
  }

  // Detect editor port by trying to connect
  async function detectEditorPort() {
    const possiblePorts = [3456, 3457, 3458, 3459, 3460, 4000, 5000, 8080];
    
    for (const port of possiblePorts) {
      try {
        const response = await fetch(`http://localhost:${port}/api/_edit/ping`, {
          method: 'GET',
          mode: 'no-cors' // This will prevent CORS errors but we won't get response data
        });
        // If no error is thrown, the port is likely available
        return port;
      } catch (error) {
        // Port is not available or CORS blocked, try next
        continue;
      }
    }
    
    // Default to 3456 if detection fails
    return 3456;
  }

  // Create and inject the widget
  function createWidget(slug, editorPort) {
    // Create container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'dev-md-editor-widget';
    widgetContainer.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      transform: translateY(0);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 1;
    `;

    // Create the toolbar
    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
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
    `;

    // Create pencil icon
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('width', '16');
    icon.setAttribute('height', '16');
    icon.setAttribute('viewBox', '0 0 24 24');
    icon.setAttribute('fill', 'none');
    icon.setAttribute('stroke', 'currentColor');
    icon.setAttribute('stroke-width', '2');
    icon.setAttribute('stroke-linecap', 'round');
    icon.setAttribute('stroke-linejoin', 'round');
    icon.style.cssText = `
      flex-shrink: 0;
      opacity: 0.9;
    `;

    const pencilPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pencilPath.setAttribute('d', 'm18 2 4 4-14 14H4v-4L18 2z');
    
    const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    linePath.setAttribute('d', 'm14.5 5.5 4 4');

    icon.appendChild(pencilPath);
    icon.appendChild(linePath);

    // Create text
    const text = document.createElement('span');
    text.textContent = 'Edit';
    text.style.cssText = `
      color: rgba(255, 255, 255, 0.95);
      font-weight: 500;
      letter-spacing: 0.01em;
    `;

    // Assemble toolbar
    toolbar.appendChild(icon);
    toolbar.appendChild(text);
    widgetContainer.appendChild(toolbar);

    // Add click handler
    toolbar.addEventListener('click', () => {
      const editUrl = `http://localhost:${editorPort}/${slug}/_edit`;
      window.open(editUrl, '_blank');
    });

    // Add hover effects
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

    // Auto-hide after 15 seconds, then show minimal version
    let isVisible = true;
    setTimeout(() => {
      if (isVisible) {
        widgetContainer.style.transform = 'translateY(12px)';
        widgetContainer.style.opacity = '0.7';
        isVisible = false;
      }
    }, 15000);

    // Show on hover of page
    document.addEventListener('mousemove', () => {
      if (!isVisible) {
        widgetContainer.style.transform = 'translateY(0)';
        widgetContainer.style.opacity = '1';
        isVisible = true;
      }
    });

    // Add to page
    document.body.appendChild(widgetContainer);
  }

  // Initialize widget when DOM is ready
  function init() {
    const slug = detectSlug();
    
    detectEditorPort().then(port => {
      createWidget(slug, port);
    }).catch(() => {
      // Fallback to default port
      createWidget(slug, 3456);
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 