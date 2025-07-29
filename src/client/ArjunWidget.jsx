import React from 'react';

export function ArjunWidget({ 
  port = 3000, 
  apiBase = '/api/_arjun_edit', 
  editorBase = '/_arjun_edit' 
} = {}) {
  // Only render in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const widgetScript = `
(function() {
  if (typeof window === 'undefined' || window.arjunEditorInjected) return;
  window.arjunEditorInjected = true;

  // Only run in development
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') return;
  
  // Detect current page slug for editing
  function detectSlug() {
    const path = window.location.pathname;
    
    // Handle different Next.js app structures
    if (path === '/') {
      return 'app/page';
    }
    
    // Handle blog posts in app/blog/posts/ structure
    if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      if (slug) {
        return 'app/blog/posts/' + slug;
      } else {
        return 'app/blog/page';
      }
    }
    
    // Convert URL path to potential markdown file path
    const cleanPath = path.replace(/^\//, '').replace(/\/$/, '');
    return cleanPath || 'app/page';
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

  return (
    <script 
      dangerouslySetInnerHTML={{ __html: widgetScript }}
    />
  );
}

export default ArjunWidget; 