import React from 'react';
import { TimetableSession, PersonalEvent } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes } from '../utils/scheduleLogic';
import { MapPin, Clock, Calendar } from 'lucide-react';

interface TimetableAgendaProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
}

export const TimetableAgenda: React.FC<TimetableAgendaProps> = ({
  sessions,
  personalEvents,
  onSelectCourse,
  onSelectVenue,
}) => {
  return (
    <div className="space-y-6">
      {ACADEMIC_DAYS.map((day) => {
        const daySessions = sessions
          .filter((s) => s.day === day)
          .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

        const dayPersonal = personalEvents
          .filter((e) => e.day === day)
          .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

        if (daySessions.length === 0 && dayPersonal.length === 0) {
          return null;
        }

        return (
          <div key={day} className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 dark:border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {day}
              </h4>
              <span className="text-[11px] font-mono text-slate-400">
                ({daySessions.length + dayPersonal.length} total)
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs overflow-hidden">
              {daySessions.map((s) => (
                <div
                  key={s.id}
                  className="p-3 sm:px-4 flex items-start justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="min-w-[85px] sm:min-w-[100px] shrink-0 font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.startTime}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectCourse?.(s.courseCode)}
                        className="text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-left"
                      >
                        {s.courseCode}
                      </button>
                      {s.isPractical && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          · Practical
                        </span>
                      )}
                      {s.isVirtual && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                          · Virtual
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onSelectVenue?.(s.venue)}
                      className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate"
                    >
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{s.venue}</span>
                    </button>
                  </div>

                  <div className="text-right text-[11px] font-mono text-slate-400 shrink-0 hidden sm:block">
                    until {s.endTime}
                  </div>
                </div>
              ))}

              {dayPersonal.map((p) => (
                <div
                  key={p.id}
                  className="p-3 sm:px-4 flex items-start justify-between gap-4 bg-amber-50/30 dark:bg-amber-950/10 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors"
                >
                  <div className="min-w-[85px] sm:min-w-[100px] shrink-0 font-mono text-xs font-semibold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{p.startTime}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-amber-950 dark:text-amber-200">
                        {p.title}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                        · Personal ({p.type})
                      </span>
                    </div>

                    {p.location && (
                      <div className="mt-0.5 flex items-center gap-1 text-xs text-amber-800/80 dark:text-amber-400/80">
                        <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{p.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
