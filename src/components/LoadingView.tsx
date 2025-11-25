import React from 'react';
import { motion } from 'framer-motion';

const LoadingView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-10 text-center w-full h-64 relative z-20">
      <div className="relative w-40 h-40">
        {/* Outer Glow */}
        <motion.div 
          className="absolute inset-0 bg-indigo-500/30 blur-xl rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/10 shadow-2xl bg-indigo-900/40 backdrop-blur-md">
          {/* Wave Animation */}
          <motion.div
            className="absolute bottom-0 left-0 w-[200%] h-[200%] bg-gradient-to-t from-indigo-500 to-purple-500 opacity-70 rounded-[40%]"
            animate={{ 
              rotate: 360,
              y: [0, -20, 0]
            }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ transformOrigin: '50% 48%', left: '-50%', bottom: '-60%' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-[200%] h-[200%] bg-gradient-to-t from-blue-400 to-cyan-400 opacity-60 rounded-[45%]"
            animate={{ 
              rotate: -360,
              y: [0, -25, 0]
            }}
            transition={{ 
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
            }}
            style={{ transformOrigin: '50% 48%', left: '-50%', bottom: '-65%' }}
          />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="space-y-2"
      >
        <h3 className="text-2xl font-serif text-white tracking-wide">수면 위로 올라가는 중...</h3>
        <p className="text-sm text-indigo-200/70 font-light tracking-widest uppercase">잠시만 기다려주세요</p>
      </motion.div>
    </div>
  );
};

export default LoadingView;
