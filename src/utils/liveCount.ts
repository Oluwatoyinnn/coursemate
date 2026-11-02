/**
 * Live "Students on Course Mate" counter.
 *
 * Each device registers once with a random anonymous ID (no name, no email, nothing personal),
 * and everyone sees the same total. It needs a small free Supabase project; see
 * docs/live-counter-setup.md. Until those two settings exist, nothing is shown at all
 * (we never display a made-up number).
 */
/**
 * Accepts the project URL however it was pasted: with quotes, spaces, a trailing slash, or the
 * "/rest/v1" API path that Supabase shows in some places. We always add "/rest/v1" ourselves.
 */
function cleanUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  const v = raw
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\/+$/, '')
    .replace(/\/rest\/v1$/i, '')
    .replace(/\/+$/, '');
  return /^https?:\/\/.+/i.test(v) ? v : undefined;
}
const cleanKey = (raw: string | undefined): string | undefined => {
  const v = raw?.trim().replace(/^["']|["']$/g, '');
  return v || undefined;
};

const SUPABASE_URL = cleanUrl(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const SUPABASE_KEY = cleanKey(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

const ID_KEY = 'course_mate_device_id';
const COUNTED_KEY = 'course_mate_device_counted';
const CACHE_KEY = 'course_mate_student_count';

export const isCounterConfigured = (): boolean => !!(SUPABASE_URL && SUPABASE_KEY);

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  // Fallback for very old browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getDeviceId(): string {
  try {
    let id = localStorage.getItem(ID_KEY);
    if (!id) {
      id = newId();
      localStorage.setItem(ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

/** Last number we saw (shown instantly, and when offline). */
export function getCachedCount(): number | null {
  try {
    const n = Number(localStorage.getItem(CACHE_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

function withTimeout(ms: number): { signal: AbortSignal; done: () => void } {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

/** Registers this device once (if it has not been counted yet) and returns the live total. */
export async function registerAndGetCount(): Promise<number | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
  };

  try {
    const id = getDeviceId();
    if (id && !localStorage.getItem(COUNTED_KEY)) {
      const t = withTimeout(8000);
      const res = await fetch(`${SUPABASE_URL}/rest/v1/students?on_conflict=id`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({ id }),
        signal: t.signal,
      });
      t.done();
      if (res.ok) localStorage.setItem(COUNTED_KEY, '1');
    }

    const t2 = withTimeout(8000);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/student_count`, {
      method: 'POST',
      headers,
      body: '{}',
      signal: t2.signal,
    });
    t2.done();
    if (!res.ok) return getCachedCount();
    const total = Number(await res.json());
    if (Number.isFinite(total) && total > 0) {
      localStorage.setItem(CACHE_KEY, String(total));
      return total;
    }
    return getCachedCount();
  } catch {
    return getCachedCount(); // offline or slow network: show the last known number
  }
}
