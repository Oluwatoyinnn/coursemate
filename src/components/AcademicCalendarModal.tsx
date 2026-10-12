import React, { useState } from 'react';
import { ACADEMIC_CALENDAR_2026_2027, AcademicCalendarEvent } from '../data/academicCalendar';
import { X, Calendar, Search, Sparkles, Clock, BookOpen, GraduationCap, Award, Bell } from 'lucide-react';

interface AcademicCalendarModalProps {
  onClose: () => void;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({ onClose }) => {
  const [filter, setFilter] = useState<'all' | 'First Semester' | 'Second Semester' | 'inaugural'>('all');
  const [search, setSearch] = useState('');

  const now = new Date();

  // Find nearest upcoming milestone
  const upcomingEvents = ACADEMIC_CALENDAR_2026_2027.filter((e) => new Date(e.isoDate) >= now).sort(
    (a, b) => new Date(a.isoDate).getTime() - new Date(b.isoDate).getTime()
  );

  const filteredEvents = ACADEMIC_CALENDAR_2026_2027.filter((e) => {
    if (filter === 'inaugural') {
      if (e.category !== 'inaugural') return false;
    } else if (filter !== 'all') {
      if (e.semester !== filter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.title.toLowerCase().includes(q) ||
        e.dateStr.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getDaysRemaining = (isoDate: string) => {
    const target = new Date(isoDate);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getCategoryBadge = (category: AcademicCalendarEvent['category']) => {
    switch (category) {
      case 'exam':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'cat':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900';
      case 'matriculation':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-900';
      case 'registration':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900';
      case 'inaugural':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
      case 'senate':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-900 dark:to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300">
                  Official Senate Schedule
                </span>
                <span className="text-[10px] font-mono text-slate-400">2026/2027 Session</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                FUNAAB Academic Calendar
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upcoming Highlight Cards */}
        {upcomingEvents.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Next Upcoming Milestones</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {upcomingEvents.slice(0, 2).map((ev) => {
                const daysLeft = getDaysRemaining(ev.isoDate);
                return (
                  <div
                    key={ev.id}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                        {ev.title}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{ev.dateStr}</div>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold shrink-0 font-mono">
                      {daysLeft === 0 ? 'Today!' : daysLeft > 0 ? `In ${daysLeft} days` : 'Past'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter bar & Search */}
        <div className="p-3 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Dates' },
              { id: 'First Semester', label: 'First Semester' },
              { id: 'Second Semester', label: 'Second Semester' },
              { id: 'inaugural', label: 'Inaugural Lectures' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filter === tab.id
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calendar…"
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Event List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-100 dark:divide-slate-800/80">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No calendar milestones matching your search.
            </div>
          ) : (
            filteredEvents.map((ev) => {
              const daysLeft = getDaysRemaining(ev.isoDate);
              const isPast = daysLeft < 0;

              return (
                <div key={ev.id} className="pt-2.5 first:pt-0 flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge(
                          ev.category
                        )}`}
                      >
                        {ev.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold">
                        {ev.dateStr}
                      </span>
                    </div>

                    <h4
                      className={`text-xs sm:text-sm font-bold leading-snug ${
                        ev.isImportant
                          ? 'text-slate-900 dark:text-white font-extrabold'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {ev.title}
                    </h4>

                    {ev.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                        {ev.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 pt-0.5">
                    {isPast ? (
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                        Concluded
                      </span>
                    ) : daysLeft === 0 ? (
                      <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded animate-pulse">
                        Today
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                        In {daysLeft}d
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="p-3 sm:px-5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span>Official FUNAAB 2026/2027 Academic Session Calendar</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
