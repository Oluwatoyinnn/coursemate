import type { TimetableSession } from '../types';

/**
 * Department-specific corrections to the official timetable.
 *
 * These apply ONLY to the department and level named here, and only change how that
 * department's students see their classes. The official dataset itself is never edited,
 * so every other department keeps exactly what TIMTEC published.
 */

interface DepartmentOverride {
  /** Fixes keyed by official session id */
  patches: Record<string, Partial<Pick<TimetableSession, 'day' | 'startTime' | 'endTime' | 'venue'>>>;
  /** Group (stream) a student of this department is on unless they pick another allowed one */
  defaultGroups: Record<string, string>;
  /** Groups that really exist for this department (others are dropped) */
  allowedGroups: Record<string, string[]>;
  /** Every class for this department is physical */
  allPhysical: boolean;
}

const OVERRIDES: Record<string, DepartmentOverride> = {
  // Cyber Security, 100 level
  'CYB:100': {
    patches: {
      // Monday: STA 111 / STS 101 holds in CAD (COLANIM Auditorium)
      'funaab-tt-1124': { venue: 'CAD' },
      // Tuesday: MTS 101 is in the 1000 capacity lecture theatre, in person
      'funaab-tt-356': { venue: '1000 CAP LT' },
      // Tuesday: CYB 113 holds in the Software Engineering Lab, 11 AM to 1 PM
      'funaab-tt-146': { venue: 'SOFTWARE ENGINEERING LAB', startTime: '11:00 AM', endTime: '01:00 PM' },
    },
    // GST 111 for Cyber Security is the Friday class in ANE I (group F). Every other group is not theirs.
    defaultGroups: { 'MTS 101': 'A', 'GST 111': 'F' },
    allowedGroups: { 'GST 111': ['F'] },
    allPhysical: true,
  },
};

const keyOf = (dept?: string, level?: string) => `${(dept || '').toUpperCase()}:${level || ''}`;

export function hasDepartmentOverride(dept?: string, level?: string): boolean {
  return !!OVERRIDES[keyOf(dept, level)];
}

/** The official sessions with this department's corrections applied (same list for everyone else). */
export function applyDepartmentOverrides(
  sessions: TimetableSession[],
  dept?: string,
  level?: string
): TimetableSession[] {
  const o = OVERRIDES[keyOf(dept, level)];
  if (!o) return sessions;
  return sessions.map((s) => {
    const patch = o.patches[s.id];
    const needsPhysical = o.allPhysical && (s.isVirtual || /\/\s*VIRTUAL/i.test(s.venue));
    if (!patch && !needsPhysical) return s;
    const next: TimetableSession = { ...s, ...(patch || {}) };
    if (needsPhysical) {
      next.isVirtual = false;
      next.venue = next.venue.replace(/\s*\/\s*VIRTUAL/gi, '').trim();
    }
    return next;
  });
}

/** Stream choices with this department's defaults filled in and impossible choices replaced. */
export function normalizeStreamPreferences(
  prefs: Record<string, string> | undefined,
  dept?: string,
  level?: string
): Record<string, string> | undefined {
  const o = OVERRIDES[keyOf(dept, level)];
  if (!o) return prefs;
  const out: Record<string, string> = { ...(prefs || {}) };
  for (const [course, group] of Object.entries(o.defaultGroups)) {
    const allowed = o.allowedGroups[course];
    if (!out[course] || (allowed && !allowed.includes(out[course]))) out[course] = group;
  }
  return out;
}
