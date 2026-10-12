import React, { useState } from 'react';
import { UserProfile, TimetableViewMode } from '../types';
import { VERIFIED_COLLEGES, OFFICIAL_METADATA, TIMETABLE_SESSIONS } from '../data/timetable';
import { getDepartmentSuggestedCourses, exportToICalendar } from '../utils/scheduleLogic';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { requestNotificationPermission } from '../utils/notifications';
import { playAlarmChime, ChimeType } from '../utils/alarmAudio';
import { computeRewardStats } from '../utils/storage';
import {
  ShieldAlert,
  RotateCcw,
  Check,
  ExternalLink,
  Phone,
  Moon,
  Sun,
  ShieldCheck,
  Info,
  BookOpen,
  X,
  RefreshCw,
  Plus,
  Bell,
  Volume2,
  Megaphone,
  Trophy,
  Sparkles,
  Calendar,
  Lock,
  Download,
  CheckCircle2,
} from 'lucide-react';

interface SettingsPageProps {
  userProfile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetAllData: () => void;
  onToggleDarkMode: () => void;
  onOpenFeedback: () => void;
  onSyncDepartmentCurriculum?: () => void;
  onOpenAdModal?: () => void;
  onOpenRewardsModal?: () => void;
  onOpenAcademicCalendar?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  userProfile,
  onUpdateProfile,
  onResetAllData,
  onToggleDarkMode,
  onOpenFeedback,
  onSyncDepartmentCurriculum,
  onOpenAdModal,
  onOpenRewardsModal,
  onOpenAcademicCalendar,
}) => {
  const [name, setName] = useState(userProfile.preferredName);
  const [collegeId, setCollegeId] = useState(userProfile.collegeId || VERIFIED_COLLEGES[0].id);
  const [departmentId, setDepartmentId] = useState(userProfile.departmentId);
  const [level, setLevel] = useState(userProfile.level);
  const [view, setView] = useState<TimetableViewMode>(userProfile.preferredView);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Notification and Alarm states
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!userProfile.notificationsEnabled);
  const [alarmSoundEnabled, setAlarmSoundEnabled] = useState(!!userProfile.alarmSoundEnabled);
  const [leadMinutes, setLeadMinutes] = useState(userProfile.notificationLeadMinutes || 15);
  const [activeChime, setActiveChime] = useState<ChimeType>((userProfile.selectedChime as ChimeType) || 'default');

  const rewardStats = computeRewardStats(userProfile.adInteractionsCount || 0, userProfile.isAdminUnlocked);
  const canCustomizeChime = rewardStats.unlockedTier2Chimes;

  const chimeOptions: { id: ChimeType; name: string }[] = [
    { id: 'default', name: 'Melodic Two-Tone (Default)' },
    { id: 'marimba', name: 'Warm Marimba' },
    { id: 'bell', name: 'University Bell' },
    { id: 'gong', name: 'Zen Gong' },
    { id: 'pulse', name: 'Modern Pulse' },
  ];

  const selectedCollege = VERIFIED_COLLEGES.find((c) => c.id === collegeId) || VERIFIED_COLLEGES[0];
  const departments = selectedCollege?.departments || [];

  const handleSave = () => {
    const newDept = departmentId || (departments[0]?.code ?? '');
    const deptChanged = newDept !== userProfile.departmentId || level !== userProfile.level;
    const newCourses = deptChanged
      ? getDepartmentSuggestedCourses(newDept, level, TIMETABLE_SESSIONS)
      : userProfile.selectedCourseCodes;

    onUpdateProfile({
      ...userProfile,
      preferredName: name.trim(),
      collegeId: selectedCollege?.id || '',
      departmentId: newDept,
      level,
      selectedCourseCodes: newCourses,
      preferredView: view,
      notificationsEnabled,
      alarmSoundEnabled,
      notificationLeadMinutes: leadMinutes,
      selectedChime: activeChime,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestSound = (tone: ChimeType = activeChime) => {
    playAlarmChime(tone, 0.4);
  };

  const handleToggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const handleSafeReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 4000);
    } else {
      onResetAllData();
      setConfirmReset(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & About
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your local academic preferences, display mode, and review official source data.
        </p>
      </div>

      {/* PWA Banner */}
      <PWAInstallButton variant="banner" />

      {/* 1. Academic Profile Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Academic Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Preferred Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tobi"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Level */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Current Academic Level
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            >
              {['100', '200', '300', '400', '500', '600'].map((l) => (
                <option key={l} value={l}>
                  {l} Level
                </option>
              ))}
            </select>
          </div>

          {/* College */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              College (Verified)
            </label>
            <select
              value={collegeId}
              onChange={(e) => {
                const newCol = e.target.value;
                setCollegeId(newCol);
                const colObj = VERIFIED_COLLEGES.find((c) => c.id === newCol);
                if (colObj && colObj.departments.length > 0) {
                  setDepartmentId(colObj.departments[0].code);
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {VERIFIED_COLLEGES.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.id} — {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Department (Verified Mappings)
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.code} — {dept.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Timetable View Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Timetable View
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'agenda', label: 'Agenda' },
              { id: 'compact', label: 'Compact' },
            ].map((v) => {
              const isSelected = view === v.id;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id as TimetableViewMode)}
                  className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>Saved successfully</span>
            </span>
          )}
          <div />

          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Course Enrollment & Department Curriculum */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Registered Courses & Curriculum</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {(userProfile.selectedCourseCodes || []).length} registered course{(userProfile.selectedCourseCodes || []).length === 1 ? '' : 's'} active on your schedule for {userProfile.level}L {userProfile.departmentId}.
            </p>
          </div>

          {onSyncDepartmentCurriculum && (
            <button
              onClick={onSyncDepartmentCurriculum}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold transition-colors border border-indigo-200 dark:border-indigo-800 shrink-0 shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Enroll Full Recommended Basket</span>
            </button>
          )}
        </div>

        {/* Registered Course Chips */}
        <div className="flex flex-wrap gap-2">
          {(userProfile.selectedCourseCodes || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No courses selected. Tap the button above to enroll your full department curriculum.</p>
          ) : (
            (userProfile.selectedCourseCodes || []).map((code) => (
              <span
                key={code}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono font-medium shadow-2xs"
              >
                <span>{code}</span>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (userProfile.selectedCourseCodes || []).filter((c) => c !== code);
                    onUpdateProfile({ ...userProfile, selectedCourseCodes: updated });
                  }}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                  title={`Remove ${code}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* 2. Notifications & Audio Alarms (Opt-In) */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Class Reminders & Audio Alarms
            </h3>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            Opt-in
          </span>
        </div>

        <div className="space-y-3 text-xs">
          {/* Web Notification Toggle */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-900 dark:text-white">
                Upcoming Class Notifications
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Receive popup banners on your phone or PC before your next lecture starts.
              </p>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                notificationsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sound Alarm Toggle & Chime Selector */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Audible Class Alarm Chime</span>
                  <button
                    type="button"
                    onClick={() => handleTestSound(activeChime)}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 font-bold"
                    title="Test current alarm tone"
                  >
                    Test Sound
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Plays a pleasant academic chime so you never miss a lecture venue change.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAlarmSoundEnabled(!alarmSoundEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 shrink-0 ${
                  alarmSoundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform transform ${
                    alarmSoundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Selectable Chime Tones with Testing */}
            {alarmSoundEnabled && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Select Alarm Sound:
                  </span>
                  {!canCustomizeChime && onOpenRewardsModal && (
                    <button
                      type="button"
                      onClick={onOpenRewardsModal}
                      className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-bold text-[10px]"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Unlock 4 Custom Chimes in Perks</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {chimeOptions.map((chime) => {
                    const isSelected = activeChime === chime.id;
                    const isLocked = !canCustomizeChime && chime.id !== 'default';

                    return (
                      <div
                        key={chime.id}
                        className={`p-2 rounded-lg border flex items-center justify-between gap-2 text-xs transition-colors ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200'
                            : isLocked
                            ? 'border-slate-200 dark:border-slate-800 text-slate-400 opacity-60'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <span className="truncate">{chime.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleTestSound(chime.id)}
                            disabled={isLocked}
                            className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-mono hover:bg-slate-300 disabled:opacity-50"
                            title="Play sound preview"
                          >
                            ▶ Test
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!isLocked) {
                                setActiveChime(chime.id);
                                handleTestSound(chime.id);
                                onUpdateProfile({ ...userProfile, selectedChime: chime.id });
                              }
                            }}
                            disabled={isLocked}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 disabled:opacity-50'
                            }`}
                          >
                            {isSelected ? 'Active' : isLocked ? 'Locked' : 'Use'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Lead time */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <label className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
              Alert Reminder Lead Time
            </label>
            <div className="flex items-center gap-1">
              {[10, 15, 30].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setLeadMinutes(mins)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    leadMinutes === mins
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mins}m before
                </button>
              ))}
            </div>
          </div>

          {/* Continuous Lock-Screen Phone Alarms (System Calendar Sync) */}
          <div className="mt-3 p-3.5 rounded-xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 max-w-lg">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Continuous Lock-Screen Alarms (Native Phone Calendar)</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                Want continuous loud alarms that ring and wake your phone even when locked or asleep? Export your schedule to Google Calendar, Apple Calendar, or Samsung Calendar in 1-tap.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const activeSessions = TIMETABLE_SESSIONS.filter((s) => {
                  const isLevelMatch = s.level === userProfile.level;
                  const isEnrolled = userProfile.selectedCourseCodes.includes(s.courseCode);
                  return isLevelMatch || isEnrolled;
                });
                const studentName = userProfile.preferredName || `${userProfile.level}L ${userProfile.departmentId || 'Student'}`;
                const icsContent = exportToICalendar(activeSessions, studentName);
                const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `FUNAAB_Timetable_${userProfile.level}L_${userProfile.departmentId || 'Schedule'}.ics`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sync to Phone (.ics)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Display Mode & Theme Settings */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3 text-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
          Display & Appearance
        </h3>

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              {userProfile.darkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>{userProfile.darkMode ? 'Night Mode (Dark Theme)' : 'Day Mode (Light Theme)'}</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Switch between high-contrast light mode and battery-friendly dark mode.
            </p>
          </div>

          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              userProfile.darkMode
                ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300'
                : 'border-amber-300 bg-amber-50 text-amber-800'
            }`}
          >
            {userProfile.darkMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Switch to Day</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600" />
                <span>Switch to Night</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="font-semibold text-slate-900 dark:text-white">Active Software Skin</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
              {userProfile.selectedTheme && userProfile.selectedTheme !== 'default'
                ? `${userProfile.selectedTheme} Edition`
                : 'Classic Course Mate'}
            </div>
          </div>

          {onOpenRewardsModal && (
            <button
              type="button"
              onClick={onOpenRewardsModal}
              className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1 text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Change Skin</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Campus Perks & Themes */}
      {onOpenRewardsModal && (
        <div className="p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-amber-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Campus Perks & Appearance Themes</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-[11px]">
              Support verified campus brands to unlock themes, audio chimes, and pro exports.
            </p>
          </div>

          <button
            onClick={onOpenRewardsModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>View Perks & Themes</span>
          </button>
        </div>
      )}

      {/* 4. Promote Your Brand Spotlight */}
      {onOpenAdModal && (
        <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/70 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="font-bold text-indigo-950 dark:text-indigo-200">
                Promote Your Brand on Course Mate
              </span>
            </div>
            <p className="text-[11px] text-indigo-800/85 dark:text-indigo-300/85 leading-relaxed">
              Reach <strong>20,000+ FUNAABites</strong> across colleges while they check daily classes, venues, and lecture updates. Starting at ₦3,000/week.
            </p>
          </div>

          <button
            onClick={onOpenAdModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap self-start sm:self-auto"
          >
            <span>Book Ad Space →</span>
          </button>
        </div>
      )}

      {/* 5. Official Timetable Provenance Card */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Official Timetable Data
          </h3>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Academic Year</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.academicYear}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Semester</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.semester}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Timetable Dataset</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">Official TIMTEC Master v{OFFICIAL_METADATA.timetableVersion}</span>
          </div>
          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500">Authority</span>
            <span className="font-bold text-slate-900 dark:text-white">{OFFICIAL_METADATA.committee}</span>
          </div>
        </div>

        {/* Academic Session Calendar Entry */}
        {onOpenAcademicCalendar && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>2026/2027 Academic Session Calendar</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Official Senate approved schedule, continuous assessment tests, and exam dates.
              </p>
            </div>
            <button
              onClick={onOpenAcademicCalendar}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-colors shrink-0 whitespace-nowrap self-start sm:self-auto shadow-2xs"
            >
              Open Calendar →
            </button>
          </div>
        )}

        {/* Campus Web Services */}
        <div className="pt-2 text-xs border-t border-slate-100 dark:border-slate-800 space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            Campus Ecosystem & Utilities:
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <a
              href="https://funaab101.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:border-indigo-400 transition-colors"
            >
              <span>FUNAAB 101 Guide</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <a
              href={OFFICIAL_METADATA.directionServiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:border-indigo-400 transition-colors"
            >
              <span>GetDirection Service</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* TIMTEC Enquiries Contacts */}
        <div className="pt-2 text-xs text-slate-600 dark:text-slate-300 space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
            TIMTEC Official Enquiries:
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-700 dark:text-slate-300 font-mono">
            {OFFICIAL_METADATA.timtecContacts.map((c) => (
              <span key={c.role} className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>{c.role}: {c.phone}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Independent Status / Disclaimer */}
      <div className="p-4 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Course Mate is built independently and isn't an official FUNAAB platform.</strong> For official academic decisions, always confirm with the university and official TIMTEC releases.
        </p>
      </div>

      {/* 7. Feedback trigger */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
            Have a suggestion or spotted a discrepancy?
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Report incorrect class details or suggest features directly to our WhatsApp hotline.
          </p>
        </div>

        <button
          onClick={onOpenFeedback}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors shrink-0"
        >
          Send Feedback
        </button>
      </div>

      {/* 8. Credits Section */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Credits & Origin
        </h3>

        <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            Course Mate
          </p>
          <div className="pt-0.5 space-y-0.5">
            <p className="font-semibold text-slate-900 dark:text-white">
              Designed & built by <strong className="text-indigo-600 dark:text-indigo-400">Sisco</strong>
            </p>
            <p className="text-slate-800 dark:text-slate-200">
              Sholuade AbdulRasak Akorede
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Cyber Security Student • COLCOMPS (College of Computing)
            </p>
          </div>
          <div className="pt-2">
            <a
              href={OFFICIAL_METADATA.credits.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <span>{OFFICIAL_METADATA.credits.portfolioUrl.replace('https://', '')}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 9. Danger Zone / Reset */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSafeReset}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-colors px-2 py-1 rounded-lg ${
            confirmReset
              ? 'bg-rose-600 text-white font-bold animate-pulse'
              : 'text-rose-600 hover:text-rose-700 dark:hover:text-rose-400'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{confirmReset ? 'Click again to confirm reset' : 'Reset Local Profile & Data'}</span>
        </button>

        <div className="text-[11px] font-mono text-slate-400 text-right">
          <div>Course Mate v2.0</div>
          <div className="text-[10px] text-slate-400/80">TIMTEC Dataset v{OFFICIAL_METADATA.timetableVersion}</div>
        </div>
      </div>
    </div>
  );
};
