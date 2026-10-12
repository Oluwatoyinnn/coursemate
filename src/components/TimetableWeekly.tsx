import React from 'react';
import { TimetableSession, PersonalEvent, TimetableDay } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes, getCampusNow } from '../utils/scheduleLogic';
import { getCourseMeaning } from '../utils/courseMeanings';
import { Clock, MapPin, Trophy } from 'lucide-react';

interface TimetableWeeklyProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
}

export const TimetableWeekly: React.FC<TimetableWeeklyProps> = ({
  sessions,
  personalEvents,
  onSelectCourse,
  onSelectVenue,
}) => {
  const campus = getCampusNow();

  return (
    <div className="space-y-2">
      {/* Mobile Swipe Hint */}
      <div className="flex md:hidden items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1 font-mono">
        <span>Weekly Calendar Grid</span>
        <span>Swipe horizontally (Mon–Fri) →</span>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-thin rounded-2xl">
        <div className="min-w-[860px] grid grid-cols-5 gap-3">
        {ACADEMIC_DAYS.map((day) => {
          const isToday = campus.day === day;
          const daySessions = sessions
            .filter((s) => s.day === day)
            .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

          const dayPersonal = personalEvents
            .filter((e) => e.day === day)
            .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

          return (
            <div
              key={day}
              className={`flex flex-col rounded-2xl border transition-all p-3.5 min-h-[420px] ${
                isToday
                  ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'
              }`}
            >
              {/* Day Header */}
              <div className="pb-2.5 mb-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {day}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
                      Today
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {daySessions.length} {daySessions.length === 1 ? 'class' : 'classes'}
                </span>
              </div>

              {/* Day Items */}
              <div className="space-y-2 flex-1">
                {daySessions.length === 0 && dayPersonal.length === 0 && day !== 'Wednesday' ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-xs text-slate-400 italic">No classes</span>
                  </div>
                ) : (
                  <>
                    {daySessions.map((s) => (
                      <div
                        key={s.id}
                        className={`p-2.5 rounded-xl border text-xs transition-all ${
                          s.isPractical
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-900/60'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        } shadow-2xs hover:shadow-xs`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <button
                            onClick={() => onSelectCourse?.(s.courseCode)}
                            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left"
                          >
                            {s.courseCode}
                          </button>
                          {s.isPractical && (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                              (Practical)
                            </span>
                          )}
                        </div>

                        <p
                          className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 leading-tight"
                          title={getCourseMeaning(s.courseCode)}
                        >
                          {getCourseMeaning(s.courseCode)}
                        </p>

                        <div className="mt-1 flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{s.startTime} – {s.endTime}</span>
                        </div>

                        <button
                          onClick={() => onSelectVenue?.(s.venue)}
                          className="mt-1 flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 truncate w-full text-left"
                        >
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{s.venue}</span>
                        </button>
                      </div>
                    ))}

                    {/* Official Wednesday Sports Period */}
                    {day === 'Wednesday' && (
                      <div className="p-2 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs flex items-center gap-1.5">
                        <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-emerald-950 dark:text-emerald-200 block text-[11px]">
                            University Sports
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800/80 dark:text-emerald-300/80">
                            2:00 PM – 4:00 PM
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Personal events */}
                    {dayPersonal.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 text-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-semibold text-amber-950 dark:text-amber-200 truncate">
                            {p.title}
                          </span>
                          <span className="text-[9px] uppercase font-bold text-amber-700 dark:text-amber-400">
                            Personal
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                          {p.startTime} – {p.endTime}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
};
