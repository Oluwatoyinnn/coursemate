/**
 * Course Mate - Class Notification and Audio Alarm Manager
 */
import { TimetableSession, UserProfile } from '../types';
import { getCampusNow, parseTimeToMinutes } from './scheduleLogic';
import { playAlarmChime, ChimeType } from './alarmAudio';

// Set of session keys already notified today: e.g. "2026-10-02_MTS101_09:00 AM"
const notifiedSessionsToday = new Set<string>();

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
}

export function checkAndNotifyUpcomingClass(
  sessions: TimetableSession[],
  profile: UserProfile
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
    const startMins = parseTimeToMinutes(session.startTime);
    const diff = startMins - currentMinutes;

    // Check if the class is within the reminder window (e.g. 1 to leadMinutes minutes ahead)
    if (diff > 0 && diff <= leadMinutes) {
      const datePrefix = campus.date instanceof Date ? campus.date.toISOString().split('T')[0] : 'today';
      const todayKey = `${datePrefix}_${session.courseCode}_${session.startTime}`;
      if (!notifiedSessionsToday.has(todayKey)) {
        notifiedSessionsToday.add(todayKey);

        // 1. Play audible alarm if user enabled it
        if (profile.alarmSoundEnabled) {
          playAlarmChime((profile.selectedChime as ChimeType) || 'default');
        }

        // 2. Fire system / PWA popup notification if enabled
        if (profile.notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            const title = `Course Mate • Next Class in ${diff}m!`;
            const body = `${session.courseCode} @ ${session.venue} starts at ${session.startTime}.${session.isPractical ? ' [Practical Session]' : ''}`;
            new Notification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/favicon.svg',
              tag: todayKey,
            });
          } catch (e) {
            console.warn('Notification trigger error:', e);
          }
        }
      }
    }
  }
}
