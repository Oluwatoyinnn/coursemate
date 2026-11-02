import React, { useEffect, useState } from 'react';
import { UserProfile, PersonalEvent, TimetableSession, TimetableDay, TimetableEdits } from './types';
import {
  DEFAULT_PROFILE,
  getInitialProfile,
  getInitialPersonalEvents,
  getStoredProfile,
  saveStoredProfile,
  getStoredPersonalEvents,
  savePersonalEvent,
  deletePersonalEvent,
  resetAllLocalData,
} from './utils/storage';
import { TIMETABLE_SESSIONS } from './data/timetable';
import { applyDepartmentOverrides, normalizeStreamPreferences } from './data/departmentOverrides';
import {
  getDepartmentSuggestedCourses,
  isSessionMatchingCourse,
  getRootCourseCode,
  getCourseGroup,
  getEffectiveGroup,
  isCarryoverCode,
  isCourseEnrolled,
  isForeignCrossListing,
  applyTimetableEdits,
} from './utils/scheduleLogic';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OnboardingModal } from './components/OnboardingModal';
import { CourseModal } from './components/CourseModal';
import { VenueModal } from './components/VenueModal';
import { PersonalEventModal } from './components/PersonalEventModal';
import { ShareTimetableModal } from './components/ShareTimetableModal';
import { FeedbackModal } from './components/FeedbackModal';
import { PrintableTimetable } from './components/PrintableTimetable';
import { AdPlacementModal } from './components/AdPlacementModal';
import { RewardsModal } from './components/RewardsModal';
import { SiscoShowcaseModal } from './components/SiscoShowcaseModal';
import { DaVinciShowcaseModal } from './components/DaVinciShowcaseModal';
import { AcademicCalendarModal } from './components/AcademicCalendarModal';
import { CGPAEstimatorModal } from './components/CGPAEstimatorModal';
import { SplashScreen } from './components/SplashScreen';
import { TimetableEditorModal } from './components/TimetableEditorModal';
import { UpdatePrompt } from './components/UpdatePrompt';
import { installAudioUnlock } from './utils/alarmAudio';
import { checkAndNotifyUpcomingClass } from './utils/notifications';
import { checkAndNotifyCalendarEvents } from './utils/calendarReminders';

import { HomePage } from './pages/HomePage';
import { TimetablePage } from './pages/TimetablePage';
import { CoursesPage } from './pages/CoursesPage';
import { VenuesPage } from './pages/VenuesPage';
import { FreeTimePage } from './pages/FreeTimePage';
import { MySchedulePage } from './pages/MySchedulePage';
import { SettingsPage } from './pages/SettingsPage';

