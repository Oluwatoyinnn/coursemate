/**
 * Course Mate - class reminders (system notification + chime + in-app banner)
 *
 * Reliability notes (this is why reminders used to be silent on phones):
 *  - Android Chrome refuses `new Notification()`. Notifications must go through the service worker.
 *  - Phones pause timers when the app is in the background, so we also check the moment the app
 *    comes back to the foreground.
 *  - Browsers keep audio blocked until the first tap, so the app "unlocks" sound on first touch.
 */
import { TimetableSession, UserProfile } from '../types';
import { getCampusNow, parseTimeToMinutes } from './scheduleLogic';
import { playAlarmChime, ChimeType } from './alarmAudio';

// Set of session keys already notified today: e.g. "2026-10-02_MTS101_09:00 AM"
const notifiedSessionsToday = new Set<string>();

const BASE = (import.meta.env.BASE_URL || './') as string;
const iconUrl = () => `${BASE}pwa-192x192.png`;
const badgeUrl = () => `${BASE}favicon.svg`;

export type NotificationSupport = 'ready' | 'denied' | 'default' | 'needs-install' | 'unsupported';

function isIOS(): boolean {
  return typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** What can this device do right now? Used to show plain-language help in Settings. */
export function getNotificationSupport(): NotificationSupport {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return isIOS() && !isStandalone() ? 'needs-install' : 'unsupported';
  }
  if (Notification.permission === 'granted') return 'ready';
  if (Notification.permission === 'denied') return 'denied';
  return 'default';
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

/** Show a system notification the way phones require (service worker first, constructor as fallback). */
export async function showSystemNotification(title: string, body: string, tag: string): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  const options: NotificationOptions & { vibrate?: number[]; renotify?: boolean } = {
    body,
    icon: iconUrl(),
    badge: badgeUrl(),
    tag,
    vibrate: [200, 100, 200],
  };
  try {
    if ('serviceWorker' in navigator) {
      const reg = (await navigator.serviceWorker.getRegistration()) || (await navigator.serviceWorker.ready);
      if (reg) {
        await reg.showNotification(title, options);
        return true;
      }
    }
  } catch (e) {
    console.warn('Service worker notification failed, trying fallback:', e);
  }
  try {
    new Notification(title, options);
    return true;
  } catch (e) {
    console.warn('Notification trigger error:', e);
    return false;
  }
}

export function checkAndNotifyUpcomingClass(
  sessions: TimetableSession[],
  profile: UserProfile,
  onInApp?: (message: string) => void
): void {
  if (!profile.notificationsEnabled && !profile.alarmSoundEnabled) {
    return;
  }

  const campus = getCampusNow();
  if (!campus.isAcademicDay) return;

  const currentMinutes = campus.hours * 60 + campus.minutes;
  const leadMinutes = profile.notificationLeadMinutes || 15;
  const todaySessions = sessions.filter((s) => s.day === campus.day);

  for (const session of todaySessions) {
    if (/^SPORTS/i.test(session.courseCode)) continue;
    const startMins = parseTimeToMinutes(session.startTime);
    const diff = startMins - currentMinutes;

    // Inside the reminder window (from `leadMinutes` before the class up to its start)
    if (diff >= 0 && diff <= leadMinutes) {
      const datePrefix = campus.date instanceof Date ? campus.date.toISOString().split('T')[0] : 'today';
      const todayKey = `${datePrefix}_${session.courseCode}_${session.startTime}`;
      if (notifiedSessionsToday.has(todayKey)) continue;
      notifiedSessionsToday.add(todayKey);

      const title = diff === 0 ? 'Course Mate • Class starting now' : `Course Mate • Next class in ${diff}m`;
      const body = `${session.courseCode} @ ${session.venue.replace('/VIRTUAL', '')} starts at ${session.startTime}.${session.isPractical ? ' [Practical]' : ''}`;

      // 1. Audible chime
      if (profile.alarmSoundEnabled) {
        playAlarmChime((profile.selectedChime as ChimeType) || 'default');
      }
      // 2. System notification
      if (profile.notificationsEnabled) {
        void showSystemNotification(title, body, todayKey);
      }
      // 3. In-app banner (always, so it still works if system notifications are blocked)
      onInApp?.(`${title.replace('Course Mate • ', '')}: ${body}`);
    }
  }
}
