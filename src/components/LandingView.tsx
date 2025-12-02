'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onStart: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center w-full h-full relative z-20">
      {/* Title Section - Positioned at the top like a book cover */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="pt-20 sm:pt-24 md:pt-32 relative z-20 text-center"
      >
        <div className="relative inline-block">
          <motion.div
            className="absolute -inset-4 bg-teal-500/20 blur-xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-bold tracking-wider text-white" style={{ fontFamily: "'Playfair Display', serif", textShadow: '0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(0, 0, 0, 0.2)' }}>
            나의 바다를
            <br />
            찾아서
          </h1>
        </div>
      </motion.div>

      {/* Content Section - Centered in the remaining space */}
      <div className="flex-1 flex flex-col items-center justify-center w-full space-y-8 sm:space-y-12 md:space-y-16 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1.5 }}
        >
          <p className="text-teal-200/90 text-lg font-medium tracking-[0.2em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            심해에서 시작되는 당신의 이야기
          </p>
        </motion.div>

        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="group relative px-8 py-4 sm:px-10 sm:py-4 md:px-12 md:py-5 bg-transparent overflow-hidden rounded-full"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 backdrop-blur-md border border-teal-500/30 group-hover:border-teal-400/50 transition-colors duration-300" />
          <div className="absolute inset-0 w-full h-full bg-teal-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <span className="relative z-10 text-teal-50 text-lg font-medium tracking-widest group-hover:text-white transition-colors">
            탐험 시작하기
          </span>

          {/* Button Glow */}
          <motion.div
            className="absolute -inset-2 bg-teal-400/20 blur-lg rounded-full opacity-0 group-hover:opacity-100"
            transition={{ duration: 0.3 }}
          />
        </motion.button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1.5 }}
        >
          <p className="text-teal-200/90 text-lg font-medium tracking-[0.2em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center">
            당신의 모험성향과
            <br />
            행동성향을 확인해 보세요
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingView;
