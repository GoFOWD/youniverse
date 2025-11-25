import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './components/Layout';
import LandingView from './components/LandingView';
import QuestionView from './components/QuestionView';
import LoadingView from './components/LoadingView';
import ResultView from './components/ResultView';
import ProgressBar from './components/ProgressBar';
import { audioManager } from './utils/audioManager';

// Mock Data - 18 Questions (Placeholders)
const questions = [
  {
    id: 1,
    question: "깊은 바닷속, 당신은 무엇을 발견했나요?",
    options: [
      { id: 'a', text: "오래된 보물 상자" },
      { id: 'b', text: "신비로운 빛을 내는 산호" },
      { id: 'c', text: "잠들어 있는 거대한 고래" },
    ]
  },
  ...Array.from({ length: 17 }, (_, i) => ({
    id: i + 2,
    question: `질문 ${i + 2}: Lorem ipsum dolor sit amet?`,
    options: [
      { id: 'a', text: `선택지 A - ${i + 2}` },
      { id: 'b', text: `선택지 B - ${i + 2}` },
      { id: 'c', text: `선택지 C - ${i + 2}` },
    ]
  }))
];

function App() {
  const [step, setStep] = useState<'landing' | 'question' | 'loading' | 'result'>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const handleStart = () => {
    audioManager.init();
    audioManager.playSwoosh();
    setStep('question');
  };

  const handleAnswer = (answerId: string) => {
    audioManager.playBubble();
    const newAnswers = [...answers, answerId];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        audioManager.playSwoosh();
        setCurrentQuestionIndex(prev => prev + 1);
      }, 500); // Wait for exit animation
    } else {
      setStep('loading');
      setTimeout(() => {
        setStep('result');
      }, 4000); // Simulate loading time
    }
  };

  const handleRestart = () => {
    audioManager.playSwoosh();
    setStep('landing');
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Ascent Transition Variants
  const pageVariants = {
    initial: { opacity: 0, y: 100 }, // Come from below
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 100, transition: { duration: 0.5 } } // Go down (user goes up)
  };

  return (
    <Layout step={step} progress={progress}>
      <AnimatePresence mode="wait">
        {step === 'landing' && (
          <motion.div
            key="landing"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full"
          >
            <LandingView onStart={handleStart} />
          </motion.div>
        )}

        {step === 'question' && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full flex flex-col items-center"
          >
            <ProgressBar progress={progress} />
            <QuestionView 
              question={questions[currentQuestionIndex]} 
              onAnswer={handleAnswer} 
            />
          </motion.div>
        )}

        {step === 'loading' && (
          <motion.div
            key="loading"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <LoadingView />
          </motion.div>
        )}

        {step === 'result' && (
          <motion.div
            key="result"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full"
          >
            <ResultView onRestart={handleRestart} />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

export default App;
