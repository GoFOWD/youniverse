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
}

const QuestionView: React.FC<QuestionViewProps> = ({ question, onAnswer }) => {
  const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);

  const handleAnswer = (id: string) => {
    if (selectedOptionId) return; // Prevent multiple clicks
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
    <div className="w-full flex flex-col items-center space-y-10 relative z-20">
      <motion.div
        className="glass-panel p-10 rounded-3xl w-full text-center shadow-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-white leading-relaxed drop-shadow-md">
          {question.question}
        </h2>
      </motion.div>

      <div className="w-full space-y-5">
        {question.options.map((option, index) => {
          const isSelected = selectedOptionId === option.id;
          const isOtherSelected = selectedOptionId !== null && !isSelected;

          return (
            <motion.button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              initial={{ x: -20, opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: isOtherSelected ? 0.5 : 1, 
                borderColor: isSelected ? "rgba(255,255,255,0)" : "rgba(255, 255, 255, 0.1)", 
                backgroundColor: isSelected ? "rgba(255,255,255,0)" : "rgba(255, 255, 255, 0.05)",
                scale: isSelected ? 0.95 : 1, // Slight contraction for "pop" feel
                boxShadow: isSelected ? "none" : "0 0 0 0 rgba(0,0,0,0)"
              }}
              transition={{ 
                duration: 0.4,
                borderColor: { duration: 0.15 }, // Instant vanish
                backgroundColor: { duration: 0.15 },
                boxShadow: { duration: 0.15 },
                scale: { duration: 0.2, ease: "easeIn" } // Quick contraction
              }}
              whileHover={!selectedOptionId ? {
                scale: 1.02,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
              } : {}}
              whileTap={!selectedOptionId ? { scale: 0.98 } : {}}
              className="group w-full p-6 rounded-2xl border text-white text-lg font-light transition-all duration-300 hover:shadow-xl text-left relative overflow-visible"
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

              {/* BURST EFFECT */}
              {isSelected && (
                <>
                  {/* Particle Explosion */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-cyan-200 rounded-full"
                      style={{ 
                        left: '50%', 
                        top: '50%',
                        x: '-50%',
                        y: '-50%' 
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0, 1.2, 0],
                        opacity: [0, 1, 0],
                        x: (Math.random() - 0.5) * 400, // Wider spread
                        y: (Math.random() - 0.5) * 200  // Wider spread
                      }}
                      transition={{ 
                        duration: 0.5, // Faster particles
                        ease: "easeOut",
                        delay: Math.random() * 0.05
                      }}
                    />
                  ))}
                </>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionView;
