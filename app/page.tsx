"use client";

import { useState } from "react";

type Screen = "start" | "tournament";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");

  if (screen === "tournament") {
    // Placeholder — the Tournament flow is built in later slices.
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-muted text-sm uppercase tracking-widest">Turneu</p>
        <p className="text-muted max-w-xs text-sm">
          Aici va veni bracket-ul. (placeholder)
        </p>
        <button
          onClick={() => setScreen("start")}
          className="text-muted mt-4 text-sm underline underline-offset-4"
        >
          Înapoi
        </button>
      </main>
    );
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
        onClick={() => setScreen("tournament")}
        className="bg-accent active:bg-accent-strong w-full rounded-2xl py-5 text-xl font-black tracking-wide text-black transition-colors"
      >
        START
      </button>
    </main>
  );
}
