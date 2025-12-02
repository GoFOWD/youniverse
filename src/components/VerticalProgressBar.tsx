'use client';

import React from 'react';
import { motion } from 'framer-motion';

import JellyfishIndicator from './JellyfishIndicator';

interface VerticalProgressBarProps {
    progress: number; // 0 to 100
}

const VerticalProgressBar: React.FC<VerticalProgressBarProps> = ({ progress }) => {
    // Mariana Trench Depth: ~11,000m
    const maxDepth = 11000;

    // Depth markers to display (0m to 11000m)
    const depthMarkers = [0, 2500, 5000, 7500, 10000, 11000];

    return (
        <div className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 h-[70vh] w-12 z-50 flex flex-col items-center">
            {/* Track Background */}
            <div className="absolute inset-y-0 w-[2px] bg-white/10 left-1/2 -translate-x-1/2 rounded-full" />

            {/* Glowing Trail (Fills from bottom) */}
            <motion.div
                className="absolute bottom-0 w-[2px] bg-gradient-to-t from-cyan-500 via-teal-400 to-white left-1/2 -translate-x-1/2 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                initial={{ height: '0%' }}
                animate={{ height: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />

            {/* Surface Marker (Top) */}
            <div className={`absolute -top-6 text-[10px] font-bold tracking-widest uppercase text-center w-20 transition-all duration-500 ${progress >= 98 ? 'text-cyan-300 drop-shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'text-white/30'}`}>
                Surface
            </div>

            {/* Abyss Marker (Bottom) */}
            <div className={`absolute -bottom-6 text-[10px] font-bold tracking-widest uppercase text-center w-20 transition-all duration-500 ${progress > 0 ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]' : 'text-white/30'}`}>
                Mariana
            </div>

            {/* Progress Indicator (Jellyfish) */}
            <motion.div
                className="absolute z-20"
                initial={{ bottom: '0%' }}
                animate={{ bottom: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                style={{ left: '50%', x: '-50%' }}
            >
                <JellyfishIndicator />
            </motion.div>

            {/* Depth Markers (Layered ON TOP of the bar) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-10">
                {depthMarkers.map((depth, i) => {
                    // Calculate threshold for this depth
                    // 11000m -> 0%, 0m -> 100%
                    const threshold = ((maxDepth - depth) / maxDepth) * 100;
                    const isPassed = progress >= threshold;

                    return (
                        <div key={i} className="relative w-full flex items-center justify-center">
                            {/* Tick Mark */}
                            <div className={`w-4 h-[1px] transition-all duration-500 ${isPassed ? 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,1)]' : 'bg-white/20'}`} />

                            {/* Depth Number (Overlaying the bar/side) */}
                            <span className={`absolute left-6 text-[9px] font-mono font-medium transition-all duration-500 ${isPassed ? 'text-cyan-300 drop-shadow-[0_0_5px_rgba(103,232,249,0.8)] scale-110' : 'text-white/40'}`}>
                                {depth.toLocaleString()}m
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default VerticalProgressBar;
