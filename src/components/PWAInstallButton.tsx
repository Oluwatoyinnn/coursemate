import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'compact';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
              Take Course Mate with you
            </h4>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
              Install the app for instant access to your timetable, even when you're offline.
            </p>
          </div>
          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isInstalling ? 'Installing…' : 'Install App'}</span>
            </button>
          ) : isIOS ? (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install on iPhone</span>
            </button>
          ) : (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>How to Install</span>
            </button>
          )}
        </div>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 1:</span> Tap the <strong className="text-indigo-600 dark:text-indigo-400">Share</strong> button in Safari's bottom toolbar.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 2:</span> Scroll down and tap <strong className="text-indigo-600 dark:text-indigo-400">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Header compact / button variant
  if (isInstallable) {
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs ${className}`}
        title="Install Course Mate as App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isInstalling ? 'Installing…' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors ${className}`}
        >
          <Download className="w-3 h-3" />
          <span>Install</span>
        </button>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Install on iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 1:</span> Tap the <strong className="text-indigo-600 dark:text-indigo-400">Share</strong> icon at the bottom of Safari.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">Step 2:</span> Tap <strong className="text-indigo-600 dark:text-indigo-400">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
