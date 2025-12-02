'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface Option {
  id: string;
  text: string;
}

interface Question {
  id: number;
  question: string;
  options: Option[];
}

interface QuestionViewProps {
  question: Question;
  onAnswer: (id: string) => void;
  disabled?: boolean;
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, onAnswer, disabled }) => {
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);

  const handleAnswer = (id: string) => {
    if (selectedOptionId || disabled) return; // Prevent multiple clicks or interaction when disabled
    setSelectedOptionId(id);

    // Call onAnswer immediately so sound plays right away
    onAnswer(id);
    // State will be reset by useEffect when question changes
  };

  // Reset selection when question changes
  React.useEffect(() => {
    setSelectedOptionId(null);
  }, [question.id]);

  return (
    <div className={`w-full flex flex-col items-center space-y-6 sm:space-y-8 md:space-y-10 relative z-20 ${disabled ? 'pointer-events-none' : ''}`}>
      <motion.div
        className="glass-panel p-6 sm:p-8 md:p-10 rounded-3xl w-full text-center shadow-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-white leading-relaxed drop-shadow-md relative z-10">
          {question.question}
        </h2>
      </motion.div>

      <div className="w-full space-y-3 sm:space-y-4 md:space-y-5">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isOtherSelected = selectedOptionId !== null && !isSelected;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              disabled={disabled}
              initial={{ opacity: 0 }}
              animate={{
                opacity: isOtherSelected ? 0.5 : 1,
                borderColor: isSelected ? "rgba(255,255,255,0)" : "rgba(255, 255, 255, 0.1)",
                backgroundColor: isSelected ? "rgba(255,255,255,0)" : "rgba(255, 255, 255, 0.05)",
                scale: isSelected ? 0.95 : 1,
                boxShadow: isSelected ? "none" : "0 0 0 0 rgba(0,0,0,0)"
              }}
              transition={{
                opacity: { duration: 0.3 },
                borderColor: { duration: 0.15 },
                backgroundColor: { duration: 0.15 },
                boxShadow: { duration: 0.15 },
                scale: { duration: 0.2, ease: "easeIn" }
              }}
              whileHover={!selectedOptionId ? {
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
              } : {}}
              whileTap={!selectedOptionId ? { scale: 0.98 } : {}}
              className="group w-full p-4 sm:p-5 md:p-6 rounded-2xl border text-white text-lg font-light transition-all duration-300 hover:shadow-xl text-left relative overflow-visible cursor-pointer touch-manipulation z-30"
            >
              <span className={`relative z-10 transition-all duration-300 ${isSelected ? 'font-medium text-teal-200' : 'group-hover:font-normal'}`}>
                {option.text}
              </span>

              {/* Ripple/Glow Effect on Hover (Only if not selected) */}
              {!selectedOptionId && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              )}

              {/* BURST EFFECT - Simplified to just button state change */}
              {isSelected && (
                <div className="absolute inset-0 bg-white/10 animate-pulse rounded-2xl pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionView;