/** Light or dark for a profile: explicit choice wins, "auto" follows the device. */
function resolveDark(p: UserProfile, systemDark?: boolean): boolean {
  const sys = systemDark ?? (typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const mode = p.themeMode ?? (p.darkMode ? 'dark' : 'auto');
  return mode === 'auto' ? sys : mode === 'dark';
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(getInitialProfile);
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>(getInitialPersonalEvents);
  const [isLoaded, setIsLoaded] = useState(true);
  const [showSplashScreen, setShowSplashScreen] = useState(true);
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modals state
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [editingPersonalEvent, setEditingPersonalEvent] = useState<PersonalEvent | null>(null);
  const [isAddingPersonalEvent, setIsAddingPersonalEvent] = useState(false);
  const [suggestedDayTime, setSuggestedDayTime] = useState<{ day?: TimetableDay; time?: string }>({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [systemDark, setSystemDark] = useState<boolean>(
    () => typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showTimetableEditor, setShowTimetableEditor] = useState(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [feedbackContext, setFeedbackContext] = useState<any>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showSiscoShowcase, setShowSiscoShowcase] = useState(false);
  const [showDaVinciShowcase, setShowDaVinciShowcase] = useState(false);
  const [showAcademicCalendar, setShowAcademicCalendar] = useState(false);
  const [showCGPAEstimator, setShowCGPAEstimator] = useState(false);

  // Initialize storage
  useEffect(() => {
    async function loadData() {
      const p = await getStoredProfile();
      const events = await getStoredPersonalEvents();
      setProfile(p);
      setPersonalEvents(events);
      setIsLoaded(true);

      // Apply dark mode (the sync effect below keeps it correct from here on)
      document.documentElement.classList.toggle('dark', resolveDark(p));

      // Apply appearance theme
      const root = document.documentElement;
      root.classList.remove('theme-emerald', 'theme-cyber', 'theme-royal', 'theme-amber');
      if (p.selectedTheme && p.selectedTheme !== 'default') {
        root.classList.add(`theme-${p.selectedTheme}`);
      }
    }
    loadData();
  }, []);

  // Sync theme when profile changes
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-emerald', 'theme-cyber', 'theme-royal', 'theme-amber');
    if (profile.selectedTheme && profile.selectedTheme !== 'default') {
      root.classList.add(`theme-${profile.selectedTheme}`);
    }
  }, [profile.selectedTheme]);

  // Follow the device's light/dark setting while the student is on "Auto"
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Single source of truth for light/dark: the student's choice, or the device when on Auto
  const effectiveDark = resolveDark(profile, systemDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', effectiveDark);

    // Keep the browser / installed-app title bar in step with the mode:
    // bright white in day mode, deep slate in dark mode.
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', effectiveDark ? '#0f172a' : '#ffffff');

    // Keep profile.darkMode equal to what is actually showing, so every screen reads one value
    if (profile.darkMode !== effectiveDark) {
      setProfile((p) => ({ ...p, darkMode: effectiveDark }));
    }
  }, [effectiveDark, profile.darkMode]);

  const handleAdInteraction = () => {
    const current = profile.adInteractionsCount || 0;
    const updated = { ...profile, adInteractionsCount: current + 1 };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Always reset scroll to top immediately whenever changing views/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentTab]);

  // Tab selection handler: if already on tab, smoothly scroll up; otherwise switch tab & reset to top
  const handleSelectTab = (tab: string) => {
    if (tab === currentTab) {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    } else {
      setCurrentTab(tab);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  // Update dark mode
  const toggleDarkMode = () => {
    const nextMode = !effectiveDark;
    const updated: UserProfile = { ...profile, darkMode: nextMode, themeMode: nextMode ? 'dark' : 'light' };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Profile update
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Course toggle enrollment (group- and carry-over aware)
  const handleToggleCourseEnrollment = (code: string) => {
    const root = getRootCourseCode(code);
    const group = getCourseGroup(code);
    const currentCodes = profile.selectedCourseCodes || [];
    const prefs: Record<string, string> = { ...(streamPrefs || {}) };
    let updatedCodes: string[];

    if (isCarryoverCode(code)) {
      // Carry-over classes are added and removed individually
      updatedCodes = currentCodes.includes(code)
        ? currentCodes.filter((c) => c !== code)
        : [...currentCodes, code];
    } else {
      const enrolled = currentCodes.includes(root) || currentCodes.includes(code);
      if (group && enrolled && getEffectiveGroup(root, prefs, TIMETABLE_SESSIONS) !== group) {
        // Already enrolled in another group: switch group, stay enrolled
        prefs[root] = group;
        updatedCodes = currentCodes;
      } else if (enrolled) {
        updatedCodes = currentCodes.filter((c) => c !== root && c !== code);
        delete prefs[root];
      } else {
        updatedCodes = [...currentCodes, root];
        if (group) prefs[root] = group;
      }
    }
    const updatedProfile = { ...profile, selectedCourseCodes: updatedCodes, streamPreferences: prefs };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  // Student picks which group (A, B, C...) they belong to for a course
  const handleSetCourseGroup = (code: string, letter: string) => {
    const root = getRootCourseCode(code);
    const prefs = { ...(profile.streamPreferences || {}), [root]: letter };
    const updatedProfile = { ...profile, streamPreferences: prefs };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  // Sync complete recommended department & faculty curriculum
  const handleSyncDepartmentCurriculum = () => {
    const dept = profile.departmentId || 'CYB';
    const lvl = profile.level || '100';
    const fullBasket = getDepartmentSuggestedCourses(dept, lvl, TIMETABLE_SESSIONS);
    const updatedProfile = { ...profile, selectedCourseCodes: fullBasket };
    setProfile(updatedProfile);
    saveStoredProfile(updatedProfile);
  };

  // Personal event handlers
  const handleSavePersonalEvent = async (event: PersonalEvent) => {
    await savePersonalEvent(event);
    const updated = await getStoredPersonalEvents();
    setPersonalEvents(updated);
    setIsAddingPersonalEvent(false);
    setEditingPersonalEvent(null);
  };

  const handleDeletePersonalEvent = async (id: string) => {
    await deletePersonalEvent(id);
    const updated = await getStoredPersonalEvents();
    setPersonalEvents(updated);
    setEditingPersonalEvent(null);
  };

  const handleResetAll = async () => {
    await resetAllLocalData();
    setProfile(DEFAULT_PROFILE);
    setPersonalEvents([]);
    setCurrentTab('home');
  };

  // Department corrections (e.g. Cyber Security 100L venues) layered on the official data.
  // Other departments get the official list untouched.
  const sessionPool: TimetableSession[] = React.useMemo(
    () => applyDepartmentOverrides(TIMETABLE_SESSIONS, profile.departmentId || 'CYB', profile.level || '100'),
    [profile.departmentId, profile.level]
  );
  const streamPrefs = React.useMemo(
    () => normalizeStreamPreferences(profile.streamPreferences, profile.departmentId || 'CYB', profile.level || '100'),
    [profile.streamPreferences, profile.departmentId, profile.level]
  );

  // Determine active sessions for the user:
  // If user selected courses explicitly, match them via isSessionMatchingCourse.
  // Auto-heals incomplete single-course legacy state and resolves shared faculty courses.
  const baseSessions: TimetableSession[] = React.useMemo(() => {
    const dept = profile.departmentId || 'CYB';
    const userLvl = profile.level || '100';

    let activeCodes = profile.selectedCourseCodes;

    // Auto-heal legacy 1-class bug where only CYB 113 was saved
    if (activeCodes && activeCodes.length === 1 && activeCodes[0] === 'CYB 113') {
      const fullBasket = getDepartmentSuggestedCourses(dept, userLvl, TIMETABLE_SESSIONS);
      activeCodes = fullBasket;
    }

    let candidateSessions: TimetableSession[] = [];

    if (activeCodes && activeCodes.length > 0) {
      candidateSessions = sessionPool.filter((s) =>
        activeCodes.some((code) => isSessionMatchingCourse(s.courseCode, code))
      );
    } else {
      const suggestedCodes = getDepartmentSuggestedCourses(dept, userLvl, TIMETABLE_SESSIONS);
      candidateSessions = sessionPool.filter((s) =>
        suggestedCodes.some((code) => isSessionMatchingCourse(s.courseCode, code))
      );
    }

    // Drop other departments' joint classes (e.g. "PCP 101/BIO 101" for a BIO 101 student)
    const enrolledForMatch =
      activeCodes && activeCodes.length > 0
        ? activeCodes
        : getDepartmentSuggestedCourses(dept, userLvl, TIMETABLE_SESSIONS);
    candidateSessions = candidateSessions.filter((s) => !isForeignCrossListing(s.courseCode, enrolledForMatch));

    // Carry-over ("OLD") classes only show for students who added them on purpose
    const exactCodes = new Set(profile.selectedCourseCodes || []);
    candidateSessions = candidateSessions.filter(
      (s) => !isCarryoverCode(s.courseCode) || exactCodes.has(s.courseCode)
    );

    // Keep only the student's own group (A, B, C...) for courses split into groups
    candidateSessions = candidateSessions.filter((s) => {
      const g = getCourseGroup(s.courseCode);
      if (!g) return true;
      return getEffectiveGroup(s.courseCode, streamPrefs, sessionPool) === g;
    });

    // Filter practicals if practicalDayPreferences is specified for 100L practicals
    if (profile.practicalDayPreferences) {
      candidateSessions = candidateSessions.filter((s) => {
        if (!s.isPractical) return true;
        const root = getRootCourseCode(s.courseCode);
        const assignedDay =
          profile.practicalDayPreferences?.[root] ||
          profile.practicalDayPreferences?.[s.courseCode];
        if (assignedDay) {
          return s.day === assignedDay;
        }
        return true;
      });
    }

    // Consolidate identical concurrent multi-streams (e.g. MTS 105 (A), (B), (C) at Friday 2:30 PM)
    const seenSlots = new Set<string>();
    const deduplicatedSessions: TimetableSession[] = [];
    for (const session of candidateSessions) {
      const root = getRootCourseCode(session.courseCode);
      const slotKey = `${session.day}-${session.startTime}-${root}`;
      if (!seenSlots.has(slotKey)) {
        seenSlots.add(slotKey);
        deduplicatedSessions.push(session);
      }
    }

    return deduplicatedSessions;
  }, [profile.selectedCourseCodes, profile.departmentId, profile.level, profile.practicalDayPreferences, streamPrefs, sessionPool]);

  // The student's own edits (removed / adjusted / added classes) layered on the official timetable.
  // Every screen, reminder, free-time calculation and share/print uses this one list.
  const activeSessions: TimetableSession[] = React.useMemo(
    () => applyTimetableEdits(baseSessions, profile.timetableEdits),
    [baseSessions, profile.timetableEdits]
  );

  const handleChangeTimetableEdits = (edits: TimetableEdits) => {
    const updated = { ...profile, timetableEdits: edits };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Unlock reminder sounds on the first tap (phones block audio until then)
  useEffect(() => {
    installAudioUnlock();
  }, []);

  // Class reminders: check often, and again the moment the app comes back to the foreground
  useEffect(() => {
    if (!isLoaded) return;
    const run = () => {
      checkAndNotifyUpcomingClass(activeSessions, profile, (msg) => setReminderToast(msg));
      checkAndNotifyCalendarEvents(profile, (msg) => setReminderToast(msg));
    };
    run();
    const interval = setInterval(run, 15000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', run);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', run);
    };
  }, [isLoaded, activeSessions, profile]);

  useEffect(() => {
    if (!reminderToast) return;
    const t = window.setTimeout(() => setReminderToast(null), 12000);
    return () => window.clearTimeout(t);
  }, [reminderToast]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-500">Loading Course Mate...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSplashScreen && (
        <SplashScreen onFinish={() => setShowSplashScreen(false)} />
      )}

      <div id="screen-root" className="print:hidden min-h-screen text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
        {/* Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          darkMode={profile.darkMode}
          onToggleDarkMode={toggleDarkMode}
          onOpenFeedback={() => {
            setFeedbackContext({ departmentId: profile.departmentId || profile.collegeId });
            setShowFeedbackModal(true);
          }}
          onOpenAdModal={() => setShowAdModal(true)}
          onOpenAcademicCalendar={() => setShowAcademicCalendar(true)}
          onOpenCGPAEstimator={() => setShowCGPAEstimator(true)}
        />

        {/* Main Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-24 lg:pb-12">
        {currentTab === 'home' && (
          <HomePage
            userProfile={profile}
            activeSessions={activeSessions}
            personalEvents={personalEvents}
            onNavigateTab={handleSelectTab}
            onSelectCourse={setSelectedCourse}
            onSelectVenue={setSelectedVenue}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
            onOpenShareModal={() => setShowShareModal(true)}
            onSyncDepartmentCurriculum={handleSyncDepartmentCurriculum}
            onOpenAdModal={() => setShowAdModal(true)}
            onOpenSiscoShowcase={() => setShowSiscoShowcase(true)}
            onOpenDaVinciShowcase={() => setShowDaVinciShowcase(true)}
            onOpenAcademicCalendar={() => setShowAcademicCalendar(true)}
            onOpenCGPAEstimator={() => setShowCGPAEstimator(true)}
            onAdInteraction={handleAdInteraction}
          />
        )}

        {currentTab === 'timetable' && (
          <TimetablePage
            sessions={activeSessions}
            onOpenTimetableEditor={() => setShowTimetableEditor(true)}
            personalEvents={personalEvents}
            preferredView={profile.preferredView}
            onUpdatePreferredView={(v) => handleUpdateProfile({ ...profile, preferredView: v })}
            onSelectCourse={setSelectedCourse}
            onSelectVenue={setSelectedVenue}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
            onOpenAcademicCalendar={() => setShowAcademicCalendar(true)}
          />
        )}

        {currentTab === 'courses' && (
          <CoursesPage
            selectedCourseCodes={profile.selectedCourseCodes}
            streamPreferences={streamPrefs}
            onToggleCourse={handleToggleCourseEnrollment}
            onSelectCourse={setSelectedCourse}
            userLevel={profile.level}
          />
        )}

        {currentTab === 'venues' && (
          <VenuesPage onSelectVenue={setSelectedVenue} />
        )}

        {currentTab === 'freetime' && (
          <FreeTimePage
            sessions={activeSessions}
            onOpenAddPersonalEvent={(day, time) => {
              setSuggestedDayTime({ day, time });
              setIsAddingPersonalEvent(true);
            }}
            onOpenAdModal={() => setShowAdModal(true)}
            onOpenSiscoShowcase={() => setShowSiscoShowcase(true)}
            onAdInteraction={handleAdInteraction}
          />
        )}

        {currentTab === 'myschedule' && (
          <MySchedulePage
            personalEvents={personalEvents}
            officialSessions={activeSessions}
            onOpenAddEvent={() => {
              setSuggestedDayTime({});
              setIsAddingPersonalEvent(true);
            }}
            onEditEvent={setEditingPersonalEvent}
            onDeleteEvent={handleDeletePersonalEvent}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            userProfile={profile}
            activeSessions={activeSessions}
            onOpenTimetableEditor={() => setShowTimetableEditor(true)}
            onUpdateProfile={handleUpdateProfile}
            onResetAllData={handleResetAll}
            onToggleDarkMode={toggleDarkMode}
            onSyncDepartmentCurriculum={handleSyncDepartmentCurriculum}
            onOpenFeedback={() => {
              setFeedbackContext(null);
              setShowFeedbackModal(true);
            }}
            onOpenAdModal={() => setShowAdModal(true)}
            onOpenRewardsModal={() => setShowRewardsModal(true)}
            onOpenAcademicCalendar={() => setShowAcademicCalendar(true)}
          />
        )}
        </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenFeedback={() => {
          setFeedbackContext(null);
          setShowFeedbackModal(true);
        }}
        onOpenAdModal={() => setShowAdModal(true)}
      />

      {/* Subtle Offline Indicator (Always available when offline) */}
      <OfflineIndicator />

      {/* First-Time Onboarding Modal */}
      {!profile.onboardingCompleted && (
        <OnboardingModal
          initialProfile={profile}
          onComplete={(updated) => {
            handleUpdateProfile(updated);
          }}
        />
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <CourseModal
          courseCode={selectedCourse}
          isRegistered={isCourseEnrolled(selectedCourse, profile.selectedCourseCodes || [], streamPrefs, TIMETABLE_SESSIONS)}
          onReportIssue={(code) => {
            setFeedbackContext({ departmentId: profile.departmentId || profile.collegeId, courseCode: code });
            setSelectedCourse(null);
            setShowFeedbackModal(true);
          }}
          isRootEnrolled={(profile.selectedCourseCodes || []).includes(getRootCourseCode(selectedCourse))}
          streamPreferences={streamPrefs}
          onSetGroup={handleSetCourseGroup}
          onToggleRegistered={handleToggleCourseEnrollment}
          onClose={() => setSelectedCourse(null)}
          onSelectVenue={setSelectedVenue}
          sessionPool={sessionPool}
        />
      )}

      {/* Venue Detail Modal */}
      {selectedVenue && (
        <VenueModal
          venueName={selectedVenue}
          onClose={() => setSelectedVenue(null)}
          onSelectCourse={setSelectedCourse}
        />
      )}

      {/* Personal Event Modal (Add / Edit) */}
      {(isAddingPersonalEvent || editingPersonalEvent) && (
        <PersonalEventModal
          initialDay={suggestedDayTime.day || 'Monday'}
          initialStartTime={suggestedDayTime.time || '10:00 AM'}
          existingEvent={editingPersonalEvent || undefined}
          officialSessions={activeSessions}
          existingPersonalEvents={personalEvents}
          onSave={handleSavePersonalEvent}
          onDelete={editingPersonalEvent ? handleDeletePersonalEvent : undefined}
          onClose={() => {
            setIsAddingPersonalEvent(false);
            setEditingPersonalEvent(null);
          }}
        />
      )}

      {/* Edit my timetable */}
      {showTimetableEditor && (
        <TimetableEditorModal
          baseSessions={baseSessions}
          edits={profile.timetableEdits}
          level={profile.level || '100'}
          onChange={handleChangeTimetableEdits}
          onOpenCourses={() => {
            setShowTimetableEditor(false);
            handleSelectTab('courses');
          }}
          onClose={() => setShowTimetableEditor(false)}
        />
      )}

      {/* In-app class reminder (works even if system notifications are blocked) */}
      {reminderToast && (
        <div className="fixed left-3 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[28rem] top-16 z-[70] rounded-2xl bg-indigo-600 text-white shadow-2xl px-4 py-3 flex items-start gap-3 animate-in slide-in-from-top-4 duration-300" role="status">
          <span className="text-lg leading-none mt-0.5">⏰</span>
          <p className="text-sm font-semibold flex-1">{reminderToast}</p>
          <button onClick={() => setReminderToast(null)} className="text-white/80 hover:text-white text-lg leading-none" aria-label="Dismiss reminder">×</button>
        </div>
      )}

      {import.meta.env.PROD && <UpdatePrompt />}

      {/* Share Timetable Modal */}
      {showShareModal && (
        <ShareTimetableModal
          sessions={activeSessions}
          profile={profile}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Feedback / Discrepancy Report Modal */}
      {showFeedbackModal && (
        <FeedbackModal
          initialContext={feedbackContext || { departmentId: profile.departmentId || profile.collegeId }}
          onClose={() => setShowFeedbackModal(false)}
        />
      )}

      {/* Ad Placement / Brand Promotion Booking Modal */}
      {showAdModal && (
        <AdPlacementModal onClose={() => setShowAdModal(false)} />
      )}

      {/* Campus Perks & Themes Modal */}
      {showRewardsModal && (
        <RewardsModal
          userProfile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setShowRewardsModal(false)}
          onOpenAdModal={() => {
            setShowRewardsModal(false);
            setShowAdModal(true);
          }}
        />
      )}

      {/* The Sisco Initiative 30-Day In-App Promo Showcase */}
      {showSiscoShowcase && (
        <SiscoShowcaseModal
          onClose={() => setShowSiscoShowcase(false)}
          onAdInteraction={handleAdInteraction}
        />
      )}

      {/* DaVinci Live Comedy Special Showcase */}
      {showDaVinciShowcase && (
        <DaVinciShowcaseModal
          onClose={() => setShowDaVinciShowcase(false)}
          onAdInteraction={handleAdInteraction}
        />
      )}

      {/* Official 2026/2027 Academic Session Calendar */}
      {showAcademicCalendar && (
        <AcademicCalendarModal
          onClose={() => setShowAcademicCalendar(false)}
          profile={profile}
        />
      )}

      {/* 5-Point CGPA Goal Estimator */}
      {showCGPAEstimator && (
        <CGPAEstimatorModal
          isOpen={showCGPAEstimator}
          onClose={() => setShowCGPAEstimator(false)}
          activeSessions={activeSessions}
        />
      )}
    </div>

    {/* Official Certified University Printable Timetable (Printed on Print / PDF export) */}
    <PrintableTimetable sessions={activeSessions} profile={profile} />
  </>
  );
}
