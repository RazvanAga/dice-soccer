/** A random number generator returning a float in [0, 1), like `Math.random`. */
export type Rng = () => number;

/**
 * Deterministic seeded RNG (mulberry32). The same seed always yields the same
 * sequence, so a Bracket built from a fixed seed is reproducible — which is what
 * lets the engine be tested without real randomness.
 */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
