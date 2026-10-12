import React, { useMemo, useState } from 'react';
import { DoorOpen, Search, Users, Building2, Info } from 'lucide-react';
import { ACADEMIC_DAYS, getCampusNow, formatMinutesToTime } from '../utils/scheduleLogic';
import { findFreeVenues } from '../utils/venueAvailability';

const START_OF_DAY = 8 * 60;
const END_OF_DAY = 19 * 60;
const TIME_OPTIONS: number[] = [];
for (let m = START_OF_DAY; m <= END_OF_DAY; m += 30) TIME_OPTIONS.push(m);

const QUICK_SLOTS: { label: string; start: number; end: number }[] = [
  { label: '9–11 AM', start: 9 * 60, end: 11 * 60 },
  { label: '11 AM–1 PM', start: 11 * 60, end: 13 * 60 },
  { label: '2–4 PM', start: 14 * 60, end: 16 * 60 },
  { label: '4–6 PM', start: 16 * 60, end: 18 * 60 },
];

const SEAT_FILTERS = [
  { label: 'Any size', min: 0 },
  { label: '50+ seats', min: 50 },
  { label: '100+ seats', min: 100 },
  { label: '200+ seats', min: 200 },
];

export const EmptyVenueFinder: React.FC = () => {
  const now = getCampusNow();
  const inTeachingHours = now.isAcademicDay && now.totalMinutes >= START_OF_DAY && now.totalMinutes < END_OF_DAY;
  const nowRounded = Math.min(END_OF_DAY - 60, Math.floor(now.totalMinutes / 30) * 30);

  const [day, setDay] = useState<string>(now.isAcademicDay ? now.day : 'Monday');
  const [start, setStart] = useState<number>(inTeachingHours ? nowRounded : 9 * 60);
  const [end, setEnd] = useState<number>(inTeachingHours ? Math.min(END_OF_DAY, nowRounded + 120) : 11 * 60);
  const [minSeats, setMinSeats] = useState(0);
  const [includeLabs, setIncludeLabs] = useState(false);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'capacity' | 'longest'>('capacity');
  const [showAll, setShowAll] = useState(false);

  const validWindow = end > start;

  const results = useMemo(() => {
    if (!validWindow) return [];
    const q = query.trim().toLowerCase();
    const list = findFreeVenues(day, start, end).filter(({ venue }) => {
      if (!includeLabs && venue.kind !== 'room') return false;
      if (minSeats > 0 && (venue.capacity ?? 0) < minSeats) return false;
      if (q && !venue.name.toLowerCase().includes(q) && !venue.building.toLowerCase().includes(q)) return false;
      return true;
    });
    list.sort((a, b) => {
      if (sortBy === 'longest') {
        const fa = a.freeUntil ?? 24 * 60;
        const fb = b.freeUntil ?? 24 * 60;
        if (fb !== fa) return fb - fa;
      }
      const ca = a.venue.capacity ?? -1;
      const cb = b.venue.capacity ?? -1;
      if (cb !== ca) return cb - ca;
      return a.venue.name.localeCompare(b.venue.name);
    });
    return list;
  }, [day, start, end, minSeats, includeLabs, query, sortBy, validWindow]);

  const LIMIT = 24;
  const visible = showAll ? results : results.slice(0, LIMIT);

  const selectCls =
    'w-full px-1.5 sm:px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';

  return (
    <section className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0">
          <DoorOpen className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Empty Venue Finder</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Checks every level and department on campus and lists rooms with no timetabled class in your chosen window.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Day</span>
          <select className={selectCls} value={day} onChange={(e) => setDay(e.target.value)}>
            {ACADEMIC_DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">From</span>
          <select className={selectCls} value={start} onChange={(e) => setStart(Number(e.target.value))}>
            {TIME_OPTIONS.slice(0, -1).map((m) => (
              <option key={m} value={m}>{formatMinutesToTime(m)}</option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">To</span>
          <select className={selectCls} value={end} onChange={(e) => setEnd(Number(e.target.value))}>
            {TIME_OPTIONS.slice(1).map((m) => (
              <option key={m} value={m}>{formatMinutesToTime(m)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {inTeachingHours && (
          <button
            onClick={() => { setDay(now.day); setStart(nowRounded); setEnd(Math.min(END_OF_DAY, nowRounded + 120)); }}
            className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
          >
            Free now
          </button>
        )}
        {QUICK_SLOTS.map((q) => (
          <button
            key={q.label}
            onClick={() => { setStart(q.start); setEnd(q.end); }}
            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
              start === q.start && end === q.end
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a venue or building…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <select className={`${selectCls} sm:w-36`} value={minSeats} onChange={(e) => setMinSeats(Number(e.target.value))}>
          {SEAT_FILTERS.map((f) => (
            <option key={f.min} value={f.min}>{f.label}</option>
          ))}
        </select>
        <select className={`${selectCls} sm:w-40`} value={sortBy} onChange={(e) => setSortBy(e.target.value as 'capacity' | 'longest')}>
          <option value="capacity">Sort: biggest first</option>
          <option value="longest">Sort: free longest</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeLabs}
          onChange={(e) => setIncludeLabs(e.target.checked)}
          className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
        />
        Also show labs and department rooms
      </label>

      {/* Results */}
      {!validWindow ? (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg px-3 py-2">
          Pick an end time later than the start time.
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
            <span>
              <strong className="text-emerald-700 dark:text-emerald-400">{results.length}</strong> free {results.length === 1 ? 'venue' : 'venues'}
            </span>
            <span>{day} • {formatMinutesToTime(start)} – {formatMinutesToTime(end)}</span>
          </div>

          {results.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-3 text-center">
              No venue matches. Try a shorter window, a smaller seat filter, or include labs.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {visible.map(({ venue, freeUntil }) => (
                <div
                  key={venue.name}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight break-words min-w-0">{venue.name}</span>
                    {venue.capacity ? (
                      <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300">
                        <Users className="w-3 h-3" />
                        {venue.capacity}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Building2 className="w-3 h-3 shrink-0" />
                    <span className="truncate">{venue.building}</span>
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                    {freeUntil === null ? 'Free for the rest of the day' : `Next class here at ${formatMinutesToTime(freeUntil)}`}
                  </div>
                </div>
              ))}
            </div>
          )}

          {results.length > LIMIT && (
            <button
              onClick={() => setShowAll((v) => !v)}
              className="w-full py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {showAll ? 'Show fewer' : `Show all ${results.length}`}
            </button>
          )}
        </>
      )}

      <p className="flex items-start gap-1.5 text-[11px] text-slate-400 leading-relaxed">
        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        Based on the official TIMTEC lecture timetable only. "Free" means no timetabled class, not a booking, so exams, events or
        department use are not included. Check before you settle in.
      </p>
    </section>
  );
};
