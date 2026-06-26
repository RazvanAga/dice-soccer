Issue: https://github.com/RazvanAga/dice-soccer/issues/5

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

Advancement through all five Rounds. The engine advances Match winners into their
predetermined parent slots on the fixed tree; after a Round resolves, the Bracket
view updates to the next Round's survivors, with the Round-name indicator stepping
through 16-imi → Optimi → Sferturi → Semifinale → Finală. Playing continues to a
single champion. No prediction or scoring yet.

## Acceptance criteria

- [ ] Winners advance to fixed parent slots; the Bracket updates each Round
- [ ] Round indicator steps correctly: 16-imi (16) → Optimi (8) → Sferturi (4) → Semifinale (2) → Finală (1)
- [ ] Playing all Rounds yields exactly one champion
- [ ] A fixed seed plays a full Tournament deterministically (test)
- [ ] Tests cover advancement across all five Rounds to a single winner

## Blocked by

https://github.com/RazvanAga/dice-soccer/issues/4

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Advancement through all five Rounds to a champion".
