'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ResultData {
  resultCode: string;
  ocean: string;
  season: string;
  score: any;
  title: string;
  description: string;
  advice?: string;
  hashtag?: string[];
  id?: string; // Added ID for feedback
}

interface ResultViewProps {
  result: ResultData;
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, onRestart }) => {
  // Feedback state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Helper function to parse text and convert **text** to <strong>text</strong>
  const parseTextWithBold = (text: string) => {
    // Match any text wrapped in ** **, including **text**, **[text]**, **'text'**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      // Extract content between ** **
      const match = part.match(/^\*\*(.*?)\*\*$/);
      if (match) {
        // Remove optional brackets or quotes from the content
        const content = match[1].replace(/^[\[']|[\]']$/g, '');
        return <strong key={index}>{content}</strong>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      alert('별점을 선택해주세요!');
      return;
    }

    if (!result.id) {
      console.error('No result ID found');
      alert('오류가 발생했습니다. 다시 시도해주세요.');
      return;
    }

    try {
      const response = await fetch('/api/test/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: result.id,
          rating,
          comment,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      console.log('📊 User Feedback Submitted');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('피드백 전송에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-10 w-full relative z-20">

      <motion.div
        className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl w-full text-center space-y-6 sm:space-y-7 md:space-y-8 border border-white/30 bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_rgba(251,146,60,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 5.0, duration: 1.0 }} // Delayed to show 5s video intro
      >
        <div className="space-y-3">
          <h3 className="text-white/95 text-sm tracking-[0.3em] uppercase font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]">
            {result.ocean} - {result.season}
          </h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            {result.title}
          </h2>
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-200/30 to-transparent" />

        {result.advice && (
          <div className="p-4 bg-white/10 rounded-xl border border-white/25 shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
            <p className="text-sm text-white/95 font-medium mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">이 겨울 온도를 높여줄 한가지</p>
            <p className="text-white/95 text-sm drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{result.advice}</p>
          </div>
        )}

        <p className="text-white/95 leading-loose font-normal text-lg whitespace-pre-wrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          {parseTextWithBold(result.description)}
        </p>

        {result.hashtag && result.hashtag.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {result.hashtag.map((tag, idx) => (
              <span key={idx} className="px-3 py-1 rounded-full bg-white/15 text-xs text-white/90 border border-white/20 backdrop-blur-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Feedback Section */}
      <motion.div
        className="glass-panel p-6 sm:p-7 md:p-8 rounded-3xl w-full border border-white/30 bg-gradient-to-b from-white/15 via-white/10 to-white/5 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_60px_rgba(251,146,60,0.25),inset_0_1px_1px_rgba(255,255,255,0.3)]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 6.0, duration: 0.8 }}
      >
        {!isSubmitted ? (
          <div className="space-y-6">
            <h3 className="text-xl font-serif text-white text-center drop-shadow-[0_2px_6px_rgba(0,0,0,0.7)]">
              테스트가 어떠셨나요?
            </h3>

            {/* Star Rating */}
            <div className="flex flex-col items-center space-y-3">
              <p className="text-sm text-orange-100/70">만족도를 평가해주세요</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      className={`w-10 h-10 transition-colors ${star <= (hoverRating || rating)
                        ? 'text-orange-400 fill-orange-400'
                        : 'text-orange-200/30 fill-none'
                        }`}
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-xs text-orange-200/80">
                  {rating}점을 선택하셨습니다
                </p>
              )}
            </div>

            {/* Comment Field */}
            <div className="space-y-2">
              <label htmlFor="feedback-comment" className="text-sm text-orange-100/70 block">
                의견을 남겨주세요 (선택사항)
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={3}
                placeholder="예: 질문이 흥미로웠어요 / 결과가 정확했어요 / 더 개선되면 좋을 점 등"
                className="w-full p-4 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/50 focus:outline-none focus:border-white/50 focus:bg-white/15 transition-colors resize-none backdrop-blur-sm"
                aria-label="피드백 코멘트"
              />
              <p className="text-xs text-orange-200/60 text-right">
                {comment.length}/500
              </p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleFeedbackSubmit}
              className="w-full py-3 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-medium shadow-lg hover:from-orange-500 hover:to-rose-500 transition-all"
            >
              의견 제출하기
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="text-center"
            >
              <div className="text-2xl mb-2">✨</div>
              <div className="text-lg text-white font-medium mb-1">
                소중한 의견 감사합니다!
              </div>
              <div className="text-sm text-orange-100/70">
                더 나은 서비스를 만드는 데 큰 도움이 됩니다
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>

      <div className="flex flex-col w-full space-y-3">
        <motion.button
          onClick={() => alert('공유 기능은 준비 중입니다.')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-white/10 text-white rounded-xl font-medium border border-white/20 hover:bg-white/20 transition-colors"
        >
          결과 공유하기
        </motion.button>

        <motion.button
          onClick={onRestart}
          whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(251, 146, 60, 0.4)" }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-orange-400 to-rose-400 text-white rounded-xl font-bold shadow-lg hover:from-orange-500 hover:to-rose-500 transition-all"
        >
          다시 시작하기
        </motion.button>
      </div>
    </div>
  );
};

export default ResultView;
