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
    // Original Ads (200x350)
    { id: 'ad1', src: 'https://coupa.ng/ckVTlN', width: '200', height: '350' },
    { id: 'ad2', src: 'https://coupa.ng/ckVVdU', width: '200', height: '350' },
    { id: 'ad3', src: 'https://coupa.ng/ckVX7a', width: '200', height: '350' },
    { id: 'ad4', src: 'https://coupa.ng/ckYVeT', width: '200', height: '350' },
    { id: 'ad5', src: 'https://coupa.ng/ckVYkJ', width: '200', height: '350' },
    { id: 'ad6', src: 'https://coupa.ng/ckVYnS', width: '200', height: '350' },
    { id: 'ad7', src: 'https://coupa.ng/ckVYry', width: '200', height: '350' },
    { id: 'ad8', src: 'https://coupa.ng/ckVYtS', width: '200', height: '350' },
    { id: 'ad9', src: 'https://coupa.ng/ckVYxn', width: '200', height: '350' },
    { id: 'ad10', src: 'https://coupa.ng/ck5tNV', width: '200', height: '350' },
    { id: 'ad11', src: 'https://coupa.ng/ck5uL2', width: '200', height: '350' },

    // New Ads (120x240)
    { id: 'ad12', src: 'https://coupa.ng/ck5vga', width: '120', height: '240' },
    { id: 'ad13', src: 'https://coupa.ng/ck5vhb', width: '120', height: '240' },
    { id: 'ad14', src: 'https://coupa.ng/ck5viz', width: '120', height: '240' },
    { id: 'ad15', src: 'https://coupa.ng/ck5vi9', width: '120', height: '240' },
    { id: 'ad16', src: 'https://coupa.ng/ck5vj6', width: '120', height: '240' },
    { id: 'ad17', src: 'https://coupa.ng/ck5vkC', width: '120', height: '240' },
    { id: 'ad18', src: 'https://coupa.ng/ck5vk1', width: '120', height: '240' },
    { id: 'ad19', src: 'https://coupa.ng/ck5vlz', width: '120', height: '240' },
    { id: 'ad20', src: 'https://coupa.ng/ck5vmi', width: '120', height: '240' },
    { id: 'ad21', src: 'https://coupa.ng/ck5vsF', width: '120', height: '240' },
];

const CoupangAd: React.FC = () => {
    const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

    useEffect(() => {
        const fetchAndSelectAd = async () => {
            let availableAds = [...AD_LIST];

            try {
                // Ensure the API endpoint exists before relying on it, or handle 404 gracefully
                const res = await fetch('/api/admin/ads').catch(() => null);

                if (res && res.ok) {
                    const dbAds = await res.json();
                    if (Array.isArray(dbAds) && dbAds.length > 0) {
                        // Map DB ads to AdItem format
                        const formattedDbAds = dbAds.map((ad: any) => ({
                            id: `db_${ad.id}`,
                            src: ad.src,
                            width: ad.width || '200',
                            height: ad.height || '350'
                        }));
                        // Combine or prioritize DB ads
                        availableAds = [...formattedDbAds, ...AD_LIST];
                    }
                }
            } catch (error) {
                console.warn('Failed to fetch dynamic ads, using default list:', error);
            }

            // Randomly select an ad
            const randomIndex = Math.floor(Math.random() * availableAds.length);
            setSelectedAd(availableAds[randomIndex]);
        };

        fetchAndSelectAd();
    }, []);

    if (!selectedAd) return null;

    return (
        <div className="flex flex-col items-center justify-center my-4 w-full">
            <div style={{ width: `${selectedAd.width}px`, height: `${selectedAd.height}px` }}>
                <iframe
                    src={selectedAd.src}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    referrerPolicy="unsafe-url"
                    style={{ width: '100%', height: '100%', display: 'block' }}
                ></iframe>
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
                이 포스팅은 쿠팡 파트너스 활동의 일환으로,<br />
                이에 따른 일정액의 수수료를 제공받습니다.
            </p>
        </div>
    );
};

export default CoupangAd;
