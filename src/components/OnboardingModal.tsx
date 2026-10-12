import React, { useState, useEffect } from 'react';
import { UserProfile, TimetableViewMode, TimetableDay } from '../types';
import { VERIFIED_COLLEGES, TIMETABLE_SESSIONS, VERIFIED_COURSE_TITLES } from '../data/timetable';
import { getDepartmentSuggestedCourses, ACADEMIC_DAYS } from '../utils/scheduleLogic';
import { BrandLogo } from './BrandLogo';
import { ArrowRight, Check, Sparkles, BookOpen, Plus, X, Calendar } from 'lucide-react';

interface OnboardingModalProps {
  initialProfile: UserProfile;
  onComplete: (updated: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  initialProfile,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState(initialProfile.preferredName || '');
  const [collegeId, setCollegeId] = useState(initialProfile.collegeId || VERIFIED_COLLEGES[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(initialProfile.departmentId || '');
  const [level, setLevel] = useState(initialProfile.level || '100');
  const [selectedCourses, setSelectedCourses] = useState<string[]>(initialProfile.selectedCourseCodes || []);
  const [practicalDay, setPracticalDay] = useState<TimetableDay>('Tuesday');
  const [extraCourseInput, setExtraCourseInput] = useState('');
  const [view, setView] = useState<TimetableViewMode>(initialProfile.preferredView || 'daily');

  const selectedCollege = VERIFIED_COLLEGES.find((c) => c.id === collegeId) || VERIFIED_COLLEGES[0];
  const departments = selectedCollege ? selectedCollege.departments : [];
  const currentDeptCode = departmentId || (departments[0]?.code ?? 'CSC');

  // When department or level changes, update recommended courses automatically
  useEffect(() => {
    if (currentDeptCode) {
      const suggested = getDepartmentSuggestedCourses(currentDeptCode, level, TIMETABLE_SESSIONS);
      if (suggested.length > 0) {
        setSelectedCourses(suggested);
      }
    }
  }, [currentDeptCode, level]);

  const toggleCourse = (code: string) => {
    if (selectedCourses.includes(code)) {
      setSelectedCourses(selectedCourses.filter((c) => c !== code));
    } else {
      setSelectedCourses([...selectedCourses, code]);
    }
  };

  const handleAddExtraCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = extraCourseInput.trim().toUpperCase();
    if (!clean) return;
    if (!selectedCourses.includes(clean)) {
      setSelectedCourses([...selectedCourses, clean]);
    }
    setExtraCourseInput('');
  };

  const handleNext = () => {
    if (step < 6) {
      if (step === 4 && selectedCourses.length === 0) {
        // Auto-seed courses for Step 5
        const suggested = getDepartmentSuggestedCourses(currentDeptCode, level, TIMETABLE_SESSIONS);
        setSelectedCourses(suggested);
      }
      setStep(step + 1);
    } else {
      // Complete
      const practicalMap: Record<string, TimetableDay> = {};
      if (level === '100') {
        practicalMap['PHS 191'] = practicalDay;
        practicalMap['CHM 191'] = practicalDay;
        practicalMap['BIO 107'] = practicalDay;
        practicalMap['PCP 191'] = practicalDay;
      }

      const cleanName = name
        .replace(/^[-_—\s]+/, '')
        .replace(/[-_—\s]+$/, '')
        .trim();

      let finalCourses = selectedCourses;
      if (finalCourses.length === 0 || (finalCourses.length === 1 && finalCourses[0].startsWith(currentDeptCode))) {
        finalCourses = getDepartmentSuggestedCourses(currentDeptCode, level, TIMETABLE_SESSIONS);
      }

      onComplete({
        ...initialProfile,
        preferredName: cleanName,
        collegeId: selectedCollege?.id || '',
        departmentId: currentDeptCode,
        level,
        selectedCourseCodes: finalCourses,
        practicalDayPreferences: practicalMap,
        preferredView: view,
        onboardingCompleted: true,
      });
    }
  };

  const handleSkipName = () => {
    setName('');
    setStep(2);
  };

  const viewOptions: { id: TimetableViewMode; title: string; desc: string }[] = [
    {
      id: 'daily',
      title: 'Daily View',
      desc: 'Focus on today and one day at a time with full details.',
    },
    {
      id: 'weekly',
      title: 'Weekly View',
      desc: 'Monday to Friday bird’s-eye view of your entire academic week.',
    },
    {
      id: 'agenda',
      title: 'Agenda View',
      desc: 'Clean, chronological stream of all your upcoming sessions.',
    },
    {
      id: 'compact',
      title: 'Compact View',
      desc: 'High-density tabular summary for maximum overview speed.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-slate-950/70 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-3.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <BrandLogo size="sm" showTagline={false} />
          <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 font-mono">
            <span>Step {step} of 6</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div
            className="bg-indigo-600 h-1 transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 scrollbar-thin">
          {/* STEP 1: Name */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Welcome to Course Mate
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  What should we call you?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Optional. We use this to greet you calmly and personalize your timetable.
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Preferred First Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tobi"
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleNext();
                  }}
                />
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Stored entirely on your device. Zero login friction—no email or password.
              </p>
            </div>
          )}

          {/* STEP 2: College */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Academic Profile
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Select your College
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Includes COLCOMPS and all faculties verified for First Semester 2026/2027.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {VERIFIED_COLLEGES.map((col) => {
                  const isSelected = col.id === collegeId;
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        setCollegeId(col.id);
                        if (col.departments.length > 0) {
                          setDepartmentId(col.departments[0].code);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {col.id}
                        </div>
                        <div className="text-xs font-medium">{col.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Department */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {selectedCollege.id}
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Select your Department
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Showing verified department mappings for {selectedCollege.name}.
                </p>
              </div>

              <div className="space-y-2 pt-1 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                {departments.map((dept) => {
                  const isSelected = (departmentId || departments[0]?.code) === dept.code;
                  return (
                    <button
                      key={dept.id}
                      onClick={() => setDepartmentId(dept.code)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400">
                          {dept.code}
                        </div>
                        <div className="text-xs font-medium">{dept.name}</div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Level */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Academic Level
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  What is your Level?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Filters official classes and practicals relevant to your academic year.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                {['100', '200', '300', '400', '500', '600'].map((lvl) => {
                  const isSelected = level === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => setLevel(lvl)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold'
                      }`}
                    >
                      <div className="text-base">{lvl} Level</div>
                      <div className="text-[11px] opacity-80 font-normal">
                        {lvl === '100' ? 'Freshman' : lvl === '500' || lvl === '600' ? 'Finalist' : `Year ${lvl[0]}`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Course Basket / Registration (Eliminates 64 classes on Monday!) */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Course Enrollment
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Confirm your registered courses
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pre-selected for <strong>{currentDeptCode} ({level}L)</strong>. Uncheck any course you are not offering or add carryovers.
                </p>
              </div>

              {/* 100L Lab day rotation picker */}
              {level === '100' && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Your 100L Lab Practical Day (11 AM – 2 PM)</span>
                  </div>
                  <p className="text-[11px] text-indigo-800/80 dark:text-indigo-300/80">
                    Which day is your department scheduled for Chemistry / Physics / Bio labs?
                  </p>
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {(['Monday', 'Tuesday', 'Wednesday', 'Thursday'] as TimetableDay[]).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setPracticalDay(d)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-colors ${
                          practicalDay === d
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200'
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Selection List */}
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                {selectedCourses.length === 0 ? (
                  <p className="text-xs text-slate-400 italic p-3 text-center">
                    No courses selected yet. Add your courses below.
                  </p>
                ) : (
                  selectedCourses.map((code) => {
                    const title = VERIFIED_COURSE_TITLES[code.toUpperCase()];
                    return (
                      <div
                        key={code}
                        onClick={() => toggleCourse(code)}
                        className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 flex items-center justify-between text-xs cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <span className="font-bold text-indigo-950 dark:text-indigo-200">
                            {code}
                          </span>
                          {title && (
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              {title}
                            </span>
                          )}
                        </div>
                        <span className="p-1 rounded-md bg-indigo-600 text-white shrink-0">
                          <Check className="w-3 h-3" />
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Extra / Carryover Course Form */}
              <form onSubmit={handleAddExtraCourse} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={extraCourseInput}
                  onChange={(e) => setExtraCourseInput(e.target.value)}
                  placeholder="Add carryover or elective (e.g. MTS 101, GNS 111)..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!extraCourseInput.trim()}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </form>

              <div className="text-[11px] text-slate-400 font-mono">
                {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'} selected for your timetable.
              </div>
            </div>
          )}

          {/* STEP 6: Timetable View Preference */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Display Preference
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  Choose your preferred view
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  You can change this anytime with one click in the navigation bar.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {viewOptions.map((opt) => {
                  const isSelected = view === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setView(opt.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold">{opt.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-center">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  {name ? `You're all set, ${name}!` : "You're all set."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
          {step === 1 ? (
            <button
              onClick={handleSkipName}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Skip name
            </button>
          ) : (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 transition-colors"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all active:scale-95"
          >
            <span>{step === 6 ? 'Open Timetable' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
