import { TIMETABLE_SESSIONS, OFFICIAL_VENUES } from '../data/timetable';
import { parseTimeToMinutes } from './scheduleLogic';

/**
 * Campus-wide venue availability.
 * Looks at EVERY timetabled session (all levels, all departments) and works out
 * which venues have no lecture/practical in a chosen day + time window.
 * It only knows about the TIMTEC lecture timetable (not exams or special events).
 */

export type VenueKind = 'room' | 'lab' | 'outdoor';

export interface CampusVenue {
  name: string;
  building: string;
  capacity?: number;
  kind: VenueKind;
}

export interface FreeVenue {
  venue: CampusVenue;
  /** Minutes-from-midnight when the venue is next booked, or null if free for the rest of the day. */
  freeUntil: number | null;
}

// Spelling / format variants used in the printed timetable -> one canonical name.
const ALIASES: Record<string, string> = {
  'CENT AUD': 'CENTS AUD',
  'ENG AUD': 'ENGR AUD',
  'MAMHOOD': 'MAHMOOD',
  'JAO I': 'JAO 1',
  'AGRIC LAB I': 'AGRIC LAB 1',
  'AGRIC LAB II': 'AGRIC LAB 2',
  'GLR 1': 'GLR I',
  'GLR 2': 'GLR II',
  'GLR 3': 'GLR III',
  'GLR LR 2': 'GLY LR 2',
  'COLENDS LR I': 'COLENDS LR 1',
  'COLENDS LR II': 'COLENDS LR 2',
  '1000CAP LT': '1000 CAP LT',
  'ACC 400 LR': 'ACCT 400 LR',
  'PHS LABS': 'PHS LAB',
  'CHM LABS': 'CHM LAB',
  'BIO LABS': 'BIO LAB',
};

function canonical(raw: string): string {
  let t = raw.toUpperCase().replace(/\s+/g, ' ').trim();
  t = t.replace(/^\(P\)\s*/, '').replace(/^\d+\s*\([A-Z]\)\s*/, ''); // stray "(P)" / "105 (C)" from the printed table
  t = t.replace(/\s*-\s*/g, '-'); // "ACAD C4 -C6" -> "ACAD C4-C6"
  t = t.replace(/\bCI-C3\b/, 'C1-C3').replace(/COMPLAB/, 'COMP LAB');
  t = t.replace(/4OO/g, '400');
  t = t.replace(/^([A-Z]{1,6})(\d{2,3})$/, '$1 $2'); // A101 -> A 101
  t = t.replace(/\b(\d{3})LR\b/, '$1 LR'); // 400LR -> 400 LR
  t = t.replace(/\bLR(\d)\b/, 'LR $1'); // LR1 -> LR 1
  t = t.replace(/\b1000CAP\b/, '1000 CAP');
  return ALIASES[t] ?? t;
}

/** "ELBOG I/ELBOG II/VIRTUAL" -> ["ELBOG I", "ELBOG II"]; virtual is not a room. */
export function splitVenues(raw: string): string[] {
  let s = (raw || '').toUpperCase();
  s = s.replace(/MP ?03\s*\/\s*0?4/g, 'MP 03_04'); // keep the real name that contains a slash
  s = s.replace(/AGRIC LABS?\s*I\s*[,&]?\s*(AND)?\s*II/g, 'AGRIC LAB 1|AGRIC LAB 2');
  return s
    .split(/[\/,|&]/)
    .map((p) => canonical(p.replace('MP 03_04', 'MP 03/04')))
    .filter((p) => p && p !== 'VIRTUAL');
}

function kindFor(name: string, officialType?: string): VenueKind {
  if (/FARM|FIELD|SPORTS/.test(name)) return 'outdoor';
  if (/LAB|STUDIO|DRAFTING|BIO-M|^VTH$/.test(name)) return 'lab';
  if (officialType && /Laborator|Clinical|Sports/i.test(officialType)) return officialType.match(/Sports/i) ? 'outdoor' : 'lab';
  return 'room';
}

interface Index {
  venues: Map<string, CampusVenue>;
  busy: Map<string, Map<string, Array<[number, number]>>>; // venue -> day -> intervals
}

let cache: Index | null = null;

function build(): Index {
  const venues = new Map<string, CampusVenue>();
  const busy: Index['busy'] = new Map();

  for (const v of OFFICIAL_VENUES) {
    const name = canonical(v.name);
    if (venues.has(name)) continue;
    venues.set(name, { name, building: v.building, capacity: v.capacity, kind: kindFor(name, v.type) });
  }

  for (const s of TIMETABLE_SESSIONS) {
    const start = parseTimeToMinutes(s.startTime);
    const end = parseTimeToMinutes(s.endTime);
    if (!end || end <= start) continue;
    for (const name of splitVenues(s.venue)) {
      if (!venues.has(name)) {
        venues.set(name, { name, building: 'Department / other venue', kind: kindFor(name) });
      }
      let byDay = busy.get(name);
      if (!byDay) busy.set(name, (byDay = new Map()));
      const list = byDay.get(s.day) ?? [];
      list.push([start, end]);
      byDay.set(s.day, list);
    }
  }
  return (cache = { venues, busy });
}

export function getCampusVenues(): CampusVenue[] {
  return Array.from((cache ?? build()).venues.values());
}

/** Venues with no timetabled class overlapping [startMin, endMin) on the given day. */
export function findFreeVenues(day: string, startMin: number, endMin: number): FreeVenue[] {
  const idx = cache ?? build();
  const out: FreeVenue[] = [];
  for (const venue of idx.venues.values()) {
    if (venue.kind === 'outdoor') continue;
    const slots = idx.busy.get(venue.name)?.get(day) ?? [];
    const clash = slots.some(([s, e]) => s < endMin && e > startMin);
    if (clash) continue;
    const upcoming = slots.filter(([s]) => s >= endMin).map(([s]) => s);
    out.push({ venue, freeUntil: upcoming.length ? Math.min(...upcoming) : null });
  }
  return out;
}
