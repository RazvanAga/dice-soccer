"use client";

import { useEffect, useMemo, useState } from "react";
import {
  advance,
  cpuPicks,
  createBracket,
  createSeededRng,
  resolveRound,
  ROUNDS,
  scoreRound,
  type Match,
  type MatchResult,
  type Team,
} from "@/lib/engine";
import { Die } from "./dice";
import { Flag } from "./flag";

function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}

/** Build a fresh Bracket plus the CPU's hidden first-Round Picks. */
function newGame() {
  const matches = createBracket(createSeededRng(randomSeed())).firstRound;
  return { matches, cpu: cpuPicks(matches, Math.random) };
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
    tone === "player"
      ? "bg-accent/20 text-accent"
      : "bg-muted/15 text-muted";
  const mark =
    correct === null ? "" : correct ? " ✓" : " ✗";
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

/** Full-screen prediction: one Match, two tappable Teams. */
function PredictionCard({
  match,
  round,
  index,
  total,
  onPick,
}: {
  match: Match;
  round: string;
  index: number;
  total: number;
  onPick: (team: Team) => void;
}) {
  return (
    <div className="anim-card-in flex flex-1 flex-col gap-4">
      <div className="text-center">
        <span className="bg-accent/15 text-accent rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
          {round}
        </span>
        <p className="text-muted mt-3 text-sm">
          Cine merge mai departe?{" "}
          <span className="text-foreground font-semibold tabular-nums">
            {index + 1} / {total}
          </span>
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        <TeamButton team={match.favorite} onPick={onPick} />
        <div className="text-muted/60 text-center text-sm font-black tracking-widest">
          VS
        </div>
        <TeamButton team={match.underdog} onPick={onPick} />
      </div>
    </div>
  );
}

/** One Match in the reveal grid, showing rolls and Pick attribution. */
function ResultCard({
  match,
  index,
  result,
  playerPick,
  cpuPick,
  revealed,
}: {
  match: Match;
  index: number;
  result: MatchResult | null;
  playerPick: Team;
  cpuPick: Team;
  revealed: boolean;
}) {
  function row(team: Team, favorite: boolean, roll: number | undefined) {
    const winner = revealed && result?.winner === team;
    const isPlayer = playerPick === team;
    const isCpu = cpuPick === team;
    return (
      <div
        className={`flex items-center gap-1.5 rounded-md px-1 py-0.5 ${
          winner ? "bg-accent/15" : ""
        }`}
      >
        <Flag flag={team.flag} name={team.name} className="w-6 shrink-0" />
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
        {isPlayer && (
          <PickChip
            label="TU"
            tone="player"
            correct={revealed && result ? result.winner === team : null}
          />
        )}
        {isCpu && revealed && result && (
          <PickChip label="CPU" tone="cpu" correct={result.winner === team} />
        )}
        {revealed ? (
          <span
            className={`w-4 text-right text-sm font-bold tabular-nums ${
              winner ? "text-accent" : "text-muted"
            }`}
          >
            {roll}
          </span>
        ) : (
          <span className="text-muted/70 w-4 text-right text-[0.65rem] tabular-nums">
            #{team.rank}
          </span>
        )}
      </div>
    );
  }

  return (
    <li
      className={`bg-surface flex flex-col gap-1 rounded-xl p-3 ${
        revealed ? "anim-settle" : ""
      }`}
    >
      <span className="text-muted/60 text-[0.6rem] font-medium tracking-widest">
        {index}
      </span>
      {row(match.favorite, true, result?.favoriteRoll)}
      {row(match.underdog, false, result?.underdogRoll)}
    </li>
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
  const [game, setGame] = useState(newGame);
  const [roundIndex, setRoundIndex] = useState(0);
  const [matches, setMatches] = useState<readonly Match[]>(game.matches);
  const [cpu, setCpu] = useState<readonly Team[]>(game.cpu);

  const [phase, setPhase] = useState<"predict" | "reveal">("predict");
  const [pickIndex, setPickIndex] = useState(0);
  const [playerPicks, setPlayerPicks] = useState<Team[]>([]);

  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [revealed, setRevealed] = useState(0);
  // Bumped on every play() so the 3D dice re-trigger their tumble.
  const [rollCount, setRollCount] = useState(0);

  // Scores from fully-completed prior Rounds; the current Round is added live.
  const [committedPlayer, setCommittedPlayer] = useState(0);
  const [committedCpu, setCommittedCpu] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[roundIndex];
  const isFinal = roundIndex === ROUNDS.length - 1;
  const rolling = results !== null && revealed < results.length;
  const roundDone = results !== null && revealed >= results.length;

  const roundScore = useMemo(
    () => (results ? scoreRound(round, results, playerPicks, cpu) : null),
    [results, round, playerPicks, cpu],
  );

  const shownPlayer =
    committedPlayer + (roundDone && roundScore ? roundScore.playerPoints : 0);
  const shownCpu =
    committedCpu + (roundDone && roundScore ? roundScore.cpuPoints : 0);

  // The dice tumble first, then the numbers scatter into the Matches one by
  // one. The first reveal waits for the roll to settle; the rest cascade fast.
  useEffect(() => {
    if (!results || revealed >= results.length) return;
    const delay = revealed === 0 ? 720 : 85;
    const id = setTimeout(() => setRevealed((n) => n + 1), delay);
    return () => clearTimeout(id);
  }, [results, revealed]);

  function pick(team: Team) {
    const next = [...playerPicks, team];
    setPlayerPicks(next);
    if (next.length >= matches.length) {
      setPhase("reveal");
    } else {
      setPickIndex((i) => i + 1);
    }
  }

  function play() {
    setResults(resolveRound(matches, Math.random));
    setRevealed(0);
    setRollCount((n) => n + 1);
  }

  function finishRound() {
    if (!roundScore) return;
    setCommittedPlayer((p) => p + roundScore.playerPoints);
    setCommittedCpu((c) => c + roundScore.cpuPoints);

    if (isFinal) {
      setFinished(true);
      return;
    }
    const next = advance(results!);
    setMatches(next);
    setCpu(cpuPicks(next, Math.random));
    setRoundIndex((r) => r + 1);
    setPhase("predict");
    setPickIndex(0);
    setPlayerPicks([]);
    setResults(null);
    setRevealed(0);
  }

  function replay() {
    const fresh = newGame();
    setGame(fresh);
    setMatches(fresh.matches);
    setCpu(fresh.cpu);
    setRoundIndex(0);
    setPhase("predict");
    setPickIndex(0);
    setPlayerPicks([]);
    setResults(null);
    setRevealed(0);
    setCommittedPlayer(0);
    setCommittedCpu(0);
    setFinished(false);
  }

  if (finished) {
    return (
      <FinalScreen
        player={committedPlayer}
        cpu={committedCpu}
        onReplay={replay}
      />
    );
  }

  if (phase === "predict") {
    return (
      <main className="flex flex-1 flex-col gap-4 p-4">
        <ScoreBar player={shownPlayer} cpu={shownCpu} />
        <PredictionCard
          key={`${roundIndex}-${pickIndex}`}
          match={matches[pickIndex]}
          round={round.name}
          index={pickIndex}
          total={matches.length}
          onPick={pick}
        />
      </main>
    );
  }

  return (
    <main key={`reveal-${roundIndex}`} className="anim-fade-up flex flex-1 flex-col gap-4 p-4">
      <ScoreBar player={shownPlayer} cpu={shownCpu} />

      <div className="flex items-center justify-between">
        <span className="bg-accent/15 text-accent rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase">
          {round.name}
        </span>
        <span className="text-muted text-xs">
          {roundDone
            ? `+${roundScore?.playerPoints ?? 0} pentru tine`
            : "zarurile decid"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex gap-2.5">
          <Die value={results?.[0]?.favoriteRoll ?? 5} spin={rollCount} />
          <Die value={results?.[0]?.underdogRoll ?? 2} spin={rollCount} delay={110} />
        </div>
        <button
          onClick={roundDone ? finishRound : play}
          disabled={rolling}
          className="bg-accent active:bg-accent-strong flex-1 rounded-2xl py-3.5 text-lg font-black tracking-wide text-black transition-all active:scale-[0.98] disabled:opacity-40"
        >
          {roundDone ? (isFinal ? "REZULTAT FINAL" : "RUNDA URMĂTOARE") : "JOACĂ"}
        </button>
      </div>

      <ol className="grid grid-cols-2 gap-2">
        {matches.map((match, i) => (
          <ResultCard
            key={`${roundIndex}-${i}`}
            match={match}
            index={i + 1}
            result={results?.[i] ?? null}
            playerPick={playerPicks[i]}
            cpuPick={cpu[i]}
            revealed={results !== null && i < revealed}
          />
        ))}
      </ol>
    </main>
  );
}
