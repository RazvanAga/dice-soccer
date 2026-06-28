import { createBracket } from "./bracket";
import { resolveMatch, type MatchResult } from "./match";
import { ROUNDS, type Round } from "./rounds";
import type { Rng } from "./rng";
import { cpuPicks, scoreRound } from "./scoring";
import { advance } from "./tournament";
import type { Bracket, Match, Team } from "./types";

/**
 * A Tournament in progress: the moment-to-moment state of one Playthrough,
 * advanced a single Match at a time. The Player Picks a winner, the dice
 * resolve that Match, and the cursor steps to the next Match — or, at the end of
 * a Round, banks the Round's points and advances the survivors to the next
 * Round. Distinct from a TournamentPlay (a whole Tournament resolved at once):
 * a Playthrough is what the prediction screen walks through.
 *
 * The value is immutable; every transition returns a fresh Playthrough.
 * Randomness enters only through an injected Rng, exactly as the rest of the
 * engine works, so a fixed seed replays the same Playthrough.
 */
export interface Playthrough {
  /** Index into ROUNDS of the Round being played. */
  readonly roundIndex: number;
  /** The current Round's Matches. */
  readonly matches: readonly Match[];
  /** The CPU's hidden Picks for the current Round, one per Match. */
  readonly cpuPicks: readonly Team[];
  /** The Match the cursor is on within the current Round. */
  readonly matchIndex: number;
  /** The Player's Picks made so far this Round (one per resolved Match). */
  readonly playerPicks: readonly Team[];
  /** The resolved Matches so far this Round (one per Pick). */
  readonly results: readonly MatchResult[];
  /** Points banked from fully-completed prior Rounds — the Player's. */
  readonly committedPlayer: number;
  /** Points banked from fully-completed prior Rounds — the CPU's. */
  readonly committedCpu: number;
  /** True once the Final has been banked; no further transitions apply. */
  readonly finished: boolean;
  /** The Tournament winner, known only once finished. */
  readonly champion: Team | null;
}

/**
 * Begin a fresh Playthrough: build a Bracket and draw the CPU's first-Round
 * Picks, both from the one injected Rng. The cursor starts on the first Match of
 * the first Round with nothing yet resolved.
 */
export function startPlaythrough(rng: Rng, bracket?: Bracket): Playthrough {
  const matches = (bracket ?? createBracket(rng)).firstRound;
  return {
    roundIndex: 0,
    matches,
    cpuPicks: cpuPicks(matches, rng),
    matchIndex: 0,
    playerPicks: [],
    results: [],
    committedPlayer: 0,
    committedCpu: 0,
    finished: false,
    champion: null,
  };
}

/**
 * Record the Player's Pick for the current Match and resolve that Match's dice.
 * After this the current Match is resolved (its result is readable); call `next`
 * to move on. No-op once finished or if the current Match is already resolved.
 */
export function pick(play: Playthrough, team: Team, rng: Rng): Playthrough {
  if (play.finished || isResolved(play)) return play;
  const result = resolveMatch(currentMatch(play), rng);
  return {
    ...play,
    playerPicks: [...play.playerPicks, team],
    results: [...play.results, result],
  };
}

/**
 * Move past the resolved current Match. Mid-Round this just steps the cursor;
 * on the last Match it banks the Round's points and either advances the
 * survivors into the next Round or, after the Final, finishes the Playthrough.
 * No-op until the current Match has been resolved by `pick`.
 */
export function next(play: Playthrough, rng: Rng): Playthrough {
  if (play.finished || !isResolved(play)) return play;

  if (!isLastMatch(play)) {
    return { ...play, matchIndex: play.matchIndex + 1 };
  }

  // Last Match of the Round: bank its points before leaving it.
  const score = scoreRound(
    currentRound(play),
    play.results,
    play.playerPicks,
    play.cpuPicks,
  );
  const committedPlayer = play.committedPlayer + score.playerPoints;
  const committedCpu = play.committedCpu + score.cpuPoints;

  if (isFinalRound(play)) {
    return {
      ...play,
      committedPlayer,
      committedCpu,
      finished: true,
      champion: play.results[play.matchIndex].winner,
    };
  }

  const nextMatches = advance(play.results);
  return {
    ...play,
    roundIndex: play.roundIndex + 1,
    matches: nextMatches,
    cpuPicks: cpuPicks(nextMatches, rng),
    matchIndex: 0,
    playerPicks: [],
    results: [],
    committedPlayer,
    committedCpu,
  };
}

/** The Round currently being played. */
export function currentRound(play: Playthrough): Round {
  return ROUNDS[play.roundIndex];
}

/** The Match the cursor is on. */
export function currentMatch(play: Playthrough): Match {
  return play.matches[play.matchIndex];
}

/** The current Match's result, or null while it still awaits a Pick. */
export function currentResult(play: Playthrough): MatchResult | null {
  return play.results[play.matchIndex] ?? null;
}

/** The Player's Pick for the current Match, or null before they Pick. */
export function currentPlayerPick(play: Playthrough): Team | null {
  return play.playerPicks[play.matchIndex] ?? null;
}

/** The CPU's Pick for the current Match (drawn up front for the Round). */
export function currentCpuPick(play: Playthrough): Team {
  return play.cpuPicks[play.matchIndex];
}

/** Whether the current Match has been resolved (a Pick has been made). */
export function isResolved(play: Playthrough): boolean {
  return play.results.length > play.matchIndex;
}

/** Whether the cursor is on the last Match of the current Round. */
export function isLastMatch(play: Playthrough): boolean {
  return play.matchIndex === play.matches.length - 1;
}

/** Whether the current Round is the Final. */
export function isFinalRound(play: Playthrough): boolean {
  return play.roundIndex === ROUNDS.length - 1;
}

/**
 * The live Score: points banked from prior Rounds plus the current Round scored
 * over only its first `revealed` results. The reveal count lets the caller hold
 * a Match out of the Score until its dice have visibly settled; it defaults to
 * every resolved Match. Once finished, the banked totals stand on their own.
 */
export function scores(
  play: Playthrough,
  revealed: number = play.results.length,
): { player: number; cpu: number } {
  if (play.finished) {
    return { player: play.committedPlayer, cpu: play.committedCpu };
  }
  const score = scoreRound(
    currentRound(play),
    play.results.slice(0, revealed),
    play.playerPicks.slice(0, revealed),
    play.cpuPicks,
  );
  return {
    player: play.committedPlayer + score.playerPoints,
    cpu: play.committedCpu + score.cpuPoints,
  };
}
