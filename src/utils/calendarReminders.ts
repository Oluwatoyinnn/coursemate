/**
 * Course Mate - academic calendar reminders.
 *
 * Two ways to be reminded about registration, CATs, exams and other dates:
 *  1. In the app: a system notification + in-app banner, on the days and at the time the student picks.
 *  2. In the phone/computer calendar: a downloadable .ics file with the same alerts built in. Calendar
 *     apps ring even when Course Mate is closed, so this is the most reliable option.
 */
import { AcademicCalendarEvent, ACADEMIC_CALENDAR_2026_2027 } from '../data/academicCalendar';
import { UserProfile } from '../types';
import { getCampusNow } from './scheduleLogic';
import { playAlarmChime, ChimeType } from './alarmAudio';
import { showSystemNotification } from './notifications';

export const CALENDAR_LEAD_OPTIONS: { days: number; label: string }[] = [
  { days: 0, label: 'On the day' },
  { days: 1, label: '1 day before' },
  { days: 2, label: '2 days before' },
  { days: 7, label: '1 week before' },
];
export const DEFAULT_CALENDAR_LEAD_DAYS = [1];
export const DEFAULT_CALENDAR_TIME = '08:00';

const FIRED_KEY = 'course_mate_calendar_reminders_fired';

export interface CalendarReminderPrefs {
  leadDays: number[];
  time: string; // "HH:MM" (24h, Lagos time)
  importantOnly: boolean;
}

export function getCalendarPrefs(profile: Partial<UserProfile>): CalendarReminderPrefs {
  const days = (profile.calendarLeadDays && profile.calendarLeadDays.length > 0 ? profile.calendarLeadDays : DEFAULT_CALENDAR_LEAD_DAYS)
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 30);
  return {
    leadDays: days.length ? [...new Set(days)].sort((a, b) => b - a) : DEFAULT_CALENDAR_LEAD_DAYS,
    time: /^\d{2}:\d{2}$/.test(profile.calendarReminderTime || '') ? (profile.calendarReminderTime as string) : DEFAULT_CALENDAR_TIME,
    importantOnly: !!profile.calendarImportantOnly,
  };
}

const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map((n) => parseInt(n, 10));
  return (h || 0) * 60 + (m || 0);
};

/** Whole days from one "YYYY-MM-DD" to another (b minus a). Uses UTC so daylight saving can't skew it. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** Today's date in Lagos as "YYYY-MM-DD". */
export function campusTodayISO(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const m: Record<string, string> = {};
  for (const p of parts) m[p.type] = p.value;
  return `${m.year}-${m.month}-${m.day}`;
}

function readFired(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(FIRED_KEY) || '[]'));
  } catch {
    return new Set();
  }
}
function writeFired(set: Set<string>): void {
  try {
    // Keep it small: only the most recent entries matter
    localStorage.setItem(FIRED_KEY, JSON.stringify([...set].slice(-200)));
  } catch {
    /* storage blocked: reminders still work, they may repeat after a reload */
  }
}

export function describeLead(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === 7) return 'In 1 week';
  return `In ${days} days`;
}

export interface DueCalendarReminder {
  key: string;
  event: AcademicCalendarEvent;
  daysAhead: number;
}

/** Which reminders should fire right now (pure, so it can be tested without a browser). */
export function getDueCalendarReminders(
  events: AcademicCalendarEvent[],
  prefs: CalendarReminderPrefs,
  todayISO: string,
  nowMinutes: number,
  alreadyFired: Set<string>
): DueCalendarReminder[] {
  if (nowMinutes < timeToMinutes(prefs.time)) return [];
  const due: DueCalendarReminder[] = [];
  for (const event of events) {
    if (prefs.importantOnly && !event.isImportant) continue;
    const daysUntil = daysBetween(todayISO, event.isoDate);
    if (!prefs.leadDays.includes(daysUntil)) continue; // today is exactly one of the chosen lead days
    const key = `${event.id}|${daysUntil}|${event.isoDate}`;
    if (alreadyFired.has(key)) continue;
    due.push({ key, event, daysAhead: daysUntil });
  }
  return due;
}

