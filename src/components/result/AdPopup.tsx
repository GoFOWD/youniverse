'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const AdPopup: React.FC<AdPopupProps> = ({ isOpen, onClose }) => {
    const [countdown, setCountdown] = useState(3);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setCountdown(3);
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
                        className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl relative"
                    >
                        {/* Fake Ad Content */}
                        <div className="h-64 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white p-6 text-center">
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Premium Voyage</h3>
                                <p className="text-sm opacity-90">Unlock the deepest secrets of your ocean.</p>
                                <div className="mt-4 px-4 py-2 bg-white text-indigo-600 font-bold rounded-full text-sm inline-block">
                                    ADVERTISEMENT
                                </div>
                            </div>
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
