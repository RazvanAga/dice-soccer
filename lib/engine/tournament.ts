import { createBracket, pairTeams } from "./bracket";
import { resolveRound, type MatchResult } from "./match";
import { ROUNDS, type Round } from "./rounds";
import type { Rng } from "./rng";
import type { Bracket, Match, Team } from "./types";

/**
 * Advance the winners of a resolved Round into the next Round's Matches. On the
 * fixed tree, each pair of consecutive winners (in Match order) meets in their
 * predetermined parent slot. A Round of one Match yields no further Matches.
 */
export function advance(results: readonly MatchResult[]): Match[] {
  const winners = results.map((result) => result.winner);
  const next: Match[] = [];
  for (let i = 0; i + 1 < winners.length; i += 2) {
    next.push(pairTeams(winners[i], winners[i + 1]));
  }
  return next;
}

/** One Round of a played-through Tournament. */
export interface RoundPlay {
  readonly round: Round;
  readonly matches: readonly Match[];
  readonly results: readonly MatchResult[];
}

/** A full Tournament played from 16-imi to the Final, ending in one champion. */
export interface TournamentPlay {
  readonly rounds: readonly RoundPlay[];
  readonly champion: Team;
}

/**
 * Play a whole Tournament with one Rng: build a Bracket, then resolve and
 * advance through all five Rounds down to a single champion. A fixed seed plays
 * the same Tournament every time.
 */
export function playTournament(rng: Rng, bracket?: Bracket): TournamentPlay {
  let matches: readonly Match[] = (bracket ?? createBracket(rng)).firstRound;
  const rounds: RoundPlay[] = [];
  for (const round of ROUNDS) {
    const results = resolveRound(matches, rng);
    rounds.push({ round, matches, results });
    matches = advance(results);
  }
  const final = rounds[rounds.length - 1];
  return { rounds, champion: final.results[0].winner };
}
