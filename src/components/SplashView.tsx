'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SplashViewProps {
  onComplete: () => void;
}

export default function SplashView({ onComplete }: SplashViewProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Complete transition after fade out animation (2.5s total)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: fadeOut ? 0 : 1, 
          scale: fadeOut ? 1.1 : 1 
        }}
        transition={{ 
          duration: 0.8, 
          ease: 'easeOut',
          delay: 0.2 
        }}
        className="relative w-64 h-64 md:w-80 md:h-80"
      >
        <Image
          src="/logo.jpg"
          alt="Logo"
          fill
          priority
          className="object-contain"
        />
      </motion.div>
    </motion.div>
  );
}
