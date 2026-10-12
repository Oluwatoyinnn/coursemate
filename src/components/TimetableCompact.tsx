import React from 'react';
import { TimetableSession } from '../types';
import { parseTimeToMinutes } from '../utils/scheduleLogic';
import { getCourseMeaning } from '../utils/courseMeanings';

interface TimetableCompactProps {
  sessions: TimetableSession[];
  onSelectCourse?: (courseCode: string) => void;
  onSelectVenue?: (venueName: string) => void;
}

export const TimetableCompact: React.FC<TimetableCompactProps> = ({
  sessions,
  onSelectCourse,
  onSelectVenue,
}) => {
  const sorted = [...sessions].sort((a, b) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const dDiff = days.indexOf(a.day) - days.indexOf(b.day);
    if (dDiff !== 0) return dDiff;
    return parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime);
  });

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Day</th>
              <th className="py-2.5 px-3 font-mono">Time</th>
              <th className="py-2.5 px-3">Course</th>
              <th className="py-2.5 px-3">Type</th>
              <th className="py-2.5 px-3">Venue</th>
              <th className="py-2.5 px-3 text-right">Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
            {sorted.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-2 px-3 font-medium text-slate-800 dark:text-slate-200">
                  {s.day.slice(0, 3)}
                </td>
                <td className="py-2 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {s.startTime} – {s.endTime}
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => onSelectCourse?.(s.courseCode)}
                    className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline text-left block"
                  >
                    {s.courseCode}
                  </button>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 max-w-[200px]" title={getCourseMeaning(s.courseCode)}>
                    {getCourseMeaning(s.courseCode)}
                  </span>
                </td>
                <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                  {s.isPractical ? (
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">Practical</span>
                  ) : s.isVirtual ? (
                    <span className="text-indigo-600 dark:text-indigo-400">Virtual</span>
                  ) : (
                    <span>Lecture</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  <button
                    onClick={() => onSelectVenue?.(s.venue)}
                    className="text-slate-700 dark:text-slate-300 hover:underline text-left truncate max-w-[200px]"
                  >
                    {s.venue}
                  </button>
                </td>
                <td className="py-2 px-3 text-right font-mono text-slate-500">
                  {s.level}L
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
