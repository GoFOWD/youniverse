'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './Layout';
import SplashView from './SplashView';
import LandingView from './LandingView';
import QuestionView from './QuestionView';
import LoadingView from './LoadingView';
import ResultView from './ResultView';
import ProgressBar from './ProgressBar';
import { audioManager } from '../utils/audioManager';

// Define types matching the API response
interface Question {
  id: number;
  category: string;
  text: string;
  choices: string[];
}

interface UserAnswerDetail {
  questionId: number;
  choice: string;
  startTime: number;
  endTime: number;
}

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

export default function ClientApp() {
  const [step, setStep] = useState<'splash' | 'landing' | 'question' | 'loading' | 'result'>('splash');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<UserAnswerDetail[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  // Timing tracking
  const questionStartTime = useRef<number>(0);

  useEffect(() => {
    // Fetch questions on mount (or when starting)
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const res = await fetch('/api/test/start');
        if (!res.ok) throw new Error('Failed to fetch questions');
        const data = await res.json();
        setQuestions(data);
      } catch (error) {
        console.error(error);
        // Fallback or error state could be handled here
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  // Session Storage & Dropout Detection
  // Session Storage Restoration (Run once on mount)
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('test_progress_index');
    const savedAnswers = sessionStorage.getItem('test_answers');

    if (savedIndex && savedAnswers) {
      setCurrentQuestionIndex(parseInt(savedIndex));
      setAnswers(JSON.parse(savedAnswers));
      setStep('question');
    }
  }, []);

  // Dropout Detection (Unload Handler)
  useEffect(() => {
    const handleUnload = () => {
      // Only report dropout if test is in progress and not completed
      if (step === 'question' && questions.length > 0) {
        const data = {
          answers: answers, // Send current answers
          isDropout: true,
          questionProgress: currentQuestionIndex + 1,
        };

        // Use fetch with keepalive for reliability on unload
        fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          keepalive: true,
        });
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [step, questions, answers, currentQuestionIndex]);

  // Save progress to session storage whenever it changes
  useEffect(() => {
    if (step === 'question') {
      sessionStorage.setItem('test_progress_index', currentQuestionIndex.toString());
      sessionStorage.setItem('test_answers', JSON.stringify(answers));
    }
  }, [currentQuestionIndex, answers, step]);

  useEffect(() => {
    if (step === 'question') {
      questionStartTime.current = Date.now();
    }
  }, [step, currentQuestionIndex]);

  const handleSplashComplete = () => {
    setStep('landing');
  };

  const handleStart = () => {
    if (questions.length === 0) return; // Wait for questions
    audioManager.init();
    audioManager.playSwoosh();
    setStep('question');
  };

  const handleAnswer = async (choiceIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Play sound immediately on click
    audioManager.playBubble();

    const endTime = Date.now();
    const currentQuestion = questions[currentQuestionIndex];
    // Map index 0->A, 1->B, 2->C
    const choiceChar = ['A', 'B', 'C'][choiceIndex];

    const newAnswer: UserAnswerDetail = {
      questionId: currentQuestion.id,
      choice: choiceChar,
      startTime: questionStartTime.current,
      endTime: endTime
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        audioManager.playSwoosh();
        setCurrentQuestionIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 800); // Increased delay to allow burst animation to complete
    } else {
      // Last question answered
      setStep('loading');

      // Clear session storage on completion
      sessionStorage.removeItem('test_progress_index');
      sessionStorage.removeItem('test_answers');

      try {
        const res = await fetch('/api/test/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });

        if (!res.ok) throw new Error('Failed to submit test');

        const resultData = await res.json();
        setResult(resultData);

        // Minimum loading time for UX
        setTimeout(() => {
          setStep('result');
          setIsTransitioning(false);
        }, 3000);
      } catch (error) {
        console.error('Submission error:', error);
        // Handle error (maybe show an error screen or retry)
        setIsTransitioning(false);
      }
    }
  };

  const handleRestart = () => {
    audioManager.playSwoosh();
    setStep('landing');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setResult(null);

    // Clear session storage
    sessionStorage.removeItem('test_progress_index');
    sessionStorage.removeItem('test_answers');
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Ascent Transition Variants
  const pageVariants = {
    initial: { opacity: 0, y: '-100vh' }, // Start from top
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: '100vh', transition: { duration: 0.8, ease: "easeIn" as const } } // Fall down to bottom
  };

  // Map API question format to QuestionView props
  // QuestionView likely expects { id, question, options: [{id, text}] }
  // API returns { id, text, choices: ["A text", "B text", "C text"] }
  const currentQuestionData = questions[currentQuestionIndex] ? {
    id: questions[currentQuestionIndex].id,
    question: questions[currentQuestionIndex].text,
    options: questions[currentQuestionIndex].choices.map((text, idx) => ({
      id: idx.toString(), // QuestionView passes this back as answerId
      text: text
    }))
  } : null;

  return (
    <Layout step={step} progress={progress} ocean={result?.ocean} isTransitioning={isTransitioning}>
      <AnimatePresence mode="popLayout">
        {step === 'splash' && (
          <SplashView key="splash" onComplete={handleSplashComplete} />
        )}

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

        {step === 'question' && currentQuestionData && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: "easeInOut" }} // Slower, smoother transition
            className="w-full flex flex-col items-center"
          >
            <ProgressBar progress={progress} />
            <QuestionView
              question={currentQuestionData}
              onAnswer={(id) => handleAnswer(parseInt(id))}
            />
          </motion.div>
        )}

        {step === 'loading' && (
          <LoadingView key="loading" />
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            transition={{ duration: 1, ease: "easeOut" }}
            className="w-full"
          >
            <ResultView
              result={result}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
