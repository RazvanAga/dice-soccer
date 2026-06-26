Issue: https://github.com/RazvanAga/dice-soccer/issues/8

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

The end screen and replay loop. After the Final, show a final screen comparing the
Player's total Score with the CPU's (who won). A "Joacă din nou" button starts a
brand-new Tournament with fresh random Pairings and drops the Player straight into
the first prediction Round, bypassing the START splash. The START splash appears
only on first entry to the app.

## Acceptance criteria

- [ ] Final screen shows Player total Score vs CPU total Score and the winner
- [ ] "Joacă din nou" builds a completely new Bracket (fresh random Pairings)
- [ ] Replay enters the first prediction Round directly, skipping the START splash
- [ ] START splash is shown only on first app entry
- [ ] The full loop (play → final → replay) works end-to-end

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/7

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Final score screen and replay into a fresh Tournament".
