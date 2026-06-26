Issue: https://github.com/RazvanAga/dice-soccer/issues/6

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

Player prediction and scoring. Before each Round's dice, the Player makes a Pick
for every Match via full-screen cards (one Match per screen; tapping a Team records
the Pick). Picks are made only among the actual survivors of the previous Round.
After the Round resolves, correct Picks score their Round's value: 16-imi 1, Optimi
2, Sferturi 3, Semifinale 4, Finală 5. The Player's running Score is displayed.

## Acceptance criteria

- [ ] Each Round, the Player Picks every Match via full-screen cards (one Match per screen, tap to choose)
- [ ] Picks are offered only among the real survivors of the prior Round
- [ ] Correct Picks award the Round's value (1→5); the Player's Score accumulates and is shown
- [ ] Engine computes Score deterministically given a seed + a sequence of Picks (test)
- [ ] Tests cover per-Round point values and cumulative Player Score

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/5

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Player prediction cards with per-Round scoring".
