import { EditorData } from '../types';

export function generateEditorHTML(slug: string, contentDir: string, editorData: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editing: ${slug} | arjun-editor</title>
    
    <!-- Inter font from Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap" rel="stylesheet">
    
    <!-- React and ReactDOM -->
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    
    <!-- Lexical core -->
    <script src="https://unpkg.com/lexical@0.12.6/Lexical.min.js"></script>
    <script src="https://unpkg.com/@lexical/react@0.12.6/LexicalReact.min.js"></script>
    <script src="https://unpkg.com/@lexical/rich-text@0.12.6/LexicalRichText.min.js"></script>
    <script src="https://unpkg.com/@lexical/plain-text@0.12.6/LexicalPlainText.min.js"></script>
    <script src="https://unpkg.com/@lexical/list@0.12.6/LexicalList.min.js"></script>
    <script src="https://unpkg.com/@lexical/link@0.12.6/LexicalLink.min.js"></script>
    <script src="https://unpkg.com/@lexical/code@0.12.6/LexicalCode.min.js"></script>
    <script src="https://unpkg.com/@lexical/utils@0.12.6/LexicalUtils.min.js"></script>
    
    <!-- Koenig Lexical Editor -->
    <script src="https://unpkg.com/@tryghost/koenig-lexical@1.5.35/dist/koenig-lexical.umd.js"></script>
    
    <style>
        /* CSS Reset and Base Styles */
        *, *::before, *::after {
            box-sizing: border-box;
        }
        
        * {
            margin: 0;
            padding: 0;
        }
        
        html {
            font-size: 16px;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        body {
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 18px;
            line-height: 1.65;
            color: #111111;
            background: #f9f9f9;
            margin: 0;
            padding: 0;
            min-height: 100vh;
        }
        
        /* Header */
        .editor-header {
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            padding: 12px 0;
        }
        
        .header-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }
        
        .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #626d79;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.2s ease-in-out;
        }
        
        .back-link:hover {
            background: rgba(0, 0, 0, 0.05);
            color: #15171a;
        }
        
        .file-title {
            font-size: 16px;
            font-weight: 600;
            color: #15171a;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            color: #626d79;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #30cf43;
        }
        
        .status-dot.saving {
            background: #ff6b35;
            animation: pulse 1s infinite;
        }
        
        .save-time {
            font-size: 12px;
            color: #a4acb9;
            margin-left: 4px;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* Editor Container - Ghost Style */
        .editor-container {
            max-width: 720px;
            margin: 0 auto;
            padding: 40px 24px 120px;
            background: #ffffff;
            min-height: calc(100vh - 61px);
            box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
        }
        
        /* Koenig Editor Styles - Ghost Design System */
        .koenig-lexical {
            width: 100%;
            outline: none;
            font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-size: 18px;
            line-height: 1.65;
            color: #111111;
        }
        
        /* Typography */
        .koenig-lexical p {
            margin: 0 0 24px 0;
            font-size: 18px;
            line-height: 1.65;
            color: #111111;
            font-weight: 400;
        }
        
        .koenig-lexical h1 {
            font-size: 42px;
            line-height: 1.2;
            font-weight: 700;
            margin: 0 0 32px 0;
            color: #111111;
            letter-spacing: -0.02em;
        }
        
        .koenig-lexical h2 {
            font-size: 32px;
            line-height: 1.3;
            font-weight: 600;
            margin: 40px 0 24px 0;
            color: #111111;
            letter-spacing: -0.01em;
        }
        
        .koenig-lexical h3 {
            font-size: 24px;
            line-height: 1.4;
            font-weight: 600;
            margin: 32px 0 16px 0;
            color: #111111;
        }
        
        .koenig-lexical h4, 
        .koenig-lexical h5, 
        .koenig-lexical h6 {
            font-size: 20px;
            line-height: 1.5;
            font-weight: 600;
            margin: 24px 0 12px 0;
            color: #111111;
        }
        
        /* Lists */
        .koenig-lexical ul, 
        .koenig-lexical ol {
            margin: 0 0 24px 0;
            padding-left: 24px;
        }
        
        .koenig-lexical li {
            margin: 8px 0;
            font-size: 18px;
            line-height: 1.65;
            color: #111111;
        }
        
        /* Blockquotes */
        .koenig-lexical blockquote {
            margin: 32px 0;
            padding: 24px;
            border-left: 4px solid #e1e8ed;
            background: #f8f9fa;
            font-style: italic;
            border-radius: 0 4px 4px 0;
            font-size: 20px;
            line-height: 1.6;
        }
        
        /* Code */
        .koenig-lexical code {
            background: #f1f3f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 16px;
            color: #e83e8c;
        }
        
        .koenig-lexical pre {
            background: #1e1e1e;
            color: #ffffff;
            padding: 24px;
            border-radius: 8px;
            margin: 32px 0;
            overflow-x: auto;
            font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
        }
        
        /* Cards and Media */
        .koenig-lexical .kg-card {
            margin: 32px 0;
            transition: all 0.2s ease-in-out;
            border: none;
        }
        
        .koenig-lexical .kg-card:hover {
            transform: translateY(-1px);
        }
        
        .koenig-lexical .kg-image-card {
            margin: 32px 0;
        }
        
        .koenig-lexical .kg-image {
            width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        .koenig-lexical .kg-image-card-caption {
            font-size: 14px;
            color: #626d79;
            text-align: center;
            margin-top: 12px;
            font-style: italic;
        }
        
        /* Callout Card */
        .koenig-lexical .kg-callout-card {
            margin: 32px 0;
            padding: 24px;
            border-radius: 8px;
            background: #f8f9fa;
            border-left: 4px solid #30cf43;
        }
        
        /* Focus and Hover States */
        .koenig-lexical [contenteditable]:focus {
            outline: none;
        }
        
        /* Toolbar Styles */
        .koenig-lexical .kg-toolbar {
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 6px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }
        
        .koenig-lexical .kg-card:hover .kg-toolbar,
        .koenig-lexical .kg-card:focus-within .kg-toolbar {
            opacity: 1;
        }
        
        /* Plus Button */
        .koenig-lexical .kg-plus-button {
            background: #30cf43;
            color: white;
            border-radius: 50%;
            width: 32px;
            height: 32px;
            border: none;
            box-shadow: 0 2px 8px rgba(48, 207, 67, 0.3);
            transition: all 0.2s ease-in-out;
        }
        
        .koenig-lexical .kg-plus-button:hover {
            transform: scale(1.1);
            box-shadow: 0 4px 16px rgba(48, 207, 67, 0.4);
        }
        
        /* Slash Menu */
        .koenig-lexical .kg-slash-menu {
            background: #ffffff;
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
            padding: 8px;
            max-height: 320px;
            overflow-y: auto;
        }
        
        .koenig-lexical .kg-slash-menu-item {
            padding: 12px 16px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-size: 14px;
        }
        
        .koenig-lexical .kg-slash-menu-item:hover,
        .koenig-lexical .kg-slash-menu-item.selected {
            background: #f1f3f4;
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
            .header-container {
                padding: 0 16px;
            }
            
            .editor-container {
                padding: 24px 16px 80px;
                margin: 0;
                box-shadow: none;
            }
            
            .koenig-lexical h1 {
                font-size: 32px;
            }
            
            .koenig-lexical h2 {
                font-size: 24px;
            }
            
            .koenig-lexical h3 {
                font-size: 20px;
            }
            
            .koenig-lexical .kg-card {
                margin: 24px 0;
            }
        }
        
        /* Loading State */
        .editor-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 200px;
            color: #626d79;
            font-size: 14px;
        }
        
        .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid #e1e8ed;
            border-top: 2px solid #30cf43;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Development Notice */
        .dev-notice {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: rgba(0, 0, 0, 0.8);
            color: #ffffff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 1000;
        }

        /* Ensure proper paragraph spacing */
        .koenig-lexical [data-lexical-editor] p + p {
            margin-top: 24px;
        }

        /* Clean block styling */
        .koenig-lexical [data-lexical-editor] {
            outline: none;
            border: none;
        }

        /* Remove any default borders */
        .koenig-lexical * {
            border: none !important;
        }
    </style>
</head>
<body>
    <div class="editor-header">
        <div class="header-container">
            <div class="header-left">
                <a href="/" class="back-link">
                    ← Dashboard
                </a>
                <div class="file-title">${slug}</div>
            </div>
            <div class="status-indicator">
                <div class="status-dot" id="statusDot"></div>
                <span id="statusText">Live</span>
                <span class="save-time" id="saveTime"></span>
            </div>
        </div>
    </div>
    
    <div class="editor-container">
        <div class="editor-loading" id="editorLoading">
            <div class="loading-spinner"></div>
            Loading editor...
        </div>
        <div id="koenig-editor" style="display: none;"></div>
    </div>
    
    <div class="dev-notice">
        Development Mode • Auto-saving
    </div>

    <script>
        // Initialize status indicators
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const saveTime = document.getElementById('saveTime');
        const editorLoading = document.getElementById('editorLoading');
        const editorContainer = document.getElementById('koenig-editor');
        
        let editor;
        let saveTimeout;
        
        // Convert markdown to initial editor state
        function markdownToInitialState(markdown) {
            if (!markdown || markdown.trim() === '') {
                return undefined; // Let Koenig handle empty state
            }
            
            // Simple conversion for initial state
            const lines = markdown.split('\\n').filter(line => line.trim() !== '');
            
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
        }
        
        // Convert editor state to markdown
        function editorStateToMarkdown(editorState) {
            let markdown = '';
            
            function processNode(node) {
                if (node.type === 'heading') {
                    const level = parseInt(node.tag.substring(1));
                    const text = node.children?.[0]?.text || '';
                    markdown += '#'.repeat(level) + ' ' + text + '\\n\\n';
                } else if (node.type === 'paragraph') {
                    const text = node.children?.[0]?.text || '';
                    if (text.trim()) {
                        markdown += text + '\\n\\n';
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
        
        // Auto-save function
        async function autoSave() {
            if (!editor) return;
            
            try {
                statusDot.className = 'status-dot saving';
                statusText.textContent = 'Saving...';
                
                const startTime = Date.now();
                
                // Get the current editor state
                const editorState = editor.getEditorState();
                const markdown = editorStateToMarkdown(editorState.toJSON());
                
                const response = await fetch('/api/_edit/save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        slug: '${slug}',
                        markdown: markdown,
                        contentDir: '${contentDir}'
                    }),
                });
                
                const result = await response.json();
                const saveTimeMs = Date.now() - startTime;
                
                if (result.success) {
                    statusDot.className = 'status-dot';
                    statusText.textContent = 'Saved';
                    saveTime.textContent = saveTimeMs + 'ms';
                    
                    setTimeout(() => {
                        statusText.textContent = 'Live';
                        saveTime.textContent = '';
                    }, 2000);
                } else {
                    statusDot.className = 'status-dot saving';
                    statusText.textContent = 'Save failed';
                    console.error('Save failed:', result.error);
                }
            } catch (error) {
                statusDot.className = 'status-dot saving';
                statusText.textContent = 'Save error';
                console.error('Auto-save error:', error);
            }
        }
        
        // Schedule auto-save
        function scheduleAutoSave() {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(autoSave, 50); // 50ms ultra-fast
        }
        
        // Initialize Koenig editor
        function initializeEditor() {
            try {
                // Check if Koenig is loaded
                if (!window.KoenigLexical) {
                    throw new Error('Koenig Lexical not loaded');
                }
                
                const { KoenigComposer, KoenigEditor } = window.KoenigLexical;
                
                if (!KoenigComposer || !KoenigEditor) {
                    throw new Error('Koenig components not available');
                }
                
                // Prepare initial state
                const initialState = markdownToInitialState(\`${editorData.content || ''}\`);
                
                // Store current editor state for saving
                let currentEditorState = null;
                
                // Create the editor component
                const editorElement = React.createElement(KoenigComposer, {
                    initialEditorState: initialState,
                    children: React.createElement(KoenigEditor, {
                        placeholder: "Begin writing your masterpiece...",
                        className: "koenig-lexical",
                        onChange: (editorState) => {
                            currentEditorState = editorState;
                            scheduleAutoSave();
                        },
                        onError: (error) => {
                            console.error('Editor error:', error);
                        },
                        // Ghost-style configuration
                        config: {
                            namespace: 'arjun-editor',
                            theme: {
                                paragraph: 'kg-paragraph',
                                heading: {
                                    h1: 'kg-heading-h1',
                                    h2: 'kg-heading-h2', 
                                    h3: 'kg-heading-h3',
                                    h4: 'kg-heading-h4',
                                    h5: 'kg-heading-h5',
                                    h6: 'kg-heading-h6'
                                },
                                text: {
                                    bold: 'kg-bold',
                                    italic: 'kg-italic',
                                    code: 'kg-code'
                                },
                                list: {
                                    ul: 'kg-list-ul',
                                    ol: 'kg-list-ol',
                                    listitem: 'kg-list-item'
                                },
                                quote: 'kg-quote'
                            },
                            nodes: []
                        }
                    })
                });
                
                // Render the editor
                const root = ReactDOM.createRoot(editorContainer);
                root.render(editorElement);
                
                // Store editor reference for save operations
                editor = { 
                    getEditorState: () => {
                        if (currentEditorState) {
                            return {
                                toJSON: () => currentEditorState
                            };
                        }
                        
                        // Fallback: try to extract content from DOM
                        const editorDiv = document.querySelector('[data-lexical-editor]');
                        if (editorDiv) {
                            const content = editorDiv.textContent || '';
                            return {
                                toJSON: () => ({
                                    root: {
                                        children: content ? [{
                                            type: 'paragraph',
                                            children: [{
                                                type: 'text',
                                                text: content
                                            }]
                                        }] : []
                                    }
                                })
                            };
                        }
                        return { toJSON: () => ({ root: { children: [] } }) };
                    }
                };
                
                // Hide loading, show editor
                editorLoading.style.display = 'none';
                editorContainer.style.display = 'block';
                
                // Auto-focus the editor
                setTimeout(() => {
                    const editorDiv = document.querySelector('[data-lexical-editor]');
                    if (editorDiv) {
                        editorDiv.focus();
                    }
                }, 100);
                
                console.log('✅ Koenig editor initialized successfully');
                
            } catch (error) {
                console.error('Failed to initialize editor:', error);
                editorLoading.innerHTML = \`
                    <div style="color: #e74c3c; text-align: center; font-family: Inter, system-ui, sans-serif;">
                        <div style="font-size: 16px; margin-bottom: 12px;">Failed to load editor</div>
                        <div style="font-size: 14px; margin-bottom: 8px; color: #666;">Error: \${error.message}</div>
                        <div style="font-size: 12px; margin-bottom: 16px; color: #999;">
                            <div>React: \${typeof React !== 'undefined' ? '✅ Loaded' : '❌ Missing'}</div>
                            <div>ReactDOM: \${typeof ReactDOM !== 'undefined' ? '✅ Loaded' : '❌ Missing'}</div>
                            <div>KoenigLexical: \${typeof window.KoenigLexical !== 'undefined' ? '✅ Loaded' : '❌ Missing'}</div>
                            \${typeof window.KoenigLexical !== 'undefined' ? 
                                '<div>KoenigComposer: ' + (window.KoenigLexical.KoenigComposer ? '✅' : '❌') + '</div>' +
                                '<div>KoenigEditor: ' + (window.KoenigLexical.KoenigEditor ? '✅' : '❌') + '</div>'
                                : ''
                            }
                        </div>
                        <button onclick="location.reload()" style="margin-top: 16px; padding: 12px 20px; background: #30cf43; color: white; border: none; border-radius: 6px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500;">
                            Retry Loading
                        </button>
                    </div>
                \`;
            }
        }
        
        // Wait for all scripts to load
        let loadAttempts = 0;
        const maxLoadAttempts = 50;
        
        function waitForDependencies() {
            loadAttempts++;
            
            if (typeof React !== 'undefined' && 
                typeof ReactDOM !== 'undefined' && 
                typeof window.KoenigLexical !== 'undefined' &&
                window.KoenigLexical.KoenigComposer &&
                window.KoenigLexical.KoenigEditor) {
                
                setTimeout(initializeEditor, 100);
            } else if (loadAttempts < maxLoadAttempts) {
                setTimeout(waitForDependencies, 200);
            } else {
                console.error('Failed to load dependencies after', maxLoadAttempts, 'attempts');
                editorLoading.innerHTML = \`
                    <div style="color: #e74c3c; text-align: center;">
                        <div>Failed to load editor dependencies</div>
                        <div style="font-size: 12px; margin-top: 8px;">
                            React: \${typeof React !== 'undefined' ? '✅' : '❌'}<br>
                            ReactDOM: \${typeof ReactDOM !== 'undefined' ? '✅' : '❌'}<br>
                            KoenigLexical: \${typeof window.KoenigLexical !== 'undefined' ? '✅' : '❌'}
                        </div>
                        <button onclick="location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Retry
                        </button>
                    </div>
                \`;
            }
        }
        
        // Start loading check
        waitForDependencies();
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + S to force save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                autoSave();
            }
        });
        
    </script>
</body>
</html>
  `;
} 