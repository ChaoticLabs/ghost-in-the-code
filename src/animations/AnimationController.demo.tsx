/**
 * Demo component showing AnimationController usage
 * 
 * This demonstrates how to integrate the animation system with game components.
 * Can be used for testing and as a reference implementation.
 */

import { useState } from 'react';
import { AnimationProvider, useAnimationController } from './index';
import './AnimationController.demo.css';

function AnimationDemo() {
  const { 
    state,
    triggerAnimation,
    clearAnimations
  } = useAnimationController();

  const [log, setLog] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleCodeHeal = () => {
    addLog('Triggering codeHeal animation');
    triggerAnimation({
      type: 'codeHeal',
      target: 'demo-code',
      onComplete: () => addLog('codeHeal completed')
    });
  };

  const handleTerminalGlow = () => {
    addLog('Triggering terminalGlow animation');
    triggerAnimation({
      type: 'terminalGlow',
      onComplete: () => addLog('terminalGlow completed')
    });
  };

  const handleGhostCelebrate = () => {
    addLog('Triggering ghostCelebrate animation');
    triggerAnimation({
      type: 'ghostCelebrate',
      onComplete: () => addLog('ghostCelebrate completed')
    });
  };

  const handleParticleBurst = () => {
    addLog('Triggering particleBurst animation');
    triggerAnimation({
      type: 'particleBurst',
      onComplete: () => addLog('particleBurst completed')
    });
  };

  const handleSuccessSequence = () => {
    addLog('Triggering success sequence (all animations)');
    // Trigger animations in sequence
    triggerAnimation({
      type: 'codeHeal',
      target: 'demo-code',
      duration: 2000
    });
    triggerAnimation({
      type: 'terminalGlow',
      duration: 2500,
      delay: 500
    });
    triggerAnimation({
      type: 'ghostCelebrate',
      duration: 1500,
      delay: 800
    });
    triggerAnimation({
      type: 'particleBurst',
      duration: 2000,
      delay: 800,
      onComplete: () => addLog('Success sequence completed!')
    });
  };

  const handleClearLog = () => {
    setLog([]);
  };

  return (
    <div className="animation-demo">
      <h1>Animation Controller Demo</h1>
      
      <div className="demo-controls">
        <h2>Individual Animations</h2>
        <div className="button-group">
          <button onClick={handleCodeHeal} disabled={state.isPlaying}>
            Code Heal
          </button>
          <button onClick={handleTerminalGlow} disabled={state.isPlaying}>
            Terminal Glow
          </button>
          <button onClick={handleGhostCelebrate} disabled={state.isPlaying}>
            Ghost Celebrate
          </button>
          <button onClick={handleParticleBurst} disabled={state.isPlaying}>
            Particle Burst
          </button>
        </div>

        <h2>Composite Animations</h2>
        <div className="button-group">
          <button onClick={handleSuccessSequence} disabled={state.isPlaying}>
            Success Sequence (All)
          </button>
        </div>

        <h2>Controls</h2>
        <div className="button-group">
          <button onClick={clearAnimations} disabled={!state.isPlaying}>
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
          <p><strong>Playing:</strong> {state.isPlaying ? 'Yes' : 'No'}</p>
          <p><strong>Queue Length:</strong> {state.queue.length}</p>
          <p><strong>Current Animation:</strong> {state.currentAnimation?.type || 'None'}</p>
          {state.currentAnimation && (
            <>
              <p><strong>Target:</strong> {state.currentAnimation.target || 'N/A'}</p>
              <p><strong>Duration:</strong> {state.currentAnimation.duration}ms</p>
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
