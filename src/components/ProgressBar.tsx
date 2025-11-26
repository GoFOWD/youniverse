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
          
          {/* Wave Layer 1 - Main wave */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'wave1 3s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          />
          
          {/* Wave Layer 2 - Secondary wave */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'wave2 4s ease-in-out infinite',
              animationDelay: '0.5s',
            }}
          />
          
          {/* Top edge wave effect */}
          <div className="absolute top-0 left-0 w-full h-full">
            <div 
              className="absolute top-0 left-0 w-[200%] h-full"
              style={{
                background: `
                  radial-gradient(ellipse 40px 8px at 20px 50%, rgba(255,255,255,0.3), transparent),
                  radial-gradient(ellipse 40px 8px at 80px 50%, rgba(255,255,255,0.3), transparent),
                  radial-gradient(ellipse 40px 8px at 140px 50%, rgba(255,255,255,0.3), transparent),
                  radial-gradient(ellipse 40px 8px at 200px 50%, rgba(255,255,255,0.3), transparent),
                  radial-gradient(ellipse 40px 8px at 260px 50%, rgba(255,255,255,0.3), transparent),
                  radial-gradient(ellipse 40px 8px at 320px 50%, rgba(255,255,255,0.3), transparent)
                `,
                animation: 'waveFlow 4s linear infinite',
              }}
            />
          </div>
          
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
        
        @keyframes wave2 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(2px) scaleY(0.9); }
        }
        
        @keyframes waveFlow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
