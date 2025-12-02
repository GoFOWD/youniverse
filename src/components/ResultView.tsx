'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ShareCard from './result/ShareCard';
import AdPopup from './result/AdPopup';
import StatChart from './result/StatChart';
import Barometer from './result/Barometer';
import LetterView from './result/LetterView';
import AllOceanTypesView from './result/AllOceanTypesView';
import CompatibilityView from './result/CompatibilityView';

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
          userResponseId: result.id,
          rating,
          comment
        }),
      });

      if (response.ok) {
        setFeedbackSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock keywords based on result (could be added to DB later)
  const keywords = [result.season, 'Voyager', 'Deep Ocean', result.ocean];

  return (
    <div className="w-full min-h-screen pb-20 relative z-10">
      <AdPopup isOpen={isAdOpen} onClose={handleAdClose} />

      {/* All Ocean Types Modal */}
      <AnimatePresence>
        {showAllOceans && <AllOceanTypesView onClose={() => setShowAllOceans(false)} />}
      </AnimatePresence>

      <div className="max-w-md mx-auto px-4 space-y-12 pt-8">

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
              {/* SECTION 2: Stat Analysis & Barometer */}
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-serif text-white">항해 기록 (Navigation Log)</h2>
                  <div className="w-12 h-1 bg-white/20 mx-auto rounded-full" />
                </div>

                <Barometer season={result.season} />
                <StatChart scores={result.scores} />
              </section>

              {/* SECTION 3: The Letter */}
              <section>
                <LetterView
                  title={result.title}
                  description={result.description}
                  advice={result.advice}
                  oceanName={result.ocean}
                  seasonName={result.season}
                />
              </section>

              {/* Button to show all ocean types */}
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

              {/* SECTION 4: Compatibility */}
              <section>
                <CompatibilityView ocean={result.ocean} season={result.season} />
              </section>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ResultView;
