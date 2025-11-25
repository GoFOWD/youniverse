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
  return (
    <div className="w-full flex flex-col items-center space-y-10 relative z-20">
      <motion.div
        className="glass-panel p-10 rounded-3xl w-full text-center shadow-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-white leading-relaxed drop-shadow-md">
          {question.question}
        </h2>
      </motion.div>

      <div className="w-full space-y-5">
        {question.options.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => onAnswer(option.id)}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.15, duration: 0.6 }}
            whileHover={{ 
              scale: 1.02, 
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderColor: "rgba(255, 255, 255, 0.3)"
            }}
            whileTap={{ scale: 0.98 }}
            className="group w-full p-6 rounded-2xl bg-white/5 border border-white/10 text-white text-lg font-light transition-all duration-300 hover:shadow-xl text-left relative overflow-hidden"
          >
            <span className="relative z-10 group-hover:font-normal transition-all duration-300">{option.text}</span>
            
            {/* Ripple/Glow Effect on Hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -left-full top-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default QuestionView;
