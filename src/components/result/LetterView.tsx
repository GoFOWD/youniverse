'use client';

import React from 'react';

interface LetterViewProps {
    title: string;
    description: string;
    advice: string;
    oceanName?: string;
    seasonName?: string;
}

const LetterView: React.FC<LetterViewProps> = ({ title, description, advice, oceanName, seasonName }) => {
    // Helper to parse bold text (**text**)
    const parseTextWithBold = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index} className="font-bold text-indigo-200">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    // Generate summary from description (first 2 sentences or 150 chars)
    const getSummary = (text: string) => {
        if (!text) return '';
        const sentences = text.split(/[.!?]\s+/);
        const summary = sentences.slice(0, 2).join('. ');
        return summary.length > 150 ? summary.substring(0, 150) + '...' : summary + '.';
    };

    return (
        <div className="w-full space-y-8">
            {/* Compass Header with Summary */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 backdrop-blur-sm p-8 rounded-xl border border-indigo-500/30 shadow-2xl">
                <div className="flex items-start gap-6">
                    {/* Compass Icon */}
                    <div className="flex-shrink-0">
                        <svg viewBox="0 0 100 100" className="w-24 h-24">
                            {/* Outer metallic ring */}
                            <defs>
                                <radialGradient id="metalGradLetter">
                                    <stop offset="0%" stopColor="#818cf8" />
                                    <stop offset="50%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#4f46e5" />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="50" r="48" fill="url(#metalGradLetter)" stroke="#312e81" strokeWidth="2" />
                            <circle cx="50" cy="50" r="42" fill="#1e1b4b" stroke="#4c1d95" strokeWidth="1" />

                            {/* Cardinal Directions */}
                            <text x="50" y="18" textAnchor="middle" fontSize="10" fill="#c7d2fe" fontWeight="bold">N</text>
                            <text x="82" y="54" textAnchor="middle" fontSize="8" fill="#a5b4fc">E</text>
                            <text x="50" y="88" textAnchor="middle" fontSize="8" fill="#a5b4fc">S</text>
                            <text x="18" y="54" textAnchor="middle" fontSize="8" fill="#a5b4fc">W</text>

                            {/* Compass Needle */}
                            <g transform="rotate(45 50 50)">
                                <path d="M50 20 L55 50 L50 48 L45 50 Z" fill="#ef4444" />
                                <path d="M50 80 L55 50 L50 52 L45 50 Z" fill="#1e1b4b" />
                                <circle cx="50" cy="50" r="4" fill="#c7d2fe" />
                            </g>
                        </svg>
                    </div>

                    {/* Summary Text */}
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-indigo-200 mb-2">
                            {oceanName && seasonName ? `${oceanName} · ${seasonName}의 바다` : '항해 요약'}
                        </h3>
                        <p className="text-indigo-100/80 leading-relaxed text-sm">
                            {getSummary(description)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Full Letter Content */}
            <div className="bg-black/20 backdrop-blur-sm p-8 rounded-sm border-l-4 border-white/20">
                <h3 className="text-2xl font-serif text-white mb-6 border-b border-white/10 pb-4">
                    친애하는 항해자에게,
                </h3>

                <div className="space-y-6 text-lg leading-relaxed text-white/90 font-light">
                    <div className="whitespace-pre-wrap">
                        {parseTextWithBold(description)}
                    </div>
                </div>
            </div>

            {/* Captain's Advice */}
            <div className="bg-indigo-900/20 p-6 rounded-xl border border-indigo-500/30">
                <h4 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
                    <span className="text-xl">⚓</span> 선장의 조언 (Captain's Advice)
                </h4>
                <p className="text-indigo-100/90 italic leading-relaxed">
                    "{advice}"
                </p>
            </div>
        </div>
    );
};

export default LetterView;
