'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full max-w-xs mb-8">
      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        {/* Progress fill container */}
        <motion.div
          className="absolute top-0 left-0 h-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-blue-500" />
          
          {/* Wave Layer - Main wave */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'wave1 3s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes wave1 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
