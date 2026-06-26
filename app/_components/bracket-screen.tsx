"use client";

import { useEffect, useState } from "react";
import {
  advance,
  createBracket,
  createSeededRng,
  resolveRound,
  ROUNDS,
  type Match,
  type MatchResult,
  type Team,
} from "@/lib/engine";

const DICE_FACES = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

function TeamRow({
  team,
  favorite,
  roll,
  winner,
  revealed,
}: {
  team: Team;
  favorite: boolean;
  roll: number | undefined;
  winner: boolean;
  revealed: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-1 py-0.5 transition-colors ${
        winner ? "bg-accent/15" : ""
      }`}
    >
      <span className="text-base leading-none" aria-hidden>
        {team.flag}
      </span>
      <span
        className={`flex-1 truncate text-sm ${
          winner
            ? "text-foreground font-semibold"
            : favorite && !revealed
              ? "text-foreground"
              : "text-muted"
        }`}
      >
        {team.name}
      </span>
      {revealed ? (
        <span
          className={`text-sm font-bold tabular-nums ${
            winner ? "text-accent" : "text-muted"
          }`}
        >
          {roll}
        </span>
      ) : (
        <span className="text-muted/70 text-[0.65rem] tabular-nums">
          #{team.rank}
        </span>
      )}
    </div>
  );
}

function MatchCard({
  match,
  index,
  result,
  revealed,
}: {
  match: Match;
  index: number;
  result: MatchResult | null;
  revealed: boolean;
}) {
  const favoriteWon = revealed && result?.winner === match.favorite;
  const underdogWon = revealed && result?.winner === match.underdog;
  return (
    <li className="bg-surface flex flex-col gap-1 rounded-xl p-3">
      <span className="text-muted/60 text-[0.6rem] font-medium tracking-widest">
        {index}
      </span>
      <TeamRow
        team={match.favorite}
        favorite
        roll={result?.favoriteRoll}
        winner={favoriteWon}
        revealed={revealed}
      />
      <TeamRow
        team={match.underdog}
        favorite={false}
        roll={result?.underdogRoll}
        winner={underdogWon}
        revealed={revealed}
      />
    </li>
  );
}

export default function BracketScreen({ onBack }: { onBack: () => void }) {
  // Build one Bracket per Tournament from a random seed; the seed makes the
  // Pairings reproducible while the engine stays deterministic.
  const [bracket] = useState(() => createBracket(createSeededRng(randomSeed())));
  const [roundIndex, setRoundIndex] = useState(0);
  const [matches, setMatches] = useState<readonly Match[]>(
    () => bracket.firstRound,
  );
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [face, setFace] = useState(0);

  const round = ROUNDS[roundIndex];
  const isFinal = roundIndex === ROUNDS.length - 1;
  const rolling = results !== null && revealed < results.length;
  const roundDone = results !== null && revealed >= results.length;
  const champion = isFinal && roundDone ? results![0].winner : null;

  // Reveal the Matches one by one for a quick sequential animation.
  useEffect(() => {
    if (!results || revealed >= results.length) return;
    const id = setTimeout(() => setRevealed((n) => n + 1), 110);
    return () => clearTimeout(id);
  }, [results, revealed]);

  // Tumble the two dice while results are still being revealed.
  useEffect(() => {
    if (!rolling) return;
    const id = setInterval(() => setFace((f) => (f + 1) % DICE_FACES.length), 90);
    return () => clearInterval(id);
  }, [rolling]);

  function play() {
    setResults(resolveRound(matches, createSeededRng(randomSeed())));
    setRevealed(0);
  }

  function nextRound() {
    if (!results) return;
    setMatches(advance(results));
    setRoundIndex((r) => r + 1);
    setResults(null);
    setRevealed(0);
  }

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

      {champion ? (
        <div className="bg-surface flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-black">
          <span aria-hidden>🏆</span>
          <span className="text-2xl" aria-hidden>
            {champion.flag}
          </span>
          <span>{champion.name}</span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div
            className={`flex gap-1 text-3xl leading-none ${
              rolling ? "animate-bounce" : ""
            }`}
            aria-hidden
          >
            <span>{DICE_FACES[face]}</span>
            <span>{DICE_FACES[(face + 3) % DICE_FACES.length]}</span>
          </div>
          <button
            onClick={roundDone ? nextRound : play}
            disabled={rolling}
            className="bg-accent active:bg-accent-strong flex-1 rounded-2xl py-3 text-lg font-black tracking-wide text-black transition-colors disabled:opacity-40"
          >
            {roundDone ? "RUNDA URMĂTOARE" : "JOACĂ"}
          </button>
        </div>
      )}

      <ol className="grid grid-cols-2 gap-2">
        {matches.map((match, i) => (
          <MatchCard
            key={`${roundIndex}-${i}`}
            match={match}
            index={i + 1}
            result={results?.[i] ?? null}
            revealed={results !== null && i < revealed}
          />
        ))}
      </ol>
    </main>
  );
}
