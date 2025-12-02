import React, { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

import Barometer from './Barometer';

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
            });

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
            case '태평양': return { top: '45%', left: '75%' };
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
            {/* Capture Area (The Card) */}
            <div
                ref={cardRef}
                className="relative w-full bg-[#e8dcc5] text-[#2c1810] overflow-hidden shadow-2xl rounded-sm flex flex-col"
            >
                {/* 1. Header/Title Section - Ocean and Season on One Line */}
                <div className="relative p-6 pb-4 bg-gradient-to-b from-[#d4c5a9] to-[#e8dcc5] border-b-2 border-[#8b5a2b]/30">
                    {/* Decorative Corner Elements */}
                    <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#8b5a2b]/40" />
                    <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#8b5a2b]/40" />

                    <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-12 h-[1px] bg-[#8b5a2b]/40" />
                            <span className="text-[9px] tracking-[0.3em] uppercase opacity-60 font-bold">Voyage Log</span>
                            <div className="w-12 h-[1px] bg-[#8b5a2b]/40" />
                        </div>
                        <h3 className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-mono">No. {logNumber}</h3>

                        {/* Ocean and Season on One Line */}
                        <h1 className="text-2xl font-bold tracking-wider text-[#1a0f0a] drop-shadow-sm font-serif">
                            {oceanName} · {seasonName}의 바다
                        </h1>
                    </div>
                </div>

                {/* 2. Map Section - 4:3 Aspect Ratio */}
                <div
                    className="relative w-full aspect-[4/3] overflow-hidden border-b-4 border-[#8b5a2b]/40"
                    style={{
                        backgroundImage: 'url(/assets/vintage_world_map.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    {/* Overlays */}
                    <div className="absolute inset-0 bg-[#5d4037]/10 mix-blend-multiply pointer-events-none" />
                    <div className="absolute inset-0 border-[8px] border-double border-[#8b5a2b]/40 pointer-events-none z-20" />

                    {/* Ship Marker - Using vintage ship image */}
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
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-white/30 rounded-full blur-sm animate-pulse" />
                        </div>
                    </div>

                    {/* Coordinates Label - REMOVED */}
                </div>

                {/* 3. Dashboard Section - Full Width Instruments */}
                {/* 3. Dashboard Section - Full Width Instruments */}
                <div className="px-[10px] py-10 bg-[#e8dcc5]">

                    {/* Dashboard Instruments - Side by Side, Full Width */}
                    <div className="grid grid-cols-2 gap-2 mb-6">

                        {/* Barometer - Left */}
                        <div className="flex flex-col items-center justify-center">
                            {scores && <Barometer season={seasonName} />}
                        </div>

                        {/* Compass - Right */}
                        <div className="flex flex-col items-center justify-center">
                            <div className="relative w-full aspect-square mx-auto">
                                {/* Compass Background - Provided Image */}
                                <img
                                    src="/assets/compass_bg.png"
                                    alt="Compass"
                                    className="w-full h-full object-cover rounded-full"
                                />

                                {/* Compass Needle - CSS Only, centered */}
                                <div
                                    className="absolute top-1/2 left-1/2 transition-transform duration-700 ease-out"
                                    style={{
                                        transform: `translate(-50%, -50%) rotate(${compassRotation}deg)`,
                                        transformOrigin: 'center center'
                                    }}
                                >
                                    {/* North pointer (Red) */}
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2"
                                        style={{
                                            width: '0',
                                            height: '0',
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderBottom: '75px solid #c41e3a',
                                            top: '-75px',
                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                        }}
                                    />
                                    {/* South pointer (Dark) */}
                                    <div
                                        className="absolute left-1/2 -translate-x-1/2"
                                        style={{
                                            width: '0',
                                            height: '0',
                                            borderLeft: '6px solid transparent',
                                            borderRight: '6px solid transparent',
                                            borderTop: '75px solid #2a2a2a',
                                            top: '0',
                                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                                        }}
                                    />
                                    {/* Center cap */}
                                    <div
                                        className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 z-10"
                                        style={{
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description (2 Lines) */}
                    {description && (
                        <div className="text-center space-y-2 pt-2 pb-4 border-t border-[#8b5a2b]/20">
                            <p className="text-sm text-[#5d4037]/90 font-serif leading-relaxed line-clamp-2 px-2">
                                {description}
                            </p>
                        </div>
                    )}

                    {/* Keywords */}
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {keywords.map((keyword, i) => (
                            <span key={i} className="px-2 py-1 bg-[#2c1810]/90 text-[#f4e4bc] border border-[#2c1810]/20 rounded-full text-[10px] font-medium shadow-sm">
                                #{keyword}
                            </span>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="text-center w-full border-t border-[#2c1810]/30 pt-3">
                        <p className="text-[9px] tracking-widest opacity-70 font-bold">NAKED OCEAN PSYCHOLOGY</p>
                        <p className="text-[8px] mt-0.5 opacity-60">youniverse.com</p>
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
