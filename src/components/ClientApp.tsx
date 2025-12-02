'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from './Layout';
import SplashView from './SplashView';
import LandingView from './LandingView';
import QuestionView from './QuestionView';
import LoadingView from './LoadingView';
import ResultView from './ResultView';
import VerticalProgressBar from './VerticalProgressBar';
import dynamic from 'next/dynamic';
import { audioManager } from '../utils/audioManager';

const DeepSeaEffect = dynamic(() => import('./DeepSeaEffect'), { ssr: false });

import { questions as hardcodedQuestions } from '../data/questions';

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
  const [step, setStep] = useState<'splash' | 'landing' | 'question' | 'loading' | 'ocean_transition' | 'result'>('splash');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Use hardcoded questions directly
  const [questions] = useState<Question[]>(hardcodedQuestions);
  const [answers, setAnswers] = useState<UserAnswerDetail[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFalling, setIsFalling] = useState(false); // Controls visual falling effect
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);

  /* Timing tracking 중도이탈률 계산 선언
  const questionStartTime = useRef<number>(0);
   */
  // Timeout refs for cleanup
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to prevent rapid clicks (more reliable than state)
  const isProcessingAnswer = useRef<boolean>(false);

  // Removed fetchQuestions useEffect as we use hardcoded data

  // Session Storage & Dropout Detection
  // Session Storage Restoration (Run once on mount)
  useEffect(() => {
    const savedIndex = sessionStorage.getItem('test_progress_index');
    const savedAnswers = sessionStorage.getItem('test_answers');

    if (savedIndex && savedAnswers) {
      setCurrentQuestionIndex(parseInt(savedIndex));
      setAnswers(JSON.parse(savedAnswers));
      setStep('question');
      // Initialize audio on restore (might be suspended, but context created)
      audioManager.init();
    }
  }, []);

  // Dropout Detection (Unload Handler) - REMOVED
  // The user requested to remove admin connection features that might block the test.
  /*
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
  */

  // Cleanup timeouts on unmount 중도이탈률 계산 
  /*useEffect(() => { 
    return () => {
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);
  */

  // Save progress to session storage whenever it changes
  useEffect(() => {
    if (step === 'question') {
      sessionStorage.setItem('test_progress_index', currentQuestionIndex.toString());
      sessionStorage.setItem('test_answers', JSON.stringify(answers));
    }
  }, [currentQuestionIndex, answers, step]);
  /*
    useEffect(() => {
      if (step === 'question') {
        questionStartTime.current = Date.now();
        // Scroll to top when question changes
        window.scrollTo(0, 0);
      }
    }, [step, currentQuestionIndex]);
  */
  const handleSplashComplete = () => {
    setStep('landing');
  };

  const handleStart = () => {
    if (questions.length === 0) return; // Wait for questions
    audioManager.init();
    audioManager.playSwoosh();
    setStep('question');
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Clear any pending transitions if user clicks back quickly
      if (transitionTimeoutRef.current) clearTimeout(transitionTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);

      audioManager.playSwoosh();
      setCurrentQuestionIndex(prev => prev - 1);
      setAnswers(prev => prev.slice(0, -1)); // Remove last answer
      setIsTransitioning(false);
      setIsFalling(false); // Reset falling state
      isProcessingAnswer.current = false;
    } else {
      // If at first question, go back to landing? Or just do nothing?
      // Let's go back to landing for now
      setStep('landing');
      setAnswers([]);
    }
  };

  const handleAnswer = async (choiceIndex: number) => {
    // CRITICAL: Use ref for immediate blocking (state updates are async)
    if (isProcessingAnswer.current || isTransitioning) {
      console.log('⚠️ Click blocked - already processing answer');
      return;
    }

    // Lock immediately to prevent race conditions
    isProcessingAnswer.current = true;
    setIsTransitioning(true);

    // Ensure audio context is running (resume if suspended)
    audioManager.resume();

    // Play sound immediately on click
    audioManager.playBubble();

    const endTime = Date.now();
    const currentQuestion = questions[currentQuestionIndex];
    // Map index 0->A, 1->B, 2->C
    const choiceChar = ['A', 'B', 'C'][choiceIndex];

    const newAnswer: UserAnswerDetail = {
      questionId: currentQuestion.id,
      choice: choiceChar,
    };

    const newAnswers = [...answers, newAnswer];
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      // Wait for burst animation (800ms), then trigger fall
      // Wait for burst animation (400ms), then trigger fall
      transitionTimeoutRef.current = setTimeout(() => {
        audioManager.playSwoosh();
        setIsFalling(true); // Start bubble fall
        setCurrentQuestionIndex(prev => prev + 1); // Start card fall (exit)

        // Wait for exit animation (400ms) to complete before unlocking
        // This prevents clicking the fading-out options of the previous question
        resetTimeoutRef.current = setTimeout(() => {
          setIsFalling(false);
          setIsTransitioning(false);
          isProcessingAnswer.current = false;
        }, 500);
      }, 400);
    } else {
      // Last question answered
      // Wait for burst animation (400ms), then trigger fall
      transitionTimeoutRef.current = setTimeout(() => {
        audioManager.playSwoosh();
        setIsFalling(true); // Start bubble fall (exit animation)

        // Wait for exit animation (500ms) before showing loading
        setTimeout(() => {
          setStep('loading');

          // Clear session storage on completion
          sessionStorage.removeItem('test_progress_index');
          sessionStorage.removeItem('test_answers');

          (async () => {
            try {
              const res = await fetch('/api/test/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: newAnswers, isDropout: false })
              });

              if (!res.ok) throw new Error('Failed to submit test');

              const data: ResultData = await res.json();
              setResult(data);

              // Wait 3 seconds before showing result page (Ocean Transition)
              setStep('ocean_transition');
              setTimeout(() => {
                setStep('result');
                setIsTransitioning(false);
                isProcessingAnswer.current = false;
                setIsFalling(false); // Reset falling state
              }, 3000);

            } catch (error) {
              console.error('Error submitting test:', error);
              // If error, maybe go back to landing or show error?
              // For now, reset state so they can try again or go back
              setIsTransitioning(false);
              isProcessingAnswer.current = false;
              setIsFalling(false);
              setStep('question'); // Go back to question to retry? Or stay in loading?
              alert('결과 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
          })();
        }, 500);
      }, 400);
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

  // Page transition variants - Optimized for smooth performance
  const pageVariants = {
    initial: {
      y: 30,
      opacity: 0,
    },
    animate: {
      y: 0,
      opacity: 1,
    },
    exit: {
      y: -30,
      opacity: 0,
    },
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
    <div className="w-full min-h-[100dvh] bg-[#050505] text-white overflow-hidden relative selection:bg-teal-500/30">
      <Layout
        step={step}
        progress={progress}
        ocean={result?.ocean}
        isTransitioning={isFalling}
        backgroundComponent={
          (step === 'question' && currentQuestionIndex === 17) ? <DeepSeaEffect videoSrc="/assets/main3.mp4" /> :
            step === 'landing' ? <DeepSeaEffect videoSrc="/assets/main.mp4" /> :
              step === 'loading' ? <DeepSeaEffect videoSrc="/assets/main3.mp4" /> :
                step === 'ocean_transition' && result ? (
                  <DeepSeaEffect videoSrc={`/assets/${result.ocean === '북극해' ? 'Arctic1' :
                    result.ocean === '대서양' ? 'Atlantic1' :
                      result.ocean === '인도양' ? 'indian1' :
                        result.ocean === '남극해' ? 'southern1' :
                          'pacific1' // 태평양
                    }.mp4`} />
                ) : null
        }
      >
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
            <>
              {/* Back Button - Fixed position, outside animation */}
              <button
                onClick={handleBack}
                className="fixed left-6 top-6 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm flex items-center gap-2"
              >
                <span>←</span> 이전
              </button>

              <motion.div
                key={`question-${currentQuestionIndex}`}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="w-full flex flex-col items-center relative"
              >
                {/* Question Content - with padding for left progress bar */}
                <div className="w-full pl-16 md:pl-24">
                  <QuestionView
                    question={currentQuestionData}
                    onAnswer={(id) => handleAnswer(parseInt(id))}
                    disabled={isTransitioning}
                  />
                </div>
              </motion.div>
            </>
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
                result={{
                  ...result,
                  id: result.id || '',
                  advice: result.advice || '',
                  scores: {
                    P: result.score.positivity,
                    E: result.score.energy,
                    C: result.score.curiosity
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical Progress Bar - Persistent outside animation, only visible during question step */}
        {step === 'question' && (
          <VerticalProgressBar progress={progress} />
        )}
      </Layout>
    </div >
  );
}
