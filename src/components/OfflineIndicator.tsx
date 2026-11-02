import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsDismissed(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsDismissed(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-dismiss after 6 seconds so it never stays stuck on screen blocking user navigation
  useEffect(() => {
    if (!isOnline && !isDismissed) {
      const timer = setTimeout(() => {
        setIsDismissed(true);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isDismissed]);

  if (isOnline || isDismissed) return null;

  return (
    <aside
      aria-label="Offline status notification"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-full bg-slate-900/95 text-stone-200 text-xs pl-3.5 pr-2 py-1.5 shadow-xl border border-slate-700/80 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-[11px] font-medium">Offline — your saved timetable is still available.</span>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss offline notification"
        className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Dismiss (leave screen)"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
