'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import CoupangAd from './CoupangAd';

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
                        <CoupangAd />


                        {/* Close Button Area */}
                        <div className="py-3 px-4 bg-gray-50 flex justify-between items-center">
                            <span className="text-xs text-gray-400">광고 눌러주세요.ㅠㅠ</span>
                            <button
                                onClick={canClose ? onClose : undefined}
                                disabled={!canClose}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${canClose
                                    ? 'bg-gray-900 text-white hover:bg-black'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {canClose ? '결과보기' : `광고 닫고 결과보기 ${countdown}초`}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AdPopup;
