/**
 * ConceptExplanationModal - Template component for concept explanations
 * Note: This component is not directly rendered in the app, but serves as a 
 * reference for the HTML structure generated in conceptExplanation.ts
 */

import type { LevelIntroduction } from '../engine/types';

interface ConceptExplanationModalProps {
  introduction: LevelIntroduction;
  levelName: string;
}

/**
 * This component serves as a TypeScript reference for the concept explanation structure.
 * The actual rendering is done via HTML generation in utils/conceptExplanation.ts
 * to create standalone pages that open in new tabs.
 */
export function ConceptExplanationModal({
  introduction,
  levelName
}: ConceptExplanationModalProps) {
  return (
    <div className="concept-explanation-page">
      <header className="concept-header">
        <h1 className="concept-title">{introduction.title}</h1>
        <p className="concept-subtitle">Level: {levelName}</p>
      </header>

      <main className="concept-content">
        <section className="concept-overview">
          <h2>Overview</h2>
          <p className="concept-description">{introduction.description}</p>
        </section>

        <section className="concept-details">
          <h2>Key Concepts</h2>
          <div className="concept-cards">
            {introduction.concepts.map((concept, index) => (
              <div key={index} className="concept-card">
                <h3 className="concept-name">{concept.name}</h3>
                <p className="concept-explanation">{concept.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="concept-ready">
          <div className="ready-message">
            <h3>Ready to Start?</h3>
            <p>{introduction.readyMessage}</p>
            <p className="tip">💡 Close this tab and return to the game to start coding!</p>
          </div>
        </section>
      </main>

      <footer className="concept-footer">
        <p>Ghost in The Code - Learning Made Fun! 👻</p>
      </footer>
    </div>
  );
}