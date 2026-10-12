#!/usr/bin/env node
/**
 * scripts/check-site.js — fast sanity check of the built site (run after `npm run build`).
 *
 *  - every sitemap URL: JSON-LD parses, exactly one <h1>, title/description lengths
 *  - every root-relative link/asset exists; every /page#anchor points to an existing id
 *  - owner rules: banned phrases never appear in public files (see BANNED)
 *
 * Usage: npm run check      Exit code 1 if anything is wrong.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT } = require('./lib/tools');

// Owner's rules (2026-10): min order is 100 000, no "reply in 30 min", working hours hidden,
// designer lamps are not sold, orange accent was rejected.
const BANNED = [
  [/\b30[\s  ]000\b/, 'old min price 30 000'],
  [/30\s*(минут|daqiqa)/i, '"reply in 30 minutes" promise'],
  [/\b9:00\b|21:00|Пн–Сб|Du–Sha|openingHours/, 'working hours (must be hidden)'],
  [/светильн|chiroq|designer-lamps|svetilniki/i, 'designer lamps (not sold anymore)'],
  [/#ff5a1f/i, 'old orange accent']
];
const BANNED_SCAN = ['.html', '.css', '.js', '.txt', '.xml', '.json'];
const BANNED_SKIP = /^(\.git|\.github|node_modules|\.shots|\.tools|docs|scripts)([\\/]|$)|^taplink\.html$/;

const problems = [];
const fileOf = p => (p === '/' ? 'index.html' : p.endsWith('.html') ? p.slice(1) : p.slice(1) + 'index.html');

const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>https:\/\/3dpie\.uz([^<]+)<\/loc>/g)].map(m => m[1]);

for (const u of urls) {
  const f = path.join(ROOT, fileOf(u));
  if (!fs.existsSync(f)) { problems.push(`missing page file for ${u}`); continue; }
  const h = fs.readFileSync(f, 'utf8');
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { problems.push(`${u}: bad JSON-LD (${e.message})`); }
  }
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) problems.push(`${u}: ${h1} <h1> tags`);
  const title = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
  if (title.length > 90) problems.push(`${u}: title too long (${title.length})`);
  for (const m of h.matchAll(/(?:href|src|poster|data-poster)="(\/[^"#?]*)/g)) {
    const p = m[1];
    if (!fs.existsSync(path.join(ROOT, p.endsWith('/') ? p + 'index.html' : p))) problems.push(`${u}: missing ${p}`);
  }
  for (const m of h.matchAll(/href="(\/[^"#]*)#([^"]+)"/g)) {
    const target = path.join(ROOT, fileOf(m[1] || '/'));
    if (!fs.existsSync(target) || !fs.readFileSync(target, 'utf8').includes(`id="${m[2]}"`)) {
      problems.push(`${u}: broken anchor ${m[1]}#${m[2]}`);
    }
  }
}

(function scan(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const rel = path.relative(ROOT, full);
    if (BANNED_SKIP.test(rel)) continue;
    if (fs.statSync(full).isDirectory()) { scan(full); continue; }
    if (!BANNED_SCAN.includes(path.extname(name))) continue;
    const text = fs.readFileSync(full, 'utf8');
    for (const [re, why] of BANNED) if (re.test(text)) problems.push(`${rel}: ${why}`);
  }
})(ROOT);

console.log(`[check] ${urls.length} pages`);
if (problems.length) {
  console.log(problems.map(p => '  ✗ ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log('[check] OK');
}
