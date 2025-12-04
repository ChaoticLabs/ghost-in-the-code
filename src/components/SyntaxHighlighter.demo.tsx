import { useState } from 'react';
import { SyntaxHighlighter } from './SyntaxHighlighter';

export const SyntaxHighlighterDemo = () => {
  const [theme, setTheme] = useState<'dark' | 'high-contrast'>('dark');
  
  const sampleCode = `// Sample JavaScript code
function greet(name) {
  const message = "Hello, " + name + "!";
  const count = 42;
  
  /* Multi-line comment
     with multiple lines */
  
  if (count > 0) {
    console.log(message);
    return true;
  }
  
  return false;
}

const result = greet("Ghost");`;

  return (
    <div style={{ padding: '2rem', background: '#0D1117', minHeight: '100vh' }}>
      <h1 style={{ color: '#C792EA', marginBottom: '1rem' }}>
        SyntaxHighlighter Component Demo
      </h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'high-contrast' : 'dark')}
          style={{
            padding: '0.5rem 1rem',
            background: '#6B46C1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Toggle Theme (Current: {theme})
        </button>
      </div>

      <div style={{
        background: '#0D1117',
        border: '2px solid #6B46C1',
        borderRadius: '8px',
        padding: '1rem',
        maxWidth: '800px'
      }}>
        <SyntaxHighlighter
          code={sampleCode}
          theme={theme}
        />
      </div>

      <div style={{ marginTop: '2rem', color: '#ffffff' }}>
        <h2 style={{ color: '#00D9FF' }}>Features:</h2>
        <ul>
          <li>Keywords highlighted in purple (#C792EA)</li>
          <li>Strings highlighted in green (#A3FF00)</li>
          <li>Numbers highlighted in cyan (#00D9FF)</li>
          <li>Comments highlighted in gray (#6B7280) with italic styling</li>
          <li>Operators and punctuation in light blue (#89DDFF)</li>
          <li>High-contrast mode support with increased font weights</li>
          <li>Efficient rendering with useMemo optimization</li>
          <li>Error handling with fallback to plain text</li>
        </ul>
      </div>
    </div>
  );
};
