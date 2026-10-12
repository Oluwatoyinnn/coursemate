import React from 'react';
import { TimelineItem, TimetableDay, PersonalEvent, TimetableSession } from '../types';
import { buildDayTimeline } from '../utils/scheduleLogic';
import { MapPin, Clock, AlertTriangle, Coffee, Plus, Navigation, Trophy } from 'lucide-react';
import { OFFICIAL_METADATA } from '../data/timetable';
import { getCourseMeaning } from '../utils/courseMeanings';

interface TodayTimelineProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  day: TimetableDay;
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
  onAddPersonalEvent?: (suggestedDay?: TimetableDay, suggestedTime?: string) => void;
}

export const TodayTimeline: React.FC<TodayTimelineProps> = ({
  sessions,
  personalEvents,
  day,
  onSelectCourse,
  onSelectVenue,
  onAddPersonalEvent,
}) => {
  const timeline = buildDayTimeline(sessions, personalEvents, day);

  const handleDirections = (venue: string) => {
    window.open(OFFICIAL_METADATA.directionServiceUrl, '_blank', 'noopener,noreferrer');
  };

  if (timeline.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/50">
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mx-auto flex items-center justify-center mb-3">
          <Coffee className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
          You're free today.
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No official lectures or practicals are scheduled for {day} under your selected courses.
        </p>
        <button
          onClick={() => onAddPersonalEvent?.(day)}
          className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add personal study session</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative pl-6 md:pl-8 space-y-4 before:absolute before:left-2 md:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {timeline.map((item) => {
        // CASE 1: Official Class Session
        if (item.kind === 'session') {
          const s = item.session;
          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div
                className={`absolute -left-6 md:-left-8 top-3 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 bg-white dark:bg-slate-900 transition-colors ${
                  s.isPractical
                    ? 'border-emerald-600 dark:border-emerald-400'
                    : 'border-indigo-600 dark:border-indigo-400'
                }`}
              />

              <div
                className={`p-4 rounded-xl border transition-all ${
                  s.isPractical
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/50'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                } shadow-xs hover:shadow-sm`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCourse?.(s.courseCode)}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        {s.courseCode}
                      </button>
                      {s.isPractical && (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          · Practical
                        </span>
                      )}
                      {s.isVirtual && (
                        <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
                          · Virtual
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                      {getCourseMeaning(s.courseCode)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono shrink-0">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.startTime} – {s.endTime}</span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onSelectVenue?.(s.venue)}
                    className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.venue}</span>
                  </button>

                  <button
                    onClick={() => handleDirections(s.venue)}
                    className="text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
                    title="Open campus direction service (funaab.getdirection.xyz)"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // CASE 2: University Sports Window
        if (item.kind === 'sports') {
          return (
            <div key={item.id} className="relative group">
              <div className="absolute -left-6 md:-left-8 top-3 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-emerald-500 bg-white dark:bg-slate-900" />
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-200">
                    <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{item.title}</span>
                  </div>
                  <span className="font-mono text-emerald-800/80 dark:text-emerald-300/80">
                    {item.startTime} – {item.endTime}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/70 dark:text-emerald-300/70 mt-0.5">
                  Reserved university-wide across FUNAAB for inter-hall, departmental, and SU games.
                </p>
              </div>
            </div>
          );
        }

        // CASE 3: Personal Event
        if (item.kind === 'personal') {
          const e = item.event;
          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-6 md:-left-8 top-3 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-amber-500 bg-white dark:bg-slate-900" />

              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-amber-950 dark:text-amber-200">
                      {e.title}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                      · Personal ({e.type})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-amber-800/80 dark:text-amber-300/80 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{e.startTime} – {e.endTime}</span>
                  </div>
                </div>

                {e.location && (
                  <div className="mt-1.5 text-xs text-amber-800/70 dark:text-amber-300/70 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{e.location}</span>
                  </div>
                )}
                {e.notes && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 italic">
                    {e.notes}
                  </p>
                )}
              </div>
            </div>
          );
        }

        // CASE 3: Free Time Gap
        if (item.kind === 'free') {
          const g = item.gap;
          return (
            <div key={item.id} className="relative my-2">
              <div className="absolute -left-6 md:-left-8 top-1.5 w-4 md:w-5 h-4 md:h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 bg-stone-50 dark:bg-slate-950" />

              <div className="py-2 px-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <Coffee className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Free window ({g.formattedDuration})
                  </span>
                  <span className="hidden sm:inline font-mono text-[11px]">
                    · {g.startTime} – {g.endTime}
                  </span>
                </div>

                <button
                  onClick={() => onAddPersonalEvent?.(day, g.startTime)}
                  className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Fit study here</span>
                </button>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
