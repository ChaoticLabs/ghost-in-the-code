/**
 * Success Animations - Framer Motion components for challenge completion
 * 
 * Provides visual feedback animations when players successfully fix bugs:
 * - codeHeal: Lines of code glow and repair
 * - terminalGlow: Pulsing glow effect on editor
 * - particleBurst: Sparkles/particles on success
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import './SuccessAnimations.css';

// CodeHeal Animation - Cute healing effect for fixed code lines
interface CodeHealProps {
  lineNumber: number;
  isActive: boolean;
  onComplete?: () => void;
}

export const CodeHeal = ({ lineNumber, isActive, onComplete }: CodeHealProps) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 1500);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="code-heal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            left: '-10px',
            right: '-10px',
            top: `${(lineNumber - 1) * 1.6}rem`,
            height: '1.6rem',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {/* Healing wave effect */}
          <motion.div
            className="heal-wave"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ 
              scaleX: [0, 1.2, 1],
              opacity: [0, 0.8, 0],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.5, 1],
              ease: "easeOut"
            }}
          />
          
          {/* Sparkle emojis */}
          <motion.div
            className="heal-sparkle"
            initial={{ x: '0%', opacity: 0, scale: 0 }}
            animate={{ 
              x: ['0%', '100%'],
              opacity: [0, 1, 1, 0],
              scale: [0, 1.2, 1, 0.8],
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.2, 0.6, 1],
              ease: "easeOut"
            }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="heal-sparkle"
            initial={{ x: '0%', opacity: 0, scale: 0 }}
            animate={{ 
              x: ['0%', '100%'],
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.9, 0.7],
              rotate: [0, -360],
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.2, 0.6, 1],
              ease: "easeOut",
              delay: 0.2,
            }}
          >
            💚
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// TerminalGlow Animation - Cute pulsing glow effect on the code editor
interface TerminalGlowProps {
  isActive: boolean;
  onComplete?: () => void;
}

export const TerminalGlow = ({ isActive, onComplete }: TerminalGlowProps) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="terminal-glow-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="glow-effect"
            animate={{
              boxShadow: [
                '0 0 15px rgba(163, 255, 0, 0.3), inset 0 0 15px rgba(163, 255, 0, 0.1)',
                '0 0 40px rgba(163, 255, 0, 0.7), inset 0 0 30px rgba(163, 255, 0, 0.3)',
                '0 0 25px rgba(163, 255, 0, 0.5), inset 0 0 20px rgba(163, 255, 0, 0.2)',
                '0 0 15px rgba(163, 255, 0, 0.3), inset 0 0 15px rgba(163, 255, 0, 0.1)',
              ],
              borderColor: [
                'rgba(163, 255, 0, 0.4)',
                'rgba(163, 255, 0, 1)',
                'rgba(163, 255, 0, 0.7)',
                'rgba(163, 255, 0, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              times: [0, 0.4, 0.7, 1],
              ease: [0.4, 0, 0.2, 1],
            }}
          />
          
          {/* Corner sparkles */}
          <motion.div
            className="corner-sparkle top-left"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            ✨
          </motion.div>
          
          <motion.div
            className="corner-sparkle top-right"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, -180, -360],
            }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
          >
            ⭐
          </motion.div>
          
          <motion.div
            className="corner-sparkle bottom-left"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.4 }}
          >
            🎃
          </motion.div>
          
          <motion.div
            className="corner-sparkle bottom-right"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: [0, 1.2, 1, 0],
              opacity: [0, 1, 1, 0],
              rotate: [0, -180, -360],
            }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.6 }}
          >
            👻
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ParticleBurst Animation - Halloween-themed sparkles and particles
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
  angle: number;
  distance: number;
  delay: number;
}

interface ParticleBurstProps {
  isActive: boolean;
  centerX?: number;
  centerY?: number;
  particleCount?: number;
  onComplete?: () => void;
}

