import {
  DayOfWeek,
  TimetableDay,
  TimetableSession,
  PersonalEvent,
  FreeTimeGap,
  ScheduleClash,
  TimelineItem,
} from '../types';

export const ACADEMIC_DAYS: TimetableDay[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];

/**
 * Accurately gets the current Nigerian Campus Time (West Africa Time, WAT = UTC+1)
 * regardless of device timezone, VPN, or server location.
 */
export function getCampusNow(): {
  date: Date;
  day: DayOfWeek;
  hours: number;
  minutes: number;
  totalMinutes: number;
  timeStr: string;
  fullDateStr: string;
  isAcademicDay: boolean;
} {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Lagos',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const parts = formatter.formatToParts(now);
    const map: Record<string, string> = {};
    for (const p of parts) {
      map[p.type] = p.value;
    }

    const day = (map.weekday || 'Monday') as DayOfWeek;
    const hours = parseInt(map.hour || '0', 10);
    const minutes = parseInt(map.minute || '0', 10);
    const totalMinutes = hours * 60 + minutes;

    // 12-hour string
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr = `${displayHour}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    const fullDateStr = `${day}, ${map.day} ${map.month} ${map.year}`;
    const isAcademicDay = ACADEMIC_DAYS.includes(day as TimetableDay);

    return {
      date: now,
      day,
      hours,
      minutes,
      totalMinutes,
      timeStr,
      fullDateStr,
      isAcademicDay,
    };
  } catch {
    // Fallback to local system time if Intl fails
    const days: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const day = days[now.getDay()];
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    const timeStr = `${displayHour}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
    return {
      date: now,
      day,
      hours,
      minutes,
      totalMinutes,
      timeStr,
      fullDateStr: now.toDateString(),
      isAcademicDay: ACADEMIC_DAYS.includes(day as TimetableDay),
    };
  }
}

export function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return 0;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const norm = ((totalMinutes % 1440) + 1440) % 1440;
  let hours = Math.floor(norm / 60);
  const minutes = norm % 60;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  if (hours === 0) hours = 12;
  else if (hours > 12) hours -= 12;

  const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  return `${hours}:${mStr} ${ampm}`;
}

export function getCurrentDayOfWeek(): DayOfWeek {
  return getCampusNow().day;
}

export function formatRelativeMinutes(minutes: number): string {
  if (minutes <= 0) return 'Just now';
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hrs === 0) return `${rem}m`;
  if (rem === 0) return `${hrs}h`;
  return `${hrs}h ${rem}m`;
}

export interface NextClassState {
  status: 'now' | 'upcoming' | 'done_for_today' | 'no_classes_today';
  currentSession?: TimetableSession;
  nextSession?: TimetableSession;
  timeRemainingMinutes?: number;
  nextAcademicDay?: TimetableDay;
  firstSessionNextDay?: TimetableSession;
  todayRemainingCount?: number;
  dayOffset?: number;
}

