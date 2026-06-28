"use client";

import { useEffect, useState } from "react";
import {
  createSeededRng,
  currentCpuPick,
  currentMatch,
  currentPlayerPick,
  currentResult,
  currentRound,
  isFinalRound,
  isLastMatch,
  isResolved,
  next,
  pick,
  scores,
  startPlaythrough,
  type Team,
} from "@/lib/engine";
import { Die } from "./dice";
import { Flag } from "./flag";

function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** Always-visible "TU x | y CPU" bar; each number pops when it changes. */
function ScoreBar({ player, cpu }: { player: number; cpu: number }) {
  return (
    <div className="bg-surface/80 flex items-center justify-center gap-3 rounded-2xl py-2.5 text-sm font-black tracking-wide backdrop-blur">
      <span className="text-accent">TU</span>
      <span key={`p${player}`} className="text-foreground anim-pop text-xl tabular-nums">
        {player}
      </span>
      <span className="bg-muted/30 h-5 w-px" />
      <span key={`c${cpu}`} className="text-foreground anim-pop text-xl tabular-nums">
        {cpu}
      </span>
      <span className="text-muted">CPU</span>
    </div>
  );
}

/** Small badge showing who Picked a Team and, after reveal, whether it was right. */
function PickChip({
  label,
  correct,
  tone,
}: {
  label: string;
  correct: boolean | null;
  tone: "player" | "cpu";
}) {
  const base =
    tone === "player" ? "bg-accent/20 text-accent" : "bg-muted/15 text-muted";
  const mark = correct === null ? "" : correct ? " ✓" : " ✗";
  const marked =
    correct === null
      ? base
      : correct
        ? "bg-accent/20 text-accent"
        : "bg-red-500/20 text-red-400";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold tracking-wide ${marked}`}
    >
      {label}
      {mark}
    </span>
  );
}

/** A big tappable Team panel used in the prediction screen. */
function TeamButton({
  team,
  onPick,
}: {
  team: Team;
  onPick: (team: Team) => void;
}) {
  return (
    <button
      onClick={() => onPick(team)}
      className="bg-surface active:bg-accent/20 active:ring-accent flex flex-1 flex-col items-center justify-center gap-3 rounded-3xl p-6 ring-2 ring-transparent transition-colors"
    >
      <Flag flag={team.flag} name={team.name} className="w-20" />
      <span className="text-center text-xl font-black">{team.name}</span>
      <span className="text-muted/70 text-xs tabular-nums">#{team.rank}</span>
    </button>
  );
}

/** One Team's line on the result screen: its Roll, winner highlight, and Picks. */
function ResultRow({
  team,
  roll,
  isWinner,
  isPlayer,
  isCpu,
  settled,
}: {
  team: Team;
  roll: number;
  isWinner: boolean;
  isPlayer: boolean;
  isCpu: boolean;
  settled: boolean;
}) {
  const win = settled && isWinner;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
        win ? "bg-accent/15" : "bg-surface"
      }`}
    >
      <Flag flag={team.flag} name={team.name} className="w-10 shrink-0" />
      <div className="flex flex-1 flex-col gap-1">
        <span
          className={`text-base font-bold ${win ? "text-foreground" : "text-muted"}`}
        >
          {team.name}
        </span>
        <div className="flex gap-1">
          {isPlayer && (
            <PickChip
              label="TU"
              tone="player"
              correct={settled ? isWinner : null}
            />
          )}
          {isCpu && settled && (
            <PickChip label="CPU" tone="cpu" correct={isWinner} />
          )}
        </div>
      </div>
      <span
        className={`w-6 text-right text-2xl font-black tabular-nums ${
          win ? "text-accent" : "text-muted"
        }`}
      >
        {settled ? roll : "?"}
      </span>
    </div>
  );
}

/** End-of-Tournament summary with a replay button. */
function FinalScreen({
  player,
  cpu,
  onReplay,
}: {
  player: number;
  cpu: number;
  onReplay: () => void;
}) {
  const verdict =
    player > cpu
      ? { emoji: "🏆", text: "Ai bătut calculatorul!", tone: "text-accent" }
      : player < cpu
        ? { emoji: "🤖", text: "Calculatorul a câștigat.", tone: "text-muted" }
        : { emoji: "🤝", text: "Egalitate!", tone: "text-foreground" };

  return (
    <main className="anim-fade-up flex flex-1 flex-col items-center justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="anim-settle text-6xl" aria-hidden>
          {verdict.emoji}
        </div>
        <h1 className={`text-2xl font-black ${verdict.tone}`}>{verdict.text}</h1>
        <div className="bg-surface flex items-center gap-6 rounded-2xl px-8 py-5">
          <div className="flex flex-col items-center">
            <span className="text-accent text-xs font-bold tracking-widest">
              TU
            </span>
            <span className="text-4xl font-black tabular-nums">{player}</span>
          </div>
          <span className="bg-muted/30 h-10 w-px" />
          <div className="flex flex-col items-center">
            <span className="text-muted text-xs font-bold tracking-widest">
              CPU
            </span>
            <span className="text-4xl font-black tabular-nums">{cpu}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onReplay}
        className="bg-accent active:bg-accent-strong w-full rounded-2xl py-5 text-xl font-black tracking-wide text-black transition-all active:scale-[0.98]"
      >
        JOACĂ DIN NOU
      </button>
    </main>
  );
}

