# PRD-01: Dice Soccer — core game

Terms are used as defined in [CONTEXT.md](CONTEXT.md) (Player, CPU, Team, Rank,
Favorite, Underdog, Tournament, Bracket, Pairing, Round, Match, Roll, Pick, Score).

## Problem Statement

I want a quick, fun thing to do on my phone: predict who wins a knockout football
tournament and see if my instincts beat random chance. Watching real tournaments,
I always think "I could have called that bracket better" — I want a fast, low-stakes
way to test that feeling in under a couple of minutes, with the drama of an
unpredictable result every time.

## Solution

A mobile-only web game. The Player predicts, Round by Round, the winners of a
32-Team national-team knockout Tournament. Each Match is decided by weighted dice:
the higher-ranked Team (the Favorite) has an edge but upsets happen ~29% of the
time. The CPU makes its own hidden Picks. After each Round the dice reveal the real
winners, both participants' Picks are scored, and the live Score updates. At the end
the Player sees their Score versus the CPU's and can instantly play a fresh
Tournament.

## User Stories

1. As a Player, I want a single big START button on entry, so that I can begin without any setup or instructions.
2. As a Player, I want the app to work and look right on my phone, so that I never have to think about desktop layout.
3. As a Player, I want a dark theme, so that the game feels premium and the flags stand out.
4. As a Player, I want the 32 strongest national teams in the Tournament, so that the matchups feel meaningful and recognizable.
5. As a Player, I want each Team shown with its flag, so that I can recognize teams at a glance without reading.
6. As a Player, I want the first-Round Pairings to be random each Tournament, so that every playthrough is different.
7. As a Player, I want to predict Round by Round among the teams that actually survived, so that my later Picks reflect what really happened, not a guess locked in at the start.
8. As a Player, I want to make my Pick for one Match at a time on a full-screen card, so that the choice is easy to tap and uncluttered on a small screen.
9. As a Player, I want to tap the Team I think will win on each card, so that making a Pick is a single deliberate action.
10. As a Player, I want to move through all Matches of the current Round before the dice roll, so that I commit my whole Round at once.
11. As a Player, I want to see a Bracket view after I've made my Picks, so that I can see the whole Round laid out before playing it.
12. As a Player, I want the Bracket shown as a per-Round two-column list with a Round indicator (16-imi → Final), so that I can read it comfortably on my phone.
13. As a Player, I want two dice and a JOACĂ button at the top of the Bracket screen, so that it's obvious how to play the Round.
14. As a Player, I want one tap on JOACĂ to resolve the entire Round, so that I don't have to tap through 16 separate Matches.
15. As a Player, I want the results to reveal sequentially with a quick animation, so that there's drama even though one tap resolves everything.
16. As a Player, I want each Team's Roll shown next to it, so that I can see how each Match was decided.
17. As a Player, I want the Favorite to have a real but beatable edge, so that picking the stronger team is smart but upsets still thrill me.
18. As a Player, I want no Match to ever end in a draw, so that every Match produces a winner that advances.
19. As a Player, I want winners to advance to fixed slots in the Bracket, so that the Tournament feels like a real knockout.
20. As a Player, I want to earn more points for correct Picks in later Rounds (1→2→3→4→5), so that the stakes rise as the Tournament progresses.
21. As a Player, I want my Score and the CPU's Score always visible at the top (e.g. "TU 7 – 4 CPU"), so that I always know how I'm doing against the opponent.
22. As a Player, I want the Score to update after each Round, so that I get immediate feedback on how that Round went.
23. As a Player, I want to compete against a CPU that makes its own Picks, so that there's an opponent to beat, not just a solo score.
24. As a Player, I want the CPU's Picks hidden during prediction and play, so that the prediction screen stays clean and I'm not influenced.
25. As a Player, I want the CPU's Picks revealed at the result (✓/✗ for both me and CPU on each Match), so that I understand exactly why the Score changed.
26. As a Player, I want a final screen showing my total Score versus the CPU's, so that I know who won the Tournament.
27. As a Player, I want a "Joacă din nou" button on the final screen, so that I can immediately start another Tournament.
28. As a Player, I want "Joacă din nou" to build a completely new Bracket with fresh random Pairings, so that the next game isn't a rerun.
29. As a Player, I want replay to drop me straight into the first prediction Round (skipping the START splash), so that I get back into the action with one tap.
30. As a Player, I want the START splash only on first entry, so that the front door isn't in my way on every replay.
31. As a Player, I want satisfying dice animations, so that playing a Round feels good and not flat.
32. As a Player, I want the game to be fast end-to-end (a Tournament in ~1–2 minutes), so that it fits a short break.

## Implementation Decisions

