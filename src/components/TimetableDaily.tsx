import React, { useState } from 'react';
import { TimetableSession, PersonalEvent, TimetableDay } from '../types';
import { ACADEMIC_DAYS, getCampusNow } from '../utils/scheduleLogic';
import { TodayTimeline } from './TodayTimeline';

interface TimetableDailyProps {
  sessions: TimetableSession[];
  personalEvents: PersonalEvent[];
  initialDay?: TimetableDay;
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
  onAddPersonalEvent?: (suggestedDay?: TimetableDay, suggestedTime?: string) => void;
}

export const TimetableDaily: React.FC<TimetableDailyProps> = ({
  sessions,
  personalEvents,
  initialDay,
  onSelectCourse,
  onSelectVenue,
  onAddPersonalEvent,
}) => {
  const campus = getCampusNow();
  const defaultDay: TimetableDay = initialDay
    ? initialDay
    : campus.isAcademicDay
    ? (campus.day as TimetableDay)
    : 'Monday';

  const [selectedDay, setSelectedDay] = useState<TimetableDay>(defaultDay);

  return (
    <div className="space-y-5">
      {/* Day Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto scrollbar-thin">
        {ACADEMIC_DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = campus.day === day;
          const count = sessions.filter((s) => s.day === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 min-w-[72px] py-2 px-3 rounded-lg text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                isSelected
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-1">
                <span>{day.slice(0, 3)}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" title="Today" />
                )}
              </div>
              <span className="text-[10px] font-mono opacity-70">
                {count} {count === 1 ? 'class' : 'classes'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Timeline */}
      <TodayTimeline
        sessions={sessions}
        personalEvents={personalEvents}
        day={selectedDay}
        onSelectCourse={onSelectCourse}
        onSelectVenue={onSelectVenue}
        onAddPersonalEvent={onAddPersonalEvent}
      />
    </div>
  );
};
