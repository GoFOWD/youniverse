'use client';

import React, { useEffect, useRef } from 'react';

const CoupangDynamicBanner: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent duplicate injection
        if (!containerRef.current || containerRef.current.querySelector('script[src="https://ads-partners.coupang.com/g.js"]')) {
            return;
        }

        const script = document.createElement('script');
        script.src = "https://ads-partners.coupang.com/g.js";
        script.async = true;

        script.onload = () => {
            if ((window as any).PartnersCoupang) {
                try {
                    new (window as any).PartnersCoupang.G({
                        "id": 952312,
                        "template": "carousel",
                        "trackingCode": "AF3255057",
                        "width": "680",
                        "height": "140",
                        "tsource": ""
                    });
                } catch (e) {
                    console.error("Coupang Banner initialization failed", e);
                }
            }
        };

        containerRef.current.appendChild(script);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full my-4">
            <div ref={containerRef} className="min-h-[140px]"></div>
            <p className="text-[10px] text-gray-400 mt-2">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
};

export default CoupangDynamicBanner;
