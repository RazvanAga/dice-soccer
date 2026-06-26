Issue: https://github.com/RazvanAga/dice-soccer/issues/7

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

The CPU opponent with live scoring and result attribution. The CPU makes its own
Pick for every Match, chosen uniformly at random (50/50), hidden during prediction
and play. A score bar at the top always shows "TU x – y CPU", updated after each
Round. On the reveal, each Match is marked ✓/✗ for both the Player and the CPU so
the Player sees exactly why the Score changed.

## Acceptance criteria

- [ ] CPU makes a random (50/50) Pick for every Match, hidden until reveal
- [ ] Live "TU x – y CPU" score bar at the top, updated after each Round
- [ ] On reveal, each Match shows ✓/✗ for both Player and CPU
- [ ] Both Scores accumulate correctly across the Tournament
- [ ] Tests cover CPU Score accumulation and ✓/✗ attribution for both participants

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/6

---

Finish by creating a commit whose message describes what was achieved, e.g.
"CPU opponent with live score bar and per-Match result attribution".