export default function Game() {
  // One Rng drives the whole Playthrough — Bracket, dice, and CPU Picks alike —
  // so a Tournament is reproducible from its seed and no raw randomness leaks in.
  // It lives beside the Playthrough in state: the Rng's internal counter mutates
  // as it draws, while each transition returns a fresh Playthrough value.
  const [{ rng, play }, setSession] = useState(() => {
    const rng = createSeededRng(randomSeed());
    return { rng, play: startPlaythrough(rng) };
  });
  // `settled` flips once the dice have landed and their rolls can be read. It is
  // pure view timing, so it stays in React rather than in the Playthrough.
  const [settled, setSettled] = useState(false);

  const resolved = isResolved(play);

  // The dice pop in when a Match resolves; reveal the rolls once the little roll
  // animation has played.
  useEffect(() => {
    if (!resolved) return;
    const id = setTimeout(() => setSettled(true), 450);
    return () => clearTimeout(id);
  }, [resolved, play.matchIndex, play.roundIndex]);

  // Each transition draws from the Rng exactly once, here in the handler — never
  // inside a state updater, which React may run more than once.
  function onPick(team: Team) {
    setSettled(false);
    setSession({ rng, play: pick(play, team, rng) });
  }

  function onNext() {
    setSettled(false);
    setSession({ rng, play: next(play, rng) });
  }

  function replay() {
    const fresh = createSeededRng(randomSeed());
    setSettled(false);
    setSession({ rng: fresh, play: startPlaythrough(fresh) });
  }

  // Hold the just-resolved Match out of the live Score until its dice settle, so
  // the bar never pops before the roll is revealed.
  const revealed = resolved && !settled ? play.results.length - 1 : play.results.length;
  const { player: shownPlayer, cpu: shownCpu } = scores(play, revealed);

  if (play.finished) {
    const final = scores(play);
    return (
      <FinalScreen player={final.player} cpu={final.cpu} onReplay={replay} />
    );
  }

  const round = currentRound(play);
  const match = currentMatch(play);
  const header = (
    <div className="text-center">
      <span className="bg-accent/15 text-accent rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
        {round.name}
      </span>
      <p className="text-muted mt-3 text-sm">
        Meci{" "}
        <span className="text-foreground font-semibold tabular-nums">
          {play.matchIndex + 1} / {play.matches.length}
        </span>
      </p>
    </div>
  );

  if (!resolved) {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4">
        <ScoreBar player={shownPlayer} cpu={shownCpu} />
        <div
          key={`${play.roundIndex}-${play.matchIndex}`}
          className="anim-card-in flex flex-1 flex-col gap-4"
        >
          {header}
          <p className="text-muted/80 -mt-2 text-center text-sm">
            Cine merge mai departe?
          </p>
          <div className="flex flex-1 flex-col gap-3">
            <TeamButton team={match.favorite} onPick={onPick} />
            <div className="text-muted/60 text-center text-sm font-black tracking-widest">
              VS
            </div>
            <TeamButton team={match.underdog} onPick={onPick} />
          </div>
        </div>
      </main>
    );
  }

  const result = currentResult(play);
  const playerPick = currentPlayerPick(play);
  const cpuPick = currentCpuPick(play);
  const lastMatch = isLastMatch(play);
  const isFinal = isFinalRound(play);

  return (
    <main
      key={`result-${play.roundIndex}-${play.matchIndex}`}
      className="anim-fade-up flex flex-1 flex-col gap-4 p-4"
    >
      <ScoreBar player={shownPlayer} cpu={shownCpu} />
      {header}

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex gap-2.5">
          <Die value={result?.favoriteRoll ?? 5} />
          <Die value={result?.underdogRoll ?? 2} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <ResultRow
            team={match.favorite}
            roll={result?.favoriteRoll ?? 0}
            isWinner={result?.winner === match.favorite}
            isPlayer={playerPick === match.favorite}
            isCpu={cpuPick === match.favorite}
            settled={settled}
          />
          <ResultRow
            team={match.underdog}
            roll={result?.underdogRoll ?? 0}
            isWinner={result?.winner === match.underdog}
            isPlayer={playerPick === match.underdog}
            isCpu={cpuPick === match.underdog}
            settled={settled}
          />
        </div>

        <p className="text-muted h-5 text-sm">
          {!settled
            ? "zarurile decid…"
            : playerPick === result?.winner
              ? `Corect! +${round.points} pentru tine`
              : "De data asta nu."}
        </p>
      </div>

      <button
        onClick={onNext}
        disabled={!settled}
        className="bg-accent active:bg-accent-strong w-full rounded-2xl py-4 text-lg font-black tracking-wide text-black transition-all active:scale-[0.98] disabled:opacity-40"
      >
        {lastMatch
          ? isFinal
            ? "REZULTAT FINAL"
            : "RUNDA URMĂTOARE"
          : "URMĂTORUL MECI"}
      </button>
    </main>
  );
}
