---
description: Create a new service/article page in RU and UZ
argument-hint: <topic, e.g. "печать корпусов для электроники">
---

Create a new page about: $ARGUMENTS

1. Pick a keyword group in `KEYWORDS.md` that no other page targets (add one if missing).
2. Copy the closest `src/pages/*.js` (service → `scanning.js`, article → `materials.js`) to a new file.
   Set a new `id`, `path` (RU: `/slug/`, UZ: `/uz/slug/`), title (≤ 75 chars, main query first), description, h1/h1Html,
   lead (answer first), spec, sections, faq (3–4), `works` (existing gallery ids), `related`.
3. Facts only from `src/site.js` / Instagram — no hours, no 30-minute promise, no printer brands.
   Prices and min order: never as numbers — use `${P.min}`, `${P.ru.tiers}` etc. (`PRICES` in `src/site.js`), `minPrice: P.minOrder`.
4. Link to the page from somewhere relevant (home `ruServices`/`uzServices` in `src/pages/home.js`, or `related` lists).
5. Add both URLs to `llms.txt`.
6. `npm run build && npm run check && npm run shots -- /slug/ --h=1400`.
