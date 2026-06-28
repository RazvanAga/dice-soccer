/** Pip positions per face value, as [row, col] cells in a 3x3 grid (0-indexed). */
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

/** A plain flat die showing `value` (1–6) as pips, with a quick roll-in pop. */
export function Die({ value }: { value: number }) {
  const pips = PIPS[value] ?? PIPS[1];
  return (
    <div className="die-flat die-roll" role="img" aria-label={`zar ${value}`}>
      {pips.map(([row, col], i) => (
        <span
          key={i}
          className="pip"
          style={{ gridRow: row + 1, gridColumn: col + 1 }}
        />
      ))}
    </div>
  );
}
