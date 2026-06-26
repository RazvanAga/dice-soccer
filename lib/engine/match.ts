import type { Rng } from "./rng";
import type { Match, Team } from "./types";

/** The outcome of one resolved Match: each Team's Roll and the winner. */
export interface MatchResult {
  readonly match: Match;
  /** The Favorite's Roll (2–6). */
  readonly favoriteRoll: number;
  /** The Underdog's Roll (1–5). */
  readonly underdogRoll: number;
  /** The Team with the higher Roll. Never a draw. */
  readonly winner: Team;
}

/** The Favorite rolls a die valued 2–6, giving it a ~71% chance to win. */
export const FAVORITE_DIE = { min: 2, max: 6 } as const;
/** The Underdog rolls a die valued 1–5. */
export const UNDERDOG_DIE = { min: 1, max: 5 } as const;

function roll(die: { min: number; max: number }, rng: Rng): number {
  return die.min + Math.floor(rng() * (die.max - die.min + 1));
}

/**
 * Resolve a single Match: each Team draws a Roll, equal Rolls are re-rolled
 * until unequal (never a draw), and the higher Roll wins.
 */
export function resolveMatch(match: Match, rng: Rng): MatchResult {
  let favoriteRoll: number;
  let underdogRoll: number;
  do {
    favoriteRoll = roll(FAVORITE_DIE, rng);
    underdogRoll = roll(UNDERDOG_DIE, rng);
  } while (favoriteRoll === underdogRoll);
  const winner = favoriteRoll > underdogRoll ? match.favorite : match.underdog;
  return { match, favoriteRoll, underdogRoll, winner };
}

/** Resolve every Match in a Round, in order. */
export function resolveRound(
  matches: readonly Match[],
  rng: Rng,
): MatchResult[] {
  return matches.map((match) => resolveMatch(match, rng));
}
