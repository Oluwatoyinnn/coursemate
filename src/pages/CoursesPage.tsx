import React, { useState } from 'react';
import { COURSE_CATALOG } from '../data/timetable';
import { matchCourseSearch, isSessionMatchingCourse } from '../utils/scheduleLogic';
import { getCourseMeaning } from '../utils/courseMeanings';
import { Search, Plus, Check, BookOpen, Layers } from 'lucide-react';

interface CoursesPageProps {
  selectedCourseCodes: string[];
  onToggleCourse: (code: string) => void;
  onSelectCourse: (code: string) => void;
  userLevel: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({
  selectedCourseCodes,
  onToggleCourse,
  onSelectCourse,
  userLevel,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<'all' | 'physical' | 'virtual'>('all');
  const [onlyPracticals, setOnlyPracticals] = useState(false);
  const [onlyEnrolled, setOnlyEnrolled] = useState(false);
  const [visibleCount, setVisibleCount] = useState(60);

  // Reset pagination on filter or search change
  React.useEffect(() => {
    setVisibleCount(60);
  }, [searchQuery, levelFilter, deliveryFilter, onlyPracticals, onlyEnrolled]);

  // Filter courses
  const filteredCourses = COURSE_CATALOG.filter((c) => {
    const courseTitle = getCourseMeaning(c.code);
    // Search by code and verified title
    if (searchQuery.trim() && !matchCourseSearch(c.code, searchQuery, courseTitle)) {
      return false;
    }
    // Level
    if (levelFilter !== 'all' && c.level !== levelFilter) {
      return false;
    }
    // Delivery mode
    if (deliveryFilter === 'physical' && c.isVirtual) {
      return false;
    }
    if (deliveryFilter === 'virtual' && !c.isVirtual) {
      return false;
    }
    // Practical
    if (onlyPracticals && !c.isPractical) {
      return false;
    }
    // Enrolled
    if (onlyEnrolled && !selectedCourseCodes.some((code) => isSessionMatchingCourse(c.code, code))) {
      return false;
    }
    return true;
  });

  const levelOptions = [
    { id: 'all', label: 'All Levels' },
    { id: '100', label: '100L' },
    { id: '200', label: '200L' },
    { id: '300', label: '300L' },
    { id: '400', label: '400L' },
    { id: '500', label: '500L' },
  ];

  return (
    <div className="space-y-5 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Courses Catalog
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Browse all {COURSE_CATALOG.length} verified courses from the 2026/2027 TIMTEC timetable.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course code (e.g. BIO 107, bio107, CHM, CSC)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
          />
        </div>

        {/* Level Filters & Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {levelOptions.map((opt) => {
              const isSelected = levelFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setLevelFilter(opt.id)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 sm:pt-0">
            {/* Delivery mode pills */}
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">
              <button
                onClick={() => setDeliveryFilter('all')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  deliveryFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Modes
              </button>
              <button
                onClick={() => setDeliveryFilter('physical')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  deliveryFilter === 'physical'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Physical
              </button>
              <button
                onClick={() => setDeliveryFilter('virtual')}
                className={`px-2 py-1 rounded-md font-medium transition-colors ${
                  deliveryFilter === 'virtual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Virtual
              </button>
            </div>

            <button
              onClick={() => setOnlyPracticals(!onlyPracticals)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                onlyPracticals
                  ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              Practicals
            </button>

            <button
              onClick={() => setOnlyEnrolled(!onlyEnrolled)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                onlyEnrolled
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              Enrolled ({selectedCourseCodes.length})
            </button>
          </div>
        </div>
      </div>

      {/* Course List Grid */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No courses found.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search query or level filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCourses.slice(0, visibleCount).map((course) => {
            const isEnrolled = selectedCourseCodes.some((code) =>
              isSessionMatchingCourse(course.code, code)
            );
            return (
              <div
                key={course.code}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-2xs flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-slate-500">
                      {course.level} Level
                    </span>
                    <div className="flex items-center gap-1">
                      {course.isPractical && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                          Practical
                        </span>
                      )}
                      {course.isVirtual && (
                        <span className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.5 rounded">
                          Virtual
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectCourse(course.code)}
                    className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-left mt-1 block"
                  >
                    {course.code}
                  </button>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5" title={getCourseMeaning(course.code)}>
                    {getCourseMeaning(course.code)}
                  </p>

                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {course.sessions.length} scheduled {course.sessions.length === 1 ? 'session' : 'sessions'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectCourse(course.code)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  >
                    View slots →
                  </button>

                  <button
                    onClick={() => onToggleCourse(course.code)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isEnrolled
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100'
                    }`}
                  >
                    {isEnrolled ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Enrolled</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {filteredCourses.length > visibleCount && (
        <div className="pt-4 flex flex-col items-center gap-2">
          <button
            onClick={() => setVisibleCount((prev) => prev + 60)}
            className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:border-indigo-500 shadow-2xs transition-colors"
          >
            Load More Courses (+60)
          </button>
          <span className="text-[11px] font-mono text-slate-400">
            Showing {Math.min(visibleCount, filteredCourses.length)} of {filteredCourses.length} matching courses
          </span>
        </div>
      )}
    </div>
  );
};
