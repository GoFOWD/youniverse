'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoadingView: React.FC = () => {

  return (
    <>
      {/* Loading text overlay */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center px-6 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="text-center">
          <h3 className="text-xl sm:text-2xl font-serif text-white tracking-wide drop-shadow-lg mb-2">
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
