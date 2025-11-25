import React from 'react';
import { motion } from 'framer-motion';

interface DepthIndicatorProps {
  progress: number; // 0 to 100
}

const DepthIndicator: React.FC<DepthIndicatorProps> = ({ progress }) => {
  // Calculate depth (inverted - starts at 100m, goes to 0m)
  const depth = Math.round(100 - progress);
  
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-3">
      {/* Depth Meter */}
      <div className="relative w-2 h-48 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm border border-white/20">
        {/* Water Level (rises as user progresses) */}
        <motion.div
          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-teal-400 to-cyan-300 opacity-60"
          initial={{ height: '0%' }}
          animate={{ height: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        
        {/* Bubble indicator at current level */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-white/80 rounded-full shadow-lg"
          animate={{ bottom: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>
      
      {/* Depth Label */}
      <motion.div 
        className="text-white/70 text-xs font-mono bg-black/20 px-2 py-1 rounded backdrop-blur-sm"
        key={depth}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {depth}m
      </motion.div>
    </div>
  );
};

export default DepthIndicator;
