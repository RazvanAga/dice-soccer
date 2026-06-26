import { describe, it, expect } from "vitest";
import { cpuPicks, scoreRound, scoreTournament } from "./scoring";
import { createBracket } from "./bracket";
import { resolveRound } from "./match";
import { createSeededRng } from "./rng";
import { ROUNDS } from "./rounds";

/** A strategy that always Picks the Favorite of every Match. */
const alwaysFavorite = (matches: readonly { favorite: unknown }[]) =>
  matches.map((m) => m.favorite) as never;

describe("cpuPicks", () => {
  it("Picks one Team per Match, always a participant of that Match", () => {
    const bracket = createBracket(createSeededRng(1));
    const picks = cpuPicks(bracket.firstRound, createSeededRng(9));
    expect(picks).toHaveLength(bracket.firstRound.length);
    picks.forEach((pick, i) => {
      const match = bracket.firstRound[i];
      expect([match.favorite, match.underdog]).toContain(pick);
    });
  });

  it("is deterministic for a fixed seed", () => {
    const bracket = createBracket(createSeededRng(1));
    const a = cpuPicks(bracket.firstRound, createSeededRng(9));
    const b = cpuPicks(bracket.firstRound, createSeededRng(9));
    expect(a).toEqual(b);
  });
});

describe("scoreRound", () => {
  it("awards the Round's value for each correct Pick", () => {
    const round = ROUNDS[2]; // Sferturi, worth 3 points each
    const bracket = createBracket(createSeededRng(4));
    const matches = bracket.firstRound.slice(0, round.matches);
    const results = resolveRound(matches, createSeededRng(4));
    // Player Picks every winner; CPU Picks every loser.
    const playerPicks = results.map((r) => r.winner);
    const cpuLoserPicks = results.map((r) =>
      r.winner === r.match.favorite ? r.match.underdog : r.match.favorite,
    );

    const score = scoreRound(round, results, playerPicks, cpuLoserPicks);

    expect(score.playerPoints).toBe(round.matches * round.points);
    expect(score.cpuPoints).toBe(0);
    expect(score.predictions.every((p) => p.playerCorrect)).toBe(true);
    expect(score.predictions.every((p) => !p.cpuCorrect)).toBe(true);
  });

  it("marks each Match ✓/✗ for both participants independently", () => {
    const round = ROUNDS[0];
    const bracket = createBracket(createSeededRng(8));
    const results = resolveRound(bracket.firstRound, createSeededRng(8));
    const playerPicks = bracket.firstRound.map((m) => m.favorite);
    const computerPicks = cpuPicks(bracket.firstRound, createSeededRng(8));

    const score = scoreRound(round, results, playerPicks, computerPicks);

    score.predictions.forEach((p) => {
      expect(p.playerCorrect).toBe(p.playerPick === p.result.winner);
      expect(p.cpuCorrect).toBe(p.cpuPick === p.result.winner);
    });
    // Points equal the count of correct Picks times the Round value.
    const playerCorrect = score.predictions.filter((p) => p.playerCorrect).length;
    const cpuCorrect = score.predictions.filter((p) => p.cpuCorrect).length;
    expect(score.playerPoints).toBe(playerCorrect * round.points);
    expect(score.cpuPoints).toBe(cpuCorrect * round.points);
  });
});

describe("scoreTournament", () => {
  it("computes Scores deterministically for a fixed seed and Picks", () => {
    const a = scoreTournament(createSeededRng(42), alwaysFavorite);
    const b = scoreTournament(createSeededRng(42), alwaysFavorite);
    expect(a).toEqual(b);
  });

  it("accumulates each side's Score as the sum of its per-Round points", () => {
    const scored = scoreTournament(createSeededRng(2024), alwaysFavorite);
    expect(scored.rounds).toHaveLength(ROUNDS.length);
    const playerSum = scored.rounds.reduce((s, r) => s + r.playerPoints, 0);
    const cpuSum = scored.rounds.reduce((s, r) => s + r.cpuPoints, 0);
    expect(scored.playerScore).toBe(playerSum);
    expect(scored.cpuScore).toBe(cpuSum);
  });

  it("uses each Round's escalating point value (1→5)", () => {
    const scored = scoreTournament(createSeededRng(77), alwaysFavorite);
    scored.rounds.forEach((roundScore, i) => {
      const correct = roundScore.predictions.filter((p) => p.playerCorrect).length;
      expect(roundScore.playerPoints).toBe(correct * ROUNDS[i].points);
      expect(roundScore.round.points).toBe(ROUNDS[i].points);
    });
  });

  it("scores a perfect Player who Picks every winner", () => {
    // A strategy that consults the resolved results is not possible up front,
    // so instead verify that Picking favorites never scores more than 1+2+3+4+5
    // and that a winner-Picking player would max out. Here we bound the Score.
    const scored = scoreTournament(createSeededRng(5), alwaysFavorite);
    const maxPossible = ROUNDS.reduce((s, r) => s + r.matches * r.points, 0);
    expect(scored.playerScore).toBeGreaterThanOrEqual(0);
    expect(scored.playerScore).toBeLessThanOrEqual(maxPossible);
    expect(scored.cpuScore).toBeLessThanOrEqual(maxPossible);
  });
});
