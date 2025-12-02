'use client';

import React from 'react';

interface CompassProps {
    score: number; // 0 to 10 (or -2 to 2 converted)
}

const Compass: React.FC<CompassProps> = ({ score }) => {
    // Map score to rotation
    // Let's say 0 is -90deg (West), 10 is 90deg (East), 5 is 0deg (North)
    // Or just random/fixed if no logic provided.
    // User said "Barometer and Compass". Barometer uses Season.
    // Compass usually points North.
    // Let's make it dynamic based on score to feel "alive".
    // Score 0-10 -> Rotation -45 to 45?
    const rotation = (score - 5) * 10; // -50deg to +50deg

    return (
        <div className="relative w-full aspect-square mx-auto">
            {/* Compass Background Image */}
            <img
                src="/assets/compass_bg.png"
                alt="Compass"
                className="w-full h-full object-cover rounded-full"
            />

            {/* Needle Container - Centered */}
            <div
                className="absolute top-1/2 left-1/2 origin-center transition-transform duration-1000 ease-out"
                style={{
                    transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
                    width: '0px',
                    height: '0px',
                }}
            >
                {/* Needle - Double ended (Red North, White South) */}
                {/* North (Red) */}
                <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        bottom: '0',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderBottom: '45px solid #ef4444', // Reduced from 70px
                        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
                    }}
                />
                {/* South (White/Silver) */}
                <div
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                        top: '0',
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '45px solid #e5e7eb', // Reduced from 70px
                        filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))'
                    }}
                />
            </div>

            {/* Center Cap */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 z-10 shadow-md"
                style={{
                    border: '2px solid #9ca3af'
                }}
            />
        </div>
    );
};

export default Compass;
