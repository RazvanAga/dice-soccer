"use client";

import { useState } from "react";
import Game from "./_components/game";

export default function Home() {
  // The START splash shows only on first app entry; once the Tournament begins,
  // replays loop inside Game and never return here.
  const [started, setStarted] = useState(false);

  if (started) {
    return <Game />;
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-between p-6">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="text-5xl" aria-hidden>
          ⚽🎲
        </div>
        <h1 className="text-4xl font-black tracking-tight">DICE SOCCER</h1>
        <p className="text-muted max-w-[16rem] text-sm leading-relaxed">
          Prezi câștigătorii. Zarurile decid. Bate calculatorul.
        </p>
      </div>

      <button
        onClick={() => setStarted(true)}
        className="bg-accent active:bg-accent-strong w-full rounded-2xl py-5 text-xl font-black tracking-wide text-black transition-colors"
      >
        START
      </button>
    </main>
  );
}
