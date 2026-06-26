import { describe, it, expect } from "vitest";
import { resolveMatch, resolveRound } from "./match";
import { createBracket } from "./bracket";
import { createSeededRng } from "./rng";
import type { Match } from "./types";

const sampleMatch: Match = {
  favorite: { rank: 1, name: "Argentina", flag: "🇦🇷" },
  underdog: { rank: 32, name: "Türkiye", flag: "🇹🇷" },
};

describe("resolveMatch", () => {
  it("keeps the Favorite Roll in 2–6 and the Underdog Roll in 1–5", () => {
    const rng = createSeededRng(1);
    for (let i = 0; i < 5000; i++) {
      const { favoriteRoll, underdogRoll } = resolveMatch(sampleMatch, rng);
      expect(favoriteRoll).toBeGreaterThanOrEqual(2);
      expect(favoriteRoll).toBeLessThanOrEqual(6);
      expect(underdogRoll).toBeGreaterThanOrEqual(1);
      expect(underdogRoll).toBeLessThanOrEqual(5);
    }
  });

  it("never ends in a draw", () => {
    const rng = createSeededRng(2);
    for (let i = 0; i < 5000; i++) {
      const { favoriteRoll, underdogRoll } = resolveMatch(sampleMatch, rng);
      expect(favoriteRoll).not.toBe(underdogRoll);
    }
  });

  it("awards the win to the Team with the higher Roll", () => {
    const rng = createSeededRng(3);
    for (let i = 0; i < 5000; i++) {
      const result = resolveMatch(sampleMatch, rng);
      const expected =
        result.favoriteRoll > result.underdogRoll
          ? sampleMatch.favorite
          : sampleMatch.underdog;
      expect(result.winner).toBe(expected);
    }
  });

  it("lets the Favorite win ~71% of the time over many Matches", () => {
    const rng = createSeededRng(12345);
    const total = 50000;
    let favoriteWins = 0;
    for (let i = 0; i < total; i++) {
      if (resolveMatch(sampleMatch, rng).winner === sampleMatch.favorite) {
        favoriteWins++;
      }
    }
    const rate = favoriteWins / total;
    // Exact theoretical rate is 15/21 ≈ 0.714.
    expect(rate).toBeGreaterThan(0.7);
    expect(rate).toBeLessThan(0.73);
  });

  it("is deterministic for a fixed seed", () => {
    const a = resolveMatch(sampleMatch, createSeededRng(7));
    const b = resolveMatch(sampleMatch, createSeededRng(7));
    expect(a).toEqual(b);
  });
});

describe("resolveRound", () => {
  it("resolves one result per Match in the Round", () => {
    const bracket = createBracket(createSeededRng(1));
    const results = resolveRound(bracket.firstRound, createSeededRng(1));
    expect(results).toHaveLength(16);
    for (const result of results) {
      expect([result.match.favorite, result.match.underdog]).toContain(
        result.winner,
      );
    }
  });
});
