import React from 'react';
import { TimetableSession, TimetableDay } from '../types';
import { ACADEMIC_DAYS, calculateFreeTimeGaps } from '../utils/scheduleLogic';
import { SponsoredSpot } from '../components/SponsoredSpot';
import { EmptyVenueFinder } from '../components/EmptyVenueFinder';
import { Coffee, Plus, Clock, ArrowRight } from 'lucide-react';

interface FreeTimePageProps {
  sessions: TimetableSession[];
  onOpenAddPersonalEvent: (day?: TimetableDay, time?: string) => void;
  onOpenAdModal?: () => void;
  onOpenSiscoShowcase?: () => void;
  onAdInteraction?: () => void;
}

export const FreeTimePage: React.FC<FreeTimePageProps> = ({
  sessions,
  onOpenAddPersonalEvent,
  onOpenAdModal,
  onOpenSiscoShowcase,
  onAdInteraction,
}) => {
  // Compute free time windows across all 5 academic days
  const dailyFreeWindows = ACADEMIC_DAYS.map((day) => {
    const gaps = calculateFreeTimeGaps(sessions, day);
    const totalMinutes = gaps.reduce((acc, g) => acc + g.durationMinutes, 0);
    return {
      day,
      gaps,
      totalMinutes,
      formattedTotal:
        totalMinutes >= 60
          ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60 > 0 ? `${totalMinutes % 60}m` : ''}`
          : `${totalMinutes}m`,
    };
  });

  const grandTotalMinutes = dailyFreeWindows.reduce((acc, d) => acc + d.totalMinutes, 0);
  const grandTotalHours = (grandTotalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Free Time Finder
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Factual windows between your official lectures and practicals.
        </p>
      </div>

      {/* Overview Stat Banner */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Coffee className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Weekly Free Windows
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {grandTotalHours} hours between classes
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
          Use these open gaps to plan independent study, library visits, assignments, or quiet rest.
        </div>
      </div>

      {/* Campus-wide empty venues (all levels) */}
      <EmptyVenueFinder />

      {/* Campus Sponsor / Promotional Opportunity */}
      {onOpenAdModal && (
        <SponsoredSpot
          onOpenAdModal={onOpenAdModal}
          onOpenSiscoShowcase={onOpenSiscoShowcase}
          onAdInteraction={onAdInteraction}
          variant="compact"
        />
      )}

      {/* Day by Day Breakdown */}
      <div className="space-y-4">
        {dailyFreeWindows.map(({ day, gaps, formattedTotal }) => (
          <div
            key={day}
            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  {day}
                </span>
                <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
                  {gaps.length > 0 ? `${formattedTotal} free` : 'No between-class gaps'}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {gaps.length} {gaps.length === 1 ? 'window' : 'windows'}
              </span>
            </div>

            {gaps.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-1">
                Classes are continuous or you have a single/no class scheduled for this day.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {gaps.map((g) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-mono font-bold text-slate-800 dark:text-slate-200">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{g.startTime} – {g.endTime}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Duration: <strong>{g.formattedDuration}</strong> (after {g.precedingItem})
                      </div>
                    </div>

                    <button
                      onClick={() => onOpenAddPersonalEvent(day, g.startTime)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0 pl-2"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Plan</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