const ALL_CALENDAR_DAYS: DayOfWeek[] = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function calculateNextClassState(
  allSessions: TimetableSession[]
): NextClassState {
  const campus = getCampusNow();
  const dayName = campus.day;
  const currentMinutes = campus.totalMinutes;

  const isAcademicDay = ACADEMIC_DAYS.includes(dayName as TimetableDay);
  const todayAcademicDay = isAcademicDay ? (dayName as TimetableDay) : null;

  // Filter today's sessions sorted strictly by start time
  const todaySessions = todayAcademicDay
    ? allSessions
        .filter((s) => s.day === todayAcademicDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime))
    : [];

  if (!todayAcademicDay || todaySessions.length === 0) {
    // Find next academic day with classes using true calendar sequence
    const nextDayInfo = findNextDayWithClasses(allSessions, dayName);
    return {
      status: 'no_classes_today',
      nextAcademicDay: nextDayInfo.day,
      firstSessionNextDay: nextDayInfo.firstSession,
      dayOffset: nextDayInfo.dayOffset,
    };
  }

  // 1. Check if currently inside a class right now
  for (let i = 0; i < todaySessions.length; i++) {
    const session = todaySessions[i];
    const start = parseTimeToMinutes(session.startTime);
    const end = parseTimeToMinutes(session.endTime);
    if (currentMinutes >= start && currentMinutes < end) {
      const remainingMinutes = Math.max(1, end - currentMinutes);
      const remainingToday = todaySessions.slice(i + 1);
      const nextSessionToday = remainingToday.length > 0 ? remainingToday[0] : undefined;
      const nextDayInfo = !nextSessionToday ? findNextDayWithClasses(allSessions, dayName) : {};

      return {
        status: 'now',
        currentSession: session,
        timeRemainingMinutes: remainingMinutes,
        nextSession: nextSessionToday,
        nextAcademicDay: nextDayInfo.day,
        firstSessionNextDay: nextDayInfo.firstSession,
        todayRemainingCount: remainingToday.length,
      };
    }
  }

  // 2. Check for upcoming class later today
  const upcomingToday = todaySessions.filter(
    (s) => parseTimeToMinutes(s.startTime) > currentMinutes
  );

  if (upcomingToday.length > 0) {
    const next = upcomingToday[0];
    const startsIn = Math.max(1, parseTimeToMinutes(next.startTime) - currentMinutes);
    return {
      status: 'upcoming',
      nextSession: next,
      timeRemainingMinutes: startsIn,
      todayRemainingCount: upcomingToday.length,
    };
  }

  // 3. If reached here: all scheduled classes for today have concluded
  const nextDayInfo = findNextDayWithClasses(allSessions, dayName);
  return {
    status: 'done_for_today',
    nextAcademicDay: nextDayInfo.day,
    firstSessionNextDay: nextDayInfo.firstSession,
    dayOffset: nextDayInfo.dayOffset,
  };
}

function findNextDayWithClasses(
  allSessions: TimetableSession[],
  currentDay: DayOfWeek
): { day?: TimetableDay; firstSession?: TimetableSession; dayOffset?: number } {
  const currentIdx = ALL_CALENDAR_DAYS.indexOf(currentDay);
  if (currentIdx === -1) return {};

  for (let offset = 1; offset <= 7; offset++) {
    const candidateDayName = ALL_CALENDAR_DAYS[(currentIdx + offset) % 7];
    if (ACADEMIC_DAYS.includes(candidateDayName as TimetableDay)) {
      const candidateAcademicDay = candidateDayName as TimetableDay;
      const dayClasses = allSessions
        .filter((s) => s.day === candidateAcademicDay)
        .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));
      if (dayClasses.length > 0) {
        return {
          day: candidateAcademicDay,
          firstSession: dayClasses[0],
          dayOffset: offset,
        };
      }
    }
  }
  return {};
}

export function calculateFreeTimeGaps(
  sessions: TimetableSession[],
  day: TimetableDay
): FreeTimeGap[] {
  const daySessions = sessions
    .filter((s) => s.day === day)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const gaps: FreeTimeGap[] = [];

  if (daySessions.length >= 2) {
    for (let i = 0; i < daySessions.length - 1; i++) {
      const curr = daySessions[i];
      const next = daySessions[i + 1];

      const currEnd = parseTimeToMinutes(curr.endTime);
      const nextStart = parseTimeToMinutes(next.startTime);

      if (nextStart - currEnd >= 20) {
        const duration = nextStart - currEnd;
        const hrs = Math.floor(duration / 60);
        const mins = duration % 60;
        const formatted = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;

        gaps.push({
          id: `gap-${day.toLowerCase()}-${currEnd}-${nextStart}`,
          day,
          startTime: formatMinutesToTime(currEnd),
          endTime: formatMinutesToTime(nextStart),
          durationMinutes: duration,
          formattedDuration: formatted,
          precedingItem: curr.courseCode,
          followingItem: next.courseCode,
        });
      }
    }
  }

  return gaps;
}

