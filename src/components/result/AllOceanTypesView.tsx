'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPersona } from '../../data/personaData';

// All 20 ocean type combinations (5 oceans × 4 seasons)
const ALL_OCEAN_TYPES = [
    { ocean: '태평양', season: '봄', description: '새로운 시작과 가능성의 바다' },
    { ocean: '태평양', season: '여름', description: '열정과 활력이 넘치는 바다' },
    { ocean: '태평양', season: '가을', description: '성찰과 결실의 바다' },
    { ocean: '태평양', season: '겨울', description: '고요함 속 깊은 사색의 바다' },

    { ocean: '대서양', season: '봄', description: '도전과 모험의 바다' },
    { ocean: '대서양', season: '여름', description: '자유와 열정의 바다' },
    { ocean: '대서양', season: '가을', description: '변화와 성장의 바다' },
    { ocean: '대서양', season: '겨울', description: '인내와 극복의 바다' },

    { ocean: '인도양', season: '봄', description: '따뜻한 감성의 바다' },
    { ocean: '인도양', season: '여름', description: '풍요와 번영의 바다' },
    { ocean: '인도양', season: '가을', description: '지혜와 통찰의 바다' },
    { ocean: '인도양', season: '겨울', description: '평온과 안정의 바다' },

    { ocean: '남극해', season: '봄', description: '순수와 희망의 바다' },
    { ocean: '남극해', season: '여름', description: '극한의 도전과 성취의 바다' },
    { ocean: '남극해', season: '가을', description: '고독 속 자아 발견의 바다' },
    { ocean: '남극해', season: '겨울', description: '극한의 인내와 의지의 바다' },

    { ocean: '북극해', season: '봄', description: '신비와 경이의 바다' },
    { ocean: '북극해', season: '여름', description: '백야의 끝없는 가능성의 바다' },
    { ocean: '북극해', season: '가을', description: '오로라 같은 영감의 바다' },
    { ocean: '북극해', season: '겨울', description: '극지의 고요와 명상의 바다' },
];

const AllOceanTypesView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-b from-[#d4c5a9] to-[#e8dcc5] rounded-2xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#2c1810]/80 text-white hover:bg-[#2c1810] transition-all flex items-center justify-center"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-[#1a0f0a] mb-2 font-serif">모든 바다 유형</h2>
                    <p className="text-[#5d4037] text-sm">20가지 바다와 계절의 조합</p>
                </div>

                {/* Grid of Ocean Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {ALL_OCEAN_TYPES.map((type, index) => {
                        const persona = getPersona(type.ocean, type.season);
                        return (
                            <motion.div
                                key={`${type.ocean}-${type.season}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-[#8b5a2b]/20 hover:border-[#8b5a2b]/40 transition-all hover:shadow-lg flex flex-col items-center gap-3"
                            >
                                {/* Animal Image - Larger */}
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8b5a2b]/30 shadow-lg bg-white">
                                    <img
                                        src={`/assets/${persona?.image}.png`}
                                        alt={persona?.animal}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/assets/ship_icon.png'; // Fallback
                                        }}
                                    />
                                </div>

                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-bold text-[#1a0f0a] font-serif">
                                        {type.ocean}의 {type.season}
                                    </h3>
                                    <div className="inline-block px-3 py-1 bg-[#2c1810]/90 text-[#f4e4bc] rounded-full text-xs font-medium">
                                        {persona?.animal || '신비로운 바다 생물'}
                                    </div>
                                    <p className="text-xs text-[#5d4037]/80 leading-relaxed break-keep">
                                        {persona?.description || type.description}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="text-center mt-8 pt-6 border-t border-[#8b5a2b]/20">
                    <p className="text-xs text-[#5d4037]/60">
                        각 바다는 당신의 내면을 반영합니다
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default AllOceanTypesView;
