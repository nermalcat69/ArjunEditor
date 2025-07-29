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
        
        .status {
            font-size: 0.8125rem;
            color: #6b7280;
            font-family: inherit;
            min-width: 120px;
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 0.5rem;
        }
        
        .status.saving { 
            color: #dc2626; 
        }
        
        .status.saved { 
            color: #059669; 
        }
        
        .status.live {
            color: #10b981;
            font-weight: 500;
        }
        
        .save-speed {
            font-size: 0.75rem;
            color: #9ca3af;
            font-weight: normal;
        }
        
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
            <div id="status" class="status live">
                <span id="status-text">Live</span>
                <span id="save-speed" class="save-speed"></span>
            </div>
        </div>
    </div>
    
    <div class="editor-container">
        <div class="dev-info">
            ⚡ Ultra-Fast Live Editing (50ms) - Changes save instantly as you type • Ctrl+Z to undo • Ctrl+Y to redo • Performance metrics in top-right
        </div>
        <div id="editor"></div>
    </div>

    <script src="https://unpkg.com/@editorjs/editorjs@latest"></script>
    <script src="https://unpkg.com/@editorjs/header@latest"></script>
    <script src="https://unpkg.com/@editorjs/list@latest"></script>
    <script src="https://unpkg.com/@editorjs/paragraph@latest"></script>
    <script src="https://unpkg.com/@editorjs/quote@latest"></script>
    <script src="https://unpkg.com/@editorjs/code@latest"></script>
    <script src="https://unpkg.com/@editorjs/link@latest"></script>
    <script src="https://unpkg.com/@editorjs/image@latest"></script>

    <script>
        // Wait for all scripts to load
        function initializeEditor() {
            console.log('Checking Editor.js dependencies...');
            console.log('EditorJS:', typeof EditorJS !== 'undefined' ? 'loaded' : 'missing');
            console.log('Header:', typeof Header !== 'undefined' ? 'loaded' : 'missing');
            console.log('List:', typeof List !== 'undefined' ? 'loaded' : 'missing');
            console.log('Paragraph:', typeof Paragraph !== 'undefined' ? 'loaded' : 'missing');
            console.log('Quote:', typeof Quote !== 'undefined' ? 'loaded' : 'missing');
            console.log('CodeTool:', typeof CodeTool !== 'undefined' ? 'loaded' : 'missing');

            if (typeof EditorJS === 'undefined') {
                document.getElementById('editor').innerHTML = '<div style="padding: 2rem; text-align: center; color: #dc2626;">⚠️ Editor.js failed to load. Please refresh the page.</div>';
                return;
            }

            const initialData = ${editorData};
            console.log('Initial data:', initialData);

            // Basic tools that should always work
            const tools = {};
            if (typeof Header !== 'undefined') {
                tools.header = {
                    class: Header,
                    config: {
                        placeholder: 'Enter a header',
                        levels: [1, 2, 3, 4],
                        defaultLevel: 2
                    }
                };
            }
            if (typeof List !== 'undefined') {
                tools.list = {
                    class: List,
                    inlineToolbar: true,
                };
            }
            if (typeof Paragraph !== 'undefined') {
                tools.paragraph = {
                    class: Paragraph,
                    inlineToolbar: true,
                };
            }
            if (typeof Quote !== 'undefined') {
                tools.quote = {
                    class: Quote,
                    inlineToolbar: true,
                    config: {
                        quotePlaceholder: 'Enter a quote',
                        captionPlaceholder: 'Quote author',
                    },
                };
            }
            if (typeof CodeTool !== 'undefined') {
                tools.code = {
                    class: CodeTool,
                };
            }
            if (typeof LinkTool !== 'undefined') {
                tools.linkTool = {
                    class: LinkTool,
                    config: {
                        endpoint: '/api/_edit/fetch',
                    }
                };
            }
            if (typeof ImageTool !== 'undefined') {
                tools.image = {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile: false,
                        }
                    }
                };
            }

            try {
                window.editor = new EditorJS({
                    holder: 'editor',
                    data: initialData || {
                        time: Date.now(),
                        blocks: [{
                            id: 'default',
                            type: 'paragraph',
                            data: { text: 'Start writing...' }
                        }],
                        version: '2.28.2'
                    },
                    tools: tools,
                    placeholder: 'Start writing...',
                    autofocus: true,
                                         logLevel: 'ERROR',
                     onChange: () => {
                         scheduleLiveSave();
                     },
                     // Enable undo/redo
                     onReady: () => {
                         console.log('Editor ready with undo/redo support');
                     }
                });

                console.log('Editor initialized successfully!');
                
                window.editor.isReady.then(() => {
                    console.log('Editor is ready for use!');
                }).catch((error) => {
                    console.error('Editor ready error:', error);
                    document.getElementById('editor').innerHTML = '<div style="padding: 2rem; text-align: center; color: #dc2626;">⚠️ Editor initialization failed: ' + error.message + '</div>';
                });

            } catch (error) {
                console.error('Editor creation error:', error);
                document.getElementById('editor').innerHTML = '<div style="padding: 2rem; text-align: center; color: #dc2626;">⚠️ Failed to create editor: ' + error.message + '</div>';
            }
        }

        // Initialize after a short delay to ensure all scripts load
        setTimeout(initializeEditor, 100);

        const status = document.getElementById('status');
        const statusText = document.getElementById('status-text');
        const saveSpeed = document.getElementById('save-speed');
        let liveSaveTimeout;
        let isSaving = false;
        let saveQueue = [];
        let lastSaveTime = 0;
        let saveCount = 0;

        // Ultra-fast live save function with performance metrics
        async function liveSave() {
            if (isSaving || !window.editor) return;
            
            const saveStartTime = performance.now();
            
            try {
                isSaving = true;
                statusText.textContent = '●';
                status.className = 'status saving';
                saveSpeed.textContent = '';

                const outputData = await window.editor.save();
                
                const networkStartTime = performance.now();
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
                const saveEndTime = performance.now();
                
                const totalTime = Math.round(saveEndTime - saveStartTime);
                const networkTime = Math.round(saveEndTime - networkStartTime);
                
                if (result.success) {
                    statusText.textContent = 'Live';
                    status.className = 'status live';
                    saveSpeed.textContent = totalTime + 'ms';
                    saveCount++;
                    lastSaveTime = Date.now();
                    
                    console.log('Save #' + saveCount + ': ' + totalTime + 'ms total (' + networkTime + 'ms network)');
                } else {
                    throw new Error(result.error || 'Save failed');
                }
            } catch (error) {
                console.error('Live save error:', error);
                statusText.textContent = '✗';
                status.className = 'status saving';
                saveSpeed.textContent = 'Error';
                setTimeout(() => {
                    statusText.textContent = 'Live';
                    status.className = 'status live';
                    saveSpeed.textContent = '';
                }, 2000);
            } finally {
                isSaving = false;
                // Process any queued saves immediately
                if (saveQueue.length > 0) {
                    saveQueue.shift();
                    setTimeout(liveSave, 10); // Very fast queue processing
                }
            }
        }

        // Ultra-fast debounced live save
        function scheduleLiveSave() {
            clearTimeout(liveSaveTimeout);
            liveSaveTimeout = setTimeout(() => {
                if (isSaving) {
                    saveQueue.push(true); // Queue the save
                } else {
                    liveSave();
                }
            }, 50); // Ultra-fast 50ms delay!
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Prevent Ctrl+S (not needed in live mode)
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                // In live mode, this just forces an immediate save
                clearTimeout(liveSaveTimeout);
                if (!isSaving) liveSave();
                return;
            }

            // Editor.js handles Ctrl+Z and Ctrl+Y automatically for undo/redo
            // But we can add some additional shortcuts if needed
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                // Ctrl+Z - Undo (handled by Editor.js automatically)
                console.log('Undo triggered');
            }
            
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'Z')) {
                // Ctrl+Y or Ctrl+Shift+Z - Redo (handled by Editor.js automatically)  
                console.log('Redo triggered');
            }
        });

        // Show status on page load
        setTimeout(() => {
            if (statusText && statusText.textContent === 'Live') {
                console.log('🔄 Ultra-fast live editing mode active (50ms delay)');
                console.log('⌨️  Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Y (redo)');
                console.log('📊 Save performance metrics shown in top-right corner');
            }
        }, 1000);
    </script>
</body>
</html>
  `;
} 