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
  [/#ff5a1f/i, 'old orange accent'],
  [/anycubic|kobra|qidi/i, 'printer brand/model (must not be named)']
];
const BANNED_SCAN = ['.html', '.css', '.js', '.txt', '.xml', '.json'];
const BANNED_SKIP = /^(\.git|\.github|node_modules|\.shots|\.tools|docs|scripts)([\\/]|$)/;

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
  if (title.length > 80) problems.push(`${u}: title too long (${title.length})`);
  // search engines show about 160 characters of the description: what does not fit is never seen
  const desc = ((h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  if (!desc) problems.push(`${u}: no meta description`);
  else if (desc.length > 160) problems.push(`${u}: description too long (${desc.length} > 160)`);
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

// llms.txt is written by hand: make sure it still agrees with src/site.js and lists every page.
(function checkLlms() {
  const { SITE_URL, CONTACTS, T, PRICES, money } = require('../src/site');
  const llms = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8').replace(/ /g, ' ');
  const facts = [
    [CONTACTS.phoneHuman, 'phone'],
    [CONTACTS.telegram, 'Telegram link'],
    [CONTACTS.instagram, 'Instagram link'],
    [T.ru.address.street, 'street address'],
    [T.ru.address.landmarkName, 'landmark'],
    [CONTACTS.postalCode, 'postal code'],
    [`Минимальный заказ ${PRICES.min} сум`, 'minimum order'],
    [`${PRICES.bed} мм`, 'max part size'],
    [`${PRICES.bedComposite} мм`, 'max composite part size']
  ];
  for (const [text, what] of facts) {
    if (!llms.includes(text)) problems.push(`llms.txt: ${what} differs from src/site.js — expected "${text}"`);
  }
  // "PLA и PETG 1 000 сум за грамм; ABS, PETG-CF и TPU 1 500 сум за грамм; …" — every material must sit
  // in the part of the price line that carries its own price.
  const parts = llms.split(/[;\n]/).map(part => ({
    part,
    price: (part.match(/(?<!\w)(\d{1,3}(?: \d{3})+|\d+) сум за грамм/) || [])[1]
  })).filter(p => p.price);
  for (const tier of PRICES.tiers) {
    for (const name of tier.names) {
      const own = new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`);
      const hit = parts.find(p => own.test(p.part));
      if (!hit) problems.push(`llms.txt: no price per gram for ${name} (src/site.js: ${money(tier.price)} сум за грамм)`);
      else if (hit.price !== money(tier.price)) {
        problems.push(`llms.txt: ${name} is ${hit.price} сум за грамм, src/site.js says ${money(tier.price)}`);
      }
    }
  }
  for (const u of urls) {
    if (!llms.includes(`(${SITE_URL}${u})`)) problems.push(`llms.txt: page ${u} is not listed`);
  }
})();

console.log(`[check] ${urls.length} pages`);
if (problems.length) {
  console.log(problems.map(p => '  ✗ ' + p).join('\n'));
  process.exitCode = 1;
} else {
  console.log('[check] OK');
}
