'use client';

import React from 'react';
import { motion } from 'framer-motion';
import ParticleOverlay from './ParticleOverlay';

type Step = 'splash' | 'landing' | 'question' | 'loading' | 'ocean_transition' | 'result';

interface LayoutProps {
  children: React.ReactNode;
  step: Step;
  progress?: number; // 0 to 100
  ocean?: string; // For result screen video
  className?: string;
  isTransitioning?: boolean; // New prop for burst effect
  backgroundComponent?: React.ReactNode;
}

// Ocean video mapping
const OceanVideoMap: Record<string, string> = {
  '태평양': 'pacific1.mp4',
  '대서양': 'Atlantic1.mp4',
  '인도양': 'indian1.mp4',
  '남극해': 'southern1.mp4',
  '북극해': 'Arctic1.mp4',
};

// Helper function to interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = parseInt(color1.substring(1), 16);
  const c2 = parseInt(color2.substring(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Ensure proper 6-digit hex format with leading zeros
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};



const Layout: React.FC<LayoutProps> = ({ children, step, progress = 0, ocean, className = '', isTransitioning = false, backgroundComponent }) => {
  // Calculate bubble density based on progress (more bubbles as we rise)
  const bubbleCount = Math.round(5 + (progress / 100) * 10); // 5 to 15 bubbles (Optimized)
  const bubbleSpeed = 10 + (progress / 100) * 10; // Faster as we rise

  // Light intensity increases as we approach surface
  const lightIntensity = progress / 100;

  // Get gradient colors for inline style
  const getGradientStyle = () => {
    // For splash screen - pure black
    if (step === 'splash') {
      return {
        background: '#000000'
      };
    }
    // For landing, loading, and result - use predefined colors
    if (step === 'landing') {
      return {
        background: '#000000'
      };
    } else if (step === 'loading') {
      return {
        background: '#000000'
      };
    } else if (step === 'result') {
      return {
        background: 'transparent'
      };
    } else if (step === 'question') {
      // For questions - use interpolated colors
      const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100;

      // Much darker colors for abyss feel (Q1-3: 0-16.67%)
      const darkStart = '#000000';   // Pure black for deepest ocean
      const darkMid = '#030d0f';     // Almost black with hint of teal
      const mediumStart = '#0f1f22'; // Very dark transition
      const mediumMid = '#0a3a3f';   // Dark teal
      const brightStart = '#06b6d4';  // cyan-500
      const brightMid = '#2563eb';    // blue-600
      const brightEnd = '#0f766e';    // teal-700

      let fromColor, viaColor, toColor;

      if (normalizedProgress < 0.5) {
        const factor = normalizedProgress * 2;
        fromColor = interpolateColor(darkStart, mediumStart, factor);
        viaColor = interpolateColor(darkMid, mediumMid, factor);
        toColor = interpolateColor(darkStart, mediumStart, factor);
      } else {
        const factor = (normalizedProgress - 0.5) * 2;
        fromColor = interpolateColor(mediumStart, brightStart, factor);
        viaColor = interpolateColor(mediumMid, brightMid, factor);
        toColor = interpolateColor(mediumStart, brightEnd, factor);
      }

      return {
        background: `linear-gradient(to bottom right, ${fromColor}, ${viaColor}, ${toColor})`
      };
    }

    return {
      background: 'linear-gradient(to bottom right, #0a1a1f, #050f12, #020a0d)'
    };
  };

  // SSR check for window-dependent rendering
  const isBrowser = typeof window !== 'undefined';

  const videoFile = ocean ? OceanVideoMap[ocean] : null;

  return (
    <div className={`relative h-[100dvh] w-full ${step === 'result' ? 'overflow-y-auto' : 'overflow-hidden'} text-white`}>
      {/* Dynamic Background Layer */}
      <motion.div
        className={`absolute inset-0 transition-colors duration-[4000ms] ${progress > 44 ? 'animate-gradient' : ''}`}
        style={getGradientStyle()}
        initial={false}
        animate={{ opacity: 1 }}
      />

      {/* Custom Background Component (e.g. DeepSeaEffect) */}
      {backgroundComponent && (
        <div className="absolute inset-0 z-0">
          {backgroundComponent}
        </div>
      )}



      {/* Video Background for Result Screen */}
      {step === 'result' && videoFile && (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0 bg-black">
          <motion.video
            key={videoFile} // Force reload when video changes
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            preload="auto"
            // Loop removed to stop at last frame
            onEnded={(e) => {
              e.currentTarget.pause();
            }}
            initial={{ filter: 'blur(0px)' }}
            animate={{ filter: 'blur(8px)' }}
            transition={{ delay: 4.5, duration: 1.5, ease: "easeInOut" }}
          >
            <source src={`/assets/${videoFile}`} type="video/mp4" />
          </motion.video>

          {/* Dark overlay for readability - delayed appearance handled in ResultView or here? 
              User wants video to show, then result page. 
              Let's keep overlay but maybe animate it? 
              Actually, ResultView has the glass panel. 
              Let's keep a light overlay here for contrast when content appears.
          */}
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.5, duration: 1 }}
          />
        </div>
      )}

      {/* Noise Overlay - Removed to fix Samsung Internet flickering */}
      {/* <div className="noise-overlay" /> */}

      {/* Underwater Texture for Landing Screen - REMOVED for optimization */}
      {/* step === 'landing' && (
        <>
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={`caustic-landing-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${100 + Math.random() * 150}px`,
                  height: `${100 + Math.random() * 150}px`,
                  background: `radial-gradient(circle, 
                    rgba(47, 99, 100, 0.3) 0%, 
                    rgba(47, 99, 100, 0.1) 40%,
                    transparent 70%)`,
                  filter: 'blur(25px)',
                }}
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.8, 1.2, 0.8],
                  x: ['-30px', '30px', '-30px'],
                  y: ['-20px', '20px', '-20px'],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 4,
                }}
              />
            ))}
          </div>

          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`depth-particle-${i}`}
                className="absolute bg-teal-300/20 rounded-full blur-sm"
                style={{
                  width: `${2 + Math.random() * 3}px`,
                  height: `${2 + Math.random() * 3}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  x: [0, Math.random() * 10 - 5, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 3,
                }}
              />
            ))}
          </div>

          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(47, 99, 100, 0.03) 2px,
                rgba(47, 99, 100, 0.03) 4px
              )`,
            }}
            animate={{
              backgroundPosition: ['0px 0px', '0px 20px'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </>
      )} */}

      {/* Light Rays from Surface - Sunlight Effect - REMOVED for optimization */}
      {/* progress > 38 && step !== 'result' && ( ... ) */}

      {/* Interactive Particles - Dynamic count based on progress */}
      {isBrowser && step !== 'result' && <ParticleOverlay count={bubbleCount} isTransitioning={isTransitioning} />}

      {/* Main Content Container */}
      <main className={`relative z-10 flex flex-col items-center ${step === 'result' ? 'justify-start min-h-full' : 'justify-center h-full'} px-4 py-6 pb-8 sm:py-6 md:py-8 mx-auto w-full ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
