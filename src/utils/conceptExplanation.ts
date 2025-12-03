/**
 * Utility functions for opening concept explanations in new tabs
 */

import type { LevelIntroduction } from '../engine/types';

interface CodeExample {
  type: 'demo' | 'comparison';
  title?: string;
  code?: string[];
  examples?: Array<{
    type: 'before' | 'after';
    title: string;
    code: string[];
  }>;
}

interface ConceptWithExample {
  name: string;
  explanation: string;
  codeExample?: CodeExample;
}

interface ConceptExplanationData {
  levelId: string;
  title: string;
  description: string;
  concepts: ConceptWithExample[];
  readyMessage: string;
}

/**
 * Loads concept explanation data for a specific level
 */
async function loadConceptExplanation(levelType: string): Promise<ConceptExplanationData | null> {
  try {
    let conceptData: any;
    
    switch (levelType) {
      case 'functions':
        conceptData = (await import('../data/conceptExplanations/functions.json')).default;
        break;
      case 'loops':
        conceptData = (await import('../data/conceptExplanations/loops.json')).default;
        break;
      case 'conditionals':
        conceptData = (await import('../data/conceptExplanations/conditionals.json')).default;
        break;
      case 'arrays':
        conceptData = (await import('../data/conceptExplanations/arrays.json')).default;
        break;
      case 'logic':
        conceptData = (await import('../data/conceptExplanations/logic.json')).default;
        break;
      case 'cybersecurity':
        conceptData = (await import('../data/conceptExplanations/cybersecurity.json')).default;
        break;
      default:
        console.warn(`No concept explanation found for level: ${levelType}`);
        return null;
    }
    
    return conceptData as ConceptExplanationData;
  } catch (error) {
    console.error(`Failed to load concept explanation for ${levelType}:`, error);
    return null;
  }
}

/**
 * Formats code lines with syntax highlighting
 */
