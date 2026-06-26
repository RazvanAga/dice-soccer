import { describe, it, expect } from "vitest";
import { createBracket } from "./bracket";
import { createSeededRng } from "./rng";
import { TEAMS } from "./teams";

describe("createBracket", () => {
  it("forms exactly 16 first-Round Matches", () => {
    const bracket = createBracket(createSeededRng(1));
    expect(bracket.firstRound).toHaveLength(16);
  });

  it("uses all 32 Teams exactly once", () => {
    const bracket = createBracket(createSeededRng(7));
    const used = bracket.firstRound.flatMap((match) => [
      match.favorite,
      match.underdog,
    ]);
    expect(used).toHaveLength(32);
    const ranks = new Set(used.map((team) => team.rank));
    expect(ranks.size).toBe(32);
    expect(new Set(TEAMS.map((t) => t.rank))).toEqual(ranks);
  });

  it("makes the lower-Rank Team the Favorite in every Match", () => {
    const bracket = createBracket(createSeededRng(99));
    for (const match of bracket.firstRound) {
      expect(match.favorite.rank).toBeLessThan(match.underdog.rank);
    }
  });

  it("is deterministic for a fixed seed", () => {
    const a = createBracket(createSeededRng(2024));
    const b = createBracket(createSeededRng(2024));
    expect(a).toEqual(b);
  });

  it("produces different Pairings for different seeds", () => {
    const a = createBracket(createSeededRng(1));
    const b = createBracket(createSeededRng(2));
    expect(a).not.toEqual(b);
  });
});
