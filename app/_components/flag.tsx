/**
 * Renders a Team's flag as a real SVG image instead of an emoji.
 *
 * Flag emoji (regional-indicator pairs and subdivision tag sequences) don't
 * render on Windows and some Android builds, so we derive the ISO code from the
 * emoji at render time and pull a real SVG from flagcdn. The engine data stays
 * untouched; the emoji is kept as a graceful fallback when no code is found.
 */

const RI_BASE = 0x1f1e6; // 🇦 regional indicator A
const TAG_BASE = 0xe0000; // tag-letter offset for subdivision flags

/** Map a flag emoji to a flagcdn slug ("ar", "gb-eng"), or null if unknown. */
function isoCode(flag: string): string | null {
  const cps = [...flag];

  // Subdivision flags (England, Wales, Scotland): 🏴 + tag letters spelling "gbeng".
  if (cps[0]?.codePointAt(0) === 0x1f3f4) {
    const sub = cps
      .slice(1)
      .map((c) => c.codePointAt(0)!)
      .filter((cp) => cp >= 0xe0061 && cp <= 0xe007a) // tag a-z
      .map((cp) => String.fromCharCode(cp - TAG_BASE))
      .join("");
    return sub.startsWith("gb") ? `gb-${sub.slice(2)}` : null;
  }

  // Standard country flags: two regional-indicator letters.
  const a = cps[0]?.codePointAt(0) ?? 0;
  const b = cps[1]?.codePointAt(0) ?? 0;
  if (a < RI_BASE || a > RI_BASE + 25 || b < RI_BASE || b > RI_BASE + 25) {
    return null;
  }
  return (
    String.fromCharCode(97 + (a - RI_BASE)) +
    String.fromCharCode(97 + (b - RI_BASE))
  );
}

export function Flag({
  flag,
  name,
  className = "",
}: {
  flag: string;
  name: string;
  className?: string;
}) {
  const code = isoCode(flag);

  if (!code) {
    return (
      <span className={className} aria-hidden>
        {flag}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny static flag, next/image adds no value here
    <img
      src={`https://flagcdn.com/${code}.svg`}
      alt={name}
      className={`inline-block aspect-[4/3] rounded-[3px] object-cover ring-1 ring-white/10 ${className}`}
      loading="lazy"
    />
  );
}
