---
description: Rebuild and verify the site (checks + quick screenshots)
argument-hint: [page paths, default /]
---

1. `npm run build && npm run check` — fix every reported problem in `src/` (never in generated HTML).
2. `npm run shots -- <paths> --h=1000` (paths: $ARGUMENTS; if empty use `/`) and look at the PNGs in `.shots/` (desktop + 375px mobile).
3. Report: what was checked, problems found/fixed, anything that still needs the owner's decision.
