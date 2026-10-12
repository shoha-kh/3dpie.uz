# 3dpie.uz — notes for Claude

Static RU/UZ site of 3DPie, a 3D printing / scanning / modeling studio in Chirchiq (Tashkent region).
GitHub Pages, plain HTML/CSS/JS, Node ≥ 18, **no npm dependencies**. Reply to the owner in Russian.

## Owner's rules — always follow
- Market: **Uzbekistan only** (no EN / international pages).
- **Never show or name the printer brand/models** — check photos/videos (`npm run video -- … --sheet`), cut frames.
- Min order **100 000 сум**. **No working hours** anywhere. **No "ответ за 30 минут"**. **Designer lamps are not sold.**
  `npm run check` fails on these (list in `scripts/check-site.js` → `BANNED`).
- Don't invent facts (reviews, ratings, build volume, policies). Sources of truth: `src/site.js`, Instagram @3dpie.uz.
- Design: tech "print lab" — graphite #0c0e0f + one acid-lime accent #c6f432, Unbounded (headings) + Onest.
  Light CSS-only motion (logo printed layer by layer, 3D-scan line, scroll reveal) — transform/opacity only,
  paused off-screen, off for reduced-motion. No orange; earlier rejected: "dev-studio" spec sheet, paper/serif look.

## Where to edit (HTML is generated — never edit output files)
| What | File |
|---|---|
| NAP, prices, delivery, UI strings, steps, LocalBusiness schema | `src/site.js` |
| `<head>`, header, footer, JSON-LD, shared blocks (steps/FAQ/CTA/print panel) | `src/layout.js` |
| Home RU+UZ | `src/pages/home.js` |
| Service/article pages (RU+UZ pair per file, linked by `id`) | `src/pages/{modeling,scanning,auto,gears,prices,materials}.js` |
| Gallery cards + video/photo lists | `data/gallery.json` (CRLF, big — grep by `"id"`) |
| Styles | `css/styles.css` (tokens in `:root`), `css/gallery.css` (cards + modal) |
| Instagram link-in-bio page `taplink.html` (RU/UZ, noindex) | `src/taplink.js` |
| AI summary | `llms.txt` (hand-written, sync with `src/site.js`) |
| Keywords per page | `KEYWORDS.md` |

Output: `index.html`, `uz.html`, `<slug>/index.html`, `uz/<slug>/index.html`, `404.html`, `taplink.html` (both noindex), `sitemap.xml` — all generated, all committed.
Site sits behind Cloudflare; titles ≤ 80 chars (check fails above), keep keywords in the first ~60.

## Commands
- `npm run build` — all pages + gallery + sitemap
- `npm run check` — links, anchors, JSON-LD, one h1, banned phrases. Run after every build.
- `npm run shots -- / /ceny/ --h=1000` — PNGs in `.shots/` (desktop 1440 + real 375 mobile). Use small `--h` to save tokens.
- `npm run og` — social images `images/og-{ru,uz}.jpg` (texts in `scripts/og-image.js`)
- `npm run video -- raw.mp4 my-id --sheet` → contact sheet; `--cut=0-38,54-75 --poster=12` → `gallery/my-id/`
- Custom commands: `/add-work <instagram url>`, `/new-page <topic>`, `/verify`

## Don't read unless needed (saves tokens)
- Generated HTML and `sitemap.xml` — read `src/` instead.
- `gallery/**`, `images/**` binaries — view a `.shots/` render or a contact sheet instead of full photos.
- `docs/archive/` — outdated notes (30 000 сум, lamps, hours).
- Whole `data/gallery.json` / `css/styles.css` — grep for the id / selector.

## Gotchas
- Windows + Git Bash. `data/gallery.json` and some files are CRLF: string patches with `\n` won't match — use Edit tool.
- Bash heredocs with mixed quotes break — write temp scripts with the Write tool into `.shots/`.
- Headless Chrome can't render < ~500px windows; `scripts/shots.js` uses a 375px iframe.
- Gallery JSON paths are `./gallery/...`; `build-gallery.js` turns them into root-relative URLs.
- Instagram: fetch caption per reel with WebFetch `https://www.instagram.com/3dpie.uz/reel/<code>/`;
  download with yt-dlp: `python -m pip install --target .tools/pylib yt-dlp`, then
  `PYTHONPATH=.tools/pylib python -m yt_dlp -o ".tools/ig/%(id)s.%(ext)s" <url>` (`.tools/` is gitignored).
- Deploy: push to `main` → `.github/workflows/deploy.yml` (rsync public files only, then IndexNow). Commit only when asked.
