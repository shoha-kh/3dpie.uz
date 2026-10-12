---
description: Add a work to the gallery from an Instagram reel/post (or a local video)
argument-hint: <instagram url | path to mp4> [short note]
---

Add a new gallery item from: $ARGUMENTS

1. If it's an Instagram link: WebFetch the post URL and get the caption + date verbatim.
   Download the video: `PYTHONPATH=.tools/pylib python -m yt_dlp -q -o ".tools/ig/%(id)s.%(ext)s" <url>`
   (if yt-dlp is missing: `python -m pip install -q --target .tools/pylib yt-dlp`).
2. `npm run video -- <file> <kebab-id> --sheet`, then look at `.shots/<id>-sheet.jpg`.
   If a printer / its brand is visible — choose `--cut` ranges without those frames.
3. `npm run video -- <file> <kebab-id> [--cut=…] --poster=<sec>`; glance at the poster.
4. Add the item at the **top** of `items` in `data/gallery.json` (use the printed skeleton; Edit tool, file is CRLF).
   Texts RU + UZ (latin, ASCII apostrophe) — only facts from the caption/video, no invented details.
5. If it fits a service page, add the id to that page's `WORKS` in `src/pages/*.js`.
6. `npm run build && npm run check`, then `npm run shots -- / --h=900 --desktop` only if layout could change.
7. Report what was added. Don't commit unless asked.
