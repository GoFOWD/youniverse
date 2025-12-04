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

// Helper function to interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = parseInt(color1.substring(1), 16);
  const c2 = parseInt(color2.substring(1), 16);

  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;

  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;

  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function ClientApp() {
  const [step, setStep] = useState<'splash' | 'landing' | 'question' | 'loading' | 'ocean_transition' | 'result'>('splash');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Use hardcoded questions directly
  const [questions] = useState<Question[]>(hardcodedQuestions);
  const [answers, setAnswers] = useState<UserAnswerDetail[]>([]);
  const [result, setResult] = useState<ResultData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isFalling, setIsFalling] = useState(false); // Controls visual falling effect

  useEffect(() => {
    const videosToPreload = [
      '/assets/main.mp4',
      '/assets/main3.mp4',
      '/assets/main4.mp4',
      '/assets/main5.mp4',
      '/assets/main6.mp4',
      '/assets/main7.mp4',
      '/assets/main8.mp4',
      '/assets/Arctic1.mp4',
      '/assets/Atlantic1.mp4',
      '/assets/indian1.mp4',
      '/assets/southern1.mp4',
      '/assets/pacific1.mp4',
    ];

    videosToPreload.forEach(src => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      // Start loading but don't play
      video.load();
    });
  }, []);
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

  // Helper to get video for current question
  const getQuestionVideo = (index: number) => {
    if (index < 4) return '/assets/main4.mp4';      // Q1-4
    if (index < 8) return '/assets/main5.mp4';      // Q5-8
    if (index < 12) return '/assets/main6.mp4';     // Q9-12
    if (index < 16) return '/assets/main7.mp4';     // Q13-16
    return '/assets/main8.mp4';                     // Q17-18
  };

  // Helper to get background color for current question (matches Layout gradient logic)
  const getQuestionBackgroundColor = (progress: number): string => {
    const normalizedProgress = Math.min(Math.max(progress, 0), 100) / 100;

    const darkStart = '#000000';   // Pure black for deepest ocean
    const darkMid = '#030d0f';     // Almost black with hint of teal
    const mediumStart = '#0f1f22'; // Very dark transition
    const mediumMid = '#0a3a3f';   // Dark teal
    const brightStart = '#06b6d4';  // cyan-500
    const brightMid = '#2563eb';    // blue-600

    let fromColor, viaColor;

    if (normalizedProgress < 0.5) {
      const factor = normalizedProgress * 2;
      fromColor = interpolateColor(darkStart, mediumStart, factor);
      viaColor = interpolateColor(darkMid, mediumMid, factor);
    } else {
      const factor = (normalizedProgress - 0.5) * 2;
      fromColor = interpolateColor(mediumStart, brightStart, factor);
      viaColor = interpolateColor(mediumMid, brightMid, factor);
    }

    // Return the middle color for a solid background
    return viaColor;
  };

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

              // Wait 4 seconds on loading page before ocean transition
              setTimeout(() => {
                setStep('ocean_transition');
                // Then wait 3 more seconds for ocean video before showing result
                setTimeout(() => {
                  setStep('result');
                  setIsTransitioning(false);
                  isProcessingAnswer.current = false;
                  setIsFalling(false); // Reset falling state
                }, 3000);
              }, 4000);

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
          step === 'landing' ? <DeepSeaEffect videoSrc="/assets/main.mp4" /> :
            step === 'loading' ? <DeepSeaEffect videoSrc="/assets/main3.mp4" zoom={1.3} /> :
              step === 'question' ? <DeepSeaEffect videoSrc={getQuestionVideo(currentQuestionIndex)} spotlight={true} backgroundColor={getQuestionBackgroundColor(progress)} /> :
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
              {/* Back Button - Bottom right */}
              <button
                onClick={handleBack}
                className="fixed right-4 bottom-6 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white/70 hover:bg-white/20 hover:text-white transition-all text-sm flex items-center gap-2 shadow-lg"
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