/** Called by the app's reminder loop alongside the class reminders. */
export function checkAndNotifyCalendarEvents(profile: UserProfile, onInApp?: (message: string) => void): void {
  if (!profile.calendarRemindersEnabled) return;
  const campus = getCampusNow();
  const prefs = getCalendarPrefs(profile);
  const fired = readFired();
  const due = getDueCalendarReminders(
    ACADEMIC_CALENDAR_2026_2027,
    prefs,
    campusTodayISO(),
    campus.hours * 60 + campus.minutes,
    fired
  );
  if (due.length === 0) return;

  for (const d of due) {
    fired.add(d.key);
    const title = `Course Mate • ${describeLead(d.daysAhead)}`;
    const body = `${d.event.title} (${d.event.dateStr}).`;
    if (profile.alarmSoundEnabled) playAlarmChime((profile.selectedChime as ChimeType) || 'default');
    void showSystemNotification(title, body, `cal-${d.key}`);
    onInApp?.(`${describeLead(d.daysAhead)}: ${d.event.title}`);
  }
  writeFired(fired);
}

/** Send one example reminder so students can see what it looks like. */
export async function sendTestCalendarReminder(onInApp?: (message: string) => void): Promise<boolean> {
  const next = ACADEMIC_CALENDAR_2026_2027.filter((e) => daysBetween(campusTodayISO(), e.isoDate) >= 0)[0];
  const text = next ? `${next.title} (${next.dateStr})` : 'Your next academic date will appear here.';
  onInApp?.(`Test reminder: ${text}`);
  return showSystemNotification('Course Mate • Test calendar reminder', text, 'cm-cal-test');
}

// --------------------------------------------------------------------------
// Phone / computer calendar export (.ics), with the student's chosen alerts built in
// --------------------------------------------------------------------------

const icsEscape = (v: string) => v.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
const icsDate = (iso: string) => iso.replace(/-/g, '');
const nextDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + 1));
  return `${dt.getUTCFullYear()}${String(dt.getUTCMonth() + 1).padStart(2, '0')}${String(dt.getUTCDate()).padStart(2, '0')}`;
};

/**
 * An all-day event starts at midnight, so "N days before at HH:MM" is
 * (N days minus HH:MM) before midnight. If that is zero or negative the alert comes after midnight on the day.
 */
export function alarmTrigger(daysBefore: number, time: string): string {
  const minutes = daysBefore * 1440 - timeToMinutes(time);
  return minutes > 0 ? `-PT${minutes}M` : `PT${Math.abs(minutes)}M`;
}

export function buildAcademicCalendarICS(events: AcademicCalendarEvent[], prefs: CalendarReminderPrefs): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Course Mate//FUNAAB Academic Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Course Mate - Academic Calendar 2026/2027',
    'X-WR-TIMEZONE:Africa/Lagos',
  ];
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  for (const e of events) {
    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${e.id}-${e.isoDate}@course-mate.app`);
    lines.push(`DTSTAMP:${stamp}`);
    lines.push(`DTSTART;VALUE=DATE:${icsDate(e.isoDate)}`);
    lines.push(`DTEND;VALUE=DATE:${nextDay(e.isoDate)}`);
    lines.push(`SUMMARY:${icsEscape(e.title)}`);
    lines.push(`DESCRIPTION:${icsEscape(e.description || 'FUNAAB 2026/2027 academic calendar')}`);
    lines.push('TRANSP:TRANSPARENT');
    for (const d of prefs.leadDays) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${icsEscape(`${describeLead(d)}: ${e.title}`)}`);
      lines.push(`TRIGGER:${alarmTrigger(d, prefs.time)}`);
      lines.push('END:VALARM');
    }
    lines.push('END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadTextFile(filename: string, content: string, mime = 'text/calendar;charset=utf-8'): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
