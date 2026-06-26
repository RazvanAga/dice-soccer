import { TEAMS } from "./teams";
import type { Rng } from "./rng";
import type { Bracket, Match, Team } from "./types";

/** Fisher–Yates shuffle driven by the injected Rng; never mutates the input. */
function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Form a Match from a Pairing; the lower Rank number is the Favorite. */
function pair(a: Team, b: Team): Match {
  return a.rank < b.rank
    ? { favorite: a, underdog: b }
    : { favorite: b, underdog: a };
}

/**
 * Build a Bracket: shuffle the Teams into random first-Round Pairings, then form
 * the 16 first-Round Matches. The rest of the tree is fixed and filled by later
 * Rounds as winners advance.
 *
 * The Rng is injected so a fixed seed produces a deterministic Bracket.
 */
export function createBracket(
  rng: Rng,
  teams: readonly Team[] = TEAMS,
): Bracket {
  const order = shuffle(teams, rng);
  const firstRound: Match[] = [];
  for (let i = 0; i < order.length; i += 2) {
    firstRound.push(pair(order[i], order[i + 1]));
  }
  return { firstRound };
}
