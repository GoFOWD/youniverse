import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

import Barometer from './Barometer';
import { getPersona } from '../../data/personaData';

interface ShareCardProps {
    oceanName: string;
    seasonName: string;
    keywords: string[];
    onReadMore: () => void;
    scores?: { P: number; E: number; C: number };
    description?: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ oceanName, seasonName, keywords, onReadMore, scores, description }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [logNumber, setLogNumber] = useState(0);
    const [compassRotation, setCompassRotation] = useState(0);
    const [luckLevel, setLuckLevel] = useState('');

    const persona = getPersona(oceanName, seasonName);

    useEffect(() => {
        setLogNumber(Math.floor(Math.random() * 1000));
        setCompassRotation(Math.floor(Math.random() * 360));

        // Determine luck level based on scores
        const avgScore = scores ? (scores.P + scores.E + scores.C) / 3 : 0;
        if (avgScore > 1) setLuckLevel('행운의 바람');
        else if (avgScore > 0) setLuckLevel('순풍');
        else if (avgScore > -1) setLuckLevel('잔잔한 바다');
        else setLuckLevel('폭풍 전야');
    }, [scores]);

    const handleDownload = async () => {
        if (!cardRef.current) return;

        try {
            const canvas = await html2canvas(cardRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
            } as any);

            const link = document.createElement('a');
            link.download = `my_voyage_log_${new Date().getTime()}.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        } catch (err) {
            console.error('Failed to generate image:', err);
        }
    };

    // Ship positioning logic (Adjusted for 4:3 Aspect Ratio)
    const getShipPosition = (ocean: string) => {
        switch (ocean) {
            case '태평양': return { top: '50%', left: '85%' }; // Right Center (below Japan)
            case '대서양': return { top: '35%', left: '35%' };
            case '인도양': return { top: '60%', left: '65%' };
            case '남극해': return { top: '80%', left: '50%' };
            case '북극해': return { top: '15%', left: '50%' };
            default: return { top: '50%', left: '50%' };
        }
    };

    const shipPos = getShipPosition(oceanName);

    return (
        <div className="flex flex-col items-center space-y-6 w-full max-w-md mx-auto">
            {/* Capture Area (The Card) - 9:16 Aspect Ratio */}
            <div
                ref={cardRef}
                className="relative w-full aspect-[9/16] bg-[#e8dcc5] text-[#2c1810] overflow-hidden shadow-2xl rounded-sm flex flex-col"
            >
                {/* HEADER SECTION: Title */}
                <div className="relative w-full bg-gradient-to-b from-[#d4c5a9] to-[#e8dcc5] border-b-2 border-[#8b5a2b]/30 py-3 px-6">
                    {/* Decorative Corner Elements */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8b5a2b]/40" />
                    <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8b5a2b]/40" />

                    <div className="text-center">
                        <div className="text-xs text-[#8b5a2b] font-serif uppercase tracking-widest mb-1">Voyage Log</div>
                        <h1 className="text-xl font-bold tracking-wider text-[#1a0f0a] drop-shadow-sm font-serif">
                            {oceanName} · {seasonName}
                        </h1>
                    </div>
                </div>

                {/* MAP SECTION: 4:5 Ratio */}
                <div className="relative w-full aspect-[4/5] overflow-hidden border-b-2 border-[#8b5a2b]/30">
                    <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                            backgroundImage: 'url(/assets/vintage_world_map.png)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        {/* Overlays */}
                        <div className="absolute inset-0 bg-[#5d4037]/10 mix-blend-multiply pointer-events-none" />
                        <div className="absolute inset-0 border-[6px] border-double border-[#8b5a2b]/40 pointer-events-none z-20" />

                        {/* Ship Marker */}
                        <div
                            className="absolute w-20 h-20 transition-all duration-1000 ease-out z-10"
                            style={{
                                top: shipPos.top,
                                left: shipPos.left,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="relative w-full h-full animate-float">
                                <img
                                    src="/assets/ship_vintage.png"
                                    alt="Ship"
                                    className="w-full h-full object-contain drop-shadow-lg opacity-90"
                                />
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-white/30 rounded-full blur-sm animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* INSTRUMENTS SECTION: Side by Side */}
                <div className="relative w-full bg-[#e8dcc5] border-b-2 border-[#8b5a2b]/30 flex items-center justify-center gap-4 py-3">
                    {/* Barometer */}
                    <div className="w-[120px] h-[120px]">
                        {scores && <Barometer season={seasonName} />}
                    </div>

                    {/* Compass */}
                    <div className="w-[120px] h-[120px] relative">
                        <img
                            src="/assets/compass_bg.png"
                            alt="Compass"
                            className="w-full h-full object-cover rounded-full"
                        />
                        <div
                            className="absolute top-1/2 left-1/2 transition-transform duration-700 ease-out"
                            style={{
                                transform: `translate(-50%, -50%) rotate(${compassRotation}deg)`,
                                transformOrigin: 'center center'
                            }}
                        >
                            <div
                                className="absolute left-1/2 -translate-x-1/2"
                                style={{
                                    width: '0',
                                    height: '0',
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderBottom: '35px solid #c41e3a',
                                    top: '-35px',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}
                            />
                            <div
                                className="absolute left-1/2 -translate-x-1/2"
                                style={{
                                    width: '0',
                                    height: '0',
                                    borderLeft: '4px solid transparent',
                                    borderRight: '4px solid transparent',
                                    borderTop: '35px solid #2a2a2a',
                                    top: '0',
                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                }}
                            />
                            <div
                                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 z-10"
                                style={{
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* FEATURED SAILOR SECTION: "Sailor of the Year" Style */}
                <div className="relative w-full flex-1 bg-gradient-to-b from-[#e8dcc5] to-[#d4c5a9] flex flex-col items-center justify-center px-6 py-4">
                    {/* Award-style Header */}
                    <div className="text-center mb-3">
                        <div className="text-xs text-[#8b5a2b] font-serif uppercase tracking-[0.2em] mb-1 opacity-80">
                            ⚓ Featured Sailor ⚓
                        </div>
                        <div className="text-sm text-[#5d4037] font-serif italic">
                            Voyage Companion of the Season
                        </div>
                    </div>

                    {/* Large Portrait Frame */}
                    <div className="relative mb-3">
                        {/* Ornate Corner Decorations - Larger */}
                        <div className="absolute -top-3 -left-3 w-10 h-10 border-t-4 border-l-4 border-[#8b5a2b]/70"
                            style={{ borderImage: 'linear-gradient(135deg, #8b5a2b, #d4a574) 1' }} />
                        <div className="absolute -top-3 -right-3 w-10 h-10 border-t-4 border-r-4 border-[#8b5a2b]/70"
                            style={{ borderImage: 'linear-gradient(45deg, #8b5a2b, #d4a574) 1' }} />
                        <div className="absolute -bottom-3 -left-3 w-10 h-10 border-b-4 border-l-4 border-[#8b5a2b]/70"
                            style={{ borderImage: 'linear-gradient(225deg, #8b5a2b, #d4a574) 1' }} />
                        <div className="absolute -bottom-3 -right-3 w-10 h-10 border-b-4 border-r-4 border-[#8b5a2b]/70"
                            style={{ borderImage: 'linear-gradient(315deg, #8b5a2b, #d4a574) 1' }} />

                        {/* Large Featured Portrait */}
                        <div className="relative w-40 h-40 bg-[#f5f0e8] p-3 shadow-2xl"
                            style={{
                                border: '6px double #8b5a2b',
                                boxShadow: 'inset 0 0 30px rgba(139, 90, 43, 0.15), 0 6px 20px rgba(0,0,0,0.4)'
                            }}>
                            <div className="w-full h-full overflow-hidden bg-[#faf8f3] relative"
                                style={{
                                    border: '3px solid #d4a574',
                                    filter: 'sepia(0.2) contrast(1.1)'
                                }}>
                                <img
                                    src={`/assets/${persona?.image}.png`}
                                    alt={persona?.animal}
                                    className="w-full h-full object-cover"
                                    style={{
                                        mixBlendMode: 'multiply',
                                        opacity: 0.95
                                    }}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/assets/ship_icon.png';
                                    }}
                                />
                                {/* Vintage Photo Effect Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#5d4037]/5 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* Name Plate */}
                    <div className="text-center w-full bg-[#8b5a2b]/10 py-2 px-4 rounded border border-[#8b5a2b]/30">
                        <h3 className="text-lg font-bold text-[#2c1810] font-serif leading-tight mb-1">
                            {persona?.animal || '신비로운 바다 생물'}
                        </h3>
                        <p className="text-xs text-[#5d4037] font-serif leading-relaxed break-keep opacity-90 italic">
                            {persona?.description || description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3 px-4">
                <button
                    onClick={handleDownload}
                    className="w-full py-4 bg-[#2c1810] text-[#f4e4bc] font-serif text-lg rounded-lg shadow-lg hover:bg-[#3e2723] transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    항해 일지 저장 (갤러리)
                </button>

                <button
                    onClick={onReadMore}
                    className="w-full py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white font-light rounded-lg hover:bg-white/20 transition-all text-sm animate-pulse"
                >
                    상세 분석 결과 확인하기 ↓
                </button>
            </div>
        </div>
    );
};

export default ShareCard;
