"use client";

import { useState } from "react";
import {
  createBracket,
  createSeededRng,
  ROUNDS,
  type Match,
  type Team,
} from "@/lib/engine";

function TeamRow({ team, favorite }: { team: Team; favorite: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-base leading-none" aria-hidden>
        {team.flag}
      </span>
      <span
        className={`flex-1 truncate text-sm ${
          favorite ? "text-foreground font-semibold" : "text-muted"
        }`}
      >
        {team.name}
      </span>
      <span className="text-muted/70 text-[0.65rem] tabular-nums">
        #{team.rank}
      </span>
    </div>
  );
}

function MatchCard({ match, index }: { match: Match; index: number }) {
  return (
    <li className="bg-surface flex flex-col gap-1.5 rounded-xl p-3">
      <span className="text-muted/60 text-[0.6rem] font-medium tracking-widest">
        {index}
      </span>
      <TeamRow team={match.favorite} favorite />
      <TeamRow team={match.underdog} favorite={false} />
    </li>
  );
}

export default function BracketScreen({ onBack }: { onBack: () => void }) {
  // Build one Bracket per Tournament from a random seed; the seed makes the
  // Pairings reproducible while the engine stays deterministic.
  const [bracket] = useState(() =>
    createBracket(createSeededRng((Math.random() * 0xffffffff) >>> 0)),
  );
  const round = ROUNDS[0];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4">
      <header className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-muted text-sm underline underline-offset-4"
        >
          Înapoi
        </button>
        <span className="bg-accent/15 text-accent rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
          {round.name}
        </span>
      </header>

      <ol className="grid grid-cols-2 gap-2">
        {bracket.firstRound.map((match, i) => (
          <MatchCard key={i} match={match} index={i + 1} />
        ))}
      </ol>
    </main>
  );
}
