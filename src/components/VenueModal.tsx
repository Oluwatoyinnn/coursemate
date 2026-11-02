import React from 'react';
import { TIMETABLE_SESSIONS, OFFICIAL_VENUES, OFFICIAL_METADATA } from '../data/timetable';
import { X, Navigation, Users, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

interface VenueModalProps {
  venueName: string;
  onClose: () => void;
  onSelectCourse?: (courseCode: string) => void;
}

export const VenueModal: React.FC<VenueModalProps> = ({
  venueName,
  onClose,
  onSelectCourse,
}) => {
  // Look up verified directory data
  const officialInfo = OFFICIAL_VENUES.find(
    (v) => v.name.toLowerCase() === venueName.toLowerCase()
  );

  // Find all sessions using this venue
  const sessions = TIMETABLE_SESSIONS.filter(
    (s) => s.venue.toLowerCase() === venueName.toLowerCase()
  );

  // Group sessions by day
  const sessionsByDay: Record<string, typeof sessions> = {};
  for (const s of sessions) {
    if (!sessionsByDay[s.day]) sessionsByDay[s.day] = [];
    sessionsByDay[s.day].push(s);
  }

  const handleOpenDirections = () => {
    window.open(OFFICIAL_METADATA.directionServiceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5" />
              <span>Campus Venue Directory</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {venueName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {officialInfo?.building || 'FUNAAB Campus Space'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Official Specs Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Building / College</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {officialInfo?.building || 'Verified in Timetable'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Official Capacity</span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {officialInfo?.capacity ? `${officialInfo.capacity} seats` : 'Source unspecified'}
              </span>
            </div>
          </div>

          {/* External Directions Card (Handoff to funaab.getdirection.xyz) */}
          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                Need directions to this venue?
              </h4>
              <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5">
                Course Mate handles your schedule. Navigation is provided by the external campus service <strong>funaab.getdirection.xyz</strong>.
              </p>
            </div>

            <a
              href={OFFICIAL_METADATA.directionServiceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors shrink-0"
            >
              <span>Get directions</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Classes hosted in this venue */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Classes at this venue ({sessions.length})
            </h4>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No scheduled sessions in timetable.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(sessionsByDay).map(([day, dayList]) => (
                  <div key={day} className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      {day}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {dayList.map((s) => (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                        >
                          <button
                            onClick={() => {
                              onClose();
                              onSelectCourse?.(s.courseCode);
                            }}
                            className="font-bold text-indigo-700 dark:text-indigo-400 hover:underline"
                          >
                            {s.courseCode}
                          </button>
                          <span className="font-mono text-[11px] text-slate-500">
                            {s.startTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provenance Footer */}
          <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Venue specifications derived from official TIMTEC 2026/2027 lecture timetable venue capacity directory.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
