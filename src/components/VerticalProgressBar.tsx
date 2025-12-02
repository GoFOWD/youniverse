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
            {/* Track */}
            <div className="absolute inset-y-0 w-[2px] bg-white/20 left-1/2 -translate-x-1/2 rounded-full" />

            {/* Surface Marker (Top) */}
            <div className="absolute -top-6 text-[10px] text-cyan-300 font-bold tracking-widest uppercase text-center w-20 shadow-black/50 drop-shadow-md">
                Surface
            </div>

            {/* Abyss Marker (Bottom) */}
            <div className="absolute -bottom-6 text-[10px] text-indigo-400 font-bold tracking-widest uppercase text-center w-20 shadow-black/50 drop-shadow-md">
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
                {depthMarkers.map((depth, i) => (
                    <div key={i} className="relative w-full flex items-center justify-center">
                        {/* Tick Mark */}
                        <div className="w-4 h-[1px] bg-white/40" />

                        {/* Depth Number (Overlaying the bar/side) */}
                        <span className="absolute left-6 text-[9px] font-mono text-white/60 font-medium drop-shadow-md">
                            {depth.toLocaleString()}m
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VerticalProgressBar;
