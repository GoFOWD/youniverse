'use client';

import React, { useRef, useEffect, useState } from 'react';

interface SimpleFallbackVideoProps {
    videoSrc: string;
    spotlight?: boolean;
    backgroundColor?: string;
}

/**
 * Fallback video player for browsers that don't support WebGL (e.g., KakaoTalk in-app browser)
 * Uses native HTML5 video element with CSS for effects
 */
export default function SimpleFallbackVideo({ videoSrc, spotlight = false, backgroundColor = '#000000' }: SimpleFallbackVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Force video attributes for better compatibility
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');

        const handleLoadedMetadata = () => {
            // Show video as soon as we have basic metadata
            setIsLoaded(true);
        };

        const handleCanPlay = () => {
            // Try to play immediately when video is ready
            video.play().catch(err => {
                console.warn('Video autoplay failed, waiting for interaction:', err);
            });
        };

        const handleInteraction = () => {
            if (video.paused) {
                video.play().catch(err => console.warn('Video play failed:', err));
            }
        };

        // Prioritize loadedmetadata for faster visual feedback
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('canplay', handleCanPlay);
        window.addEventListener('touchstart', handleInteraction, { once: true });
        window.addEventListener('click', handleInteraction, { once: true });

        // Start loading immediately
        video.load();

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('canplay', handleCanPlay);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('click', handleInteraction);
        };
    }, [videoSrc]);

    useEffect(() => {
        if (!spotlight) return;

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: e.clientX / window.innerWidth,
                y: e.clientY / window.innerHeight
            });
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                setMousePos({
                    x: e.touches[0].clientX / window.innerWidth,
                    y: e.touches[0].clientY / window.innerHeight
                });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove);
        };
    }, [spotlight]);

    return (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0" style={{ backgroundColor }} />

            {/* Video with fade-in */}
            <div
                className="absolute inset-0 transition-opacity duration-300 ease-out"
                style={{ opacity: isLoaded ? 1 : 0 }}
            >
                {/* Video element */}
                <video
                    ref={videoRef}
                    src={videoSrc}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                />

                {/* Spotlight overlay */}
                {spotlight && (
                    <div
                        className="absolute inset-0 pointer-events-none transition-all duration-100"
                        style={{
                            background: `radial-gradient(circle 250px at ${mousePos.x * 100}% ${mousePos.y * 100}%, transparent 0%, ${backgroundColor} 100%)`,
                        }}
                    />
                )}
            </div>
        </div>
    );
}
