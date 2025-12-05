'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdPopup: React.FC<AdPopupProps> = ({ isOpen, onClose }) => {
    const [countdown, setCountdown] = useState(5);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCountdown(5);
            setCanClose(false);
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanClose(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white w-auto max-w-[90vw] rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Ad Content */}
                        <div className="bg-white flex flex-col items-center justify-center p-0 text-center space-y-2">
                            <div className="w-[120px] h-[240px] overflow-hidden">
                                <iframe
                                    src="https://coupa.ng/ckVTlN"
                                    width="120"
                                    height="240"
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

                        {/* Close Button Area */}
                        <div className="p-4 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-400">Sponsored</span>
                            <button
                                onClick={canClose ? onClose : undefined}
                                disabled={!canClose}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${canClose
                                    ? 'bg-gray-900 text-white hover:bg-black'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {canClose ? 'Close & View Result' : `Wait ${countdown}s`}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AdPopup;
