import React, { useMemo, useState } from 'react';
import { Pencil, Trash2, RotateCcw, Plus, X, Info, Clock, MapPin, AlertTriangle, BookOpen, Undo2 } from 'lucide-react';
import { TimetableDay, TimetableEdits, TimetableSession } from '../types';
import {
  ACADEMIC_DAYS,
  applyTimetableEdits,
  parseTimeToMinutes,
  to12hSession,
  to24hInput,
} from '../utils/scheduleLogic';
import { getCampusVenues } from '../utils/venueAvailability';

interface Props {
  /** The student's official classes (after their group choice), before any personal edits */
  baseSessions: TimetableSession[];
  edits?: TimetableEdits;
  level: string;
  onChange: (edits: TimetableEdits) => void;
  onOpenCourses: () => void;
  onClose: () => void;
}

const EMPTY: TimetableEdits = { hidden: [], edited: {}, custom: [] };

interface FormState {
  id?: string; // official session id being edited, or custom id
  isNew: boolean;
  isCustom: boolean;
  title: string;
  day: TimetableDay;
  start: string; // 24h
  end: string; // 24h
  venue: string;
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40';
const labelCls = 'text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 block';

export const TimetableEditorModal: React.FC<Props> = ({ baseSessions, edits, level, onChange, onOpenCourses, onClose }) => {
  const current: TimetableEdits = edits || EMPTY;
  const [day, setDay] = useState<TimetableDay>('Monday');
  const [form, setForm] = useState<FormState | null>(null);
  const [formError, setFormError] = useState('');
  const [undo, setUndo] = useState<{ label: string; revert: () => void } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const venueNames = useMemo(() => getCampusVenues().map((v) => v.name).sort(), []);

  const changeCount =
    current.hidden.length + Object.keys(current.edited).length + current.custom.length;

  // Everything the student currently sees, after their edits
  const finalSessions = useMemo(() => applyTimetableEdits(baseSessions, current), [baseSessions, current]);
  const hiddenSessions = baseSessions.filter((s) => current.hidden.includes(s.id));

  const daySessions = finalSessions
    .filter((s) => s.day === day && !/^SPORTS/i.test(s.courseCode))
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const dayCount = (d: TimetableDay) =>
    finalSessions.filter((s) => s.day === d && !/^SPORTS/i.test(s.courseCode)).length;

  const commit = (next: TimetableEdits, undoLabel?: string, prev?: TimetableEdits) => {
    onChange(next);
    if (undoLabel && prev) {
      setUndo({ label: undoLabel, revert: () => onChange(prev) });
      window.setTimeout(() => setUndo((u) => (u && u.label === undoLabel ? null : u)), 6000);
    }
  };

  const openEdit = (s: TimetableSession) => {
    setFormError('');
    setForm({
      id: s.id,
      isNew: false,
      isCustom: !!s.isCustom,
      title: s.courseCode,
      day: s.day,
      start: to24hInput(s.startTime),
      end: to24hInput(s.endTime),
      venue: s.venue,
    });
  };

  const openAdd = () => {
    setFormError('');
    setForm({ isNew: true, isCustom: true, title: '', day, start: '09:00', end: '11:00', venue: '' });
  };

  const clashWith = (f: FormState): string | null => {
    const s = parseTimeToMinutes(to12hSession(f.start));
    const e = parseTimeToMinutes(to12hSession(f.end));
    const other = finalSessions.find(
      (x) =>
        x.id !== f.id &&
        x.day === f.day &&
        !/^SPORTS/i.test(x.courseCode) &&
        parseTimeToMinutes(x.startTime) < e &&
        parseTimeToMinutes(x.endTime) > s
    );
    return other ? other.courseCode : null;
  };

  const saveForm = () => {
    if (!form) return;
    const startMin = parseTimeToMinutes(to12hSession(form.start));
    const endMin = parseTimeToMinutes(to12hSession(form.end));
    if (form.isCustom && !form.title.trim()) return setFormError('Give the class a name, for example "Study group".');
    if (endMin <= startMin) return setFormError('The end time must be after the start time.');

    const startTime = to12hSession(form.start);
    const endTime = to12hSession(form.end);
    const venue = form.venue.trim() || 'TBA';
    const prev = current;

    if (form.isCustom) {
      const session: TimetableSession = {
        id: form.id || `custom-${Date.now()}`,
        day: form.day,
        startTime,
        endTime,
        courseCode: form.title.trim(),
        venue,
        level,
        prefix: '',
        isPractical: false,
        isVirtual: false,
        academicYear: '2026/2027',
        semester: 'First',
        timetableVersion: 'custom',
        source: 'Added by you',
        verificationStatus: 'Added by you',
        isCustom: true,
      };
      const custom = form.id ? current.custom.map((c) => (c.id === form.id ? session : c)) : [...current.custom, session];
      commit({ ...current, custom });
    } else if (form.id) {
      commit({ ...current, edited: { ...current.edited, [form.id]: { day: form.day, startTime, endTime, venue } } });
    }
    if (form.day !== day) setDay(form.day);
    setForm(null);
    void prev;
  };

  const removeSession = (s: TimetableSession) => {
    const prev = current;
    if (s.isCustom) {
      commit({ ...current, custom: current.custom.filter((c) => c.id !== s.id) }, `Removed ${s.courseCode}`, prev);
    } else {
      const edited = { ...current.edited };
      delete edited[s.id];
      commit({ ...current, hidden: [...current.hidden, s.id], edited }, `Removed ${s.courseCode}`, prev);
    }
  };

  const restoreSession = (id: string) => commit({ ...current, hidden: current.hidden.filter((h) => h !== id) });

  const resetSession = (id: string) => {
    const edited = { ...current.edited };
    delete edited[id];
    commit({ ...current, edited });
  };

  const formClash = form ? clashWith(form) : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-2xl max-h-[94dvh] sm:max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">Edit my timetable</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Remove, adjust or add classes so this matches what your lecturers actually told you.
            </p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Close editor">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
            <Info className="w-3.5 h-3.5 mt-0.5 text-indigo-600 dark:text-indigo-300 shrink-0" />
            <span>
              Your changes are saved <strong>on this device only</strong>. The official TIMTEC timetable is never changed, and
              reminders, free time and sharing all use your edited version.
            </span>
          </div>

          {/* Day tabs */}
          <div className="grid grid-cols-5 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {ACADEMIC_DAYS.map((d) => (
              <button
                key={d}
                onClick={() => { setDay(d); setForm(null); }}
                className={`py-2 rounded-lg text-xs font-semibold flex flex-col items-center leading-tight transition-colors ${
                  day === d ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <span>{d.slice(0, 3)}</span>
                <span className="text-[10px] font-mono opacity-70">{dayCount(d)}</span>
              </button>
            ))}
          </div>

          {/* Classes for the day */}
          <div className="space-y-2.5">
            {daySessions.length === 0 && !form && (
              <p className="text-xs text-slate-400 italic text-center py-6">No classes on {day}. Add one below if you have a class that is not listed.</p>
            )}
            {daySessions.map((s) => {
              const editingThis = form && form.id === s.id;
              return (
                <div key={s.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm text-slate-900 dark:text-white break-words">{s.courseCode}</span>
                        {s.userEdited && <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300">Edited</span>}
                        {s.isCustom && <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300">Yours</span>}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{s.startTime} – {s.endTime}</span>
                        <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{s.venue}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {s.userEdited && (
                        <button onClick={() => resetSession(s.id)} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Reset to official" aria-label={`Reset ${s.courseCode} to official`}>
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit" aria-label={`Edit ${s.courseCode}`}>
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => removeSession(s)} className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" title="Remove" aria-label={`Remove ${s.courseCode}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {editingThis && form && renderForm()}
                </div>
              );
            })}

            {form && form.isNew && <div className="rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900 p-3.5">{renderForm()}</div>}

            {!form && (
              <button onClick={openAdd} className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-sm font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 inline-flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add my own class on {day}
              </button>
            )}
          </div>

          {/* Removed classes */}
          {hiddenSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Removed by you ({hiddenSessions.length})</h3>
              {hiddenSessions.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="min-w-0 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-300">{s.courseCode}</span>
                    <span className="text-slate-400 font-mono"> · {s.day.slice(0, 3)} {s.startTime}</span>
                  </div>
                  <button onClick={() => restoreSession(s.id)} className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40">
                    <Undo2 className="w-3.5 h-3.5" /> Restore
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={onOpenCourses} className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" /> Need an official course that is missing? Browse all courses
          </button>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {changeCount === 0 ? 'No changes yet' : `${changeCount} change${changeCount === 1 ? '' : 's'} saved`}
          </span>
          <div className="flex items-center gap-2">
            {changeCount > 0 && (
              <button
                onClick={() => {
                  if (!confirmReset) { setConfirmReset(true); window.setTimeout(() => setConfirmReset(false), 4000); return; }
                  onChange(EMPTY); setConfirmReset(false); setForm(null);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold border ${confirmReset ? 'bg-rose-600 text-white border-rose-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
              >
                {confirmReset ? 'Tap again to reset everything' : 'Reset all'}
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">Done</button>
          </div>
        </div>

        {/* Undo toast */}
        {undo && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-20 z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xl">
            <span>{undo.label}</span>
            <button onClick={() => { undo.revert(); setUndo(null); }} className="font-extrabold text-amber-300 dark:text-indigo-600">Undo</button>
          </div>
        )}
      </div>
    </div>
  );

  function renderForm() {
    if (!form) return null;
    return (
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {form.isCustom && (
          <label className="block">
            <span className={labelCls}>Class name</span>
            <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Study group, Make-up class" maxLength={40} />
          </label>
        )}
        <div className="grid grid-cols-3 gap-2">
          <label className="block">
            <span className={labelCls}>Day</span>
            <select className={inputCls} value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as TimetableDay })}>
              {ACADEMIC_DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="block">
            <span className={labelCls}>Starts</span>
            <input type="time" className={inputCls} value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
          </label>
          <label className="block">
            <span className={labelCls}>Ends</span>
            <input type="time" className={inputCls} value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
          </label>
        </div>
        <label className="block">
          <span className={labelCls}>Venue</span>
          <input className={inputCls} list="editor-venues" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Type or pick a venue" />
          <datalist id="editor-venues">{venueNames.map((v) => <option key={v} value={v} />)}</datalist>
        </label>
        {formClash && (
          <p className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg px-2.5 py-2">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> This overlaps with {formClash}. You can still save it.
          </p>
        )}
        {formError && <p className="text-[11px] font-semibold text-rose-600">{formError}</p>}
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setForm(null); setFormError(''); }} className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          <button onClick={saveForm} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold">{form.isNew ? 'Add class' : 'Save changes'}</button>
        </div>
      </div>
    );
  }
};
