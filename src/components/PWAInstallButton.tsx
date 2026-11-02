import React, { useState } from 'react';
import { usePWAInstall, InstallPlatform } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X, MoreVertical, MonitorSmartphone } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'compact';
  className?: string;
}

const Step: React.FC<{ icon: React.ReactNode; n: number; children: React.ReactNode }> = ({ icon, n, children }) => (
  <div className="flex items-start gap-3">
    <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 shrink-0">{icon}</div>
    <div>
      <span className="font-semibold text-slate-900 dark:text-white">Step {n}:</span> {children}
    </div>
  </div>
);

const B: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <strong className="text-indigo-600 dark:text-indigo-400">{children}</strong>
);

/** Plain-language install steps for the device the student is on. */
const InstallGuideModal: React.FC<{ platform: InstallPlatform; onClose: () => void }> = ({ platform, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-4">
    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {platform === 'ios' ? 'Install on iPhone / iPad' : platform === 'android' ? 'Install on Android' : 'Install on your computer'}
        </h3>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" aria-label="Close">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
        {platform === 'ios' && (
          <>
            <Step n={1} icon={<Share2 className="w-4 h-4" />}>Open this page in <B>Safari</B> and tap the <B>Share</B> icon.</Step>
            <Step n={2} icon={<PlusSquare className="w-4 h-4" />}>Tap <B>Add to Home Screen</B>, then <B>Add</B>.</Step>
          </>
        )}
        {platform === 'android' && (
          <>
            <Step n={1} icon={<MoreVertical className="w-4 h-4" />}>Open this page in <B>Chrome</B> and tap the <B>⋮</B> menu.</Step>
            <Step n={2} icon={<PlusSquare className="w-4 h-4" />}>Tap <B>Install app</B> (or <B>Add to Home screen</B>).</Step>
          </>
        )}
        {platform === 'desktop' && (
          <>
            <Step n={1} icon={<MonitorSmartphone className="w-4 h-4" />}>
              In <B>Chrome</B> or <B>Edge</B>, look at the right end of the address bar for the small <B>install</B> icon and click it.
            </Step>
            <Step n={2} icon={<MoreVertical className="w-4 h-4" />}>
              Can't see it? Open the browser menu and choose <B>Install Course Mate</B> (Chrome) or <B>Apps, then Install this site as an app</B> (Edge).
            </Step>
          </>
        )}
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
          If you opened the link inside WhatsApp, Instagram or Telegram, open it in your normal browser first.
        </p>
      </div>
      <button
        onClick={onClose}
        className="mt-5 w-full py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
      >
        Got it
      </button>
    </div>
  </div>
);

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Already running as an installed app: nothing to show
  if (isInstalled) return null;

  const handleInstallClick = async () => {
    // One tap installs when the browser allows it; otherwise show the steps for this device
    if (!isInstallable) {
      setShowGuide(true);
      return;
    }
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  const label = isInstalling ? 'Installing…' : isInstallable ? 'Install App' : platform === 'ios' ? 'Install on iPhone' : 'How to Install';
  const guide = showGuide ? <InstallGuideModal platform={platform} onClose={() => setShowGuide(false)} /> : null;

  if (variant === 'banner') {
    return (
      <div className={`p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">Take Course Mate with you</h4>
            <p className="text-xs text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
              Install the app for instant access to your timetable, even when you're offline.
            </p>
          </div>
          <button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        </div>
        {guide}
      </div>
    );
  }

  // Header / compact variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        className={
          isInstallable
            ? `inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-xs ${className}`
            : `inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors ${className}`
        }
        title="Install Course Mate as an app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{isInstallable ? (isInstalling ? 'Installing…' : 'Install App') : 'Install'}</span>
      </button>
      {guide}
    </>
  );
};
