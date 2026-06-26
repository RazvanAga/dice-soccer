"use client";

import { useEffect, useRef, useState } from "react";

/** Pip positions per face value, as [row, col] cells in a 3x3 grid (0-indexed). */
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

/** Where each face sits on the cube (translateZ is added in CSS via --die-half). */
const FACES: { value: number; transform: string }[] = [
  { value: 1, transform: "rotateY(0deg)" },
  { value: 6, transform: "rotateY(180deg)" },
  { value: 3, transform: "rotateY(90deg)" },
  { value: 4, transform: "rotateY(-90deg)" },
  { value: 2, transform: "rotateX(90deg)" },
  { value: 5, transform: "rotateX(-90deg)" },
];

/** Cube rotation that brings each value's face to the front. */
const SHOW: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: -90, y: 0 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  5: { x: 90, y: 0 },
  6: { x: 0, y: 180 },
};

/**
 * A real CSS 3D die. Each time `spin` changes it tumbles through extra full
 * turns and lands on `value`, so the roll always reads as forward motion.
 */
export function Die({
  value,
  spin,
  delay = 0,
}: {
  value: number;
  spin: number;
  delay?: number;
}) {
  // Accumulated full turns; grows on every roll so the cube never spins backward.
  const turns = useRef(1);
  const mounted = useRef(false);
  const face = SHOW[value] ?? SHOW[1];
  const [rot, setRot] = useState({ x: face.x, y: face.y });

  useEffect(() => {
    // Skip the first run so the die rests on its placeholder when the reveal
    // screen appears; it only tumbles once a roll actually bumps `spin`.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    turns.current += 2;
    const target = SHOW[value] ?? SHOW[1];
    // Spin a touch more on Y than X so the tumble reads as a real toss, not a
    // flat spin around one axis.
    setRot({
      x: target.x + turns.current * 360,
      y: target.y + (turns.current + 1) * 360,
    });
  }, [spin, value]);

  return (
    <div className="die-scene" aria-hidden>
      <div
        className="die"
        style={{
          transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
          transitionDelay: `${delay}ms`,
        }}
      >
        {FACES.map((f) => (
          <div
            key={f.value}
            className="die-face"
            style={{ transform: `${f.transform} translateZ(var(--die-half))` }}
          >
            {PIPS[f.value].map(([row, col], i) => (
              <span
                key={i}
                className="pip"
                style={{ gridRow: row + 1, gridColumn: col + 1 }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
