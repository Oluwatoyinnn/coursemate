import React, { useState } from 'react';
import { X, Calculator, Plus, Trash2, Award, Sparkles, CheckCircle2 } from 'lucide-react';
import { TimetableSession } from '../types';

interface CGPAEstimatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessions?: TimetableSession[];
}

interface CourseGradeItem {
  id: string;
  code: string;
  units: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
}

const GRADE_POINTS: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  E: 1,
  F: 0,
};

export const CGPAEstimatorModal: React.FC<CGPAEstimatorModalProps> = ({
  isOpen,
  onClose,
  activeSessions = [],
}) => {
  // Pre-populate with user's enrolled unique courses if available
  const initialCourses: CourseGradeItem[] = React.useMemo(() => {
    const uniqueCodes = Array.from(new Set(activeSessions.map((s) => s.courseCode)));
    if (uniqueCodes.length > 0) {
      return uniqueCodes.slice(0, 8).map((code, idx) => ({
        id: `course-${idx}-${code}`,
        code,
        units: code.includes('101') || code.includes('102') ? 3 : 2,
        grade: 'A',
      }));
    }
    return [
      { id: '1', code: 'CHM 101', units: 3, grade: 'A' },
      { id: '2', code: 'MTS 101', units: 3, grade: 'A' },
      { id: '3', code: 'PHS 101', units: 3, grade: 'B' },
      { id: '4', code: 'BIO 101', units: 3, grade: 'A' },
      { id: '5', code: 'GNS 101', units: 2, grade: 'A' },
    ];
  }, [activeSessions]);

  const [courses, setCourses] = useState<CourseGradeItem[]>(initialCourses);
  const [newCode, setNewCode] = useState('');
  const [newUnits, setNewUnits] = useState(2);

  if (!isOpen) return null;

  const totalUnits = courses.reduce((sum, c) => sum + c.units, 0);
  const totalWeightedPoints = courses.reduce(
    (sum, c) => sum + c.units * (GRADE_POINTS[c.grade] ?? 0),
    0
  );
  const calculatedGPA = totalUnits > 0 ? (totalWeightedPoints / totalUnits).toFixed(2) : '0.00';
  const gpaNum = parseFloat(calculatedGPA);

  let honorsClass = 'Pass / In Progress';
  let honorsBadgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  if (gpaNum >= 4.5) {
    honorsClass = 'First Class Honors';
    honorsBadgeColor = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
  } else if (gpaNum >= 3.5) {
    honorsClass = 'Second Class Upper (2:1)';
    honorsBadgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800';
  } else if (gpaNum >= 2.4) {
    honorsClass = 'Second Class Lower (2:2)';
    honorsBadgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
  } else if (gpaNum >= 1.5) {
    honorsClass = 'Third Class';
    honorsBadgeColor = 'bg-orange-100 text-orange-800 dark:bg-orange-950/70 dark:text-orange-300';
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;
    setCourses((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        code: newCode.trim().toUpperCase(),
        units: Number(newUnits) || 2,
        grade: 'A',
      },
    ]);
    setNewCode('');
    setNewUnits(2);
  };

  const handleUpdateGrade = (id: string, grade: CourseGradeItem['grade']) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, grade } : c)));
  };

  const handleUpdateUnits = (id: string, units: number) => {
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, units: Math.max(1, units) } : c)));
  };

  const handleRemoveCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/25 dark:bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                5-Point CGPA Goal Estimator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official FUNAAB 5.0 Grading Standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GPA Summary Hero Card */}
        <div className="p-5 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-900/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Projected Semester GPA
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                {calculatedGPA}
              </span>
              <span className="text-xs font-mono text-slate-400">/ 5.00</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${honorsBadgeColor}`}>
                {honorsClass}
              </span>
            </div>
          </div>

          <div className="text-right space-y-1">
            <div className="text-xs text-slate-500">
              Total Units: <strong className="text-slate-900 dark:text-white font-mono">{totalUnits}</strong>
            </div>
            <div className="text-xs text-slate-500">
              Total Points: <strong className="text-slate-900 dark:text-white font-mono">{totalWeightedPoints}</strong>
            </div>
          </div>
        </div>

        {/* Scrollable Course List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          <div className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className="p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                    {course.code}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500">Units:</span>
                    <select
                      value={course.units}
                      onChange={(e) => handleUpdateUnits(course.id, Number(e.target.value))}
                      className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white"
                    >
                      {[1, 2, 3, 4, 5, 6].map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grade Selector */}
                <div className="flex items-center gap-1">
                  {(['A', 'B', 'C', 'D', 'E', 'F'] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => handleUpdateGrade(course.id, g)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-bold font-mono text-xs transition-all ${
                        course.grade === g
                          ? 'bg-indigo-600 text-white shadow-xs scale-105'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleRemoveCourse(course.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors ml-1"
                  title="Remove course"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Course Row */}
          <form onSubmit={handleAddCourse} className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="e.g. MTS 201"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono uppercase focus:outline-hidden focus:border-indigo-500 text-slate-900 dark:text-white"
            />
            <select
              value={newUnits}
              onChange={(e) => setNewUnits(Number(e.target.value))}
              className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5, 6].map((u) => (
                <option key={u} value={u}>
                  {u} Unit{u > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs inline-flex items-center gap-1 shrink-0 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Calculations computed 100% offline</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
