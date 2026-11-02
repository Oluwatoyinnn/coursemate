import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

/**
 * The browser announces "this app can be installed" exactly once, often before any React
 * component exists. We listen at app start (this module is imported from main.tsx), keep the
 * event, and let every install button read it whenever it appears.
 */
let savedPrompt: BeforeInstallPromptEvent | null = null;
let installedFlag = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    savedPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    installedFlag = true;
    savedPrompt = null;
    notify();
  });
}

export type InstallPlatform = 'ios' | 'android' | 'desktop';

export function detectInstallPlatform(): InstallPlatform {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

function isStandaloneNow(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true)
  );
}

export function usePWAInstall() {
  const [, force] = useState(0);
  const [isInstalled, setIsInstalled] = useState(() => installedFlag || isStandaloneNow());

  useEffect(() => {
    const fn = () => {
      setIsInstalled(installedFlag || isStandaloneNow());
      force((n) => n + 1);
    };
    listeners.add(fn);
    fn();
    return () => {
      listeners.delete(fn);
    };
  }, []);

  const install = async () => {
    if (!savedPrompt) return false;
    const prompt = savedPrompt;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      installedFlag = true;
      savedPrompt = null;
      notify();
      return true;
    }
    return false;
  };

  const platform = detectInstallPlatform();
  return {
    isInstallable: !!savedPrompt,
    isInstalled,
    isIOS: platform === 'ios',
    platform,
    install,
  };
}
