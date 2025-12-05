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

    const bestMatchOcean = getBestMatch(ocean);
    // Assuming best match season is same or random, let's pick same season for simplicity or random
    // For now, let's just use the same season to get a persona, or hardcode a mapping if needed.
    // Let's use '여름' as default or same season.
    const bestMatchSeason = season;

    // Import getPersona here or pass it down? 
    // Since it's a client component, we can import it.
    // We need to import getPersona at the top.
    const { getPersona } = require('../../data/personaData');
    const bestMatchPersona = getPersona(bestMatchOcean, bestMatchSeason);

    return (
        <div className="w-full space-y-6 text-center">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                    2026년<br />베스트 항해 파트너
                </h2>
                <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col items-center justify-center gap-0">
                {/* Speech Bubble */}
                <div className="relative bg-white/90 rounded-2xl px-6 py-3 shadow-lg">
                    <div className="text-sm font-bold text-gray-800 tracking-wide">나의 친구가 되라!</div>
                    {/* Speech bubble tail */}
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-white/90" />
                </div>

                {/* Animal Image - No circular background */}
                <div className="w-[280px] h-[280px] flex items-center justify-center mt-[-10px]">
                    <img
                        src={`/assets/${bestMatchPersona?.image}.png`}
                        alt={bestMatchPersona?.animal}
                        className="w-full h-full object-contain drop-shadow-xl"
                        style={{
                            filter: 'brightness(1.05) contrast(1.1)'
                        }}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/ship_icon.png';
                        }}
                    />
                </div>

                <div className="text-center space-y-2">
                    <div className="text-xl font-bold text-emerald-300">{bestMatchOcean}의 {bestMatchSeason}</div>
                    <div className="text-lg text-white font-serif">{bestMatchPersona?.animal}</div>
                    <p className="text-sm text-white/60 max-w-xs mx-auto leading-relaxed">
                        {bestMatchPersona?.description}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CompatibilityView;