function formatCodeLine(line: string): string {
  return line
    .replace(/\/\/(.*)/g, '<span class="code-comment">//$1</span>')
    .replace(/\b(function|let|const|var|if|else|for|while|return|true|false)\b/g, '<span class="code-keyword">$1</span>')
    .replace(/'([^']*)'/g, '<span class="code-string">\'$1\'</span>')
    .replace(/\b([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, '<span class="code-function">$1</span>(');
}

/**
 * Generates HTML for a code example
 */
function generateCodeExampleHTML(codeExample: CodeExample): string {
  if (codeExample.type === 'demo') {
    return `
      <div class="code-example code-example--demo">
        <h4>${codeExample.title}</h4>
        <div class="code-container">
          ${codeExample.code?.map(line => 
            `<div class="code-line">${formatCodeLine(line)}</div>`
          ).join('') || ''}
        </div>
      </div>
    `;
  } else if (codeExample.type === 'comparison' && codeExample.examples) {
    return codeExample.examples.map(example => `
      <div class="code-example code-example--${example.type}">
        <h4>${example.title}</h4>
        <div class="code-container">
          ${example.code.map(line => 
            `<div class="code-line">${formatCodeLine(line)}</div>`
          ).join('')}
        </div>
      </div>
    `).join('');
  }
  return '';
}

/**
 * Generates HTML content for the concept explanation page using dynamic data
 */
function generateConceptHTML(conceptData: ConceptExplanationData, levelName: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conceptData.title} - Ghost in The Code</title>
    <style>
        /* Import Jolly Lodger font for headers */
        @import url('https://fonts.googleapis.com/css2?family=Jolly+Lodger&display=swap');

        /* CSS Variables matching the main site */
        :root {
          --color-primary: #A3FF00;
          --color-secondary: #00D9FF;
          --color-accent: #FF9500;
          --color-purple: #6B46C1;
          --color-dark-bg: #1A1F2E;
          --color-darker-bg: #2D1B4E;
          --color-text-light: #FFFFFF;
          --color-text-muted: rgba(255, 255, 255, 0.7);
          --color-border: rgba(107, 70, 193, 0.3);
          
          font-family: Avenir, 'Avenir Next', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          font-weight: 400;
          color-scheme: dark;
          color: var(--color-text-light);
          background-color: var(--color-dark-bg);
        }

        body {
          margin: 0;
          padding: 0;
          font-family: Avenir, 'Avenir Next', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        /* Header styles matching the main site */
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Jolly Lodger', cursive;
          font-weight: 400;
          line-height: 1.2;
          letter-spacing: 0.05em;
        }

        h1 {
          font-size: clamp(3rem, 6vw, 3.5rem);
        }

        h2 {
          font-size: clamp(2rem, 4.5vw, 2.5rem);
        }

        h3 {
          font-size: clamp(1.5rem, 3.5vw, 2rem);
        }

        h4 {
          font-size: clamp(1.25rem, 3vw, 1.5rem);
        }

        /* Code styling matching the game's CodeEditor */
        .code-container {
          background: #0D1117;
          border: 2px solid var(--color-purple);
          border-radius: 6px;
          padding: 0.75rem;
          font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
          font-size: 0.9rem;
          line-height: 1.4;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .code-example {
          margin: 1.5rem 0;
        }

        .code-example h4 {
          color: var(--color-secondary);
          margin-bottom: 0.5rem;
          font-family: Avenir, 'Avenir Next', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .code-example h4::before {
          font-size: 1rem;
        }

        .code-example--before h4::before {
          content: "❌";
        }

        .code-example--after h4::before {
          content: "✅";
        }

        .code-example--demo h4::before {
          content: "💻";
        }

        .code-line {
          color: var(--color-text-light);
        }

        .code-comment {
          color: #7C7C7C;
          font-style: italic;
        }

        .code-keyword {
          color: #FF79C6;
        }

        .code-string {
          color: #F1FA8C;
        }

        .code-function {
          color: #50FA7B;
        }

        /* Main page container using site's gradient pattern */
        .concept-explanation-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--color-dark-bg) 0%, var(--color-darker-bg) 100%);
          color: var(--color-text-light);
          padding: 2rem;
        }

        /* Header using modal header pattern */
        .concept-header {
          text-align: center;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 2px solid var(--color-accent);
        }

        .concept-title {
          color: var(--color-accent);
          margin-bottom: 0.5rem;
          text-shadow: 
            0 0 10px rgba(255, 149, 0, 0.8),
            0 0 20px rgba(255, 149, 0, 0.6),
            2px 2px 0px rgba(255, 149, 0, 0.3);
        }

        .concept-subtitle {
          font-size: 1.2rem;
          color: var(--color-text-muted);
          margin: 0;
          font-family: Avenir, 'Avenir Next', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }

        .concept-content {
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Overview section using modal container pattern */
        .concept-overview {
          margin-bottom: 3rem;
          padding: 2rem;
          background: linear-gradient(135deg, var(--color-darker-bg) 0%, var(--color-dark-bg) 100%);
          border: 2px solid var(--color-border);
          border-radius: 12px;
        }

        .concept-overview h2 {
          color: var(--color-accent);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .concept-overview h2::before {
          content: "📖";
          font-size: 1.5rem;
        }

        .concept-description {
          font-size: 1.1rem;
          color: var(--color-text-light);
          margin: 0;
          line-height: 1.6;
        }

        .concept-details {
          margin-bottom: 3rem;
        }

        .concept-details h2 {
          color: var(--color-primary);
          margin-bottom: 2rem;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .concept-details h2::before {
          content: "🧠";
          font-size: 1.5rem;
        }

        /* Cards using existing concept card pattern */
        .concept-cards {
          display: grid;
          gap: 1.5rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        .concept-card {
          background: rgba(0, 217, 255, 0.1);
          border: 2px solid var(--color-secondary);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          transition: all 0.3s ease;
        }

        .concept-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 217, 255, 0.2);
          border-color: var(--color-secondary);
        }

        .concept-name {
          color: var(--color-secondary);
          margin-bottom: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .concept-name::before {
          content: "💡";
          font-size: 1.1rem;
        }

        .concept-explanation {
          color: var(--color-text-light);
          font-size: 1rem;
          margin: 0;
          line-height: 1.7;
        }

        /* Ready section using primary color theme */
        .concept-ready {
          text-align: center;
          padding: 2rem;
          background: rgba(163, 255, 0, 0.1);
          border-radius: 12px;
          border: 2px solid var(--color-primary);
          margin-bottom: 2rem;
        }

        .ready-message h3 {
          color: var(--color-primary);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .ready-message h3::before {
          content: "🚀";
          font-size: 1.3rem;
        }

        .ready-message p {
          font-size: 1.1rem;
          color: var(--color-text-light);
          margin-bottom: 0.5rem;
        }

        .tip {
          font-style: italic;
          color: var(--color-text-muted) !important;
          font-size: 1rem !important;
        }

        /* Footer using modal footer pattern */
        .concept-footer {
          text-align: center;
          padding-top: 2rem;
          border-top: 2px solid var(--color-border);
          color: var(--color-text-muted);
          font-size: 0.9rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .concept-explanation-page {
            padding: 1rem;
          }
          
          .concept-title {
            font-size: 2rem;
          }
          
          .concept-cards {
            grid-template-columns: 1fr;
          }
          
          .concept-overview,
          .concept-ready {
            padding: 1.5rem;
          }
        }

        /* Print Styles */
        @media print {
          .concept-explanation-page {
            background: white;
            color: black;
          }
          
          .concept-title,
          .concept-overview h2,
          .concept-details h2,
          .concept-name {
            color: #333;
          }
          
          .concept-card {
            border: 1px solid #ccc;
            background: #f9f9f9;
          }
        }
    </style>
</head>
<body>
    <div class="concept-explanation-page">
        <header class="concept-header">
            <h1 class="concept-title">${conceptData.title}</h1>
            <p class="concept-subtitle">Level: ${levelName}</p>
        </header>

        <main class="concept-content">
            <section class="concept-overview">
                <h2>Overview</h2>
                <p class="concept-description">${conceptData.description}</p>
            </section>

            <section class="concept-details">
                <h2>Key Concepts</h2>
                <div class="concept-cards">
                    ${conceptData.concepts.map(concept => `
                        <div class="concept-card">
                            <h3 class="concept-name">${concept.name}</h3>
                            <p class="concept-explanation">${concept.explanation}</p>
                            ${concept.codeExample ? generateCodeExampleHTML(concept.codeExample) : ''}
                        </div>
                    `).join('')}
                </div>
            </section>

            <section class="concept-ready">
                <div class="ready-message">
                    <h3>Ready to Start?</h3>
                    <p>${conceptData.readyMessage}</p>
                    <p class="tip">💡 Close this tab and return to the game to start coding!</p>
                </div>
            </section>
        </main>

        <footer class="concept-footer">
            <p>Ghost in The Code - Learning Made Fun! 👻</p>
        </footer>
    </div>
</body>
</html>
  `;
}

/**
 * Opens concept explanation in a new tab using dynamic data loading
 */
export async function openConceptExplanation(introduction: LevelIntroduction, levelName: string): Promise<void> {
  try {
    // Extract level type from the introduction title or use a mapping
    const levelType = getLevelTypeFromIntroduction(introduction);
    
    // Load the concept explanation data
    const conceptData = await loadConceptExplanation(levelType);
    
    if (!conceptData) {
      // Fallback to basic explanation if no detailed data found
      openBasicConceptExplanation(introduction, levelName);
      return;
    }
    
    const htmlContent = generateConceptHTML(conceptData, levelName);
    const newWindow = window.open('', '_blank');
    
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
    } else {
      // Fallback: show alert if popup was blocked
      alert('Please allow popups to view the concept explanation in a new tab.');
    }
  } catch (error) {
    console.error('Failed to open concept explanation:', error);
    alert('Sorry, there was an error opening the concept explanation.');
  }
}

/**
 * Determines level type from introduction data
 */
function getLevelTypeFromIntroduction(introduction: LevelIntroduction): string {
  const title = introduction.title.toLowerCase();
  
  if (title.includes('function')) return 'functions';
  if (title.includes('loop')) return 'loops';
  if (title.includes('conditional')) return 'conditionals';
  if (title.includes('array')) return 'arrays';
  if (title.includes('logic')) return 'logic';
  if (title.includes('cyber') || title.includes('security')) return 'cybersecurity';
  
  // Default fallback
  return 'functions';
}

/**
 * Fallback function for basic concept explanation without code examples
 */
function openBasicConceptExplanation(introduction: LevelIntroduction, levelName: string): void {
  const basicData: ConceptExplanationData = {
    levelId: 'basic',
    title: introduction.title,
    description: introduction.description,
    concepts: introduction.concepts.map(concept => ({
      name: concept.name,
      explanation: concept.explanation
    })),
    readyMessage: introduction.readyMessage
  };
  
  const htmlContent = generateConceptHTML(basicData, levelName);
  const newWindow = window.open('', '_blank');
  
  if (newWindow) {
    newWindow.document.write(htmlContent);
    newWindow.document.close();
    newWindow.focus();
  }
}