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

    // Measure actual card height dynamically using ResizeObserver
    useEffect(() => {
        if (!cardRef.current) return;

        const resizeObserver = new ResizeObserver(() => {
            // Use offsetHeight to include padding/borders and ensure full height is captured
            if (cardRef.current) {
                setCardHeight(cardRef.current.offsetHeight);
            }
        });

        resizeObserver.observe(cardRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <div className="flex flex-col items-center w-full mx-auto px-[3%] max-w-[400px] overflow-visible">
            {/* Wrapper to center and handle scaling space */}
            <div
                className="relative flex justify-center items-center w-full transition-all duration-300 ease-out"
                style={{
                    height: `${(cardHeight * scale) + 60}px`, // Reserve scaled height + 60px buffer to prevent overlap
                    paddingTop: '20px',
                    paddingBottom: '20px'
                }}
            >
                {/* Capture Area (The Card) - Fixed 360x640 (9:16) */}
                <div
                    ref={cardRef}
                    className="absolute bg-[#e8dcc5] text-[#2c1810] overflow-visible shadow-2xl rounded-lg flex flex-col aspect-[4/5]"
                    style={{
                        width: '360px',
                        height: '450px',
                        transform: `scale(${scale})`,
                        transformOrigin: 'top center',
                        willChange: 'transform'
                    }}
                >
                    {/* HEADER SECTION: Title */}
                    <div className="relative w-full bg-gradient-to-b from-[#d4c5a9] to-[#e8dcc5] py-3 px-6 shrink-0 z-10">
                        {/* Decorative Corner Elements */}
                        <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#8b5a2b]/40" />
                        <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#8b5a2b]/40" />

                        <div className="text-center">
                            <div className="text-xs text-[#8b5a2b] font-serif uppercase tracking-widest mb-1">2025 나의 항해 일지</div>
                            <h1 className="text-2xl font-extrabold tracking-wider text-[#1a0f0a] drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] font-serif">
                                {oceanName} · {seasonName}
                            </h1>
                        </div>
                    </div>
                    {/* ANIMAL PERSONA SECTION: Simplified & Enlarged */}
                    <div className="relative w-full flex-1 bg-gradient-to-b from-[#e8dcc5] via-[#d4c5a9] to-[#c9b896] flex flex-col items-center justify-center px-6 pt-2 pb-8 overflow-hidden">
                        {/* Animal Image - Large, No Frame */}
                        <div className="relative mb-0 w-full max-w-[280px] h-[280px] flex items-center justify-center">
                            <img
                                src={`/assets/${persona?.image}.png`}
                                alt={persona?.animal}
                                className="w-full h-full object-contain drop-shadow-2xl"
                                style={{
                                    filter: 'brightness(1.05) contrast(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                                    opacity: 1
                                }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/ship_icon.png';
                                }}
                            />
                        </div>

                        {/* Name and Description - No Box, Better Typography */}
                        <div className="relative text-center w-full space-y-2 mt-[-10px]">
                            <h3 className="inline-block bg-[#2c1810] text-white text-lg md:text-xl font-bold font-sans leading-tight px-6 py-2 rounded-full shadow-md">
                                {persona?.animal || '신비로운 바다 생물'}
                            </h3>
                            <p className="text-base md:text-lg text-[#2c1810] font-serif leading-relaxed break-keep px-4 font-semibold drop-shadow-sm">
                                {persona?.description || description}
                            </p>
                        </div>

                        {/* Decorative Bottom Corner Elements */}
                        <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#8b5a2b]/40" />
                        <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#8b5a2b]/40" />
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex flex-col w-full gap-5 mt-[10px] z-10">
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
