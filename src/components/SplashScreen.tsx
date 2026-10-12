import React, { useState, useEffect } from 'react';
import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

interface SplashScreenProps {
  onFinish?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  minDurationMs = 1350,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Start graceful curtain dissolve slightly before finish
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDurationMs - 350);

    const finishTimer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, minDurationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [minDurationMs, onFinish]);

  if (!isVisible) return null;

  return (
    <div
      onClick={() => {
        setIsFading(true);
        setTimeout(() => {
          setIsVisible(false);
          onFinish?.();
        }, 120);
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-6 sm:p-10 bg-white dark:bg-[#070312] transition-opacity duration-300 select-none cursor-pointer overflow-hidden ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Academic Status Line */}
      <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1.5 tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3b188c] dark:text-indigo-400" />
          <span>FUNAAB • TIMTEC v4.0</span>
        </span>
        <span className="uppercase tracking-[0.2em] text-[9px] text-slate-400 hover:text-slate-600 transition-colors">
          Tap to skip
        </span>
      </div>

      {/* Center Aura & Brand Revelation */}
      <div className="relative flex flex-col items-center text-center my-auto animate-in zoom-in-95 fade-in duration-700">
        {/* Exquisite Geometric Concentric Aura Rings */}
        <div className="relative flex items-center justify-center">
          {/* Subtle Outer Concentric Aura Halo (Breathing) */}
          <div className="absolute w-36 h-36 sm:w-40 sm:h-40 rounded-full border border-purple-500/20 dark:border-purple-400/25 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
          
          {/* Middle Concentric Gold Ring */}
          <div className="absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border border-amber-400/30 dark:border-amber-400/40" />

          {/* Inner Radiant Disc */}
          <div className="relative flex items-center justify-center p-4 rounded-full bg-gradient-to-b from-purple-50/80 to-white dark:from-purple-950/40 dark:to-slate-900 border border-purple-100 dark:border-purple-800/40 shadow-xl shadow-purple-900/5 dark:shadow-purple-950/40">
            <BrandLogo size="xl" showWordmark={false} />
          </div>
        </div>

        {/* Wordmark with Architectural Letter-Spacing */}
        <div className="mt-6 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.18em] text-[#3b188c] dark:text-white uppercase font-sans">
            Course Mate
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 tracking-wide">
            Your academic day, simplified.
          </p>
        </div>

        {/* Minimal Precision Horizon Line */}
        <div className="w-20 h-[2px] bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-gradient-to-r from-[#3b188c] via-amber-400 to-[#3b188c] rounded-full w-full animate-pulse" />
        </div>
      </div>

      {/* Bottom Creator Attribution (Engineered by Sisco - Prestige Signature) */}
      <div className="flex flex-col items-center text-center space-y-2 pb-3 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700/60 shadow-sm dark:shadow-lg dark:shadow-black/10">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] tracking-[0.15em] uppercase font-bold text-slate-600 dark:text-slate-200">
            Built by <span className="text-amber-600 dark:text-amber-400 font-extrabold tracking-widest">Sisco</span>
          </span>
          <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
        </div>
        <span className="text-[9.5px] font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          Official First Semester Companion
        </span>
      </div>
    </div>
  );
};
