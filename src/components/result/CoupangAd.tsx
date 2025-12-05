'use client';

import React, { useEffect, useState } from 'react';

// Define the structure for an ad
interface AdItem {
    id: string;
    src: string;
    width: string;
    height: string;
}

// List of ads to rotate
const AD_LIST: AdItem[] = [
    { id: 'ad1', src: 'https://coupa.ng/ckVTlN', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVVdU', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVX7a', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYeT', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYkJ', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYnS', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYry', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYtS', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYxn', width: '200', height: '350' },

];

const CoupangAd: React.FC = () => {
    const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

    useEffect(() => {
        const fetchAndSelectAd = async () => {
            let availableAds = [...AD_LIST];

            try {
                const res = await fetch('/api/admin/ads');
                if (res.ok) {
                    const dbAds = await res.json();
                    if (dbAds && dbAds.length > 0) {
                        // Map DB ads to AdItem format
                        const formattedDbAds = dbAds.map((ad: any) => ({
                            id: `db_${ad.id}`,
                            src: ad.src,
                            width: ad.width,
                            height: ad.height
                        }));
                        // Combine or prioritize DB ads
                        availableAds = [...formattedDbAds, ...AD_LIST];
                    }
                }
            } catch (error) {
                console.error('Failed to fetch dynamic ads:', error);
            }

            // Randomly select an ad
            const randomIndex = Math.floor(Math.random() * availableAds.length);
            setSelectedAd(availableAds[randomIndex]);
        };

        fetchAndSelectAd();
    }, []);

    if (!selectedAd) return null;

    return (
        <div className="bg-white flex flex-col items-center justify-center p-0 text-center">
            <div className="overflow-hidden" style={{ width: `${selectedAd.width}px`, height: `${selectedAd.height}px` }}>
                <iframe
                    src={selectedAd.src}
                    width={selectedAd.width}
                    height={selectedAd.height}
                    frameBorder="0"
                    scrolling="no"
                    referrerPolicy="unsafe-url"
                    // @ts-ignore
                    browsingTopics={true}
                ></iframe>
            </div>
            <p className="text-[9px] text-gray-400 leading-tight pb-1 px-2 pt-1">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br />
                이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
};

export default CoupangAd;
