import React, { useState } from 'react';
import { OFFICIAL_VENUES, OFFICIAL_METADATA } from '../data/timetable';
import { matchVenueSearch } from '../utils/scheduleLogic';
import { Search, MapPin, Users, ExternalLink, Navigation, Compass } from 'lucide-react';

interface VenuesPageProps {
  onSelectVenue: (name: string) => void;
}

export const VenuesPage: React.FC<VenuesPageProps> = ({ onSelectVenue }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredVenues = OFFICIAL_VENUES.filter((v) => {
    if (searchQuery.trim() && !matchVenueSearch(v.name, searchQuery) && !v.building.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (typeFilter !== 'all' && v.type !== typeFilter) {
      return false;
    }
    return true;
  });

  const handleExternalDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(OFFICIAL_METADATA.directionServiceUrl, '_blank', 'noopener,noreferrer');
  };

  const types = ['all', 'Auditorium', 'Lecture Theatre', 'Lecture Room', 'Laboratory', 'Computer Lab'];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Campus Venues Directory
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Official lecture theatres, laboratories, and auditoria verified by TIMTEC v4.0.
        </p>
      </div>

      {/* External Direction & Campus Guide Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h4 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Campus Walking & Driving Directions
          </h4>
          <p className="text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
            Course Mate organizes your academic schedule. Campus navigation is provided externally via <strong>funaab.getdirection.xyz</strong>. For general university life & guides, visit <strong>funaab101.xyz</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://funaab101.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
          >
            <Compass className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>FUNAAB 101</span>
          </a>

          <a
            href={OFFICIAL_METADATA.directionServiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-xs"
          >
            <span>GetDirection</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Search Input */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Ask: "Where is A105?", "JAO 3", "AUD II", "COLENG"...'
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {types.map((t) => {
            const isSelected = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {t === 'all' ? 'All Spaces' : t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Venue Cards Grid */}
      {filteredVenues.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No venues match that search.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Check the venue code or clear your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredVenues.map((v) => (
            <div
              key={v.name}
              onClick={() => onSelectVenue(v.name)}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-2xs flex flex-col justify-between gap-3 cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{v.type}</span>
                  {v.capacity && (
                    <span className="font-mono flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300">
                      <Users className="w-3 h-3 text-slate-400" />
                      {v.capacity}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mt-1">
                  {v.name}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {v.building}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:underline">
                  View scheduled classes →
                </span>

                <button
                  onClick={handleExternalDirections}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                  title="Directions"
                >
                  <Navigation className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
