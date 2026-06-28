import { type MatchResult } from "./match";
import { type Round } from "./rounds";
import type { Rng } from "./rng";
import { playTournament } from "./tournament";
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
 * strategy. The Bracket progression itself is `playTournament`'s job; scoring is
 * a second pass over its Rounds — take the Player's Picks, draw the CPU's, and
 * score each resolved Round. A fixed seed and strategy always yield the same
 * Scores.
 */
export function scoreTournament(
  rng: Rng,
  pickStrategy: PickStrategy,
): ScoredTournament {
  const play = playTournament(rng);
  const rounds: RoundScore[] = play.rounds.map((roundPlay) => {
    const playerPicks = pickStrategy(roundPlay.matches, roundPlay.round);
    const computerPicks = cpuPicks(roundPlay.matches, rng);
    return scoreRound(
      roundPlay.round,
      roundPlay.results,
      playerPicks,
      computerPicks,
    );
  });
  const playerScore = rounds.reduce((sum, r) => sum + r.playerPoints, 0);
  const cpuScore = rounds.reduce((sum, r) => sum + r.cpuPoints, 0);
  return {
    rounds,
    playerScore,
    cpuScore,
    champion: play.champion,
  };
}
