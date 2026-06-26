import { describe, it, expect } from "vitest";
import { TEAMS } from "./teams";

describe("TEAMS", () => {
  it("has exactly 32 Teams", () => {
    expect(TEAMS).toHaveLength(32);
  });

  it("covers Ranks 1–32 with no gaps or duplicates", () => {
    const ranks = TEAMS.map((team) => team.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(Array.from({ length: 32 }, (_, i) => i + 1));
  });

  it("is listed in ascending Rank order (FIFA order)", () => {
    const ranks = TEAMS.map((team) => team.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("gives every Team a name and a flag", () => {
    for (const team of TEAMS) {
      expect(team.name.length).toBeGreaterThan(0);
      expect(team.flag.length).toBeGreaterThan(0);
    }
  });
});
