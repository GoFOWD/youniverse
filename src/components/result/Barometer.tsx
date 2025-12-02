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

            {/* Needle Container - rotates from center */}
            <div
                className="absolute top-1/2 left-1/2 transition-transform duration-700 ease-out"
                style={{
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    transformOrigin: 'center center',
                    width: '100%',
                    height: '100%',
                    zIndex: 20
                }}
            >
                {/* Needle - points upward (12 o'clock) when rotation is 0 */}
                <div
                    className="absolute left-1/2 top-1/2"
                    style={{
                        width: '3px',
                        height: '18%', // Further reduced to stay safely within bounds
                        background: 'linear-gradient(to top, #7c2d12, #dc2626)',
                        transformOrigin: 'bottom center',
                        transform: 'translate(-50%, -100%)', // Position so bottom is at center
                        borderRadius: '2px 2px 0 0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}
                />

                {/* Needle tip (arrow) */}
                <div
                    className="absolute left-1/2 top-1/2"
                    style={{
                        width: '0',
                        height: '0',
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderBottom: '10px solid #dc2626',
                        transform: 'translate(-50%, calc(-100% - 18%))', // Adjusted for new needle length
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
                    }}
                />
            </div>

            {/* Center cap - on top of everything */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 z-30"
                style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
                }}
            />
        </div>
    );
};

export default Barometer;
