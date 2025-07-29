import React, { useEffect, useRef, useState } from 'react';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Quote from '@editorjs/quote';
import Code from '@editorjs/code';
import LinkTool from '@editorjs/link';

const EditorUI = ({ 
  initialData, 
  slug, 
  onSave, 
  contentDir,
  apiEndpoint = '/api/_edit/save'
}) => {
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
              captionPlaceholder: 'Quote\'s author',
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
        if (onSave) onSave(outputData);
      } else {
        setSaveStatus(`❌ Error: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      setSaveStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#212529' }}>
            Editing: {slug}
          </h1>
          <p style={{ margin: '5px 0 0 0', color: '#6c757d', fontSize: '0.9rem' }}>
            Content Directory: {contentDir}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {saveStatus && (
            <span style={{ 
              fontSize: '0.9rem',
              color: saveStatus.startsWith('✅') ? '#28a745' : '#dc3545'
            }}>
              {saveStatus}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '10px 20px',
              backgroundColor: isSaving ? '#6c757d' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'background-color 0.2s'
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div 
        id="editorjs" 
        style={{ 
          border: '1px solid #e9ecef',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: 'white',
          minHeight: '400px'
        }}
      />

      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.85rem',
        color: '#6c757d'
      }}>
        <strong>💡 Tips:</strong>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Press <kbd>Tab</kbd> for inline toolbar</li>
          <li>Type <kbd>/</kbd> to access block tools</li>
          <li>Use <kbd>Ctrl/Cmd + S</kbd> to save (coming soon)</li>
        </ul>
      </div>
    </div>
  );
};

export default EditorUI; 