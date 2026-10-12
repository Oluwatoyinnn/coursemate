import React from 'react';
import { TIMETABLE_SESSIONS, OFFICIAL_METADATA } from '../data/timetable';
import { isSessionMatchingCourse, getRootCourseCode } from '../utils/scheduleLogic';
import { getCourseMeaning } from '../utils/courseMeanings';
import { X, Plus, Check, Clock, MapPin, Navigation, ShieldCheck } from 'lucide-react';

interface CourseModalProps {
  courseCode: string;
  isRegistered: boolean;
  onToggleRegistered: (code: string) => void;
  onClose: () => void;
  onSelectVenue?: (venue: string) => void;
}

export const CourseModal: React.FC<CourseModalProps> = ({
  courseCode,
  isRegistered,
  onToggleRegistered,
  onClose,
  onSelectVenue,
}) => {
  // Find all sessions for this course code (supporting streams, slashes, and root codes)
  const sessions = TIMETABLE_SESSIONS.filter((s) =>
    isSessionMatchingCourse(s.courseCode, courseCode)
  );

  const sample = sessions[0];
  const isPractical = sessions.some((s) => s.isPractical);
  const isVirtual = sessions.some((s) => s.isVirtual);
  const courseTitle = getCourseMeaning(courseCode);

  const handleDirections = (venue: string) => {
    window.open(OFFICIAL_METADATA.directionServiceUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                {sample?.level ? `${sample.level} Level` : 'Official Course'}
              </span>
              {isPractical && (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  · Practical Course
                </span>
              )}
              {isVirtual && (
                <span className="text-[11px] font-medium text-indigo-700 dark:text-indigo-400">
                  · Virtual Option
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
              {courseCode}
            </h2>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">
              {courseTitle ? courseTitle : 'Official lecture & practical timetable specification'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Action: Add / Remove from My Courses */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                {isRegistered ? 'Saved in My Courses' : 'Add to My Timetable'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {isRegistered
                  ? 'This course appears in your personalized schedule.'
                  : 'Track this course on your home timeline and next class alerts.'}
              </span>
            </div>

            <button
              onClick={() => onToggleRegistered(courseCode)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isRegistered
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
              }`}
            >
              {isRegistered ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Enrolled</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </>
              )}
            </button>
          </div>

          {/* Scheduled Sessions List */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Scheduled Weekly Sessions ({sessions.length})
            </h4>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No scheduled slots found.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-indigo-900 dark:text-indigo-300 font-bold">
                        {s.day}
                      </span>
                      <span className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {s.startTime} – {s.endTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectVenue?.(s.venue);
                        }}
                        className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.venue}</span>
                      </button>

                      <button
                        onClick={() => handleDirections(s.venue)}
                        className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 dark:text-slate-400"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provenance note */}
          <div className="pt-2 text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>
              Authoritative source: {OFFICIAL_METADATA.institution} • {OFFICIAL_METADATA.academicYear} {OFFICIAL_METADATA.semester} Lecture Time-Table (Version {OFFICIAL_METADATA.timetableVersion}) by TIMTEC.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
