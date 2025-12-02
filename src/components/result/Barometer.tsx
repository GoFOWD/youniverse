'use client';

import React from 'react';

interface BarometerProps {
    season: string;
}

const Barometer: React.FC<BarometerProps> = ({ season }) => {
    // Map season to rotation and position
    // Barometer scale: -90° (left/low) to +90° (right/high)
    // 봄 (Spring): Rising pressure, slightly right
    // 여름 (Summer): High pressure, far right (bottom right on display)
    // 가을 (Fall): Falling pressure, slightly left
    // 겨울 (Winter): Low pressure, far left (bottom left on display)
    const getRotation = (season: string) => {
        switch (season) {
            case '봄': return 45; // Spring - Right Top
            case '여름': return 135; // Summer - Right Bottom
            case '가을': return -45; // Fall - Left Top
            case '겨울': return -135; // Winter - Left Bottom
            default: return 0;
        }
    };

    const rotation = getRotation(season);

    return (
        <div className="relative w-full aspect-square mx-auto">
            {/* Barometer Background Image - Full width */}
            <img
                src="/assets/barometer_bg.png"
                alt="Barometer"
                className="w-full h-full object-cover rounded-full"
            />

            {/* Needle - CSS Only, properly centered and contained */}
            <div
                className="absolute top-1/2 left-1/2 origin-center transition-transform duration-700"
                style={{
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    width: '0px',
                    height: '0px',
                    zIndex: 20
                }}
            >
                {/* Needle shaft - extends upward from center */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 rounded-t-full shadow-lg"
                    style={{
                        bottom: '-5px', // Extend slightly below center for pivot look
                        width: '4px',
                        height: '50%', // Length of needle
                        maxHeight: '70px',
                        background: 'linear-gradient(to top, #991b1b, #ef4444)',
                        transformOrigin: 'bottom center'
                    }}
                />
                {/* Needle tip */}
                <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        bottom: 'calc(50% - 10px)', // Position tip at top of shaft
                        marginBottom: '0px',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '12px solid #ef4444',
                    }}
                />
            </div>

            {/* Center cap - on top of everything */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 z-10"
                style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
                }}
            />
        </div>
    );
};

export default Barometer;
