export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type TimetableDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export type TimetableViewMode = 'weekly' | 'daily' | 'agenda' | 'compact';

export type PersonalEventType = 'Study' | 'Assignment' | 'Meeting' | 'Personal' | 'Custom';

export interface TimetableSession {
  id: string;
  day: TimetableDay;
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "11:00 AM"
  courseCode: string;
  venue: string;
  level: string;     // e.g. "100", "200", "300", "400", "500", "Unspecified"
  prefix: string;    // e.g. "BIO", "CHM", "ABE"
  isPractical: boolean;
  isVirtual: boolean;
  academicYear: string;
  semester: string;
  timetableVersion: string;
  source: string;
  verificationStatus: string;
}

export interface PersonalEvent {
  id: string;
  title: string;
  type: PersonalEventType;
  day: DayOfWeek;
  startTime: string; // "09:00 AM"
  endTime: string;   // "11:00 AM"
  location?: string;
  notes?: string;
  createdAt: number;
}

export interface UserProfile {
  preferredName: string;
  collegeId: string;
  departmentId: string;
  level: string;
  selectedCourseCodes: string[];
  streamPreferences?: Record<string, string>; // e.g. { "MTS 105": "A" }
  practicalDayPreferences?: Record<string, TimetableDay>; // e.g. { "CHM 191": "Tuesday" }
  preferredView: TimetableViewMode;
  darkMode: boolean;
  onboardingCompleted: boolean;
  // Notifications & Audio Alarms
  notificationsEnabled?: boolean;
  alarmSoundEnabled?: boolean;
  notificationLeadMinutes?: number; // default 15 mins
  // Appearance & Audio Reward Customizations
  selectedTheme?: 'default' | 'emerald' | 'cyber' | 'royal' | 'amber';
  selectedChime?: 'default' | 'marimba' | 'bell' | 'gong' | 'pulse';
  // Reward Tracking
  adInteractionsCount?: number;
  isAdminUnlocked?: boolean;
}

export interface ActiveAd {
  id: string;
  brandName: string;
  tagline: string;
  description?: string;
  actionUrl: string;
  actionLabel?: string;
  badge?: string; // e.g. "Campus Partner"
  startDate: string; // ISO date
  endDate: string; // ISO date
  active: boolean;
  category?: string;
  is30DayPartner?: boolean;
  whatsappNumber?: string;
  whatsappMessage?: string;
  modalType?: string;
  posterUrl?: string;
}

export interface AdRewardStats {
  interactionsCount: number;
  unlockedTier1Themes: boolean; // 4 ads
  unlockedTier2Chimes: boolean; // 6 ads
  unlockedTier3Export: boolean; // 9 ads
  unlockedTier4Perks: boolean;  // 12 ads
}

export interface FreeTimeGap {
  id: string;
  day: TimetableDay;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  formattedDuration: string;
  precedingItem?: string;
  followingItem?: string;
}

export interface ScheduleClash {
  id: string;
  type: 'official-official' | 'official-personal' | 'personal-personal';
  day: DayOfWeek;
  timeRange: string;
  itemA: {
    title: string;
    venue?: string;
    isPersonal: boolean;
    startTime: string;
    endTime: string;
  };
  itemB: {
    title: string;
    venue?: string;
    isPersonal: boolean;
    startTime: string;
    endTime: string;
  };
}

export type TimelineItem = 
  | {
      kind: 'session';
      id: string;
      session: TimetableSession;
      startMinutes: number;
      endMinutes: number;
      hasClash?: boolean;
    }
  | {
      kind: 'personal';
      id: string;
      event: PersonalEvent;
      startMinutes: number;
      endMinutes: number;
      hasClash?: boolean;
    }
  | {
      kind: 'sports';
      id: string;
      title: string;
      startTime: string;
      endTime: string;
      startMinutes: number;
      endMinutes: number;
    }
  | {
      kind: 'free';
      id: string;
      gap: FreeTimeGap;
      startMinutes: number;
      endMinutes: number;
    };
