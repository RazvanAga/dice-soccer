/** One stage of the Bracket, with its Match count and per-correct-Pick points. */
export interface Round {
  readonly name: string;
  /** Number of Matches in this Round. */
  readonly matches: number;
  /** Points awarded for each correct Pick in this Round. */
  readonly points: number;
}

/** The five Rounds of the Bracket, in order, with escalating point values. */
export const ROUNDS: readonly Round[] = [
  { name: "16-imi", matches: 16, points: 1 },
  { name: "Optimi", matches: 8, points: 2 },
  { name: "Sferturi", matches: 4, points: 3 },
  { name: "Semifinale", matches: 2, points: 4 },
  { name: "Final", matches: 1, points: 5 },
];
