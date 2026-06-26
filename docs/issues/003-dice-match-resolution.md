Issue: https://github.com/RazvanAga/dice-soccer/issues/4

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

Dice resolution and reveal for a single Round. Add two dice and a JOACĂ button to
the top of the Bracket screen. One tap on JOACĂ resolves every Match in the current
Round via the engine: the Favorite draws a Roll from {2,3,4,5,6}, the Underdog from
{1,2,3,4,5}; equal Rolls are re-rolled until unequal (never a draw). Results reveal
sequentially with a quick animation; each Team's Roll is shown and winners are
highlighted.

Basic animation is fine — polished dice animation is a later slice.

## Acceptance criteria

- [ ] JOACĂ button + two dice shown atop the Bracket screen
- [ ] One tap resolves all Matches of the Round through the engine
- [ ] Favorite rolls 2–6, Underdog rolls 1–5; ties are re-rolled; no Match is ever a draw
- [ ] Results reveal sequentially; each Team's Roll is visible and the winner is highlighted
- [ ] Tests: dice rule correctness, no-draw guarantee, and Favorite win rate ~71% over many seeded Matches

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/3

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Dice Match resolution with sequential reveal for one Round".