- **Stack & hosting.** Next.js + Tailwind CSS, deployed free on Vercel. Mobile-only; no desktop layout work. Dark theme, minimalist with a "sport" accent. No backend, no persistence — the entire game runs client-side and is stateless across sessions.
- **Team data.** The 32 Teams are hardcoded national teams in FIFA-ranking order. Each Team carries a flag (Unicode emoji or free SVG) and a Rank 1–32. Rank is used only to determine the Favorite within a Match. National teams + flags are used instead of clubs + logos specifically to avoid trademark/licensing issues (see proposed ADR-0001).
- **Tournament engine (the test seam).** A pure, framework-agnostic module owns all game logic: building the Bracket, resolving Matches, advancing winners, and scoring. It takes an injectable RNG so a seed yields a fully deterministic Tournament. The React layer is a thin view/controller over this engine.
- **Bracket.** 32 Teams, random first-Round Pairings, then a fixed single-elimination tree. Five Rounds: 16-imi (16 Matches), Optimi (8), Sferturi (4), Semifinale (2), Final (1). Winner of a Match advances to a predetermined parent slot.
- **Match resolution (dice rule).** Within a Match, the Favorite (lower Rank) draws a Roll uniformly from {2,3,4,5,6}; the Underdog draws uniformly from {1,2,3,4,5}. Equal Rolls are re-rolled until unequal — no draws. This yields the Favorite a ~71% win probability (15/21 after removing ties).
- **Prediction model (round-by-round).** The Player makes Picks one Round at a time, choosing among the actual survivors of the previous Round. Prediction UI is full-screen cards, one Match per screen; tapping a Team records the Pick. After all Matches of the Round are Picked, the Bracket/play screen is shown.
- **CPU.** The CPU makes its own Pick for every Match, chosen uniformly at random (50/50), ignoring Rank. CPU Picks are hidden until the result reveal. Because the Player can favor Favorites and the CPU cannot, the Player has a genuine long-run edge.
- **Round play & reveal.** The Bracket screen shows the current Round as a two-column list with a Round-name indicator, two dice, and a JOACĂ button. One tap on JOACĂ resolves every Match in the Round; results reveal sequentially via a quick animation (dice roll once, then numbers "scatter" into the Matches). On reveal, each Match is marked ✓/✗ for both Player and CPU.
- **Scoring.** Each correct Pick is worth its Round's value: 16-imi 1, Optimi 2, Sferturi 3, Semifinale 4, Final 5. Scores accumulate for both participants and are shown live at the top as "TU x – y CPU", updated after each Round. Player maximum is 57 (16·1 + 8·2 + 4·3 + 2·4 + 1·5).
- **Flow & state.** App states: START splash (first entry only) → per-Round prediction (cards) → Round play/reveal (Bracket) → repeat for 5 Rounds → final Score screen. "Joacă din nou" constructs a brand-new Tournament (fresh random Pairings) and enters the first prediction Round directly, bypassing the splash.

## Testing Decisions

- **What makes a good test here.** Tests assert external behavior of the Tournament engine — given a seed and a sequence of Picks, the produced winners, advancement, and final Scores are exact — not internal structure or React rendering. No assertions on animation timing, DOM layout, or private helpers.
- **Primary seam.** The pure Tournament engine with an injectable RNG. This is the highest seam that still controls end-to-end behavior: a fixed seed plus given Picks deterministically drives a whole Tournament.
- **Modules tested.** The engine: Bracket construction (32 Teams, valid random Pairing, fixed tree), the dice rule (Favorite 2–6 / Underdog 1–5, re-roll on tie, never a draw, ~71% Favorite win rate over many seeds), winner advancement through all five Rounds, and scoring (per-Round point values, cumulative Player and CPU Score, correct ✓/✗ attribution).
- **Statistical checks.** The ~71% Favorite win rate and the CPU's 50/50 behavior are verified by running many seeded Matches and asserting the rate falls in an expected band, rather than asserting any single outcome.
- **Lower-value UI tests (optional).** A few component tests for the prediction card (tap records a Pick) and the reveal (✓/✗ shown for both). These are secondary to the engine tests.
- **Prior art.** None yet — this is a greenfield repo. These engine tests establish the pattern (pure logic + injected RNG + seeded determinism) for future work.

## Out of Scope

- Persistence of any kind: best-score, stats, win/loss history, leaderboards (candidate v2 via `localStorage`).
- Weighted dice tuning beyond the fixed 2–6 / 1–5 rule; configurable difficulty.
- Club teams and club logos.
- A full graphical Bracket tree with connector lines / zoom (per-Round two-column list is used instead; tree is candidate v2).
- Desktop/tablet layouts, accessibility beyond basic, internationalization beyond the Romanian UI.
- Accounts, multiplayer, sharing, sound design.
- Seeded (1-vs-32) first-Round Pairings — Pairings are random.

## Further Notes

- Glossary lives in [CONTEXT.md](CONTEXT.md); keep code identifiers aligned with its English canonical terms while UI strings stay Romanian (TU, CPU, JOACĂ, 16-imi/Optimi/Sferturi/Semifinale/Finală, Joacă din nou).
- A proposed ADR-0001 ("national teams over clubs") records the trademark-avoidance rationale; not yet written.
- Round naming maps to team counts: 16-imi = 32 Teams/16 Matches, Optimi = 16/8, Sferturi = 8/4, Semifinale = 4/2, Final = 2/1.
