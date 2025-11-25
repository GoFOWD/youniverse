import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div className="w-full max-w-xs mb-8">
      <div className="relative h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        <motion.div
          className="absolute top-0 left-0 h-full bg-teal-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        {/* Shimmer effect */}
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
