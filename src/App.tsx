import React, { useEffect, useState } from 'react';
import { UserProfile, PersonalEvent, TimetableSession, TimetableDay } from './types';
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
import {
  getDepartmentSuggestedCourses,
  isSessionMatchingCourse,
  getRootCourseCode,
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
import { checkAndNotifyUpcomingClass } from './utils/notifications';

import { HomePage } from './pages/HomePage';
import { TimetablePage } from './pages/TimetablePage';
import { CoursesPage } from './pages/CoursesPage';
import { VenuesPage } from './pages/VenuesPage';
import { FreeTimePage } from './pages/FreeTimePage';
import { MySchedulePage } from './pages/MySchedulePage';
import { SettingsPage } from './pages/SettingsPage';

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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
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

      // Apply dark mode
      if (p.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

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

  // Sync dark mode reliably whenever profile.darkMode changes
  useEffect(() => {
    if (profile.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Keep the browser / installed-app title bar in step with the mode:
    // bright white in day mode, deep slate in dark mode.
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', profile.darkMode ? '#0f172a' : '#ffffff');
  }, [profile.darkMode]);

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
    const nextMode = !profile.darkMode;
    const updated = { ...profile, darkMode: nextMode };
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Profile update
  const handleUpdateProfile = (updated: UserProfile) => {
    setProfile(updated);
    saveStoredProfile(updated);
  };

  // Course toggle enrollment
  const handleToggleCourseEnrollment = (code: string) => {
    const root = getRootCourseCode(code);
    const currentCodes = profile.selectedCourseCodes || [];
    let updatedCodes: string[];
    if (currentCodes.includes(root) || currentCodes.includes(code)) {
      updatedCodes = currentCodes.filter((c) => c !== root && c !== code);
    } else {
      updatedCodes = [...currentCodes, root];
    }
    const updatedProfile = { ...profile, selectedCourseCodes: updatedCodes };
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

  // Determine active sessions for the user:
  // If user selected courses explicitly, match them via isSessionMatchingCourse.
  // Auto-heals incomplete single-course legacy state and resolves shared faculty courses.
  const activeSessions: TimetableSession[] = React.useMemo(() => {
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
      candidateSessions = TIMETABLE_SESSIONS.filter((s) =>
        activeCodes.some((code) => isSessionMatchingCourse(s.courseCode, code))
      );
    } else {
      const suggestedCodes = getDepartmentSuggestedCourses(dept, userLvl, TIMETABLE_SESSIONS);
      candidateSessions = TIMETABLE_SESSIONS.filter((s) =>
        suggestedCodes.some((code) => isSessionMatchingCourse(s.courseCode, code))
      );
    }

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
  }, [profile.selectedCourseCodes, profile.departmentId, profile.level, profile.practicalDayPreferences]);

  // Periodic background check for upcoming classes (alarms and web notifications)
  useEffect(() => {
    if (!isLoaded) return;
    checkAndNotifyUpcomingClass(activeSessions, profile);
    const interval = setInterval(() => {
      checkAndNotifyUpcomingClass(activeSessions, profile);
    }, 25000);
    return () => clearInterval(interval);
  }, [isLoaded, activeSessions, profile]);

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
        <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-24 md:pb-12">
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
          isRegistered={profile.selectedCourseCodes?.includes(selectedCourse) || false}
          onToggleRegistered={handleToggleCourseEnrollment}
          onClose={() => setSelectedCourse(null)}
          onSelectVenue={setSelectedVenue}
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
