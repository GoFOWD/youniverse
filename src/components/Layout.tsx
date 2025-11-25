import React from 'react';
import { motion } from 'framer-motion';
import ParticleOverlay from './ParticleOverlay';

type Step = 'landing' | 'question' | 'loading' | 'result';

interface LayoutProps {
  children: React.ReactNode;
  step: Step;
  progress?: number; // 0 to 100
  className?: string;
}

const getBackgroundGradient = (step: Step, progress: number = 0) => {
  switch (step) {
    case 'landing':
      return 'from-[#1a3a3b] via-[#0f2829] to-[#0a1f20]'; // Darker deep sea version of #2F6364
    case 'question':
      // Smooth gradient transition from Q1-18
      if (progress < 38) {
        // Questions 1-7: Very dark ocean
        return 'from-slate-900 via-teal-950 to-slate-900';
      } else if (progress < 50) {
        // Question 8: Transition phase - blend between dark and bright
        return 'from-slate-800 via-teal-900 to-cyan-950';
      } else {
        // Questions 9-18: Brighter rising
        return 'from-cyan-500 via-blue-600 to-teal-700';
      }
    case 'loading':
      return 'from-blue-400 via-cyan-500 to-teal-600'; // Brighter Transition
    case 'result':
      return 'from-orange-300 via-rose-300 to-indigo-400'; // Sunrise
    default:
      return 'from-[#1a3a3b] via-[#0f2829] to-[#0a1f20]';
  }
};

const Layout: React.FC<LayoutProps> = ({ children, step, progress = 0, className = '' }) => {
  // Calculate bubble density based on progress (more bubbles as we rise)
  const bubbleCount = Math.round(20 + (progress / 100) * 30); // 20 to 50 bubbles
  const bubbleSpeed = 10 + (progress / 100) * 10; // Faster as we rise
  
  // Light intensity increases as we approach surface
  const lightIntensity = progress / 100;

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Dynamic Background Layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(step, progress)} animate-gradient transition-colors duration-[2000ms]`}
        initial={false}
        animate={{ opacity: 1 }}
      />
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Light Rays from Surface - Sunlight Effect */}
      {progress > 38 && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Volumetric God Rays */}
          {[...Array(8)].map((_, i) => {
            // Enhanced effects for questions 14+ (progress > 77%)
            const isNearSurface = progress > 77;
            const pulseIntensity = isNearSurface ? 1.5 : 1;
            const swayIntensity = isNearSurface ? 15 : 5;
            
            return (
              <motion.div
                key={`light-${i}`}
                className="absolute top-0 origin-top"
                style={{
                  left: `${10 + i * 11}%`,
                  width: '80px',
                  height: '100%',
                  background: `linear-gradient(to bottom, 
                    rgba(255, 248, 220, ${lightIntensity * 0.4}) 0%, 
                    rgba(255, 235, 180, ${lightIntensity * 0.25}) 20%,
                    rgba(255, 220, 150, ${lightIntensity * 0.15}) 40%,
                    rgba(200, 230, 255, ${lightIntensity * 0.08}) 60%,
                    transparent 100%)`,
                  filter: 'blur(20px)',
                  transform: `rotate(${-2 + i * 0.5}deg)`,
                  transformOrigin: 'top center',
                }}
                animate={{
                  opacity: [0.6, 1, 0.6],
                  scaleY: [0.95, 1.05 * pulseIntensity, 0.95],
                  scaleX: isNearSurface ? [1, 0.7, 1.3, 0.8, 1] : [1, 1, 1],
                  x: [`-${swayIntensity}px`, `${swayIntensity}px`, `-${swayIntensity}px`],
                }}
                transition={{
                  duration: isNearSurface ? 2.5 : 4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            );
          })}
          
          {/* Bright center glow */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96"
            style={{
              background: `radial-gradient(ellipse at center, 
                rgba(255, 255, 200, ${lightIntensity * 0.3}) 0%, 
                rgba(255, 240, 180, ${lightIntensity * 0.15}) 30%,
                transparent 70%)`,
              filter: 'blur(40px)',
            }}
            animate={{
              opacity: progress > 77 ? [0.5, 1, 0.5] : [0.7, 1, 0.7],
              scale: progress > 77 ? [0.8, 1.3, 0.8] : [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: progress > 77 ? 3 : 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          {/* Caustic light patterns (shimmering water surface reflections) */}
          {[...Array(12)].map((_, i) => {
            const isNearSurface = progress > 77;
            const movementRange = isNearSurface ? 40 : 20;
            
            return (
              <motion.div
                key={`caustic-${i}`}
                className="absolute rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 40}%`,
                  width: `${30 + Math.random() * 60}px`,
                  height: `${30 + Math.random() * 60}px`,
                  background: `radial-gradient(circle, 
                    rgba(255, 255, 255, ${lightIntensity * 0.4}) 0%, 
                    rgba(255, 248, 220, ${lightIntensity * 0.2}) 40%,
                    transparent 70%)`,
                  filter: 'blur(15px)',
                }}
                animate={{
                  opacity: [0, lightIntensity * 0.8, 0],
                  scale: isNearSurface ? [0.6, 1.4, 0.6] : [0.8, 1.2, 0.8],
                  x: [`-${movementRange}px`, `${movementRange}px`, `-${movementRange}px`],
                  y: [`-${movementRange / 2}px`, `${movementRange / 2}px`, `-${movementRange / 2}px`],
                }}
                transition={{
                  duration: isNearSurface ? 1.5 + Math.random() : 2 + Math.random() * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2,
                }}
              />
            );
          })}
        </div>
      )}
      
      {/* Interactive Particles */}
      <ParticleOverlay />
      
      {/* Floating Particles (Background Depth) - Dynamic Count */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(bubbleCount)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 100,
              scale: Math.random() * 0.5 + 0.2
            }}
            animate={{ 
              y: -100,
              x: `calc(${Math.random() * 100}vw)`
            }}
            transition={{ 
              duration: Math.random() * bubbleSpeed + bubbleSpeed, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
            }}
          />
        ))}
      </div>

      {/* Main Content Container */}
      <main className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 mx-auto max-w-md w-full ${className}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
