import React, { useState } from 'react';
import { UserProfile, AdRewardStats } from '../types';
import { computeRewardStats, saveStoredProfile } from '../utils/storage';
import { playAlarmChime, ChimeType } from '../utils/alarmAudio';
import {
  X,
  Trophy,
  Palette,
  Volume2,
  FileCheck,
  Tag,
  CheckCircle2,
  Lock,
  RotateCcw,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Star,
  Zap,
} from 'lucide-react';

interface RewardsModalProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onClose: () => void;
  onOpenAdModal: () => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  userProfile,
  onUpdateProfile,
  onClose,
  onOpenAdModal,
}) => {
  const count = userProfile.adInteractionsCount || 0;
  const stats: AdRewardStats = computeRewardStats(count, userProfile.isAdminUnlocked);

  // Stealth 5-tap admin trigger state
  const [tapCount, setTapCount] = useState(0);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [adminFeedback, setAdminFeedback] = useState<string | null>(null);

  const themeOptions: {
    id: UserProfile['selectedTheme'];
    name: string;
    colors: string;
    description: string;
    starTag: string;
  }[] = [
    {
      id: 'default',
      name: 'Classic Indigo',
      colors: 'from-indigo-600 via-indigo-700 to-indigo-900',
      description: 'Official default indigo & slate aesthetic',
      starTag: 'Standard Classic',
    },
    {
      id: 'emerald',
      name: 'Emerald Gold (FUNAAB)',
      colors: 'from-emerald-500 via-teal-600 to-amber-500',
      description: 'University green & vibrant agriculture gold',
      starTag: 'Campus Star Edition',
    },
    {
      id: 'cyber',
      name: 'Cyber Teal Glow',
      colors: 'from-cyan-400 via-teal-500 to-slate-900',
      description: 'High-contrast neon computing aura',
      starTag: 'Silicon Pulse',
    },
    {
      id: 'royal',
      name: 'Royal Violet Laureate',
      colors: 'from-purple-500 via-violet-600 to-indigo-900',
      description: 'Deep regal academic honor & amethyst',
      starTag: 'Chancellor Star',
    },
    {
      id: 'amber',
      name: 'Sunset Golden Harvest',
      colors: 'from-amber-400 via-orange-500 to-rose-600',
      description: 'Warm solar library radiance',
      starTag: 'Solar Radiance',
    },
  ];

  const chimeOptions: { id: ChimeType; name: string; desc: string }[] = [
    { id: 'default', name: 'Melodic Two-Tone', desc: 'Crisp, gentle 2-note chime' },
    { id: 'marimba', name: 'Warm Marimba', desc: 'Wooden acoustic harmony' },
    { id: 'bell', name: 'University Bell', desc: 'Resonant campus tower bell' },
    { id: 'gong', name: 'Zen Gong', desc: 'Deep calming resonance' },
    { id: 'pulse', name: 'Modern Pulse', desc: 'Subtle electronic triple-tap' },
  ];

  const handleSelectTheme = (theme: UserProfile['selectedTheme']) => {
    const updated = { ...userProfile, selectedTheme: theme };
    onUpdateProfile(updated);
    saveStoredProfile(updated);
  };

  const handleSelectChime = (chime: ChimeType) => {
    playAlarmChime(chime, 0.35);
    const updated = { ...userProfile, selectedChime: chime };
    onUpdateProfile(updated);
    saveStoredProfile(updated);
  };

  const handleTestChime = (chime: ChimeType) => {
    playAlarmChime(chime, 0.4);
  };

  // Discreet 5-tap gesture on the trophy icon
  const handleTrophyTap = () => {
    const next = tapCount + 1;
    if (next >= 5) {
      setTapCount(0);
      setShowAdminModal(true);
      setAdminFeedback(null);
    } else {
      setTapCount(next);
      setTimeout(() => setTapCount(0), 2500);
    }
  };

  const handleVerifyMasterKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = passkeyInput.replace(/\s+/g, '').toLowerCase();
    if (cleanKey === 'comediandavincicfrn') {
      const updated: UserProfile = {
        ...userProfile,
        adInteractionsCount: 999,
        isAdminUnlocked: true,
      };
      onUpdateProfile(updated);
      saveStoredProfile(updated);
      playAlarmChime('bell', 0.4);
      setAdminFeedback('Authorized: All themes, chimes, and pro features unlocked!');
      setTimeout(() => {
        setShowAdminModal(false);
        setPasskeyInput('');
        setAdminFeedback(null);
      }, 1400);
    } else {
      setAdminFeedback('Verification code does not match.');
    }
  };

  const handleResetToStudentMode = () => {
    const updated: UserProfile = {
      ...userProfile,
      adInteractionsCount: 0,
      isAdminUnlocked: false,
      selectedTheme: 'default',
      selectedChime: 'default',
    };
    onUpdateProfile(updated);
    saveStoredProfile(updated);
    setAdminFeedback('Reset to standard student mode (All perks locked).');
    setTimeout(() => {
      setShowAdminModal(false);
      setAdminFeedback(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTrophyTap}
              className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25 transition-colors cursor-pointer select-none active:scale-95"
              title="Campus Perks"
            >
              <Trophy className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Campus Perks & Rewards
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Support verified campus brands to unlock themes, audio alarms & pro features.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Progress Tracker Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">
                Your Sponsor Streak
              </span>
              <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {count} / 12 Verified Views
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (count / 12) * 100)}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Interacting with active sponsor cards advances your campus perks.
            </p>
          </div>

          {/* Tier 1: Visual Theme Customization */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Tier 1: Campus Themes (4 Views)
                </h4>
              </div>

              {stats.unlockedTier1Themes ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  {Math.max(0, 4 - count)} more views needed
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {themeOptions.map((t) => {
                const isSelected = (userProfile.selectedTheme || 'default') === t.id;
                const isLocked = !stats.unlockedTier1Themes && t.id !== 'default';

                return (
                  <button
                    key={t.id}
                    disabled={isLocked}
                    onClick={() => handleSelectTheme(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between gap-2 relative overflow-hidden group ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 shadow-xs ring-1 ring-indigo-500/30'
                        : isLocked
                        ? 'border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${t.colors} shrink-0 shadow-2xs`} />
                        <span className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {t.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-mono text-slate-600 dark:text-slate-300">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span>{t.starTag}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-tight">
                        {t.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="p-1 rounded-full bg-indigo-600 text-white shadow-xs shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Persistent Reset to Default Button */}
            {userProfile.selectedTheme && userProfile.selectedTheme !== 'default' && (
              <button
                onClick={() => handleSelectTheme('default')}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline pt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Classic Theme</span>
              </button>
            )}
          </div>

          {/* Tier 2: Alarm Chimes */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Tier 2: Custom Alarm Chimes (6 Views)
                </h4>
              </div>

              {stats.unlockedTier2Chimes ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  {Math.max(0, 6 - count)} more needed
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {chimeOptions.map((c) => {
                const isSelected = (userProfile.selectedChime || 'default') === c.id;
                const isLocked = !stats.unlockedTier2Chimes && c.id !== 'default';

                return (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                        : isLocked
                        ? 'border-slate-200 dark:border-slate-800 opacity-60'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{c.name}</span>
                        {isLocked && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 truncate">{c.desc}</div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleTestChime(c.id)}
                        disabled={isLocked}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono transition-colors flex items-center gap-1 ${
                          isLocked
                            ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-50'
                            : 'text-indigo-600 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-900/60 hover:bg-indigo-200'
                        }`}
                        title="Preview sound"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>Test</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectChime(c.id)}
                        disabled={isLocked}
                        className={`px-2 py-1 rounded-md text-[10px] font-bold transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : isLocked
                            ? 'text-slate-400 bg-slate-100 dark:bg-slate-800 cursor-not-allowed opacity-50'
                            : 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Set'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier 3: Pro Export */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Tier 3: Watermark-Free Timetable Export (9 Views)
                </h4>
              </div>

              {stats.unlockedTier3Export ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  {Math.max(0, 9 - count)} more needed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Generates high-definition clean timetables with official certified student badges for sharing.
            </p>
          </div>

          {/* Tier 4: Exclusive Campus Partner Discounts */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="font-bold text-slate-900 dark:text-white">
                  Tier 4: Campus Partner Discounts (12 Views)
                </h4>
              </div>

              {stats.unlockedTier4Perks ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unlocked
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                  {Math.max(0, 12 - count)} more needed
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Access negotiated student discounts on photocopying, laptop repairs, and campus meal deals.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3">
          <button
            onClick={onOpenAdModal}
            className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Advertise Your Brand Here →
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>

      {/* Stealth Master Key Dialog */}
      {showAdminModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/25 dark:bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-100">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  System Authorization
                </h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVerifyMasterKey} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Master Passkey
                </label>
                <input
                  type="password"
                  autoFocus
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter authorization key…"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {adminFeedback && (
                <div
                  className={`p-2 rounded-lg text-[11px] font-medium ${
                    adminFeedback.includes('Authorized') || adminFeedback.includes('Reset')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}
                >
                  {adminFeedback}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleResetToStudentMode}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Revert to Student
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  Verify Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
