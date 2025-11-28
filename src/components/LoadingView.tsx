'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoadingView: React.FC = () => {

  return (
    <>
      {/* Gradient Background */}
      <div className="fixed inset-0 w-screen h-screen bg-gradient-to-b from-blue-900 via-cyan-600 to-teal-500 z-0" />
      
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
      
      {/* Loading text overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center">
          <h3 className="text-2xl font-serif text-white tracking-wide drop-shadow-lg mb-2">
            수면 위로 올라가는 중...
          </h3>
          <p className="text-sm text-white/80 font-light tracking-widest uppercase drop-shadow">
            잠시만 기다려주세요
          </p>
        </div>
      </motion.div>
    </>
  );
};

export default LoadingView;
