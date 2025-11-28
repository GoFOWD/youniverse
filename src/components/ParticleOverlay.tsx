'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ParticleOverlayProps {
  count?: number; // Dynamic bubble count
  speedMultiplier?: number; // For burst effect during transition
}

const ParticleOverlay: React.FC<ParticleOverlayProps> = ({ count = 15, speedMultiplier = 1 }) => {
  // Memoize the particle configurations so they don't regenerate on re-renders
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 5 + Math.random() * 15,
      xMovement: 3 + Math.random() * 2,
    }));
  }, []); // Empty dependency array means this runs once on mount

  // Only render the requested number of particles
  const activeParticles = particles.slice(0, count);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Bubbles */}
      {activeParticles.map((p) => (
        <FloatingBubble key={p.id} config={p} speedMultiplier={speedMultiplier} />
      ))}
    </div>
  );
};

interface BubbleConfig {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  xMovement: number;
}

const FloatingBubble: React.FC<{ config: BubbleConfig; speedMultiplier: number }> = ({ config, speedMultiplier }) => {
  return (
    <motion.div
      className="absolute bg-white/10 rounded-full backdrop-blur-[1px]"
      style={{
        width: config.size,
        height: config.size,
        left: `${config.left}%`,
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ 
        y: '-10vh', 
        opacity: [0, 0.5, 0],
        x: ['-20px', '20px', '-20px']
      }}
      transition={{
        y: {
          duration: config.duration / speedMultiplier, // Speed up when multiplier increases
          repeat: Infinity,
          ease: "linear",
          delay: config.delay
        },
        opacity: {
          duration: config.duration / speedMultiplier,
          repeat: Infinity,
          times: [0, 0.2, 1],
          delay: config.delay
        },
        x: {
          duration: config.xMovement,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    />
  );
};

export default ParticleOverlay;
