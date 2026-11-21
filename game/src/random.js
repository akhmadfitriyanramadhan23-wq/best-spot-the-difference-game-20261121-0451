// A small seeded random generator, so a scene's decoration (stars, clouds, snow) is identical
// on both panels and the same seed always draws the same scene. Mulberry32: four integer ops a
// draw, good enough for decoration and fair for a game.

/** A function returning a float in [0, 1) from the 32-bit seed, advancing its state each call. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A float in [min, max) from `rng`. */
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

/** An integer in [min, max] from `rng`. */
export function int(rng, min, max) {
  return Math.floor(range(rng, min, max + 1));
}

/** One item of `list`, picked by `rng`. */
export function pick(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
