'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareCard from './result/ShareCard';
import AdPopup from './result/AdPopup';
import StatChart from './result/StatChart';
import Barometer from './result/Barometer';
import Compass from './result/Compass';
import LetterView from './result/LetterView';
import AllOceanTypesView from './result/AllOceanTypesView';
import CompatibilityView from './result/CompatibilityView';
import { getPersona } from '../data/personaData';
import { MAP_DESCRIPTIONS } from '../data/mapDescriptions';

interface ResultData {
  id: string;
  ocean: string;
  season: string;
  title: string;
  description: string;
  advice: string;
  scores: {
    P: number;
    E: number;
    C: number;
  };
  hashtag?: string[];
}

interface ResultViewProps {
  result: ResultData;
}

const ResultView: React.FC<ResultViewProps> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [showAllOceans, setShowAllOceans] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showThankYouPopup, setShowThankYouPopup] = useState(false);

  const persona = getPersona(result.ocean, result.season);

  const detailsRef = useRef<HTMLDivElement>(null);

  const handleReadMore = () => {
    setIsAdOpen(true);
  };

  const handleAdClose = () => {
    setIsAdOpen(false);
    setShowDetails(true);
    // Smooth scroll to details after a short delay
    setTimeout(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/test/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: result.id, // Fixed: use id instead of userResponseId
          rating,
          comment
        }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
        setShowThankYouPopup(true); // Show popup
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock keywords based on result (could be added to DB later)
  const keywords = [result.season, 'Voyager', 'Deep Ocean', result.ocean];

  // Helper function to parse **text** and return bold elements
  const formatText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="w-full min-h-[100dvh] pb-20 relative z-10">
      <AdPopup isOpen={isAdOpen} onClose={handleAdClose} />

      {/* Thank You Popup */}
      <AnimatePresence>
        {showThankYouPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowThankYouPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#2c1810] border-2 border-[#8b5a2b] rounded-xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
            >
              {/* Vintage paper texture overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#f4e4bc]/10 to-transparent opacity-30 pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="text-4xl">✨</div>
                <h3 className="text-xl font-serif font-bold text-[#f4e4bc] leading-relaxed">
                  감사합니다.<br />
                  행복한 2026년 되세요
                </h3>
                <button
                  onClick={() => setShowThankYouPopup(false)}
                  className="px-6 py-2 bg-[#8b5a2b] hover:bg-[#a06b35] text-[#f4e4bc] rounded-lg font-serif transition-colors"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* All Ocean Types Modal */}
      <AnimatePresence>
        {showAllOceans && <AllOceanTypesView onClose={() => setShowAllOceans(false)} />}
      </AnimatePresence>

      <div className="w-full mx-auto px-[3%] space-y-12 pt-8">

        {/* 1. Viral Share Card (Vintage Logbook) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ShareCard
            oceanName={result.ocean}
            seasonName={result.season}
            keywords={result.hashtag || []}
            onReadMore={handleReadMore}
            scores={result.scores} // Pass scores for Barometer
            description={result.description} // Pass description
          />
        </motion.section>

        {/* HIDDEN SECTIONS (Revealed after Ad) */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              ref={detailsRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.8 }}
              className="space-y-16"
            >
              {/* NEW SECTION: Ocean + Season Title with Map */}
              <section className="space-y-8">
                {/* Title */}
                <div className="text-center space-y-3">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-white drop-shadow-lg">
                    2025 나의 항해 지도
                  </h2>
                  <div className="w-16 h-1 bg-white/40 mx-auto rounded-full" />
                </div>

                {/* Map Section */}
                <div className="relative w-full max-w-2xl mx-auto aspect-[4/3] rounded-2xl overflow-hidden">
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: 'url(/assets/vintage_world_map.png)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-[#5d4037]/10 mix-blend-multiply pointer-events-none" />

                    {/* Ship Marker */}
                    <div
                      className="absolute w-24 h-24 md:w-32 md:h-32 transition-all duration-1000 ease-out z-10"
                      style={{
                        top: (() => {
                          switch (result.ocean) {
                            case '태평양': return '50%';
                            case '대서양': return '35%';
                            case '인도양': return '60%';
                            case '남극해': return '80%';
                            case '북극해': return '15%';
                            default: return '50%';
                          }
                        })(),
                        left: (() => {
                          switch (result.ocean) {
                            case '태평양': return '85%';
                            case '대서양': return '35%';
                            case '인도양': return '65%';
                            case '남극해': return '50%';
                            case '북극해': return '50%';
                            default: return '50%';
                          }
                        })(),
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <div className="relative w-full h-full animate-float">
                        <img
                          src="/assets/ship_vintage.png"
                          alt="Ship"
                          className="w-full h-full object-contain drop-shadow-lg opacity-90"
                        />
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-2 bg-white/30 rounded-full blur-sm animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Block */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl py-6 px-4 border border-white/10 text-center">
                  <div className="space-y-2">
                    {(() => {
                      const oceanDesc = MAP_DESCRIPTIONS[result.ocean];
                      const desc = oceanDesc ? oceanDesc[result.season] : null;

                      if (desc) {
                        return (
                          <>
                            <h3 className="text-xl md:text-2xl text-white font-serif font-bold drop-shadow-lg mb-3">
                              {result.ocean}의 {result.season}
                            </h3>
                            <p className="text-lg md:text-xl text-white/90 font-serif font-medium drop-shadow-md leading-relaxed">
                              {desc[0]}
                            </p>
                            <p className="text-lg md:text-xl text-white/90 font-serif font-medium drop-shadow-md leading-relaxed">
                              {desc[1]}
                            </p>
                          </>
                        );
                      }

                      // Fallback
                      return (
                        <p className="text-xl md:text-2xl text-white/90 font-serif font-medium drop-shadow-md">
                          {result.ocean}의 {result.season}
                        </p>
                      );
                    })()}
                  </div>
                </div>
              </section>

              {/* SECTION 2: Navigation Analysis - Split Layout */}
              <section className="space-y-12">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                    감정 기압 측정 결과
                  </h2>
                  <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
                </div>

                {/* Block 1: Barometer + Graph */}
                <div className="flex flex-col items-center gap-6">
                  <div className="w-full max-w-[200px] transform scale-110">
                    <Barometer season={result.season} />
                  </div>
                  <div className="w-full">
                    <StatChart scores={result.scores} />
                  </div>
                </div>

                {/* Block 2: Compass + Letter */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-white drop-shadow-lg">
                    나침반이 알려주는 방향
                  </h2>
                  <div className="w-12 h-1 bg-white/30 mx-auto rounded-full" />
                </div>

                {/* Compass - Outside Box */}
                <div className="flex justify-center">
                  <div className="w-full max-w-[200px] transform scale-110">
                    <Compass score={result.scores.C} />
                  </div>
                </div>

                {/* Letter Content - Inside Box */}
                <div className="bg-white/5 backdrop-blur-md rounded-2xl py-6 px-4 border border-white/10 flex flex-col items-center gap-6">
                  <div className="w-full text-center space-y-4">
                    <h3 className="text-lg font-serif text-amber-100/80">To. Voyager</h3>
                    <p className="text-white font-medium leading-loose whitespace-pre-wrap">
                      {formatText(result.description)}
                    </p>
                    {result.advice && (
                      <div className="pt-4 border-t border-white/10">
                        <p className="text-cyan-200/90 text-sm leading-relaxed">
                          💡 {formatText(result.advice)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* SECTION 3: Compatibility (Moved Up) */}
              <section>

                <CompatibilityView ocean={result.ocean} season={result.season} />
              </section>

              {/* SECTION 4: All Ocean Types (Moved Down) */}
              <section className="flex justify-center">
                <button
                  onClick={() => setShowAllOceans(true)}
                  className="group relative px-8 py-3 bg-[#2c1810] text-[#f4e4bc] rounded-lg font-serif text-sm shadow-lg hover:shadow-xl transition-all border-2 border-[#8b5a2b]/30 hover:border-[#8b5a2b]/60 overflow-hidden"
                >
                  {/* Vintage paper texture overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#3e2723]/50 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />

                  <div className="relative flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="tracking-wide">모든 바다 유형 보기 (20 Types)</span>
                  </div>
                </button>
              </section>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Section - Fixed at bottom */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-serif text-white mb-4 text-center">이번 항해는 어떠셨나요?</h3>

          {!feedbackSubmitted ? (
            <div className="space-y-4">
              {/* Star Rating */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-3xl transition-all hover:scale-110"
                  >
                    {star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>

              {/* Comment Input */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="소중한 의견을 남겨주세요..."
                className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-white/40 resize-none"
                rows={3}
              />

              {/* Submit Button */}
              <button
                onClick={handleFeedbackSubmit}
                disabled={isSubmitting || rating === 0}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '전송 중...' : '피드백 보내기'}
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-white/80 mb-2">✨ 소중한 의견 감사합니다! ✨</p>
              <p className="text-white/60 text-sm">더 나은 항해를 위해 노력하겠습니다.</p>
            </div>
          )}
        </motion.section>

        {/* Ad Banner Section - Fixed at bottom */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-[#2c1810]/80 to-[#3e2723]/80 backdrop-blur-md rounded-2xl p-8 border-2 border-[#8b5a2b]/30 relative overflow-hidden flex justify-center items-center min-h-[200px]"
        >
          {/* Vintage paper texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#f4e4bc]/5 to-transparent opacity-30" />

          <div className="relative text-center w-full">
            <div className="text-[#8b5a2b] text-xs font-serif tracking-widest uppercase mb-2"></div>
            {/* Google AdSense */}
            <div className="w-full overflow-hidden">
              <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2243110505553175"
                crossOrigin="anonymous"></script>
              {/* Result Page Ad */}
              <ins className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-2243110505553175"
                data-ad-format="auto"
                data-full-width-responsive="true"></ins>
              <script>
                {`(adsbygoogle = window.adsbygoogle || []).push({});`}
              </script>
            </div>
          </div>
        </motion.section>

      </div >
    </div >
  );
};

export default ResultView;
