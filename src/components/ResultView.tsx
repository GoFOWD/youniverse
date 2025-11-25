import React from 'react';
import { motion } from 'framer-motion';

interface ResultViewProps {
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ onRestart }) => {
  return (
    <div className="flex flex-col items-center space-y-10 w-full relative z-20">
      {/* Sun Glow Effect */}
      <motion.div 
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-400/30 blur-[100px] rounded-full pointer-events-none"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2 }}
      />

      <motion.div
        className="glass-panel p-10 rounded-3xl w-full text-center space-y-8 border-orange-200/20 bg-gradient-to-b from-orange-50/10 to-rose-50/5 backdrop-blur-xl shadow-[0_0_40px_rgba(251,146,60,0.2)]"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="space-y-3">
          <h3 className="text-orange-100/80 text-sm tracking-[0.3em] uppercase font-medium">New Year, New Dawn</h3>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-100 via-white to-rose-100 drop-shadow-sm">
            고요한 심해의 등대
          </h2>
        </div>
        
        <div className="w-full h-px bg-gradient-to-r from-transparent via-orange-200/30 to-transparent" />
        
        <p className="text-orange-50/90 leading-loose font-light text-lg">
          당신은 깊고 어두운 바다 속에서도 길을 잃지 않는 빛을 품고 있습니다. 
          <br/>
          새해에는 당신의 그 따뜻한 빛이 수면 위로 떠올라, 
          <br/>
          더 넓은 세상을 비추는 찬란한 태양이 되기를 바랍니다.
        </p>
      </motion.div>

      <div className="flex flex-col w-full space-y-4">
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
