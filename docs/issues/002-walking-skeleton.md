Issue: https://github.com/RazvanAga/dice-soccer/issues/2

## Parent

PRD-01: https://github.com/RazvanAga/dice-soccer/issues/1

## What to build

The walking skeleton. A Next.js + Tailwind app, mobile-first, dark theme, that
renders the START splash and deploys to Vercel. This proves the full pipeline
(build → deploy → render on a phone) end-to-end before any game logic exists.

Minimalist aesthetic with a light "sport" accent, dark theme. Mobile-only — no
desktop layout work. No backend; entirely client-side.

## Acceptance criteria

- [ ] `npm run dev` serves a Next.js + Tailwind app
- [ ] Entry screen shows a single large START button on a dark, mobile-first layout
- [ ] Tapping START transitions to an (empty) next-screen placeholder
- [ ] App builds cleanly and is deployed to Vercel (URL shared)
- [ ] Renders correctly at typical phone widths (e.g. 390px)

## Blocked by

None - can start immediately

---

Finish by creating a commit whose message describes what was achieved, e.g.
"Walking skeleton: Next.js + Tailwind app on Vercel with START screen".
