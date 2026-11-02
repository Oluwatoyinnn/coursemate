import React, { useEffect, useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { getCachedCount, isCounterConfigured, registerAndGetCount } from '../utils/liveCount';

/** "Students on Course Mate: 1,248". Renders nothing until the counter service is configured. */
export const StudentCounter: React.FC<{ className?: string; variant?: 'pill' | 'strip' }> = ({ className = '', variant = 'pill' }) => {
  const [value, setValue] = useState<number | null>(() => (isCounterConfigured() ? getCachedCount() : null));
  const [shown, setShown] = useState<number | null>(value);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!isCounterConfigured()) return;
    let cancelled = false;
    registerAndGetCount().then((n) => {
      if (!cancelled && n !== null) setValue(n);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Gentle count-up so a new number feels alive (instant if the student prefers less motion)
  useEffect(() => {
    if (value === null) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (shown === null || reduce || shown === value) {
      setShown(value);
      return;
    }
    const from = shown;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / 900);
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!isCounterConfigured() || shown === null) return null;

  if (variant === 'strip') {
    return (
      <div
        className={`w-full border-b border-indigo-100/80 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 ${className}`}
        aria-live="polite"
      >
        <div className="max-w-6xl mx-auto px-3.5 sm:px-6 h-7 flex items-center justify-center gap-2 text-[11px]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <Users className="w-3 h-3 text-indigo-600 dark:text-indigo-300" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Students on Course Mate</span>
          <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">{shown.toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 text-xs ${className}`}
      aria-live="polite"
    >
      <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-300" />
      <span className="text-slate-600 dark:text-slate-300 font-medium">Students on Course Mate</span>
      <span className="font-mono font-extrabold text-indigo-700 dark:text-indigo-300 tabular-nums">
        {shown.toLocaleString()}
      </span>
    </div>
  );
};
