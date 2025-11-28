'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
}

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
  
  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  // Calculate dynamic gradient colors based on progress (matching Layout's ocean depth concept)
  const getProgressGradient = () => {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100;
    
    // Deep ocean colors (dark, muted)
    const deepStart = '#0a3a3f';    // Very dark teal
    const deepMid = '#0d4d52';      // Dark teal-cyan
    const deepEnd = '#0f5f64';      // Slightly lighter dark teal
    
    // Mid-depth colors (transitioning)
    const midStart = '#14b8a6';     // teal-500
    const midMid = '#0d9488';       // teal-600
    const midEnd = '#0f766e';       // teal-700
    
    // Surface colors (bright, vibrant)
    const surfaceStart = '#06b6d4'; // cyan-500
    const surfaceMid = '#0ea5e9';   // sky-500
    const surfaceEnd = '#3b82f6';   // blue-500
    
    let fromColor, viaColor, toColor;
    
    if (normalizedProgress < 0.33) {
      // Deep ocean phase (0-33%)
      const factor = normalizedProgress / 0.33;
      fromColor = interpolateColor(deepStart, deepMid, factor);
      viaColor = interpolateColor(deepMid, deepEnd, factor);
      toColor = interpolateColor(deepStart, deepEnd, factor);
    } else if (normalizedProgress < 0.66) {
      // Mid-depth phase (33-66%)
      const factor = (normalizedProgress - 0.33) / 0.33;
      fromColor = interpolateColor(deepEnd, midStart, factor);
      viaColor = interpolateColor(deepEnd, midMid, factor);
      toColor = interpolateColor(deepEnd, midEnd, factor);
    } else {
      // Surface phase (66-100%)
      const factor = (normalizedProgress - 0.66) / 0.34;
      fromColor = interpolateColor(midStart, surfaceStart, factor);
      viaColor = interpolateColor(midMid, surfaceMid, factor);
      toColor = interpolateColor(midEnd, surfaceEnd, factor);
    }
    
    return `linear-gradient(to right, ${fromColor}, ${viaColor}, ${toColor})`;
  };

  // Calculate depth to surface (starting from 10,984m - Mariana Trench depth)
  const depthToSurface = Math.round(10984 * (1 - progress / 100));

  return (
    <div className="w-full max-w-xs mb-8">
      {/* Depth indicator */}
      <div className="flex justify-end mb-1">
        <span className="text-xs text-white/40 font-light">
          수면까지 {depthToSurface.toLocaleString()}m
        </span>
      </div>
      
      <div className="relative h-4 bg-white/10 rounded-full overflow-hidden backdrop-blur-sm">
        {/* Progress fill container */}
        <motion.div
          className="absolute top-0 left-0 h-full overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        >
          {/* Dynamic gradient background */}
          <div 
            className="absolute inset-0 transition-colors duration-1000" 
            style={{ background: getProgressGradient() }}
          />
          
          {/* Wave Layer - Main wave */}
          <div 
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              animation: 'wave1 3s ease-in-out infinite',
              transformOrigin: 'center',
            }}
          />
          
          {/* Shimmer effect */}
          <motion.div
            className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>
      
      {/* CSS Keyframes */}
      <style>{`
        @keyframes wave1 {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-2px) scaleY(1.1); }
        }
      `}</style>
    </div>
  );
};

export default ProgressBar;