export function detectClashes(
  officialSessions: TimetableSession[],
  personalEvents: PersonalEvent[]
): ScheduleClash[] {
  const clashes: ScheduleClash[] = [];

  // 1. Official vs Official
  for (let i = 0; i < officialSessions.length; i++) {
    for (let j = i + 1; j < officialSessions.length; j++) {
      const a = officialSessions[i];
      const b = officialSessions[j];
      if (a.day !== b.day) continue;

      const aStart = parseTimeToMinutes(a.startTime);
      const aEnd = parseTimeToMinutes(a.endTime);
      const bStart = parseTimeToMinutes(b.startTime);
      const bEnd = parseTimeToMinutes(b.endTime);

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        clashes.push({
          id: `clash-off-off-${a.id}-${b.id}`,
          type: 'official-official',
          day: a.day,
          timeRange: `${formatMinutesToTime(Math.max(aStart, bStart))} – ${formatMinutesToTime(Math.min(aEnd, bEnd))}`,
          itemA: {
            title: a.courseCode,
            venue: a.venue,
            isPersonal: false,
            startTime: a.startTime,
            endTime: a.endTime,
          },
          itemB: {
            title: b.courseCode,
            venue: b.venue,
            isPersonal: false,
            startTime: b.startTime,
            endTime: b.endTime,
          },
        });
      }
    }
  }

  // 2. Official vs Personal
  for (const off of officialSessions) {
    for (const pers of personalEvents) {
      if (off.day !== pers.day) continue;

      const aStart = parseTimeToMinutes(off.startTime);
      const aEnd = parseTimeToMinutes(off.endTime);
      const bStart = parseTimeToMinutes(pers.startTime);
      const bEnd = parseTimeToMinutes(pers.endTime);

      if (Math.max(aStart, bStart) < Math.min(aEnd, bEnd)) {
        clashes.push({
          id: `clash-off-pers-${off.id}-${pers.id}`,
          type: 'official-personal',
          day: off.day,
          timeRange: `${formatMinutesToTime(Math.max(aStart, bStart))} – ${formatMinutesToTime(Math.min(aEnd, bEnd))}`,
          itemA: {
            title: off.courseCode,
            venue: off.venue,
            isPersonal: false,
            startTime: off.startTime,
            endTime: off.endTime,
          },
          itemB: {
            title: pers.title,
            venue: pers.location,
            isPersonal: true,
            startTime: pers.startTime,
            endTime: pers.endTime,
          },
        });
      }
    }
  }

  return clashes;
}

