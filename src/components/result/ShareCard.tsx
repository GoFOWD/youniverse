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

    // Ship positioning logic (Adjusted for 16:9 Aspect Ratio)
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

    // Calculate scale based on window width to fit the fixed 360px card
    const [scale, setScale] = useState(1);
    const [cardHeight, setCardHeight] = useState(640);

    useEffect(() => {
        const handleResize = () => {
            const windowWidth = window.innerWidth;
            const maxCardWidth = 400; // Max width constraint
            const cardBaseWidth = 360; // The fixed width we designed for

            // Calculate scale needed to fit window with padding
            // Available width is windowWidth - 32px (padding)
            const availableWidth = Math.min(windowWidth - 32, maxCardWidth);

            // If available width is less than base width, scale down
            // If available width is more, we can scale up slightly or keep 1
            // Let's stick to scale 1 max to prevent blur, or allow slight upscale
            const newScale = availableWidth / cardBaseWidth;
            setScale(newScale);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Measure actual card height after render
    useEffect(() => {
        if (cardRef.current) {
            const height = cardRef.current.offsetHeight;
            setCardHeight(height);
        }
    }, []);

    return (
        <div className="flex flex-col items-center space-y-6 w-full mx-auto overflow-hidden">
            {/* Wrapper to center and handle scaling space */}
            <div
                className="relative flex justify-center items-center w-full"
                style={{
                    height: `${cardHeight * scale}px`, // Reserve exact scaled height
                }}
            >
                {/* Capture Area (The Card) - Fixed 360x640 (9:16) */}
                <div
                    ref={cardRef}
                    className="absolute bg-[#e8dcc5] text-[#2c1810] overflow-hidden shadow-2xl rounded-lg flex flex-col"
                    style={{
                        width: '360px',
                        minHeight: '640px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        willChange: 'transform'
                    }}
                >
                    {/* HEADER SECTION: Title */}
                    <div className="relative w-full bg-gradient-to-b from-[#d4c5a9] to-[#e8dcc5] border-b-2 border-[#8b5a2b]/30 py-3 px-6 shrink-0">
                        {/* Decorative Corner Elements */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8b5a2b]/40" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8b5a2b]/40" />

                        <div className="text-center">
                            <div className="text-xs text-[#8b5a2b] font-serif uppercase tracking-widest mb-1">2025 나의 항해 일지</div>
                            <h1 className="text-xl font-bold tracking-wider text-[#1a0f0a] drop-shadow-sm font-serif">
                                {oceanName} · {seasonName}
                            </h1>
                        </div>
                    </div>

                    {/* MAP SECTION: Fixed Height to maintain ratio within fixed container */}
                    {/* 360px width. 4:5 ratio map would be 360 * 1.25 = 450px height. 
                        But we have limited space. 
                        Total height 640. 
                        Header ~70px. 
                        Instruments ~120px. 
                        Footer ~150px.
                        Map needs to fit remaining. 
                        Let's keep the map aspect ratio but maybe contain it? 
                        Or just set a fixed height that looks good.
                        Previous code used aspect-[4/5]. 360 * 1.25 = 450px. Too tall for 640px total.
                        Let's use a fixed height for map section to ensure it fits.
                        Say 260px height for map.
                    */}
                    <div className="relative w-full h-[240px] overflow-hidden border-b-2 border-[#8b5a2b]/30 shrink-0">
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
                    <div className="relative w-full bg-[#e8dcc5] border-b-2 border-[#8b5a2b]/30 flex items-center justify-center gap-4 py-2 shrink-0">
                        {/* Barometer */}
                        <div className="w-[100px] h-[100px]">
                            {scores && <Barometer season={seasonName} />}
                        </div>

                        {/* Compass */}
                        <div className="w-[100px] h-[100px] relative">
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
                                        borderBottom: '25px solid #c41e3a',
                                        top: '-25px',
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
                                        borderTop: '25px solid #2a2a2a',
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
                    <div className="relative w-full bg-gradient-to-b from-[#e8dcc5] to-[#d4c5a9] flex flex-col items-center justify-center px-6 py-4">

                        {/* Large Portrait Frame with Image */}
                        <div className="relative mb-2 w-full max-w-[200px] h-[200px] flex items-center justify-center">
                            {/* Frame Image */}
                            <img
                                src="/assets/올해의선원프레임.png"
                                alt="Frame"
                                className="absolute inset-0 w-full h-full object-contain z-20"
                            />

                            {/* Animal Image - Positioned inside the frame */}
                            {/* Adjust size and position to fit the specific frame opening */}
                            <div className="w-[110px] h-[110px] relative z-10 rounded-full overflow-hidden bg-[#faf8f3] -rotate-3">
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
                            </div>
                        </div>

                        {/* Name Plate */}
                        <div className="text-center w-full bg-[#8b5a2b]/10 py-1.5 px-4 rounded border border-[#8b5a2b]/30 mt-2">
                            <h3 className="text-base font-bold text-[#2c1810] font-serif leading-tight mb-0.5">
                                {persona?.animal || '신비로운 바다 생물'}
                            </h3>
                            <p className="text-[10px] text-[#5d4037] font-serif leading-relaxed break-keep opacity-90 italic">
                                {persona?.description || description}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-3 px-4 max-w-[400px]">
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
                    className="group relative w-full py-4 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-[1.02] active:scale-98 transition-all duration-300 border border-white/20 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    <div className="relative flex items-center justify-center gap-2 drop-shadow-md">
                        <span className="tracking-wide">✨ 상세 분석 결과 확인하기</span>
                        <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ShareCard;
