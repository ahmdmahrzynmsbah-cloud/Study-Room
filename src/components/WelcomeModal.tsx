import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Sparkles, Trophy, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  welcomeMessage?: string;
}

export default function WelcomeModal({ isOpen, onClose, userName, welcomeMessage }: WelcomeModalProps) {
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[110]">
          <Confetti
            width={width}
            height={height}
            recycle={false}
            numberOfPieces={600}
            gravity={0.25}
            initialVelocityY={25}
          />
        </div>
      )}

      {/* Modal */}
      <div 
        className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center animate-scale-in z-[120]"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-warning/30 blur-xl rounded-full animate-pulse" />
          <Trophy className="text-warning relative z-10" size={40} />
          <Sparkles className="absolute -top-2 -right-2 text-warning animate-bounce" size={24} />
        </div>

        <h2 className="text-2xl font-black text-slate-800 mb-2 font-sans">
          أهلاً بك يا {userName}! 🎉
        </h2>
        
        <p className="text-slate-600 mb-6 font-sans">
          {welcomeMessage || "سعداء بانضمامك لمنصة رياح التفوق. لقد تم إيداع مكافأة الترحيب في حسابك!"}
        </p>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl w-full p-4 mb-8 transform transition-transform hover:scale-105">
          <div className="text-sm text-blue-600 font-bold mb-1">المكافأة الترحيبية</div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-4xl font-black text-blue-700 font-mono">25</span>
            <span className="text-lg text-blue-600 font-bold">نقطة</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 font-sans"
        >
          ابدأ رحلتك الآن
        </button>
      </div>
    </div>
  );
}