export function buildDayTimeline(
  sessions: TimetableSession[],
  personalEvents: PersonalEvent[],
  day: TimetableDay
): TimelineItem[] {
  const daySessions = sessions.filter((s) => s.day === day);
  const dayPersonal = personalEvents.filter((e) => e.day === day);

  const items: TimelineItem[] = [];

  // Add official sessions
  for (const s of daySessions) {
    items.push({
      kind: 'session',
      id: s.id,
      session: s,
      startMinutes: parseTimeToMinutes(s.startTime),
      endMinutes: parseTimeToMinutes(s.endTime),
    });
  }

  // Add personal events
  for (const p of dayPersonal) {
    items.push({
      kind: 'personal',
      id: p.id,
      event: p,
      startMinutes: parseTimeToMinutes(p.startTime),
      endMinutes: parseTimeToMinutes(p.endTime),
    });
  }

  // Special FUNAAB Wednesday Sports window (2:00 PM – 4:00 PM / 6:00 PM)
  if (day === 'Wednesday') {
    items.push({
      kind: 'sports',
      id: 'sports-wednesday-funaab',
      title: 'Official University Sports & Games Period',
      startTime: '02:00 PM',
      endTime: '04:00 PM',
      startMinutes: parseTimeToMinutes('02:00 PM'),
      endMinutes: parseTimeToMinutes('04:00 PM'),
    });
  }

  // Sort chronologically
  items.sort((a, b) => a.startMinutes - b.startMinutes);

  // Compute gaps between successive items
  const finalTimeline: TimelineItem[] = [];
  for (let i = 0; i < items.length; i++) {
    finalTimeline.push(items[i]);

    if (i < items.length - 1) {
      const currentEnd = items[i].endMinutes;
      const nextStart = items[i + 1].startMinutes;

      if (nextStart - currentEnd >= 20) {
        const duration = nextStart - currentEnd;
        const hrs = Math.floor(duration / 60);
        const mins = duration % 60;
        const formatted = hrs > 0 ? (mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`) : `${mins}m`;

        finalTimeline.push({
          kind: 'free',
          id: `free-${day.toLowerCase()}-${currentEnd}-${nextStart}`,
          gap: {
            id: `gap-${day.toLowerCase()}-${currentEnd}-${nextStart}`,
            day,
            startTime: formatMinutesToTime(currentEnd),
            endTime: formatMinutesToTime(nextStart),
            durationMinutes: duration,
            formattedDuration: formatted,
          },
          startMinutes: currentEnd,
          endMinutes: nextStart,
        });
      }
    }
  }

  return finalTimeline;
}

/**
 * Normalizes course code to its fundamental root code (e.g. "MTS 101 (A)" -> "MTS 101", "BIO 101[B]" -> "BIO 101")
 */
export function getRootCourseCode(code: string): string {
  if (!code) return '';
  return code
    .replace(/\s*\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}\s*(?:AM|PM)?/gi, '')
    .replace(/\s*\([A-Za-z0-9,\s\.\-]+\)$/, '')
    .replace(/\s*\[[A-Za-z0-9,\s\.\-]+\]$/, '')
    .trim();
}

/**
 * Checks whether a session matches a target course code (handling streams, slash courses, etc.)
 */
export function isSessionMatchingCourse(sessionCourseCode: string, targetCourseCode: string): boolean {
  if (!sessionCourseCode || !targetCourseCode) return false;
  const s = sessionCourseCode.trim().toUpperCase();
  const t = targetCourseCode.trim().toUpperCase();

  if (s === t) return true;

  const rootS = getRootCourseCode(s);
  const rootT = getRootCourseCode(t);
  if (rootS === rootT || rootS === t || s === rootT) return true;

  // Stream indicators
  if (s.startsWith(t + ' ') || s.startsWith(t + '(') || s.startsWith(t + '[')) {
    return true;
  }

  // Combined slash courses e.g. "CVE 201/GET 101"
  if (s.includes('/')) {
    const parts = s.split('/').map((p) => p.trim());
    if (parts.some((p) => p === t || getRootCourseCode(p) === rootT || p.startsWith(t + ' '))) {
      return true;
    }
  }

  return false;
}

export function matchCourseSearch(courseCode: string, query: string, title?: string): boolean {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const qClean = q.replace(/[^a-z0-9]/g, '');
  const cClean = courseCode.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (title && title.toLowerCase().includes(q)) {
    return true;
  }

  // Handle slash courses like "CVE 201/GET 101"
  if (courseCode.includes('/')) {
    const parts = courseCode.split('/');
    for (const part of parts) {
      const pClean = part.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (pClean.includes(qClean) || qClean.includes(pClean)) {
        return true;
      }
    }
  }

  return cClean.includes(qClean) || courseCode.toLowerCase().includes(q);
}

export function matchVenueSearch(venueName: string, query: string): boolean {
  if (!query) return true;
  const cleanedQuery = query
    .toLowerCase()
    .replace(/where\s+is\s+/gi, '')
    .replace(/[^a-z0-9]/g, '');
  const cleanedVenue = venueName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return cleanedVenue.includes(cleanedQuery) || venueName.toLowerCase().includes(query.toLowerCase());
}

/**
 * Finds all departmental and cross-cutting core courses from the master timetable
 * based on the student's department code and level.
 * Honors shared computing curricula (CYB/CSC/SEN/IFT/INS/DTS) and university general courses.
 */
export function getDepartmentSuggestedCourses(
  deptCode: string,
  level: string,
  allSessions: TimetableSession[]
): string[] {
  const codeClean = (deptCode || '').toUpperCase().trim();
  const lvl = level || '100';

  const matches = new Set<string>();

  // 1. Direct Department prefix matching
  for (const s of allSessions) {
    if (s.level === lvl && s.courseCode.toUpperCase().startsWith(codeClean)) {
      matches.add(getRootCourseCode(s.courseCode));
    }
  }

  // 2. Computing Faculty shared curricula (COLCOMPS: CYB, CSC, SEN, IFT, INS, DTS)
  const isComputing = ['CSC', 'CYB', 'SEN', 'IFT', 'INS', 'DTS'].includes(codeClean);
  if (isComputing) {
    if (lvl === '100') {
      const comp100 = ['CSC 101', 'SEN 101', 'CYB 113', 'ICT 107', 'MTS 101', 'MTS 105', 'PHS 101', 'PHY 101', 'CHM 101', 'BIO 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (comp100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      const comp200 = ['CSC 201', 'CSC 203', 'CSC 205', 'CSC 215', 'CSC 217', 'CSC 225', 'CYB 201', 'CYB 203', 'CYB 205', 'SEN 201', 'SEN 203', 'SEN 221', 'MTS 201', 'GNS 201'];
      for (const s of allSessions) {
        if (comp200.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '300') {
      const comp300 = ['CYB 306', 'CYB 311', 'CSC 301', 'CSC 305', 'CSC 307', 'CSC 311', 'CSC 337', 'CSC 339', 'DTS 301', 'SEN 301', 'SEN 304', 'SEN 305'];
      for (const s of allSessions) {
        if (comp300.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '400') {
      const comp400 = ['CSC 401', 'CSC 403', 'CSC 405', 'CSC 407', 'CSC 431', 'CSC 435', 'CSC 439', 'CSC 443', 'CSC 445', 'CSC 447'];
      for (const s of allSessions) {
        if (comp400.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    }
  }

  // 3. Physical Sciences (COLPHYS: CHM, ICH, MTS, PHS, STA)
  const isPhysicalSciences = ['CHM', 'ICH', 'MTS', 'PHS', 'STA'].includes(codeClean);
  if (isPhysicalSciences) {
    if (lvl === '100') {
      const sci100 = ['MTS 101', 'MTS 105', 'PHS 101', 'PHY 101', 'CHM 101', 'BIO 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (sci100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      if (codeClean === 'ICH') {
        const ich200 = ['ICH 201', 'ICH 203', 'ICH 205', 'CHM 211', 'CHM 221', 'CHM 243', 'CHM 269', 'MTS 201', 'GNS 201'];
        for (const s of allSessions) {
          if (ich200.some((c) => s.courseCode.toUpperCase().includes(c))) {
            matches.add(getRootCourseCode(s.courseCode));
          }
        }
      }
    }
  }

  // 4. Engineering (COLENG: ABE, CVE, ELE, MCE, MTE)
  const isEngineering = ['ABE', 'CVE', 'ELE', 'MCE', 'MTE'].includes(codeClean);
  if (isEngineering) {
    if (lvl === '100') {
      const eng100 = ['GET 101', 'MCE 101', 'MCE 103', 'MTS 101', 'PHS 101', 'CHM 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (eng100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      const eng200 = ['GET 201', 'GET 203', 'GET 205', 'GET 207', 'GET 209', 'GET 211', 'MTS 201', 'MTS 203', 'GNS 201'];
      for (const s of allSessions) {
        if (eng200.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    }
  }

  // 5. Biosciences (COLBIOS: MCB, BCH, BOT, ZOO)
  const isBiosciences = ['MCB', 'BCH', 'BOT', 'ZOO'].includes(codeClean);
  if (isBiosciences) {
    if (lvl === '100') {
      const bio100 = ['BIO 101', 'BIO 103', 'CHM 101', 'MTS 105', 'PHS 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (bio100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      const bio200 = ['BIO 201', 'CHM 211', 'GNS 201'];
      for (const s of allSessions) {
        if (bio200.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    }
  }

  // 6. Animal Science (COLANIM: APH, ABG, ANN, ANP, PRM)
  const isAnimalScience = ['APH', 'ABG', 'ANN', 'ANP', 'PRM'].includes(codeClean);
  if (isAnimalScience) {
    if (lvl === '100') {
      const anim100 = ['ANS 101', 'ANS 103', 'BIO 101', 'CHM 101', 'MTS 105', 'PHS 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (anim100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      const anim200 = ['AGR 201', 'AGR 203', 'ANS 201', 'GNS 201'];
      for (const s of allSessions) {
        if (anim200.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    }
  }

  // 7. Plant Science (COLPLANT: CPT, CRD, HRT, PBST, PCP, SOS)
  const isPlantScience = ['CPT', 'CRD', 'HRT', 'PBST', 'PCP', 'SOS'].includes(codeClean);
  if (isPlantScience) {
    if (lvl === '100') {
      const plant100 = ['PCP 101', 'BIO 101', 'CHM 101', 'MTS 105', 'PHS 101', 'GNS 111', 'GST 111'];
      for (const s of allSessions) {
        if (plant100.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    } else if (lvl === '200') {
      const plant200 = ['AGR 201', 'AGR 203', 'PCP 201', 'SOS 211', 'GNS 201'];
      for (const s of allSessions) {
        if (plant200.some((c) => s.courseCode.toUpperCase().includes(c))) {
          matches.add(getRootCourseCode(s.courseCode));
        }
      }
    }
  }

  // 8. Environmental Resources (COLERM: FIS, AQFM, FWM, EMT, WMA, WSH)
  const isErm = ['FIS', 'AQFM', 'FWM', 'EMT', 'WMA', 'WSH'].includes(codeClean);
  if (isErm && lvl === '100') {
    const erm100 = ['BIO 101', 'CHM 101', 'MTS 101', 'MTS 105', 'PHS 101', 'GNS 111', 'GST 111'];
    for (const s of allSessions) {
      if (erm100.some((c) => s.courseCode.toUpperCase().includes(c))) {
        matches.add(getRootCourseCode(s.courseCode));
      }
    }
  }

  // 9. Food Science & Human Ecology (COLFHEC: FST, HSM, HTM, NTD)
  const isFhec = ['FST', 'HSM', 'HTM', 'NTD'].includes(codeClean);
  if (isFhec && lvl === '100') {
    const fhec100 = ['BIO 101', 'CHM 101', 'MTS 105', 'PHS 101', 'GNS 111', 'GST 111'];
    for (const s of allSessions) {
      if (fhec100.some((c) => s.courseCode.toUpperCase().includes(c))) {
        matches.add(getRootCourseCode(s.courseCode));
      }
    }
  }

  // 10. Veterinary Medicine (COLVET: VMD, VBA, VBB, VBP, VPM, VPT, VCS, VCC)
  const isVet = ['VMD', 'VBA', 'VBB', 'VBP', 'VPM', 'VPT', 'VCS', 'VCC'].includes(codeClean);
  if (isVet && lvl === '100') {
    const vet100 = ['VMD 101', 'BIO 101', 'CHM 101', 'PHS 101', 'MTS 101', 'GNS 111', 'GST 111'];
    for (const s of allSessions) {
      if (vet100.some((c) => s.courseCode.toUpperCase().includes(c))) {
        matches.add(getRootCourseCode(s.courseCode));
      }
    }
  }

  // 11. Management Sciences (COLENDS: ACC, BAM, BFN, ECO, ETS)
  const isManagement = ['ACC', 'BAM', 'BFN', 'ECO', 'ETS'].includes(codeClean);
  if (isManagement && lvl === '100') {
    const mgmt100 = ['ACC 101', 'BAM 101', 'BFN 101', 'ECO 101', 'ETS 101', 'MTS 105', 'GNS 111', 'GST 111'];
    for (const s of allSessions) {
      if (mgmt100.some((c) => s.courseCode.toUpperCase().includes(c))) {
        matches.add(getRootCourseCode(s.courseCode));
      }
    }
  }

  // 12. Generic university 100L fallback if still empty
  if (lvl === '100' && matches.size === 0) {
    const general100 = ['MTS 101', 'MTS 105', 'CHM 101', 'BIO 101', 'PHS 101', 'GNS 111', 'GST 111'];
    for (const s of allSessions) {
      if (general100.some((g) => s.courseCode.toUpperCase().includes(g))) {
        matches.add(getRootCourseCode(s.courseCode));
      }
    }
  }

  // Always include official University Sports period for all undergraduates
  matches.add('SPORTS');

  return Array.from(matches);
}

/**
 * Generates RFC 5545 compliant .ics calendar file for native calendar import
 * (Google Calendar, Apple Calendar, Outlook).
 */
export function exportToICalendar(
  sessions: TimetableSession[],
  studentName: string = 'FUNAAB Student'
): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Course Mate//FUNAAB Timetable//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Course Mate - ${studentName}`,
    'X-WR-TIMEZONE:Africa/Lagos',
  ];

  // Map academic days to next upcoming date in first semester 2026/2027
  // Academic semester Monday is 2026-09-28
  const dayOffsets: Record<TimetableDay, number> = {
    Monday: 28,
    Tuesday: 29,
    Wednesday: 30,
    Thursday: 1, // Oct 1
    Friday: 2,   // Oct 2
  };

  const dayCodes: Record<TimetableDay, string> = {
    Monday: 'MO',
    Tuesday: 'TU',
    Wednesday: 'WE',
    Thursday: 'TH',
    Friday: 'FR',
  };

  for (const s of sessions) {
    const startM = parseTimeToMinutes(s.startTime);
    const endM = parseTimeToMinutes(s.endTime);

    const startH = Math.floor(startM / 60);
    const startMin = startM % 60;
    const endH = Math.floor(endM / 60);
    const endMin = endM % 60;

    const dayNum = dayOffsets[s.day] || 28;
    const monthStr = s.day === 'Thursday' || s.day === 'Friday' ? '10' : '09';
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;

    const dtStart = `2026${monthStr}${dayStr}T${startH < 10 ? '0' : ''}${startH}${startMin < 10 ? '0' : ''}${startMin}00`;
    const dtEnd = `2026${monthStr}${dayStr}T${endH < 10 ? '0' : ''}${endH}${endMin < 10 ? '0' : ''}${endMin}00`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:classease-${s.id}-${Date.now()}@funaab.timetable`);
    lines.push(`DTSTAMP:${dtStart}Z`);
    lines.push(`DTSTART;TZID=Africa/Lagos:${dtStart}`);
    lines.push(`DTEND;TZID=Africa/Lagos:${dtEnd}`);
    lines.push(`RRULE:FREQ=WEEKLY;BYDAY=${dayCodes[s.day]};UNTIL=20270131T235959Z`);
    lines.push(`SUMMARY:${s.courseCode}${s.isPractical ? ' (Practical)' : ''}`);
    lines.push(`LOCATION:${s.venue}`);
    lines.push(`DESCRIPTION:Official FUNAAB Lecture Timetable v4.0\\nVenue: ${s.venue}\\nType: ${s.isPractical ? 'Practical' : 'Lecture'}\\nDirections: https://funaab.getdirection.xyz`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}
