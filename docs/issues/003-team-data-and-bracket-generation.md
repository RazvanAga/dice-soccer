Issue: https://github.com/RazvanAga/dice-soccer/issues/3

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

Team data plus Bracket generation, made visible. Hardcode the 32 national Teams
in FIFA-ranking order, each with a flag and a Rank (1–32). The Tournament engine —
a pure module with an injectable RNG — builds a Bracket: random first-Round
Pairings, then a fixed single-elimination tree. After START, show the first Round
(16-imi) as a two-column list of the 16 Matches with a Round-name indicator.

Use the glossary terms (Team, Rank, Favorite, Bracket, Pairing, Round, Match).

## Acceptance criteria

- [ ] 32 Teams hardcoded with flag + Rank, in FIFA order
- [ ] Engine builds a Bracket: random first-Round Pairings, fixed tree, from an injectable RNG
- [ ] START shows the 16 first-Round Matches as a two-column list with a Round indicator ("16-imi")
- [ ] A fixed seed produces a deterministic Bracket (test)
- [ ] Tests cover Bracket construction: 32 Teams used exactly once, 16 valid Matches

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/2

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Team data + Bracket generation with first-Round two-column display".
