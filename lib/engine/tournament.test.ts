import { describe, it, expect } from "vitest";
import { advance, playTournament } from "./tournament";
import { resolveRound } from "./match";
import { createBracket } from "./bracket";
import { createSeededRng } from "./rng";
import { ROUNDS } from "./rounds";
import { TEAMS } from "./teams";

describe("advance", () => {
  it("halves the Matches, pairing consecutive winners", () => {
    const bracket = createBracket(createSeededRng(1));
    const results = resolveRound(bracket.firstRound, createSeededRng(1));
    const next = advance(results);
    expect(next).toHaveLength(8);
    next.forEach((match, i) => {
      const left = results[2 * i].winner;
      const right = results[2 * i + 1].winner;
      expect([match.favorite, match.underdog]).toContain(left);
      expect([match.favorite, match.underdog]).toContain(right);
    });
  });

  it("makes the lower-Rank survivor the Favorite", () => {
    const bracket = createBracket(createSeededRng(5));
    const next = advance(resolveRound(bracket.firstRound, createSeededRng(5)));
    for (const match of next) {
      expect(match.favorite.rank).toBeLessThan(match.underdog.rank);
    }
  });

  it("yields no Matches once a single winner remains", () => {
    const bracket = createBracket(createSeededRng(3));
    const finalResult = resolveRound([bracket.firstRound[0]], createSeededRng(3));
    expect(finalResult).toHaveLength(1);
    expect(advance(finalResult)).toHaveLength(0);
  });
});

describe("playTournament", () => {
  it("steps through all five Rounds with the right Match counts", () => {
    const play = playTournament(createSeededRng(2024));
    expect(play.rounds.map((r) => r.matches.length)).toEqual([16, 8, 4, 2, 1]);
    expect(play.rounds.map((r) => r.round.name)).toEqual(
      ROUNDS.map((r) => r.name),
    );
  });

  it("ends in exactly one champion drawn from the roster", () => {
    const play = playTournament(createSeededRng(77));
    expect(play.rounds).toHaveLength(5);
    expect(play.rounds[4].results).toHaveLength(1);
    expect(play.champion).toBe(play.rounds[4].results[0].winner);
    expect(TEAMS.map((t) => t.rank)).toContain(play.champion.rank);
  });

  it("plays a full Tournament deterministically for a fixed seed", () => {
    const a = playTournament(createSeededRng(42));
    const b = playTournament(createSeededRng(42));
    expect(a).toEqual(b);
    expect(a.champion).toEqual(b.champion);
  });

  it("can produce different champions for different seeds", () => {
    const champions = new Set(
      [1, 2, 3, 4, 5, 6, 7, 8].map(
        (seed) => playTournament(createSeededRng(seed)).champion.name,
      ),
    );
    expect(champions.size).toBeGreaterThan(1);
  });
});
