import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, WifiOff, X } from 'lucide-react';

/**
 * Registers the offline service worker and shows two small, friendly messages:
 *  - "Ready to work offline" the first time everything has been saved on the device
 *  - "New version available" with an Update button
 */
export const UpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Look for a new version every hour while the app stays open
      if (registration) setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
    },
  });

  // The "ready offline" note is just good news: let it fade away on its own
  useEffect(() => {
    if (!offlineReady || needRefresh) return;
    const t = window.setTimeout(() => setOfflineReady(false), 5000);
    return () => window.clearTimeout(t);
  }, [offlineReady, needRefresh, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div className="fixed left-3 right-3 sm:left-auto sm:right-4 bottom-20 lg:bottom-4 z-[60] sm:w-80 rounded-2xl border border-indigo-200 dark:border-indigo-900 bg-white dark:bg-slate-900 shadow-xl p-3.5 flex items-start gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shrink-0">
        {needRefresh ? <RefreshCw className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-900 dark:text-white">
          {needRefresh ? 'New version available' : 'Ready to work offline'}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {needRefresh
            ? 'Update now for the latest timetable fixes and features.'
            : 'Course Mate is saved on this device and opens without internet.'}
        </p>
        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
          >
            Update now
          </button>
        )}
      </div>
      <button
        onClick={() => {
          setNeedRefresh(false);
          setOfflineReady(false);
        }}
        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
