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
            <h3 className="text-xl font-serif text-white/80"><strong>2026년</strong> <br></br>베스트 항해 파트너</h3>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
                <div className="text-xs text-white/50 uppercase tracking-widest mb-1"><strong>나의 동료가 되라!</strong></div>

                {/* Animal Image */}
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 shadow-lg bg-black/20">
                    <img
                        src={`/assets/${bestMatchPersona?.image}.png`}
                        alt={bestMatchPersona?.animal}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/ship_icon.png'; // Fallback
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
