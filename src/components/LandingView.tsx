'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onStart: () => void;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 md:space-y-16 text-center w-full relative z-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="space-y-6"
      >
        <div className="relative inline-block">
          <motion.div
            className="absolute -inset-4 bg-teal-500/20 blur-xl rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <h1 className="relative text-4xl sm:text-5xl md:text-6xl font-sans font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-teal-100 to-teal-300 drop-shadow-lg">
            나의 바다를
            <br />
            찾아서
            {/* <span className="text-4xl md:text-5xl font-light text-teal-100/80">찾아서</span> */}
          </h1>
        </div>

        <p className="text-teal-200/90 text-lg font-medium tracking-[0.2em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ marginTop: '25px' }}>
          심해에서 시작되는 당신의 이야기
        </p>
      </motion.div>

      <motion.button
        onClick={onStart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
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
      <p className="text-teal-200/90 text-lg font-medium tracking-[0.2em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]" style={{ marginBottom: 0 }}>
        당신의 모험성향과
        <br />
        행동성향을 확인해 보세요
      </p>
    </div>
  );
};

export default LandingView;
