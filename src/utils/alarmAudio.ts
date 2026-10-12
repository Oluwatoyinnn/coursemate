/**
 * Web Audio API synthesizer for Course Mate class alarms and reminders.
 * Operates 100% offline with zero external audio assets.
 */

export type ChimeType = 'default' | 'marimba' | 'bell' | 'gong' | 'pulse';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playAlarmChime(type: ChimeType = 'default', volume = 0.25): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (type) {
      case 'marimba': {
        const freqs = [440, 554.37, 659.25]; // A4, C#5, E5
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(volume * 0.8, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.55);
        });
        break;
      }

      case 'bell': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.8);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.25);
        break;
      }

      case 'gong': {
        const freqs = [220, 277.18, 329.63];
        freqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(volume * 0.5, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + 1.85);
        });
        break;
      }

      case 'pulse': {
        [0, 0.15, 0.3].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, now + delay); // E5

          gain.gain.setValueAtTime(volume * 0.6, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.1);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.12);
        });
        break;
      }

      case 'default':
      default: {
        // Melodic two-tone academic chime (523.25 Hz C5 -> 659.25 Hz E5)
        const notes = [
          { freq: 523.25, time: 0, dur: 0.35 },
          { freq: 659.25, time: 0.18, dur: 0.55 },
        ];
        notes.forEach(({ freq, time, dur }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + time);

          gain.gain.setValueAtTime(volume, now + time);
          gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + time);
          osc.stop(now + time + dur + 0.05);
        });
        break;
      }
    }
  } catch (e) {
    console.warn('Audio alarm playback error:', e);
  }
}
