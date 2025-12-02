'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatChartProps {
    scores: {
        P: number; // Positivity
        E: number; // Energy
        C: number; // Curiosity
    };
}

const StatChart: React.FC<StatChartProps> = ({ scores }) => {
    // Helper to determine color based on score (0-10)
    const getColor = (score: number) => {
        if (score <= 3) return 'bg-red-500 shadow-red-500/50';
        if (score <= 6) return 'bg-emerald-500 shadow-emerald-500/50';
        return 'bg-blue-500 shadow-blue-500/50';
    };

    const getLabel = (score: number) => {
        if (score <= 3) return '낮음';
        if (score <= 6) return '보통';
        return '높음';
    };

    // Convert -2~2 range to 0~10 scale
    const convertScore = (rawScore: number) => {
        return (rawScore + 2) * 2.5;
    };

    const stats = [
        { label: '긍정성 (Positivity)', value: convertScore(scores.P), key: 'P' },
        { label: '에너지 (Energy)', value: convertScore(scores.E), key: 'E' },
        { label: '호기심 (Curiosity)', value: convertScore(scores.C), key: 'C' },
    ];

    return (
        <div className="w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 space-y-6">
            <h3 className="text-xl font-serif text-white/90 text-center mb-4">항해 분석 (Voyage Stats)</h3>

            <div className="space-y-5">
                {stats.map((stat, index) => (
                    <div key={stat.key} className="space-y-2">
                        <div className="flex justify-between text-sm text-white/70">
                            <span>{stat.label}</span>
                            <span className="font-mono">{stat.value}/10 ({getLabel(stat.value)})</span>
                        </div>

                        <div className="h-4 bg-black/20 rounded-full overflow-hidden relative">
                            {/* Grid lines */}
                            <div className="absolute inset-0 flex justify-between px-1">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-[1px] h-full bg-white/5" />
                                ))}
                            </div>

                            <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${(stat.value / 10) * 100}%` }}
                                transition={{ duration: 1, delay: index * 0.2, ease: "easeOut" }}
                                className={`h-full rounded-full ${getColor(stat.value)} shadow-[0_0_10px_rgba(0,0,0,0.3)]`}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="text-xs text-white/40 text-center mt-4 pt-4 border-t border-white/5">
                * Analysis based on your navigation choices
            </div>
        </div>
    );
};

export default StatChart;
