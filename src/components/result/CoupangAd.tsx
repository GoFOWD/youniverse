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
    { id: 'ad1', src: 'https://coupa.ng/ckVTlN', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVVdU', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVX7a', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYeT', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYkJ', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYnS', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYry', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYtS', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYxn', width: '300', height: '600' },
    { id: 'ad2', src: 'https://coupa.ng/ckVYxn', width: '300', height: '600' },
    { id: 'ad2', src: 'https://link.coupang.com/a/da5hKP', width: '300', height: '600' },

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
        <div className="bg-white flex flex-col items-center justify-center p-0 text-center space-y-2">
            <div className="w-[300px] h-[600px] overflow-hidden">
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
            <p className="text-[10px] text-gray-400 leading-tight pb-2 px-2">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br />
                이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
};

export default CoupangAd;
