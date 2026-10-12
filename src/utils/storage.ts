import { UserProfile, PersonalEvent, AdRewardStats } from '../types';

const DB_NAME = 'CourseMateDB';
const DB_VERSION = 2;
const STORE_PROFILE = 'userProfile';
const STORE_EVENTS = 'personalEvents';

export const DEFAULT_PROFILE: UserProfile = {
  preferredName: '',
  collegeId: '',
  departmentId: '',
  level: '100',
  selectedCourseCodes: [],
  preferredView: 'daily',
  darkMode: false,
  onboardingCompleted: false,
  notificationsEnabled: false,
  alarmSoundEnabled: false,
  notificationLeadMinutes: 15,
  selectedTheme: 'default',
  selectedChime: 'default',
  adInteractionsCount: 0,
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    // Safety timeout: if IndexedDB doesn't answer within 250ms (common in sandboxed iframes), fail fast
    const timeout = setTimeout(() => {
      reject(new Error('IndexedDB open timeout'));
    }, 250);

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_PROFILE)) {
          db.createObjectStore(STORE_PROFILE, { keyPath: 'key' });
        }
        if (!db.objectStoreNames.contains(STORE_EVENTS)) {
          db.createObjectStore(STORE_EVENTS, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error);
      };
    } catch (err) {
      clearTimeout(timeout);
      reject(err);
    }
  });
}

// LocalStorage fallback helpers
const LS_PROFILE_KEY = 'course_mate_profile';
const LS_EVENTS_KEY = 'course_mate_events';

export function getInitialProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const ls = localStorage.getItem(LS_PROFILE_KEY);
    if (ls) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(ls) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_PROFILE;
}

export function getInitialPersonalEvents(): PersonalEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const ls = localStorage.getItem(LS_EVENTS_KEY);
    if (ls) {
      return JSON.parse(ls);
    }
  } catch {
    // ignore
  }
  return [];
}

export async function getStoredProfile(): Promise<UserProfile> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_PROFILE, 'readonly');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.get('current');
      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve({ ...DEFAULT_PROFILE, ...req.result.data });
        } else {
          // Check local storage fallback
          const ls = localStorage.getItem(LS_PROFILE_KEY);
          if (ls) {
            try {
              resolve({ ...DEFAULT_PROFILE, ...JSON.parse(ls) });
              return;
            } catch {
              // ignore
            }
          }
          resolve(DEFAULT_PROFILE);
        }
      };
      req.onerror = () => {
        const ls = localStorage.getItem(LS_PROFILE_KEY);
        resolve(ls ? { ...DEFAULT_PROFILE, ...JSON.parse(ls) } : DEFAULT_PROFILE);
      };
    });
  } catch {
    const ls = localStorage.getItem(LS_PROFILE_KEY);
    try {
      return ls ? { ...DEFAULT_PROFILE, ...JSON.parse(ls) } : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }
}

export function computeRewardStats(count: number = 0, isAdminUnlocked = false): AdRewardStats {
  const isAllUnlocked = isAdminUnlocked || count >= 999;
  return {
    interactionsCount: count,
    unlockedTier1Themes: isAllUnlocked || count >= 4,
    unlockedTier2Chimes: isAllUnlocked || count >= 6,
    unlockedTier3Export: isAllUnlocked || count >= 9,
    unlockedTier4Perks: isAllUnlocked || count >= 12,
  };
}

export async function saveStoredProfile(profile: UserProfile): Promise<void> {
  // Always mirror in localStorage for immediate sync
  try {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_PROFILE, 'readwrite');
      const store = tx.objectStore(STORE_PROFILE);
      const req = store.put({ key: 'current', data: profile });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Falling back to localStorage for profile', err);
  }
}

export async function getStoredPersonalEvents(): Promise<PersonalEvent[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_EVENTS, 'readonly');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const ls = localStorage.getItem(LS_EVENTS_KEY);
          resolve(ls ? JSON.parse(ls) : []);
        }
      };
      req.onerror = () => {
        const ls = localStorage.getItem(LS_EVENTS_KEY);
        resolve(ls ? JSON.parse(ls) : []);
      };
    });
  } catch {
    const ls = localStorage.getItem(LS_EVENTS_KEY);
    return ls ? JSON.parse(ls) : [];
  }
}

export async function savePersonalEvent(event: PersonalEvent): Promise<void> {
  const current = await getStoredPersonalEvents();
  const existingIdx = current.findIndex((e) => e.id === event.id);
  const updated = existingIdx >= 0
    ? current.map((e) => (e.id === event.id ? event : e))
    : [...current, event];

  try {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.put(event);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback saving personal event', err);
  }
}

export async function deletePersonalEvent(eventId: string): Promise<void> {
  const current = await getStoredPersonalEvents();
  const updated = current.filter((e) => e.id !== eventId);

  try {
    localStorage.setItem(LS_EVENTS_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_EVENTS, 'readwrite');
      const store = tx.objectStore(STORE_EVENTS);
      const req = store.delete(eventId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback deleting personal event', err);
  }
}

export async function resetAllLocalData(): Promise<void> {
  try {
    localStorage.removeItem(LS_PROFILE_KEY);
    localStorage.removeItem(LS_EVENTS_KEY);
  } catch {
    // ignore
  }

  try {
    const db = await openDB();
    const tx = db.transaction([STORE_PROFILE, STORE_EVENTS], 'readwrite');
    tx.objectStore(STORE_PROFILE).clear();
    tx.objectStore(STORE_EVENTS).clear();
  } catch {
    // ignore
  }
}
