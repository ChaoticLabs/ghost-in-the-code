/**
 * Demo component showing AnimationController usage
 * 
 * This demonstrates how to integrate the animation system with game components.
 * Can be used for testing and as a reference implementation.
 */

import { useState } from 'react';
import { AnimationProvider, useAnimations } from './index';
import './AnimationController.demo.css';

function AnimationDemo() {
  const { 
    codeHeal, 
    terminalGlow, 
    ghostCelebrate, 
    particleBurst,
    successSequence,
    isPlaying,
    getQueueLength,
    getCurrentAnimation,
    clearAnimations
  } = useAnimations();

  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCodeHeal = () => {
    addLog('Triggering codeHeal animation');
    codeHeal({
      target: 'demo-code',
      onComplete: () => addLog('codeHeal completed')
    });
  };

  const handleTerminalGlow = () => {
    addLog('Triggering terminalGlow animation');
    terminalGlow({
      onComplete: () => addLog('terminalGlow completed')
    });
  };

  const handleGhostCelebrate = () => {
    addLog('Triggering ghostCelebrate animation');
    ghostCelebrate({
      onComplete: () => addLog('ghostCelebrate completed')
    });
  };

  const handleParticleBurst = () => {
    addLog('Triggering particleBurst animation');
    particleBurst({
      onComplete: () => addLog('particleBurst completed')
    });
  };

  const handleSuccessSequence = () => {
    addLog('Triggering success sequence (all animations)');
    successSequence({
      onComplete: () => addLog('Success sequence completed!')
    });
  };

  const handleClearLog = () => {
    setLog([]);
  };

  const currentAnim = getCurrentAnimation();

  return (
    <div className="animation-demo">
      <h1>Animation Controller Demo</h1>
      
      <div className="demo-controls">
        <h2>Individual Animations</h2>
        <div className="button-group">
          <button onClick={handleCodeHeal} disabled={isPlaying()}>
            Code Heal
          </button>
          <button onClick={handleTerminalGlow} disabled={isPlaying()}>
            Terminal Glow
          </button>
          <button onClick={handleGhostCelebrate} disabled={isPlaying()}>
            Ghost Celebrate
          </button>
          <button onClick={handleParticleBurst} disabled={isPlaying()}>
            Particle Burst
          </button>
        </div>

        <h2>Composite Animations</h2>
        <div className="button-group">
          <button onClick={handleSuccessSequence} disabled={isPlaying()}>
            Success Sequence (All)
          </button>
        </div>

        <h2>Controls</h2>
        <div className="button-group">
          <button onClick={clearAnimations} disabled={!isPlaying()}>
            Clear Queue
          </button>
          <button onClick={handleClearLog}>
            Clear Log
          </button>
        </div>
      </div>

      <div className="demo-status">
        <h2>Animation Status</h2>
        <div className="status-info">
          <p><strong>Playing:</strong> {isPlaying() ? 'Yes' : 'No'}</p>
          <p><strong>Queue Length:</strong> {getQueueLength()}</p>
          <p><strong>Current Animation:</strong> {currentAnim?.type || 'None'}</p>
          {currentAnim && (
            <>
              <p><strong>Target:</strong> {currentAnim.target || 'N/A'}</p>
              <p><strong>Duration:</strong> {currentAnim.duration}ms</p>
            </>
          )}
        </div>
      </div>

      <div className="demo-log">
        <h2>Event Log</h2>
        <div className="log-content">
          {log.length === 0 ? (
            <p className="log-empty">No events yet. Click a button to trigger animations.</p>
          ) : (
            log.map((entry, index) => (
              <div key={index} className="log-entry">{entry}</div>
            ))
          )}
        </div>
      </div>

      <div className="demo-preview">
        <h2>Visual Preview</h2>
        <div className="preview-area">
          <div id="demo-code" className="preview-code">
            <pre>
{`function example() {
  console.log('Hello Ghost!');
  return true;
}`}
            </pre>
          </div>
          <p className="preview-note">
            Note: This demo shows the animation system structure. 
            Visual effects will be implemented in task 24.
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrapper component with provider
export function AnimationControllerDemo() {
  return (
    <AnimationProvider>
      <AnimationDemo />
    </AnimationProvider>
  );
}
