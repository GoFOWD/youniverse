'use client';

import React from 'react';
import { motion } from 'framer-motion';

const JellyfishIndicator: React.FC = () => {
    return (
        <div className="relative w-12 h-16 flex justify-center items-center">
            {/* Head (Bell) */}
            <motion.div
                className="absolute top-0 w-10 h-8 bg-white/80 rounded-t-full shadow-[0_0_15px_rgba(255,255,255,0.6)] backdrop-blur-sm z-10"
                animate={{
                    scaleY: [1, 0.9, 1],
                    y: [0, 2, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Inner Glow */}
                <div className="absolute inset-2 bg-blue-300/30 rounded-t-full blur-sm" />
            </motion.div>

            {/* Tentacles */}
            <div className="absolute top-7 flex justify-center gap-1.5 w-full">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="w-1 bg-gradient-to-b from-white/60 to-transparent rounded-full"
                        style={{ height: 20 + Math.random() * 10 }}
                        animate={{
                            height: [20, 30, 20],
                            rotate: [0, i % 2 === 0 ? 5 : -5, 0],
                        }}
                        transition={{
                            duration: 1.5 + Math.random(),
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: i * 0.2
                        }}
                    />
                ))}
            </div>

            {/* Particles/Bubbles around */}
            <motion.div
                className="absolute -top-2 -right-2 w-1.5 h-1.5 bg-white/50 rounded-full"
                animate={{ y: -10, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div
                className="absolute -top-4 -left-1 w-1 h-1 bg-white/40 rounded-full"
                animate={{ y: -8, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.1 }}
            />
        </div>
    );
};

export default JellyfishIndicator;
