// Every sound the game makes, synthesized with the Web Audio API: no sound files, no network.
// Each effect is a short envelope over one or two oscillators. The context is created lazily on
// the first user gesture (browsers refuse sound before one) and every call is guarded, so a
// browser without audio still plays fine.

/** Frequencies (Hz) of the notes the effects use. */
const NOTE = {
  c5: 523.25,
  d5: 587.33,
  e5: 659.25,
  g5: 783.99,
  a5: 880.0,
  c6: 1046.5,
  e6: 1318.5,
  low: 140,
};

/**
 * A sound board: `found()` on a difference found, `wrong()` on a miss, `hint()` when a hint
 * opens, `level()` when a scene is cleared, `win()` on the last scene, `tick()` for the last
 * ten seconds and `click()` for buttons. `muted` silences it; `toggle()` flips that.
 */
export function createAudio() {
  let context = null;
  let muted = false;

  function ctx() {
    if (context !== null) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (AudioContext === undefined) return null;
      context = new AudioContext();
    } catch {
      return null;
    }
    return context;
  }

  /** Resume the context after a gesture; safe to call on every click. */
  function unlock() {
    const c = ctx();
    if (c !== null && c.state === 'suspended') {
      void c.resume();
    }
  }

  /** One note: an oscillator of `type` at `freq` Hz, fading out over `seconds`. */
  function note(freq, seconds, type = 'sine', when = 0, volume = 0.12) {
    if (muted) return;
    const c = ctx();
    if (c === null) return;
    try {
      const start = c.currentTime + when;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(start);
      osc.stop(start + seconds + 0.05);
    } catch {
      // A note that cannot play is a silent one, never a crash.
    }
  }

  return {
    get muted() {
      return muted;
    },
    toggle() {
      muted = !muted;
      return muted;
    },
    unlock,
    click() {
      note(NOTE.e5, 0.07, 'triangle', 0, 0.06);
    },
    found() {
      note(NOTE.e5, 0.16, 'sine');
      note(NOTE.g5, 0.22, 'sine', 0.07);
      note(NOTE.c6, 0.3, 'sine', 0.14, 0.09);
    },
    wrong() {
      note(NOTE.low, 0.22, 'sawtooth', 0, 0.07);
      note(NOTE.low * 0.75, 0.25, 'sawtooth', 0.02, 0.05);
    },
    hint() {
      note(NOTE.a5, 0.14, 'sine', 0, 0.08);
      note(NOTE.e6, 0.2, 'sine', 0.08, 0.06);
    },
    level() {
      [NOTE.c5, NOTE.e5, NOTE.g5, NOTE.c6].forEach((freq, i) => note(freq, 0.24, 'triangle', i * 0.09, 0.1));
    },
    win() {
      [NOTE.c5, NOTE.d5, NOTE.e5, NOTE.g5, NOTE.a5, NOTE.c6, NOTE.e6].forEach((freq, i) => note(freq, 0.3, 'triangle', i * 0.1, 0.1));
    },
    tick() {
      note(NOTE.c6, 0.05, 'square', 0, 0.04);
    },
  };
}
