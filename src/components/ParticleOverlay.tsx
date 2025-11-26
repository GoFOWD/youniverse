'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ParticleOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Floating Bubbles */}
      {[...Array(15)].map((_, i) => (
        <FloatingBubble key={i} />
      ))}
    </div>
  );
};

const FloatingBubble: React.FC = () => {
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 5;
  const randomDuration = 10 + Math.random() * 10;
  const size = 5 + Math.random() * 15;

  return (
    <motion.div
      className="absolute bg-white/10 rounded-full backdrop-blur-[1px]"
      style={{
        width: size,
        height: size,
        left: `${randomX}%`,
      }}
      initial={{ y: '110vh', opacity: 0 }}
      animate={{ 
        y: '-10vh', 
        opacity: [0, 0.5, 0],
        x: ['-20px', '20px', '-20px']
      }}
      transition={{
        y: {
          duration: randomDuration,
          repeat: Infinity,
          ease: "linear",
          delay: randomDelay
        },
        opacity: {
          duration: randomDuration,
          repeat: Infinity,
          times: [0, 0.2, 1],
          delay: randomDelay
        },
        x: {
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
    />
  );
};

export default ParticleOverlay;
