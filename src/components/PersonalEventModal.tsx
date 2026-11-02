import React, { useState } from 'react';
import { PersonalEvent, PersonalEventType, DayOfWeek, TimetableSession } from '../types';
import { ACADEMIC_DAYS, parseTimeToMinutes, formatMinutesToTime } from '../utils/scheduleLogic';
import { X, AlertTriangle, Clock, Calendar, Check } from 'lucide-react';

interface PersonalEventModalProps {
  initialDay?: DayOfWeek;
  initialStartTime?: string;
  existingEvent?: PersonalEvent;
  officialSessions: TimetableSession[];
  existingPersonalEvents: PersonalEvent[];
  onSave: (event: PersonalEvent) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const PersonalEventModal: React.FC<PersonalEventModalProps> = ({
  initialDay = 'Monday',
  initialStartTime = '10:00 AM',
  existingEvent,
  officialSessions,
  existingPersonalEvents,
  onSave,
  onDelete,
  onClose,
}) => {
  const [title, setTitle] = useState(existingEvent?.title || '');
  const [type, setType] = useState<PersonalEventType>(existingEvent?.type || 'Study');
  const [day, setDay] = useState<DayOfWeek>(existingEvent?.day || initialDay);
  const [startTime, setStartTime] = useState(existingEvent?.startTime || initialStartTime);
  const [endTime, setEndTime] = useState(
    existingEvent?.endTime || formatMinutesToTime(parseTimeToMinutes(initialStartTime) + 60)
  );
  const [location, setLocation] = useState(existingEvent?.location || '');
  const [notes, setNotes] = useState(existingEvent?.notes || '');

  // Calculate potential clashes dynamically
  const startMin = parseTimeToMinutes(startTime);
  const endMin = parseTimeToMinutes(endTime);

  const officialClashes = officialSessions.filter((s) => {
    if (s.day !== day) return false;
    const aS = parseTimeToMinutes(s.startTime);
    const aE = parseTimeToMinutes(s.endTime);
    return Math.max(aS, startMin) < Math.min(aE, endMin);
  });

  const personalClashes = existingPersonalEvents.filter((p) => {
    if (existingEvent && p.id === existingEvent.id) return false;
    if (p.day !== day) return false;
    const aS = parseTimeToMinutes(p.startTime);
    const aE = parseTimeToMinutes(p.endTime);
    return Math.max(aS, startMin) < Math.min(aE, endMin);
  });

  const hasClash = officialClashes.length > 0 || personalClashes.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const event: PersonalEvent = {
      id: existingEvent?.id || `pers-${Date.now()}`,
      title: title.trim(),
      type,
      day,
      startTime,
      endTime,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: existingEvent?.createdAt || Date.now(),
    };

    onSave(event);
    onClose();
  };

  const eventTypes: PersonalEventType[] = ['Study', 'Assignment', 'Meeting', 'Personal', 'Custom'];

  const timeOptions = [
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '08:00 PM'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/25 dark:bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Personal Schedule Event
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
              {existingEvent ? 'Edit Personal Event' : 'Add Personal Event'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., BCH 301 Revision or Departmental Meeting"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              autoFocus
            />
          </div>

          {/* Event Type selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {eventTypes.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    type === t
                      ? 'bg-amber-500 text-white font-semibold shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Day of Week */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Day
            </label>
            <select
              value={day}
              onChange={(e) => setDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {[...ACADEMIC_DAYS, 'Saturday', 'Sunday'].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              >
                {timeOptions.map((t) => (
                  <option key={`start-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
              >
                {timeOptions.map((t) => (
                  <option key={`end-${t}`} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clash Alert Warning */}
          {hasClash && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Schedule clash detected</span>
              </div>
              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                This time overlaps with:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {officialClashes.map((s) => (
                  <li key={s.id}>
                    <strong>Official Class:</strong> {s.courseCode} ({s.startTime} – {s.endTime} at {s.venue})
                  </li>
                ))}
                {personalClashes.map((p) => (
                  <li key={p.id}>
                    <strong>Personal Event:</strong> {p.title} ({p.startTime} – {p.endTime})
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-700/80 italic">
                You can still save this event if you intentionally plan to multitask or replace it.
              </p>
            </div>
          )}

          {/* Location / Venue */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Location / Venue (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nimbe Adedipe Library or Hostel"
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Chapters to cover, assignment requirements, or agenda..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {existingEvent && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(existingEvent.id);
                  onClose();
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium"
              >
                Delete Event
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Event</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
