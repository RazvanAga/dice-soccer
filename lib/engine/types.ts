/** A national Team in the Tournament, identified by its flag and fixed Rank. */
export interface Team {
  /** Fixed position 1–32 from the FIFA ranking; 1 is strongest. */
  readonly rank: number;
  readonly name: string;
  /** Unicode flag emoji. */
  readonly flag: string;
}

/** A single contest between a Favorite and an Underdog, resolved by one Roll each. */
export interface Match {
  /** The better-ranked Team (lower Rank number); rolls a die valued 2–6. */
  readonly favorite: Team;
  /** The worse-ranked Team; rolls a die valued 1–5. */
  readonly underdog: Team;
}

/**
 * The fixed single-elimination tree of 32 Teams. The first-Round Pairings are
 * random; from there the tree is fixed. For this slice only the first Round is
 * populated — later Rounds are filled as winners advance.
 */
export interface Bracket {
  /** 16-imi: the 16 Matches formed by random first-Round Pairings. */
  readonly firstRound: readonly Match[];
}
