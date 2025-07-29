import { EditorData } from '../types';

export function generateEditorHTML(slug: string, contentDir: string, initialData?: EditorData): string {
  const editorData = initialData ? JSON.stringify(initialData) : 'null';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit: ${slug}</title>
    <style>
        * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
        }
        
        body { 
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;
            background: #ffffff;
            color: #1a1a1a;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        
        .header {
            background: #ffffff;
            border-bottom: 1px solid #e5e5e5;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .back-btn {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            color: #374151;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            text-decoration: none;
            font-size: 0.8125rem;
            font-family: inherit;
            transition: all 0.15s ease;
            font-weight: 400;
        }
        
        .back-btn:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
        }
        
        .title {
            font-size: 1rem;
            font-weight: 400;
            color: #1a1a1a;
            letter-spacing: -0.01em;
        }
        
        .header-right {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .save-btn {
            background: #1a1a1a;
            color: #ffffff;
            border: 1px solid #1a1a1a;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            font-size: 0.8125rem;
            font-family: inherit;
            cursor: pointer;
            transition: all 0.15s ease;
            font-weight: 400;
        }
        
        .save-btn:hover {
            background: #374151;
            border-color: #374151;
        }
        
        .save-btn:disabled {
            background: #9ca3af;
            border-color: #9ca3af;
            cursor: not-allowed;
        }
        
        .status {
            font-size: 0.8125rem;
            color: #6b7280;
            font-family: inherit;
        }
        
        .status.saving { color: #dc2626; }
        .status.saved { color: #059669; }
        
        .editor-container {
            flex: 1;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
        }
        
        #editor {
            border: 1px solid #e5e5e5;
            border-radius: 4px;
            min-height: 500px;
            background: #ffffff;
        }
        
        /* Override Editor.js styles for minimal theme */
        .ce-block__content,
        .ce-toolbar__content {
            max-width: none !important;
        }
        
        .ce-toolbar {
            background: #ffffff !important;
            border: 1px solid #e5e5e5 !important;
            border-radius: 4px !important;
        }
        
        .ce-toolbar__plus,
        .ce-toolbar__settings-btn {
            color: #374151 !important;
            background: #ffffff !important;
        }
        
        .ce-toolbar__plus:hover,
        .ce-toolbar__settings-btn:hover {
            background: #f9fafb !important;
        }
        
        .ce-popover {
            background: #ffffff !important;
            border: 1px solid #e5e5e5 !important;
            border-radius: 4px !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
        }
        
        .ce-popover__item {
            color: #374151 !important;
        }
        
        .ce-popover__item:hover {
            background: #f9fafb !important;
        }
        
        .ce-block {
            color: #1a1a1a !important;
        }
        
        .ce-paragraph {
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace !important;
            line-height: 1.6 !important;
        }
        
        .ce-header {
            font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace !important;
            font-weight: 600 !important;
        }
        
        .dev-info {
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            color: #0c4a6e;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;
            font-size: 0.875rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            <a href="/" class="back-btn">← All Posts</a>
            <h1 class="title">Edit: ${slug}</h1>
        </div>
        <div class="header-right">
            <span id="status" class="status"></span>
            <button id="save-btn" class="save-btn">Save</button>
        </div>
    </div>
    
    <div class="editor-container">
        <div class="dev-info">
            🔒 Development Mode - Changes are saved to: ${contentDir}/${slug}.md
        </div>
        <div id="editor"></div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/@editorjs/editorjs@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/header@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/list@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/paragraph@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/quote@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/code@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/link@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@editorjs/image@latest"></script>

    <script>
        const editor = new EditorJS({
            holder: 'editor',
            data: ${editorData},
            tools: {
                header: {
                    class: Header,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2
                    }
                },
                list: {
                    class: List,
                    inlineToolbar: true,
                },
                paragraph: {
                    class: Paragraph,
                    inlineToolbar: true,
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Enter a quote',
                        captionPlaceholder: 'Quote author',
                    },
                },
                code: {
                    class: CodeTool,
                },
                linkTool: {
                    class: LinkTool,
                    config: {
                        endpoint: '/api/_edit/fetch',
                    }
                },
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile: false,
                        }
                    }
                }
            },
            placeholder: 'Start writing...',
            autofocus: true,
        });

        const saveBtn = document.getElementById('save-btn');
        const status = document.getElementById('status');

        saveBtn.addEventListener('click', async () => {
            try {
                status.textContent = 'Saving...';
                status.className = 'status saving';
                saveBtn.disabled = true;

                const outputData = await editor.save();
                
                const response = await fetch('/api/_edit/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        slug: '${slug}',
                        content: outputData,
                        contentDir: '${contentDir}'
                    }),
                });

                const result = await response.json();
                
                if (result.success) {
                    status.textContent = 'Saved';
                    status.className = 'status saved';
                    setTimeout(() => {
                        status.textContent = '';
                        status.className = 'status';
                    }, 2000);
                } else {
                    throw new Error(result.error || 'Save failed');
                }
            } catch (error) {
                console.error('Save error:', error);
                status.textContent = 'Save failed';
                status.className = 'status saving';
                setTimeout(() => {
                    status.textContent = '';
                    status.className = 'status';
                }, 3000);
            } finally {
                saveBtn.disabled = false;
            }
        });

        // Auto-save on Ctrl+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                saveBtn.click();
            }
        });
    </script>
</body>
</html>
  `;
} 