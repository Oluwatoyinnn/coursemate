import React from 'react';
import { PersonalEvent, TimetableSession } from '../types';
import { detectClashes, ACADEMIC_DAYS } from '../utils/scheduleLogic';
import { Plus, Clock, MapPin, Calendar, AlertTriangle, Edit3, Trash2 } from 'lucide-react';

interface MySchedulePageProps {
  personalEvents: PersonalEvent[];
  officialSessions: TimetableSession[];
  onOpenAddEvent: () => void;
  onEditEvent: (event: PersonalEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const MySchedulePage: React.FC<MySchedulePageProps> = ({
  personalEvents,
  officialSessions,
  onOpenAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  // Detect clashes involving personal events
  const clashes = detectClashes(officialSessions, personalEvents).filter(
    (c) => c.type === 'official-personal' || c.type === 'personal-personal'
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Personal Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Your private study blocks, assignments, and meetings. Stored securely on your device.
          </p>
        </div>

        <button
          onClick={onOpenAddEvent}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Personal Event</span>
        </button>
      </div>

      {/* Clashes Banner */}
      {clashes.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Schedule Overlaps Detected ({clashes.length})</span>
          </div>
          <p className="text-amber-800/90 dark:text-amber-300/90 text-[11px]">
            The following personal events overlap with other scheduled items:
          </p>
          <ul className="space-y-1 pl-4 list-disc text-[11px] text-amber-900 dark:text-amber-300">
            {clashes.map((c) => (
              <li key={c.id}>
                <strong>{c.day}:</strong> “{c.itemA.title}” overlaps with “{c.itemB.title}” ({c.timeRange})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Events List */}
      {personalEvents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nothing planned yet.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Add revision blocks, team project meetings, or personal reminders to integrate seamlessly with your timetable.
          </p>
          <button
            onClick={onOpenAddEvent}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-xs"
          >
            Add first event
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {personalEvents.map((e) => (
            <div
              key={e.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {e.title}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded">
                    Personal ({e.type})
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{e.day}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {e.startTime} – {e.endTime}
                  </span>
                  {e.location && (
                    <span className="flex items-center gap-1 font-sans text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {e.location}
                    </span>
                  )}
                </div>

                {e.notes && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-0.5">
                    {e.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => onEditEvent(e)}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit event"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteEvent(e.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
