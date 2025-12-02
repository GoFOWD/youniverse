'use client';

import React from 'react';

interface CompatibilityViewProps {
    ocean: string;
    season: string;
}

const CompatibilityView: React.FC<CompatibilityViewProps> = ({ ocean, season }) => {
    // Simple compatibility logic (placeholder)
    // Ideally this would come from a data mapping
    const getBestMatch = (o: string) => {
        const matches: Record<string, string> = {
            '태평양': '대서양',
            '대서양': '인도양',
            '인도양': '남극해',
            '남극해': '북극해',
            '북극해': '태평양',
        };
        return matches[o] || 'Unknown Ocean';
    };

    const bestMatch = getBestMatch(ocean);

    return (
        <div className="w-full space-y-6 text-center">
            <h3 className="text-xl font-serif text-white/80">함께하는 동료들 (Voyage Companions)</h3>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-center gap-8">
                <div className="text-center">
                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">나의 바다</div>
                    <div className="text-lg font-bold text-white">{ocean}</div>
                </div>

                <div className="text-2xl text-white/30">🤝</div>

                <div className="text-center">
                    <div className="text-xs text-white/50 uppercase tracking-widest mb-1">최고의 동료</div>
                    <div className="text-lg font-bold text-emerald-300">{bestMatch}</div>
                </div>
            </div>

            <button className="w-full py-4 bg-white text-black font-bold rounded-xl shadow-lg hover:bg-gray-100 transition-all transform hover:-translate-y-1 active:translate-y-0">
                모든 바다 유형 보기 (20 Types) 🌊
            </button>
        </div>
    );
};

export default CompatibilityView;
