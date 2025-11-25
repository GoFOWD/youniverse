import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LoadingView: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play video when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay failed:', err);
      });
    }
  }, []);

  return (
    <>
      {/* Video Container - Fullscreen */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          loop
        >
          <source src="/assets/surface.mp4" type="video/mp4" />
          {/* Fallback for browsers that don't support video */}
          <div className="w-full h-full bg-gradient-to-b from-blue-900 to-cyan-500 flex items-center justify-center">
            <p className="text-white text-center">영상을 불러올 수 없습니다</p>
          </div>
        </video>
        
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Loading text overlay */}
        <motion.div
          className="absolute bottom-8 left-0 right-0 text-center px-6 z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h3 className="text-2xl font-serif text-white tracking-wide drop-shadow-lg mb-2">
            수면 위로 올라가는 중...
          </h3>
          <p className="text-sm text-white/80 font-light tracking-widest uppercase drop-shadow">
            잠시만 기다려주세요
          </p>
        </motion.div>
      </div>
    </>
  );
};

export default LoadingView;
