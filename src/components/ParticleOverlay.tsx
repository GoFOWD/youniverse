'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';

interface ParticleOverlayProps {
  count?: number; // Dynamic bubble count
  isTransitioning?: boolean; // Triggers falling effect
}

const ParticleOverlay: React.FC<ParticleOverlayProps> = ({ count = 15, isTransitioning = false }) => {
  const [generation, setGeneration] = useState(0);

  // Regenerate particles when transition ends (ready for next question)
  useEffect(() => {
    if (!isTransitioning) {
      setGeneration(prev => prev + 1);
    }
  }, [isTransitioning]);

  // Memoize the particle configurations
  // Re-run when generation changes to create fresh random particles
  const particles = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 10 + Math.random() * 10,
      size: 5 + Math.random() * 15,
      xMovement: 3 + Math.random() * 2,
    }));
  }, [generation]);

  // Only render the requested number of particles
  const activeParticles = particles.slice(0, count);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Bubbles */}
      {activeParticles.map((p) => (
        <FloatingBubble 
          key={`${p.id}-${generation}`} // Force re-mount on generation change
          config={p} 
          isFalling={isTransitioning} 
        />
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

const FloatingBubble: React.FC<{ config: BubbleConfig; isFalling: boolean }> = ({ config, isFalling }) => {
  
  const variants: Variants = {
    rising: {
      y: ['110vh', '-10vh'],
      opacity: [0, 0.5, 0],
      x: ['-20px', '20px', '-20px'],
      transition: {
        y: {
          duration: config.duration,
          repeat: Infinity,
          ease: "linear",
          delay: config.delay
        },
        opacity: {
          duration: config.duration,
          repeat: Infinity,
          times: [0, 0.2, 1],
          delay: config.delay
        },
        x: {
          duration: config.xMovement,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }
    },
    falling: {
      y: '120vh', // Fall off screen
      opacity: 0,
      transition: {
        duration: 0.6, // Fast fall
        ease: "easeIn"
      }
    }
  };

  return (
    <motion.div
      className="absolute bg-white/10 rounded-full backdrop-blur-[1px]"
      style={{
        width: config.size,
        height: config.size,
        left: `${config.left}%`,
      }}
      initial={isFalling ? undefined : { y: '110vh', opacity: 0 }} // Only set initial if starting fresh
      animate={isFalling ? 'falling' : 'rising'}
      variants={variants}
    />
  );
};

export default ParticleOverlay;
