import { EditorData } from '../types';

export function generateEditorHTML(
  slug: string, 
  contentDir: string, 
  initialData?: EditorData
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Editing ${slug} - dev-md-editor</title>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/@editorjs/editorjs@latest"></script>
    <script src="https://unpkg.com/@editorjs/header@latest"></script>
    <script src="https://unpkg.com/@editorjs/list@latest"></script>
    <script src="https://unpkg.com/@editorjs/paragraph@latest"></script>
    <script src="https://unpkg.com/@editorjs/quote@latest"></script>
    <script src="https://unpkg.com/@editorjs/code@latest"></script>
    <script src="https://unpkg.com/@editorjs/link@latest"></script>
    <style>
        body {
            margin: 0;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f8f9fa;
        }
        .codex-editor__redactor {
            padding-bottom: 200px !important;
        }
        kbd {
            background-color: #e9ecef;
            border-radius: 3px;
            border: 1px solid #adb5bd;
            box-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
            color: #495057;
            display: inline-block;
            font-size: 0.8em;
            font-weight: 700;
            line-height: 1;
            padding: 2px 4px;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        const { useState, useEffect, useRef } = React;
        
        const EditorUI = ({ initialData, slug, contentDir, apiEndpoint = '/api/_edit/save' }) => {
            const ejInstance = useRef(null);
            const [isSaving, setIsSaving] = useState(false);
            const [saveStatus, setSaveStatus] = useState('');

            useEffect(() => {
                if (!ejInstance.current) {
                    ejInstance.current = new EditorJS({
                        holder: 'editorjs',
                        tools: {
                            header: {
                                class: Header,
                                config: {
                                    placeholder: 'Enter a header',
                                    levels: [1, 2, 3, 4, 5, 6],
                                    defaultLevel: 2
                                }
                            },
                            list: {
                                class: List,
                                inlineToolbar: true,
                                config: {
                                    defaultStyle: 'unordered'
                                }
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
                                    captionPlaceholder: 'Quote\\'s author',
                                },
                            },
                            code: {
                                class: Code,
                                config: {
                                    placeholder: 'Enter code'
                                }
                            },
                            linkTool: {
                                class: LinkTool,
                                config: {
                                    endpoint: '/api/_edit/fetchUrl',
                                }
                            }
                        },
                        data: initialData || {
                            time: Date.now(),
                            blocks: [],
                            version: '2.28.2'
                        },
                        placeholder: 'Start writing your content...',
                        minHeight: 300,
                    });
                }

                return () => {
                    if (ejInstance.current && ejInstance.current.destroy) {
                        ejInstance.current.destroy();
                        ejInstance.current = null;
                    }
                };
            }, [initialData]);

            const handleSave = async () => {
                if (!ejInstance.current) return;

                setIsSaving(true);
                setSaveStatus('');

                try {
                    const outputData = await ejInstance.current.save();
                    
                    const response = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            slug,
                            content: outputData,
                            contentDir,
                        }),
                    });

                    const result = await response.json();

                    if (result.success) {
                        setSaveStatus('✅ Saved successfully!');
                    } else {
                        setSaveStatus(\`❌ Error: \${result.error || 'Unknown error'}\`);
                    }
                } catch (error) {
                    setSaveStatus(\`❌ Error: \${error.message}\`);
                } finally {
                    setIsSaving(false);
                    setTimeout(() => setSaveStatus(''), 3000);
                }
            };

            return React.createElement('div', {
                style: { 
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px'
                }
            }, [
                React.createElement('div', {
                    key: 'header',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        border: '1px solid #e9ecef'
                    }
                }, [
                    React.createElement('div', { key: 'title' }, [
                        React.createElement('h1', {
                            key: 'h1',
                            style: { margin: 0, fontSize: '1.5rem', color: '#212529' }
                        }, \`Editing: \${slug}\`),
                        React.createElement('p', {
                            key: 'p',
                            style: { margin: '5px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }
                        }, \`Content Directory: \${contentDir}\`)
                    ]),
                    React.createElement('div', {
                        key: 'controls',
                        style: { display: 'flex', alignItems: 'center', gap: '10px' }
                    }, [
                        saveStatus && React.createElement('span', {
                            key: 'status',
                            style: { 
                                fontSize: '0.9rem',
                                color: saveStatus.startsWith('✅') ? '#28a745' : '#dc3545'
                            }
                        }, saveStatus),
                        React.createElement('button', {
                            key: 'save-btn',
                            onClick: handleSave,
                            disabled: isSaving,
                            style: {
                                padding: '10px 20px',
                                backgroundColor: isSaving ? '#6c757d' : '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: isSaving ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                transition: 'background-color 0.2s'
                            }
                        }, isSaving ? 'Saving...' : 'Save')
                    ])
                ]),
                React.createElement('div', {
                    key: 'editor',
                    id: 'editorjs',
                    style: { 
                        border: '1px solid #e9ecef',
                        borderRadius: '8px',
                        padding: '20px',
                        backgroundColor: 'white',
                        minHeight: '400px'
                    }
                }),
                React.createElement('div', {
                    key: 'tips',
                    style: {
                        marginTop: '20px',
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        color: '#6c757d'
                    }
                }, [
                    React.createElement('strong', { key: 'label' }, '💡 Tips:'),
                    React.createElement('ul', {
                        key: 'list',
                        style: { margin: '5px 0', paddingLeft: '20px' }
                    }, [
                        React.createElement('li', { key: 'tip1' }, [
                            'Press ',
                            React.createElement('kbd', { key: 'kbd1' }, 'Tab'),
                            ' for inline toolbar'
                        ]),
                        React.createElement('li', { key: 'tip2' }, [
                            'Type ',
                            React.createElement('kbd', { key: 'kbd2' }, '/'),
                            ' to access block tools'
                        ]),
                        React.createElement('li', { key: 'tip3' }, [
                            'Use ',
                            React.createElement('kbd', { key: 'kbd3' }, 'Ctrl/Cmd + S'),
                            ' to save (coming soon)'
                        ])
                    ])
                ])
            ]);
        };
        
        const initialData = ${JSON.stringify(initialData || null)};
        const slug = "${slug}";
        const contentDir = "${contentDir}";
        
        ReactDOM.render(
            React.createElement(EditorUI, { initialData, slug, contentDir }),
            document.getElementById('root')
        );
    </script>
</body>
</html>`;
} 