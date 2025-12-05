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
    {
        id: 'ad1',
        src: 'https://coupa.ng/ckVTlN',
        width: '300',
        height: '600'
    },
    { id: 'ad2', src: 'https://link.coupang.com/a/da4gE6', width: '300', height: '600' },
    { id: 'ad3', src: 'https://link.coupang.com/a/da4r3l', width: '300', height: '600' },
    { id: 'ad4', src: 'https://link.coupang.com/a/da4siu', width: '300', height: '600' },
    { id: 'ad5', src: 'https://link.coupang.com/a/da4sGY', width: '300', height: '600' },
    { id: 'ad6', src: 'https://link.coupang.com/a/da4txp', width: '300', height: '600' },
    { id: 'ad7', src: 'https://link.coupang.com/a/da4tKU', width: '300', height: '600' },
    { id: 'ad8', src: 'https://link.coupang.com/a/da4uBi', width: '300', height: '600' },
    { id: 'ad9', src: 'https://link.coupang.com/a/da4vqu', width: '300', height: '600' },
    { id: 'ad10', src: 'https://link.coupang.com/a/da4vCx', width: '300', height: '600' },
    { id: 'ad11', src: 'https://link.coupang.com/a/da4v9U', width: '300', height: '600' },
    { id: 'ad12', src: 'https://link.coupang.com/a/da4wt0', width: '300', height: '600' },
    { id: 'ad13', src: 'https://link.coupang.com/a/da4wLt', width: '300', height: '600' },
    { id: 'ad14', src: 'https://link.coupang.com/a/da4wYa', width: '300', height: '600' },
    { id: 'ad15', src: 'https://link.coupang.com/a/da4x8T', width: '300', height: '600' },
    { id: 'ad16', src: 'https://link.coupang.com/a/da4yDF', width: '300', height: '600' },
    { id: 'ad17', src: 'https://link.coupang.com/a/da4yO5', width: '300', height: '600' },
];

const CoupangAd: React.FC = () => {
    const [selectedAd, setSelectedAd] = useState<AdItem | null>(null);

    useEffect(() => {
        // Randomly select an ad on mount
        const randomIndex = Math.floor(Math.random() * AD_LIST.length);
        setSelectedAd(AD_LIST[randomIndex]);
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
