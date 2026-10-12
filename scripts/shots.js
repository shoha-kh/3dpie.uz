#!/usr/bin/env node
/**
 * scripts/shots.js — screenshots of built pages for visual checks.
 *
 * Usage:
 *   npm run shots                       -> /  (desktop + mobile)
 *   npm run shots -- /ceny/ /uz.html    -> several pages
 *   npm run shots -- / --h=1000         -> only the first screen (smaller image = fewer tokens)
 *   npm run shots -- / --desktop        -> desktop only (--mobile for mobile only)
 *
 * Output: .shots/<name>-desktop.png (1440 wide) and .shots/<name>-mobile.png (375 wide,
 * rendered inside an iframe — headless Chrome can't make a window narrower than ~500px).
 */

'use strict';

const path = require('path');
const { SHOTS_DIR, serve, screenshot } = require('./lib/tools');

// Git Bash on Windows rewrites "/ceny/" into "C:/Program Files/Git/ceny/" — undo that.
const args = process.argv.slice(2).map(a => a.replace(/^[A-Za-z]:[\\/](?:Program Files[\\/])?Git(?=[\\/])/i, '').replace(/\\/g, '/'));
const pages = args.filter(a => a.startsWith('/'));
const flag = name => args.includes(`--${name}`);
const opt = (name, def) => {
  const a = args.find(x => x.startsWith(`--${name}=`));
  return a ? Number(a.split('=')[1]) : def;
};
const height = opt('h', 2400);
const doDesktop = !flag('mobile');
const doMobile = !flag('desktop');

async function main() {
  const list = pages.length ? pages : ['/'];
  const frames = {};
  list.forEach((p, i) => {
    frames[`/__mobile${i}.html`] = `<!doctype html><body style="margin:0"><iframe src="${p}" style="width:375px;height:${height}px;border:0"></iframe>`;
  });
  const srv = await serve(frames);
  try {
    for (const [i, p] of list.entries()) {
      const name = p.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
      if (doDesktop) {
        const out = await screenshot(srv.url + p, path.join(SHOTS_DIR, `${name}-desktop.png`), 1440, height);
        console.log(out);
      }
      if (doMobile) {
        const out = await screenshot(`${srv.url}/__mobile${i}.html`, path.join(SHOTS_DIR, `${name}-mobile.png`), 375, height);
        console.log(out);
      }
    }
  } finally {
    srv.close();
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
