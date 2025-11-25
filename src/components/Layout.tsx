import React from 'react';
import { motion } from 'framer-motion';
import ParticleOverlay from './ParticleOverlay';

type Step = 'landing' | 'question' | 'loading' | 'result';

interface LayoutProps {
  children: React.ReactNode;
  step: Step;
  className?: string;
}

const getBackgroundGradient = (step: Step) => {
  switch (step) {
    case 'landing':
      return 'from-slate-900 via-teal-950 to-slate-900'; // Deep Sea
    case 'question':
      return 'from-teal-900 via-cyan-900 to-blue-900'; // Rising
    case 'loading':
      return 'from-blue-800 via-indigo-800 to-purple-900'; // Transition
    case 'result':
      return 'from-orange-300 via-rose-300 to-indigo-400'; // Sunrise
    default:
      return 'from-slate-900 via-teal-950 to-slate-900';
  }
};

const Layout: React.FC<LayoutProps> = ({ children, step, className = '' }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden text-white">
      {/* Dynamic Background Layer */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${getBackgroundGradient(step)} animate-gradient transition-colors duration-[2000ms]`}
        initial={false}
        animate={{ opacity: 1 }}
      />
      
      {/* Noise Overlay */}
      <div className="noise-overlay" />
      
      {/* Interactive Particles */}
      <ParticleOverlay />
      
      {/* Floating Particles (Background Depth) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
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
              duration: Math.random() * 10 + 10, 
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
