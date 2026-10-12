import React, { useState, useEffect, useRef } from 'react';
import { TimetableSession, PersonalEvent, UserProfile, TimetableDay } from '../types';
import { NextClassCard } from '../components/NextClassCard';
import { TodayTimeline } from '../components/TodayTimeline';
import { SponsoredSpot } from '../components/SponsoredSpot';
import {
  calculateFreeTimeGaps,
  getCampusNow,
  detectClashes,
  ACADEMIC_DAYS,
} from '../utils/scheduleLogic';
import {
  Calendar,
  Search,
  MapPin,
  Plus,
  Share2,
  Coffee,
  AlertTriangle,
  ChevronRight,
  Clock,
  Trophy,
  Compass,
  ExternalLink,
  Calculator,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface HomePageProps {
  userProfile: UserProfile;
  activeSessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  onNavigateTab: (tab: string) => void;
  onSelectCourse: (code: string) => void;
  onSelectVenue: (name: string) => void;
  onOpenAddPersonalEvent: (day?: TimetableDay, time?: string) => void;
  onOpenShareModal: () => void;
  onSyncDepartmentCurriculum?: () => void;
  onOpenAdModal?: () => void;
  onOpenSiscoShowcase?: () => void;
  onOpenDaVinciShowcase?: () => void;
  onOpenAcademicCalendar?: () => void;
  onOpenCGPAEstimator?: () => void;
  onAdInteraction?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  userProfile,
  activeSessions,
  personalEvents,
  onNavigateTab,
  onSelectCourse,
  onSelectVenue,
  onOpenAddPersonalEvent,
  onOpenShareModal,
  onSyncDepartmentCurriculum,
  onOpenAdModal,
  onOpenSiscoShowcase,
  onOpenDaVinciShowcase,
  onOpenAcademicCalendar,
  onOpenCGPAEstimator,
  onAdInteraction,
}) => {
  // Accurately synchronize with West Africa Time (WAT)
  const [campusTime, setCampusTime] = useState(getCampusNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setCampusTime(getCampusNow());
    }, 15000); // Check every 15s
    return () => clearInterval(timer);
  }, []);

  const todayAcademicDay: TimetableDay = campusTime.isAcademicDay
    ? (campusTime.day as TimetableDay)
    : 'Monday';

  // Interactive day switcher on Home screen
  const [activeDay, setActiveDay] = useState<TimetableDay>(todayAcademicDay);
  const prevDayRef = useRef(todayAcademicDay);

  useEffect(() => {
    if (prevDayRef.current !== todayAcademicDay) {
      prevDayRef.current = todayAcademicDay;
      setActiveDay(todayAcademicDay);
    }
  }, [todayAcademicDay]);

  // Dynamic greeting based on current local hour
  let greetingTime = 'Good morning';
  if (campusTime.hours >= 12 && campusTime.hours < 17) {
    greetingTime = 'Good afternoon';
  } else if (campusTime.hours >= 17) {
    greetingTime = 'Good evening';
  }

  // Clean raw preferred name from leading/trailing dashes, underscores, or weird punctuation
  const cleanName = (userProfile.preferredName || '')
    .replace(/^[-_—\s]+/, '')
    .replace(/[-_—\s]+$/, '')
    .trim();

  const greeting = cleanName
    ? `${greetingTime}, ${cleanName}.`
    : `${greetingTime}.`;

  // Free time calculation for active day
  const freeGaps = calculateFreeTimeGaps(activeSessions, activeDay);
  const totalFreeMinutesToday = freeGaps.reduce((acc, g) => acc + g.durationMinutes, 0);

  // Clash detection
  const clashes = detectClashes(activeSessions, personalEvents);
  const todayClashes = clashes.filter((c) => c.day === activeDay);

  const getCampusSurvivalTip = (day: string) => {
    switch (day) {
      case 'Monday':
        return 'Morning shuttle queues at Camp get thick between 7:15 AM and 8:15 AM. Plan 20 minutes ahead to secure front-row seats at JAO 1, JAO 2, or Mahmood Yakubu.';
      case 'Tuesday':
        return 'MP01, ETF lecture halls, and COLAMRUD ground floor offer reliable charging points if your device battery runs low between practicals.';
      case 'Wednesday':
        return 'Wednesday afternoons from 2:00 PM are reserved for University Sports. Use morning hours to finalize lab manuals and coursework.';
      case 'Thursday':
        return 'Moving between Ceremonial Building and COLENG? Allow at least 12 minutes brisk walking time across Motion Ground.';
      case 'Friday':
        return 'Official university lecture break runs between 1:00 PM and 2:00 PM on Fridays across all faculties.';
      default:
        return 'The Nimbe Adedipe Library provides quiet study wings on Saturdays. Use the Free Time tab to scout vacant halls for study sessions.';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner & Dynamic Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex-wrap">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono">{campusTime.fullDateStr} • {campusTime.timeStr} WAT</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px] border border-indigo-100 dark:border-indigo-900/40">
              <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span>Active 2026/2027 Timetable</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            {greeting}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {userProfile.level}L • {userProfile.departmentId || userProfile.collegeId || 'General Schedule'} • {activeSessions.length} registered {activeSessions.length === 1 ? 'class' : 'classes'}
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {onOpenCGPAEstimator && (
            <button
              onClick={onOpenCGPAEstimator}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs"
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>5.0 CGPA Estimator</span>
            </button>
          )}

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Timetable</span>
          </button>
        </div>
      </div>

      {/* Friendly Course Mate Self-Introduction & Department Personalization Card */}
      {!userProfile.departmentId ? (
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-200/90 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/90 via-white to-blue-50/70 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-2xs">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                <span>Welcome to Course Mate</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">2026/2027 Academic Session</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hello! I am Course Mate — your personal FUNAAB campus wingman.
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              I keep track of your daily lecture periods, notify you before class begins, map out empty study halls, and make sure you never walk into the wrong lecture theatre. Select your college and department so I can tailor your exact timetable in under 30 seconds.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('settings')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <span>Personalize My Timetable (30s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : null}

      {/* Daily FUNAAB Campus Survival Insight */}
      <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex items-start gap-3 text-xs shadow-2xs">
        <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
          <Compass className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider">
              FUNAAB Campus Survival Tip
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              {campusTime.day} Note
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            {getCampusSurvivalTip(campusTime.day)}
          </p>
        </div>
      </div>

      {/* Curriculum Auto-Enroll Notice for under-enrolled students */}
      {activeSessions.length <= 2 && userProfile.departmentId && onSyncDepartmentCurriculum && (
        <div className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/70 dark:bg-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 text-xs shadow-2xs">
          <div className="space-y-0.5">
            <div className="font-bold text-indigo-950 dark:text-indigo-200">
              Only {activeSessions.length} registered {activeSessions.length === 1 ? 'class' : 'classes'} on your schedule
            </div>
            <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
              At FUNAAB, {userProfile.level}L {userProfile.departmentId} takes shared cross-cutting faculty courses (Mathematics, Physics, Chemistry, Biology, Computing, GNS, and Sports).
            </p>
          </div>
          <button
            onClick={onSyncDepartmentCurriculum}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shrink-0 shadow-xs whitespace-nowrap"
          >
            <span>Enroll Full {userProfile.level}L Curriculum</span>
          </button>
        </div>
      )}

      {/* Wednesday Sports Window Notice */}
      {campusTime.day === 'Wednesday' && campusTime.hours >= 14 && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-3 text-xs">
          <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="text-emerald-950 dark:text-emerald-200">
            <span className="font-bold">Official University Sports Period:</span> Wednesday afternoons (2:00 PM – 6:00 PM) are designated for inter-hall and university sporting activities.
          </div>
        </div>
      )}

      {/* Clash Warning if detected */}
      {todayClashes.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold text-amber-950 dark:text-amber-200">
              Schedule overlap detected on {activeDay} ({todayClashes.length})
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/90 mt-0.5">
              Overlapping items: {todayClashes[0].itemA.title} and {todayClashes[0].itemB.title} ({todayClashes[0].timeRange}). Review your schedule.
            </p>
          </div>
        </div>
      )}

      {/* NEXT CLASS CARD */}
      <NextClassCard
        sessions={activeSessions}
        onSelectCourse={onSelectCourse}
        onSelectVenue={onSelectVenue}
        onSelectDay={(day) => setActiveDay(day)}
      />

      {/* CAMPUS SPONSOR SPOTLIGHT */}
      {onOpenAdModal && (
        <SponsoredSpot
          onOpenAdModal={onOpenAdModal}
          onOpenSiscoShowcase={onOpenSiscoShowcase}
          onOpenDaVinciShowcase={onOpenDaVinciShowcase}
          onAdInteraction={onAdInteraction}
          variant="home"
        />
      )}

      {/* 2026/2027 Academic Session Calendar Quick Strip */}
      {onOpenAcademicCalendar && (
        <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-slate-900 dark:text-white truncate">
                2026/2027 Academic Session Calendar
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Senate approved milestone dates, CAT & examinations
              </div>
            </div>
          </div>
          <button
            onClick={onOpenAcademicCalendar}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs transition-colors shrink-0 whitespace-nowrap"
          >
            View Calendar →
          </button>
        </div>
      )}

      {/* Free-Time Insight Snippet */}
      {freeGaps.length > 0 && (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                {totalFreeMinutesToday >= 60
                  ? `You have ${Math.floor(totalFreeMinutesToday / 60)}h ${totalFreeMinutesToday % 60 > 0 ? `${totalFreeMinutesToday % 60}m` : ''} free on ${activeDay}`
                  : `You have ${totalFreeMinutesToday}m free on ${activeDay}`}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                First open window: {freeGaps[0].startTime} – {freeGaps[0].endTime} ({freeGaps[0].formattedDuration})
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('freetime')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>Explore</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => onNavigateTab('timetable')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Full Timetable</div>
          <div className="text-[11px] text-slate-500">4 viewing modes</div>
        </button>

        <button
          onClick={() => onNavigateTab('courses')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Find a Course</div>
          <div className="text-[11px] text-slate-500">Search code & title</div>
        </button>

        <button
          onClick={() => onNavigateTab('venues')}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Find a Venue</div>
          <div className="text-[11px] text-slate-500">Auditoriums & labs</div>
        </button>

        <button
          onClick={() => onOpenAddPersonalEvent(activeDay)}
          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all text-left shadow-2xs group"
        >
          <Plus className="w-4 h-4 text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xs font-bold text-slate-900 dark:text-white">Personal Event</div>
          <div className="text-[11px] text-slate-500">Study / meeting</div>
        </button>
      </div>

      {/* FUNAAB 101 Campus Guide Resource */}
      <a
        href="https://funaab101.xyz"
        target="_blank"
        rel="noopener noreferrer"
        className="p-3.5 sm:p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 flex items-center justify-between gap-3 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-white">FUNAAB 101 Campus Guide</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                funaab101.xyz
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
              Know your school better: campus navigation, hostel guides, landmarks, survival tips & student secrets.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span className="hidden sm:inline">Explore</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>

      {/* Interactive Day Switcher Tabs */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              {activeDay}'s Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Chronological timeline of lectures, practicals, and free time
            </p>
          </div>

          {/* Interactive Day Switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto scrollbar-thin">
            {ACADEMIC_DAYS.map((d) => {
              const isSelected = activeDay === d;
              const isToday = campusTime.day === d;
              return (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1 ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{d.slice(0, 3)}</span>
                  {isToday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Today" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Timeline for Selected Day */}
        <TodayTimeline
          sessions={activeSessions}
          personalEvents={personalEvents}
          day={activeDay}
          onSelectCourse={onSelectCourse}
          onSelectVenue={onSelectVenue}
          onAddPersonalEvent={onOpenAddPersonalEvent}
        />
      </div>
    </div>
  );
};
