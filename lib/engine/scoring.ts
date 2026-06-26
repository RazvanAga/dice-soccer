import { createBracket } from "./bracket";
import { resolveRound, type MatchResult } from "./match";
import { ROUNDS, type Round } from "./rounds";
import type { Rng } from "./rng";
import { advance } from "./tournament";
import type { Match, Team } from "./types";

/**
 * One Match with both participants' Picks evaluated against the actual winner.
 * A Pick is the Team a participant chose to advance; it is correct when it
 * matches the Match's winner.
 */
export interface MatchPrediction {
  readonly result: MatchResult;
  readonly playerPick: Team;
  readonly cpuPick: Team;
  readonly playerCorrect: boolean;
  readonly cpuCorrect: boolean;
}

/** A resolved Round scored for both Player and CPU. */
export interface RoundScore {
  readonly round: Round;
  readonly predictions: readonly MatchPrediction[];
  /** Points the Player earned this Round (correct Picks × the Round's value). */
  readonly playerPoints: number;
  /** Points the CPU earned this Round. */
  readonly cpuPoints: number;
}

/** A whole Tournament scored Round by Round, with cumulative Scores. */
export interface ScoredTournament {
  readonly rounds: readonly RoundScore[];
  readonly playerScore: number;
  readonly cpuScore: number;
  readonly champion: Team;
}

/**
 * Pick a side of every Match uniformly at random — the CPU's 50/50 strategy.
 * The Rng is injected so a seed makes the CPU's Picks reproducible.
 */
export function cpuPicks(matches: readonly Match[], rng: Rng): Team[] {
  return matches.map((match) => (rng() < 0.5 ? match.favorite : match.underdog));
}

/**
 * Score one resolved Round: for each Match, mark whether the Player's and the
 * CPU's Pick matched the winner, and total each side's points (one correct Pick
 * is worth the Round's value).
 */
export function scoreRound(
  round: Round,
  results: readonly MatchResult[],
  playerPicks: readonly Team[],
  computerPicks: readonly Team[],
): RoundScore {
  const predictions: MatchPrediction[] = results.map((result, i) => {
    const playerPick = playerPicks[i];
    const cpuPick = computerPicks[i];
    return {
      result,
      playerPick,
      cpuPick,
      playerCorrect: playerPick === result.winner,
      cpuCorrect: cpuPick === result.winner,
    };
  });
  const playerPoints =
    predictions.filter((p) => p.playerCorrect).length * round.points;
  const cpuPoints =
    predictions.filter((p) => p.cpuCorrect).length * round.points;
  return { round, predictions, playerPoints, cpuPoints };
}

/**
 * Chooses the Player's Pick for every Match of a Round, given that Round's
 * Matches. Used to drive a deterministic full-Tournament scoring.
 */
export type PickStrategy = (
  matches: readonly Match[],
  round: Round,
) => readonly Team[];

/**
 * Score a whole Tournament deterministically from one Rng and a Player Pick
 * strategy: build a Bracket, then for each Round take the Player's Picks, draw
 * the CPU's random Picks, resolve the dice, score the Round, and advance the
 * winners. A fixed seed and strategy always yield the same Scores.
 */
export function scoreTournament(
  rng: Rng,
  pickStrategy: PickStrategy,
): ScoredTournament {
  let matches: readonly Match[] = createBracket(rng).firstRound;
  const rounds: RoundScore[] = [];
  for (const round of ROUNDS) {
    const playerPicks = pickStrategy(matches, round);
    const computerPicks = cpuPicks(matches, rng);
    const results = resolveRound(matches, rng);
    rounds.push(scoreRound(round, results, playerPicks, computerPicks));
    matches = advance(results);
  }
  const playerScore = rounds.reduce((sum, r) => sum + r.playerPoints, 0);
  const cpuScore = rounds.reduce((sum, r) => sum + r.cpuPoints, 0);
  const final = rounds[rounds.length - 1];
  return {
    rounds,
    playerScore,
    cpuScore,
    champion: final.predictions[0].result.winner,
  };
}
