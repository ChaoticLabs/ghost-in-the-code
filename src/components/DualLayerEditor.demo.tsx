import { useState } from 'react';
import { DualLayerEditor } from './DualLayerEditor';
import './DualLayerEditor.css';

/**
 * Demo component showing the DualLayerEditor in action
 * This demonstrates the dual-layer architecture with syntax highlighting and line numbers
 */
export const DualLayerEditorDemo = () => {
  const [code, setCode] = useState(`function greet(name) {
  // Say hello
  const message = "Hello, " + name + "!";
  return message;
}

const result = greet("World");
console.log(result);`);

  const [theme, setTheme] = useState<'dark' | 'high-contrast'>('dark');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Dual Layer Editor Demo</h1>
      <p>This editor features:</p>
      <ul>
        <li>Syntax highlighting for JavaScript</li>
        <li>Line numbers</li>
        <li>Scroll synchronization between layers</li>
        <li>Transparent textarea overlay</li>
        <li>High-contrast mode support</li>
      </ul>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => setTheme(theme === 'dark' ? 'high-contrast' : 'dark')}>
          Toggle Theme (Current: {theme})
        </button>
      </div>

      <div style={{ border: '2px solid #6B46C1', borderRadius: '8px', overflow: 'hidden' }}>
        <DualLayerEditor
          value={code}
          onChange={setCode}
          onKeyDown={handleKeyDown}
          theme={theme}
        />
      </div>

      <div style={{ marginTop: '20px' }}>
        <h3>Code Output:</h3>
        <pre style={{ 
          background: '#0D1117', 
          color: '#fff', 
          padding: '15px', 
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {code}
        </pre>
      </div>
    </div>
  );
};
