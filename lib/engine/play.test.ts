import { describe, it, expect } from "vitest";
import {
  currentMatch,
  isResolved,
  next,
  pick,
  scores,
  startPlaythrough,
  type Playthrough,
} from "./play";
import { createSeededRng } from "./rng";
import { ROUNDS } from "./rounds";
import { TEAMS } from "./teams";
import type { Match, Team } from "./types";

/** The most points a participant can score: every Match correct, each Round. */
const MAX_SCORE = ROUNDS.reduce((s, r) => s + r.matches * r.points, 0); // 57

/** Drive a Playthrough to the end, choosing each Pick with `choose`. */
function playOut(
  rng: () => number,
  choose: (match: Match) => Team,
): { final: Playthrough; roundSizes: number[] } {
  let play = startPlaythrough(rng);
  const roundSizes: number[] = [];
  let seenRound = -1;
  while (!play.finished) {
    if (play.roundIndex !== seenRound) {
      roundSizes.push(play.matches.length);
      seenRound = play.roundIndex;
    }
    play = pick(play, choose(currentMatch(play)), rng);
    play = next(play, rng);
  }
  return { final: play, roundSizes };
}

const pickFavorite = (m: Match) => m.favorite;

describe("startPlaythrough", () => {
  it("opens on the first Match of a 16-Match first Round with a clean slate", () => {
    const play = startPlaythrough(createSeededRng(1));
    expect(play.roundIndex).toBe(0);
    expect(play.matches).toHaveLength(16);
    expect(play.cpuPicks).toHaveLength(16);
    expect(play.matchIndex).toBe(0);
    expect(play.playerPicks).toHaveLength(0);
    expect(play.results).toHaveLength(0);
    expect(play.finished).toBe(false);
    expect(play.champion).toBeNull();
    expect(scores(play)).toEqual({ player: 0, cpu: 0 });
  });
});

describe("pick / next cursor", () => {
  it("resolves the current Match on pick and steps forward on next", () => {
    let play = startPlaythrough(createSeededRng(2));
    expect(isResolved(play)).toBe(false);

    play = pick(play, currentMatch(play).favorite, createSeededRng(2));
    expect(isResolved(play)).toBe(true);
    expect(play.results).toHaveLength(1);
    expect(play.matchIndex).toBe(0);

    play = next(play, createSeededRng(2));
    expect(play.matchIndex).toBe(1);
    expect(isResolved(play)).toBe(false);
  });

  it("ignores a second pick on the same Match and next before a pick", () => {
    const rng = createSeededRng(3);
    const start = startPlaythrough(rng);
    expect(next(start, rng)).toBe(start); // nothing resolved yet

    const picked = pick(start, currentMatch(start).favorite, rng);
    expect(pick(picked, currentMatch(picked).underdog, rng)).toBe(picked);
  });
});

describe("a full Playthrough", () => {
  it("walks all five Rounds, then finishes with one champion from the roster", () => {
    const { final, roundSizes } = playOut(createSeededRng(2024), pickFavorite);
    expect(roundSizes).toEqual([16, 8, 4, 2, 1]);
    expect(final.finished).toBe(true);
    expect(final.champion).not.toBeNull();
    expect(TEAMS.map((t) => t.rank)).toContain(final.champion!.rank);
  });

  it("banks each side's Score within 0..57", () => {
    const { final } = playOut(createSeededRng(77), pickFavorite);
    const { player, cpu } = scores(final);
    expect(player).toBe(final.committedPlayer);
    expect(cpu).toBe(final.committedCpu);
    for (const total of [player, cpu]) {
      expect(total).toBeGreaterThanOrEqual(0);
      expect(total).toBeLessThanOrEqual(MAX_SCORE);
    }
  });

  it("replays identically from a fixed seed and Pick strategy", () => {
    const a = playOut(createSeededRng(42), pickFavorite).final;
    const b = playOut(createSeededRng(42), pickFavorite).final;
    expect(a).toEqual(b);
  });
});

describe("scores", () => {
  it("holds the just-resolved Match out of the Score until it is revealed", () => {
    // Pick the Favorite of the first Match, then read the Score with the result
    // hidden (revealed = 0) versus shown (revealed = 1).
    let play = startPlaythrough(createSeededRng(8));
    const favorite = currentMatch(play).favorite;
    play = pick(play, favorite, createSeededRng(8));

    const hidden = scores(play, play.results.length - 1);
    expect(hidden).toEqual({ player: 0, cpu: 0 });

    const shown = scores(play, play.results.length);
    const favoriteWon = play.results[0].winner === favorite;
    expect(shown.player).toBe(favoriteWon ? ROUNDS[0].points : 0);
  });
});