export const ParticleBurst = ({ 
  isActive, 
  centerX = 50, 
  centerY = 40, 
  particleCount = 20,
  onComplete 
}: ParticleBurstProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate Halloween-themed particles
      const newParticles: Particle[] = [];
      const emojis = ['✨', '⭐', '🎃', '👻', '💚', '🌟', '💫'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.4;
        // Much larger distance to spread across the screen
        const distance = 200 + Math.random() * 300;
        
        newParticles.push({
          id: i,
          x: centerX,
          y: centerY,
          size: 24 + Math.random() * 20,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
          angle,
          distance,
          delay: Math.random() * 0.5,
        });
      }
      
      setParticles(newParticles);

      // Call onComplete after animation (much longer duration)
      if (onComplete) {
        const timer = setTimeout(onComplete, 4500);
        return () => clearTimeout(timer);
      }
    } else {
      setParticles([]);
    }
  }, [isActive, centerX, centerY, particleCount, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="particle-burst-container">
          {particles.map((particle) => {
            // Create curved path with multiple waypoints
            const endX = particle.x + Math.cos(particle.angle) * particle.distance;
            const endY = particle.y + Math.sin(particle.angle) * particle.distance;
            
            // Add curve by creating waypoints that arc
            const curveOffset = (Math.random() - 0.5) * 80; // Random curve direction
            const mid1X = particle.x + Math.cos(particle.angle) * (particle.distance * 0.25) + curveOffset * 0.3;
            const mid1Y = particle.y + Math.sin(particle.angle) * (particle.distance * 0.25) - 20;
            const mid2X = particle.x + Math.cos(particle.angle) * (particle.distance * 0.5) + curveOffset * 0.7;
            const mid2Y = particle.y + Math.sin(particle.angle) * (particle.distance * 0.5) - 30;
            const mid3X = particle.x + Math.cos(particle.angle) * (particle.distance * 0.75) + curveOffset;
            const mid3Y = particle.y + Math.sin(particle.angle) * (particle.distance * 0.75) - 20;

            return (
              <motion.div
                key={particle.id}
                className="particle halloween-particle"
                initial={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  scale: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  left: [`${particle.x}%`, `${mid1X}%`, `${mid2X}%`, `${mid3X}%`, `${endX}%`],
                  top: [`${particle.y}%`, `${mid1Y}%`, `${mid2Y}%`, `${mid3Y}%`, `${endY}%`],
                  scale: [0, 1.4, 1.3, 1.2, 1, 0.7, 0],
                  opacity: [0, 1, 1, 1, 1, 0.8, 0],
                  rotate: [0, 180, 360, 540, 720, 900],
                }}
                transition={{
                  duration: 4.5,
                  ease: [0.16, 1, 0.3, 1],
                  times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                  delay: particle.delay,
                }}
                style={{
                  fontSize: particle.size,
                  position: 'absolute',
                }}
              >
                {particle.emoji}
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};

// Combined Success Animation - Orchestrates all animations
interface SuccessAnimationProps {
  isActive: boolean;
  fixedLineNumber?: number;
  onComplete?: () => void;
}

export const SuccessAnimation = ({ 
  isActive, 
  fixedLineNumber,
  onComplete 
}: SuccessAnimationProps) => {
  const [showCodeHeal, setShowCodeHeal] = useState(false);
  const [showTerminalGlow, setShowTerminalGlow] = useState(false);
  const [showParticleBurst, setShowParticleBurst] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Sequence the animations for a cute, flowing effect
      // 1. Code heals first
      setShowCodeHeal(true);
      
      // 2. Terminal glows as code heals
      setTimeout(() => {
        setShowTerminalGlow(true);
      }, 300);
      
      // 3. Particle burst for celebration
      setTimeout(() => {
        setShowParticleBurst(true);
      }, 600);

      // Complete after all animations (reduced to 2.5s for snappier feel)
      if (onComplete) {
        const timer = setTimeout(onComplete, 2500);
        return () => clearTimeout(timer);
      }
    } else {
      setShowCodeHeal(false);
      setShowTerminalGlow(false);
      setShowParticleBurst(false);
    }
  }, [isActive, onComplete]);

  return (
    <>
      {fixedLineNumber && (
        <CodeHeal 
          lineNumber={fixedLineNumber} 
          isActive={showCodeHeal}
        />
      )}
      <TerminalGlow isActive={showTerminalGlow} />
      <ParticleBurst isActive={showParticleBurst} />
    </>
  );
};
