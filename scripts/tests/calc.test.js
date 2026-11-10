#!/usr/bin/env node
/**
 * scripts/tests/calc.test.js — browser test of the price calculator on the built prices page.
 *
 *   npm run build && npm test
 *
 * Needs Playwright with Chromium. The project itself has no npm dependencies, so the test is skipped
 * (exit code 0) where Playwright is not installed; Claude Code cloud sessions have it preinstalled.
 * Model files are generated here: a 60 mm cube (216 cm³) in every supported format and a "T" with overhangs.
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const zlib = require('zlib');
const { serve } = require('../lib/tools');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch (e) {
  console.log('[test] skipped: Playwright is not installed (npm i -g playwright && npx playwright install chromium)');
  process.exit(0);
}

// ---------- fixtures ----------

const DIR = fs.mkdtempSync(path.join(os.tmpdir(), '3dpie-calc-'));
const file = name => path.join(DIR, name);

function boxTris(x0, y0, z0, x1, y1, z1) {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  return QUADS.flatMap(([a, b, c, d]) => [[v[a], v[b], v[c]], [v[a], v[c], v[d]]]);
}
const QUADS = [[0, 3, 2, 1], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]]; // outward

function writeStl(name, tris) {
  const buf = Buffer.alloc(84 + tris.length * 50);
  buf.writeUInt32LE(tris.length, 80);
  tris.forEach((t, i) => {
    let o = 84 + i * 50 + 12;
    for (const p of t) for (const c of p) { buf.writeFloatLE(c, o); o += 4; }
  });
  fs.writeFileSync(file(name), buf);
}

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = b => { let c = 0xffffffff; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };

function writeZip(name, files, deflate) {
  const parts = [], central = [];
  let off = 0;
  for (const [entry, text] of files) {
    const raw = Buffer.from(text), data = deflate ? zlib.deflateRawSync(raw) : raw, nm = Buffer.from(entry);
    const h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50, 0); h.writeUInt16LE(20, 4); h.writeUInt16LE(deflate ? 8 : 0, 8);
    h.writeUInt32LE(crc32(raw), 14); h.writeUInt32LE(data.length, 18); h.writeUInt32LE(raw.length, 22); h.writeUInt16LE(nm.length, 26);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(deflate ? 8 : 0, 10);
    c.writeUInt32LE(crc32(raw), 16); c.writeUInt32LE(data.length, 20); c.writeUInt32LE(raw.length, 24); c.writeUInt16LE(nm.length, 28); c.writeUInt32LE(off, 42);
    parts.push(h, nm, data);
    central.push(c, nm);
    off += 30 + nm.length + data.length;
  }
  const cd = Buffer.concat(central), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cd.length, 12); end.writeUInt32LE(off, 16);
  fs.writeFileSync(file(name), Buffer.concat([...parts, cd, end]));
}

function makeFixtures() {
  const corners = s => [[0, 0, 0], [s, 0, 0], [s, s, 0], [0, s, 0], [0, 0, s], [s, 0, s], [s, s, s], [0, s, s]];
  const tris = QUADS.flatMap(([a, b, c, d]) => [[a, b, c], [a, c, d]]);
  const mesh = s => `<mesh><vertices>${corners(s).map(v => `<vertex x="${v[0]}" y="${v[1]}" z="${v[2]}"/>`).join('')}</vertices>` +
    `<triangles>${tris.map(t => `<triangle v1="${t[0]}" v2="${t[1]}" v3="${t[2]}"/>`).join('')}</triangles></mesh>`;
  const ns = 'xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02" xmlns:p="http://schemas.microsoft.com/3dmanufacturing/production/2015/06"';

  writeStl('cube.stl', boxTris(0, 0, 0, 60, 60, 60));
  writeStl('tee.stl', [...boxTris(20, 0, 0, 40, 20, 40), ...boxTris(0, 0, 40, 60, 20, 50)]);
  // OBJ: quads with texture/normal indices; and the same cube with indices counted from the end, CRLF
  fs.writeFileSync(file('cube.obj'), corners(60).map(v => 'v ' + v.join(' ')).join('\n') + '\nvn 0 0 1\n' + QUADS.map(q => 'f ' + q.map(i => `${i + 1}/1/1`).join(' ')).join('\n') + '\n');
  fs.writeFileSync(file('cube-rel.obj'), corners(60).map(v => 'v ' + v.join(' ')).join('\r\n') + '\r\n' + QUADS.map(q => 'f ' + q.map(i => i - 8).join(' ')).join('\r\n') + '\r\n');
  // 3MF: stored, in centimetres, the item moved aside
  writeZip('cube-cm.3mf', [['3D/3dmodel.model',
    `<?xml version="1.0"?><model unit="centimeter" ${ns}><resources><object id="1" type="model">${mesh(6)}</object></resources><build><item objectid="1" transform="1 0 0 0 1 0 0 0 1 10 20 0"/></build></model>`]], false);
  // 3MF as a slicer project: deflated, the mesh is in another file, comes through a component, the item scales ×2
  writeZip('cube-project.3mf', [['3D/3dmodel.model',
    `<?xml version="1.0"?><model unit="millimeter" ${ns}><resources><object id="2" type="model"><components><component p:path="/3D/Objects/object_1.model" objectid="1" transform="1 0 0 0 1 0 0 0 1 5 5 0"/></components></object></resources><build><item objectid="2" transform="2 0 0 0 2 0 0 0 2 100 100 0"/></build></model>`],
  ['3D/Objects/object_1.model', `<?xml version="1.0"?><model unit="millimeter" ${ns}><resources><object id="1" type="model">${mesh(30)}</object></resources><build/></model>`]], true);
  fs.writeFileSync(file('broken.stl'), 'not a model');
}

// ---------- tiny test runner ----------

let failed = 0, passed = 0;
function ok(cond, what) {
  if (cond) { passed++; return; }
  failed++;
  console.log('  ✗ ' + what);
}
const eq = (a, b, what) => ok(a === b, `${what}: expected ${JSON.stringify(b)}, got ${JSON.stringify(a)}`);
const num = text => parseFloat(String(text).replace(/[^\d,.-]/g, '').replace(',', '.')) || 0;

async function main() {
  makeFixtures();
  const srv = await serve();
  const browser = await chromium.launch();
  const errors = [];

  async function open(url, viewport) {
    const ctx = await browser.newContext({ viewport, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::/.test(m.text())) errors.push(m.text()); });
    await page.route(/mc\.yandex|googletagmanager|google\.com\/maps|fonts\.g/, r => r.abort());
    await page.goto(srv.url + url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.calc');
    const state = () => page.evaluate(() => {
      const text = sel => { const e = document.querySelector(sel); return e ? e.textContent.replace(/ /g, ' ').trim() : ''; };
      const o = {};
      document.querySelectorAll('.calc [data-out]').forEach(e => { o[e.dataset.out] = e.textContent.replace(/ /g, ' ').trim(); });
      o.alert = text('.calc-alert');
      o.orderMsg = text('.calc-order-msg');
      o.status = text('.calc-status');
      o.name = text('.calc-name');
      o.plates = [...document.querySelectorAll('.calc-plate')].map(p => ({
        active: p.classList.contains('is-active'), name: p.querySelector('.calc-plate-name').textContent,
        own: !p.querySelector('.calc-plate-own').hidden, info: p.querySelector('.calc-plate-info').textContent.replace(/ /g, ' '),
        sum: p.querySelector('.calc-plate-sum').textContent.replace(/ /g, ' ')
      }));
      o.scope = document.querySelector('.calc-scope [aria-pressed="true"]').dataset.scope;
      o.mat = document.querySelector('.calc-mat').value;
      o.ownMarks = [...document.querySelectorAll('.calc-own:not([hidden])')].map(b => b.dataset.own);
      o.orient = [...document.querySelectorAll('.calc-orient .is-current')].map(b => b.dataset.orient);
      o.qtyDisabled = document.querySelector('.calc-qty').disabled;
      o.sendHref = document.querySelector('.calc-send').getAttribute('href');
      return o;
    });
    const load = async (...names) => { await page.setInputFiles('.calc-file', names.map(file)); await page.waitForTimeout(900 + names.length * 250); };
    const pick = async i => { await page.locator('.calc-plate-pick').nth(i).click(); await page.waitForTimeout(300); };
    const scope = async k => { await page.click(`[data-scope="${k}"]`); };
    return { ctx, page, state, load, pick, scope };
  }

  // ----- desktop, RU
  let { ctx, page, state, load, pick, scope } = await open('/ceny/', { width: 1440, height: 1000 });
  let s = await state();
  console.log('empty state');
  eq(s.plates.length, 0, 'no plates');
  ok(s.qtyDisabled, 'quantity is disabled without a model');
  ok(!s.sendHref.includes('?text='), 'Telegram link is plain before a model is loaded');

  console.log('one model');
  await load('cube.stl');
  s = await state();
  eq(s.size, '60 × 60 × 60 мм', 'size');
  eq(num(s.volume), 216, 'volume, cm³');
  eq(num(s.weight), 74, 'weight of the cube in PETG at 20%');
  ok(/≈/.test(s.time), 'print time is marked as approximate');
  eq(num(s.total), 100000, 'total is lifted to the minimum order');
  ok(s.orderMsg.length > 0, 'the minimum order is explained');
  eq(s.orient.join(), 'reset', 'a fresh model lies as in the file');
  await page.click('[data-orient="x"]');
  await page.waitForTimeout(200);
  eq((await state()).orient.join(), '', 'no position is highlighted after a manual turn');
  await page.click('[data-orient="auto"]');
  await page.waitForTimeout(1500);
  eq((await state()).orient.join(), 'auto', '"Auto" is highlighted after auto-orientation');
  await page.locator('.calc-plate-del').first().click();

  console.log('formats');
  await load('cube.stl', 'cube.obj', 'cube-rel.obj', 'cube-cm.3mf', 'cube-project.3mf', 'broken.stl');
  s = await state();
  eq(s.plates.length, 5, 'five readable files become five plates');
  ok(s.alert.includes('broken.stl'), 'the unreadable file is named in the notice');
  for (let i = 0; i < 5; i++) {
    await pick(i);
    const p = await state();
    eq(`${p.size} / ${num(p.volume)}`, '60 × 60 × 60 мм / 216', p.name);
  }
  for (let i = 0; i < 5; i++) await page.locator('.calc-plate-del').first().click();
  eq((await state()).plates.length, 0, 'all plates removed');

  console.log('common settings and plate overrides');
  await page.selectOption('.calc-mat', 'abs');
  await load('cube.stl', 'tee.stl');
  s = await state();
  eq(s.plates.map(p => p.info.split(' · ')[0]).join(), 'ABS,ABS', 'both plates take the common plastic');
  eq(s.models + '/' + s.pieces, '2/2', 'models/pieces');
  await scope('plate');
  await page.selectOption('.calc-mat', 'tpu');
  s = await state();
  eq(s.plates.map(p => p.info.split(' · ')[0]).join(), 'ABS,TPU', 'the override changes only the open plate');
  eq(s.ownMarks.join(), 'mat', 'the overridden parameter is marked');
  ok(s.plates[1].own && !s.plates[0].own, 'the plate with its own settings is tagged');
  await scope('common');
  await page.locator('input[name=calc-infill][value="40"]').check({ force: true });
  const heavy = num((await state()).sumWeight);
  await page.locator('input[name=calc-infill][value="20"]').check({ force: true });
  ok(heavy > num((await state()).sumWeight), 'common infill changes the total weight');
  await scope('plate');
  await page.click('.calc-own[data-own="mat"]');
  s = await state();
  eq(s.plates[1].info.split(' · ')[0], 'ABS', 'the override can be put back to the common value');
  ok(!s.plates[1].own, 'the tag is gone');

  console.log('advanced mode, supports, quantity');
  const before = await state();
  await page.locator('.calc-mode').click();
  await page.selectOption('.calc-support', 'off');
  await page.waitForTimeout(300);
  s = await state();
  eq(s.supports, '—', 'no support weight with supports off');
  ok(num(before.supports) > 0, 'the T has supports by default');
  await page.locator('.calc-walls').fill('5');
  ok(num((await state()).weight) > num(s.weight), 'more walls → heavier');
  await page.locator('.calc-mode').click();
  await page.waitForTimeout(300);
  s = await state();
  eq(s.weight + s.supports, before.weight + before.supports, 'leaving the advanced mode restores the estimate');
  await pick(0);
  await page.locator('.calc-qty').fill('3');
  s = await state();
  eq(s.pieces, '4', 'pieces = 3 + 1');
  ok(s.plates[0].info.includes('3'), 'the plate card shows the quantity');
  await pick(1);
  eq(await page.locator('.calc-qty').inputValue(), '1', 'quantity belongs to the plate');

  console.log('send, copy, save');
  s = await state();
  ok(s.sendHref.includes('?text='), 'Telegram link carries the estimate');
  const sent = decodeURIComponent(s.sendHref.split('?text=')[1]);
  ok(sent.includes('cube.stl') && sent.includes('tee.stl'), 'the message lists every plate');
  await page.locator('.calc-copy').click();
  await page.waitForTimeout(300);
  eq(await page.evaluate(() => navigator.clipboard.readText()), sent, 'the copied text equals the message');
  ok((await state()).status.length > 0, 'copying is confirmed');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('.calc-save').click()]);
  const png = file('card.png');
  await dl.saveAs(png);
  ok(/\.png$/.test(dl.suggestedFilename()) && fs.statSync(png).size > 20000, 'the saved picture is a real PNG');

  console.log('replace, limit');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.locator('.calc-other').click()]);
  ok(!chooser.isMultiple(), 'replacing takes one file');
  await chooser.setFiles(file('cube.obj'));
  await page.waitForTimeout(900);
  s = await state();
  eq(s.plates.length + ':' + s.plates[1].name, '2:cube.obj', 'the file is replaced on the same plate');
  await load(...Array(10).fill('cube.stl'));
  s = await state();
  eq(s.plates.length, 10, 'no more than 10 plates');
  ok(s.alert.length > 0, 'the limit is explained');
  ok(await page.locator('.calc-plate-add').isHidden(), '"add a model" is hidden at the limit');
  await ctx.close();

  // ----- phone, UZ
  ({ ctx, page, state, load } = await open('/uz/narxlar/', { width: 375, height: 800 }));
  console.log('phone, Uzbek');
  await load('cube.stl', 'tee.stl');
  s = await state();
  eq(s.size, '60 × 20 × 50 mm', 'units are translated');
  eq(s.plates.length, 2, 'two plates');
  ok(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'no sideways scrolling of the page');
  await ctx.close();

  eq(errors.join(' | '), '', 'no errors in the console');
  await browser.close();
  srv.close();
  fs.rmSync(DIR, { recursive: true, force: true });

  console.log(failed ? `\n[test] FAILED: ${failed} of ${failed + passed} checks` : `\n[test] OK: ${passed} checks`);
  process.exitCode = failed ? 1 : 0;
}

main().catch(e => {
  console.error('[test] crashed:', e);
  process.exit(1);
});
