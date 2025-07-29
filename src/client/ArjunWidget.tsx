import React from 'react';

interface ArjunWidgetProps {
  port?: number;
  apiBase?: string;
  editorBase?: string;
}

// Koenig Editor React Component for embedded use
export function KoenigEditorComponent({ 
  initialContent = '', 
  onSave, 
  placeholder = 'Begin writing your masterpiece...',
  className = 'koenig-lexical'
}: {
  initialContent?: string;
  onSave?: (markdown: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const React = (window as any).React;
  const { KoenigComposer, KoenigEditor } = (window as any).KoenigLexical || {};
  
  if (!React || !KoenigComposer || !KoenigEditor) {
    return React.createElement('div', {
      style: { 
        padding: '20px', 
        textAlign: 'center', 
        color: '#666',
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    }, 'Loading editor...');
  }

  // Convert markdown to initial Lexical state
  const markdownToLexicalState = (markdown: string) => {
    if (!markdown || markdown.trim() === '') {
      return undefined;
    }

    const lines = markdown.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      return undefined;
    }

    return {
      root: {
        children: lines.map(line => {
          if (line.startsWith('# ')) {
            return {
              children: [{
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: line.substring(2),
                type: "text",
                version: 1
              }],
              direction: "ltr",
              format: "",
              indent: 0,
              tag: "h1",
              type: "heading",
              version: 1
            };
          } else if (line.startsWith('## ')) {
            return {
              children: [{
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: line.substring(3),
                type: "text",
                version: 1
              }],
              direction: "ltr",
              format: "",
              indent: 0,
              tag: "h2",
              type: "heading",
              version: 1
            };
          } else if (line.startsWith('### ')) {
            return {
              children: [{
                detail: 0,
                format: 0,
                mode: "normal", 
                style: "",
                text: line.substring(4),
                type: "text",
                version: 1
              }],
              direction: "ltr",
              format: "",
              indent: 0,
              tag: "h3",
              type: "heading",
              version: 1
            };
          } else {
            return {
              children: [{
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: line,
                type: "text",
                version: 1
              }],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            };
          }
        }),
        direction: "ltr",
        format: "",
        indent: 0,
        type: "root",
        version: 1
      }
    };
  };

  const initialState = markdownToLexicalState(initialContent);

  return React.createElement(KoenigComposer, {
    initialEditorState: initialState,
    children: React.createElement(KoenigEditor, {
      placeholder,
      className,
      onChange: (editorState: any) => {
        if (onSave) {
          // Convert editor state back to markdown
          const markdown = lexicalStateToMarkdown(editorState);
          onSave(markdown);
        }
      },
      onError: (error: Error) => {
        console.error('Koenig editor error:', error);
      }
    })
  });
}

// Helper function to convert Lexical state to markdown
function lexicalStateToMarkdown(editorState: any): string {
  let markdown = '';
  
  function processNode(node: any): void {
    if (node.type === 'heading') {
      const level = parseInt(node.tag.substring(1));
      const text = node.children?.[0]?.text || '';
      markdown += '#'.repeat(level) + ' ' + text + '\n\n';
    } else if (node.type === 'paragraph') {
      const text = node.children?.[0]?.text || '';
      if (text.trim()) {
        markdown += text + '\n\n';
      }
    } else if (node.children) {
      node.children.forEach(processNode);
    }
  }
  
  if (editorState.root && editorState.root.children) {
    editorState.root.children.forEach(processNode);
  }
  
  return markdown.trim();
}

export function ArjunWidget({ 
  port = 3000, 
  apiBase = '/api/_arjun_edit', 
  editorBase = '/_arjun_edit' 
}: ArjunWidgetProps = {}) {
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
          padding: 12px 16px !important;
          border-radius: 24px !important;
          font-family: Inter, system-ui, -apple-system, sans-serif !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          cursor: pointer !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          opacity: 1 !important;
          transform: translateY(0) !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15) !important;
        }
        #arjun-edit-widget:hover {
          background: rgba(55, 65, 81, 0.9) !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2) !important;
        }
        #arjun-edit-widget.auto-hide {
          opacity: 0.3 !important;
        }
        #arjun-edit-widget svg {
          width: 16px !important;
          height: 16px !important;
          fill: currentColor !important;
          flex-shrink: 0 !important;
        }
      </style>
      <svg viewBox="0 0 24 24">
        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
      </svg>
      <span>Edit</span>
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