# Dice Soccer

A mobile-only game where a player predicts the winners of a 32-team knockout
tournament whose matches are decided by dice, competing against the CPU on who
predicts more outcomes correctly.

Canonical terms are English (aligned with the code); the Romanian UI label is
noted where it differs.

## Language

### Participants

**Player**:
The human playing the game. UI label: "TU".
_Avoid_: User, human.

**CPU**:
The automated opponent. It makes its own hidden Picks (uniformly random, 50/50)
and competes with the Player on Score. UI label: "CPU".
_Avoid_: Computer, opponent, AI, bot.

### Teams

**Team**:
One of the 32 national teams in the tournament. Identified by a flag and a Rank.
_Avoid_: Club, country, nation.

**Rank**:
A Team's fixed position 1–32 (from the FIFA ranking), where 1 is strongest. Used
only to decide the Favorite within a Match.
_Avoid_: Seed, rating, position.

**Favorite**:
The better-ranked (lower Rank number) of the two Teams in a Match. Rolls a die
valued 2–6, giving it a ~71% chance to win.
_Avoid_: Stronger team.

**Underdog**:
The worse-ranked of the two Teams in a Match. Rolls a die valued 1–5.
_Avoid_: Weaker team, outsider.

### Tournament structure

**Tournament**:
A single playthrough: one Bracket of 32 Teams played from 16-imi to the Final,
ending in a final Score comparison. Replaying starts a fresh Tournament.
_Avoid_: Game, session, run.

**Playthrough**:
The moment-to-moment state of a Tournament in progress, advanced one Match at a
time: the Player Picks a winner, the dice resolve that Match, then the cursor
steps to the next Match — or, after a Round's last Match, banks its points and
advances the survivors. A whole Tournament is one Playthrough run to completion.
_Avoid_: Game state, session, run.

**Bracket**:
The fixed single-elimination tree of 32 Teams. The first-round Pairings are
random; from there the tree is fixed (winners advance to predetermined slots).
_Avoid_: Draw, tree, ladder.

**Pairing**:
The assignment of two Teams to face each other in the first Round. Random at the
start of each Tournament.
_Avoid_: Seeding, matchup.

**Round**:
One stage of the Bracket. Five Rounds, each worth escalating points:
16-imi (16 Matches, 1 pt), Optimi (8, 2 pts), Sferturi (4, 3 pts),
Semifinale (2, 4 pts), Final (1, 5 pts).
_Avoid_: Stage, level, phase.

**Match**:
A single contest between a Favorite and an Underdog, resolved by one Roll each.
Never a draw — equal Rolls are re-rolled until one Team is higher.
_Avoid_: Game, fixture, tie.

**Roll**:
The die value a Team receives in a Match (Favorite 2–6, Underdog 1–5). The higher
Roll wins the Match.
_Avoid_: Dice number, score (of a match).

### Prediction & scoring

**Pick**:
The Player's (or CPU's) chosen winner for a single Match, made before the Round's
Rolls. The Player makes Picks round-by-round, only among the real survivors of the
previous Round.
_Avoid_: Prediction, bet, guess, choice.

**Score**:
A participant's accumulated points from correct Picks across the Tournament. Each
correct Pick is worth its Round's value (1→5). Shown live as "TU x – y CPU".
Player maximum is 57.
_Avoid_: Points (as a standalone term), total.
