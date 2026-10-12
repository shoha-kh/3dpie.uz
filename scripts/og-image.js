#!/usr/bin/env node
/**
 * scripts/og-image.js — renders the social preview images images/og-ru.jpg and images/og-uz.jpg
 * (1200×630) from scripts/og/template.html. Edit TEXT below, then: npm run og
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, SHOTS_DIR, serve, screenshot, ffmpeg } = require('./lib/tools');
const { CONTACTS } = require('../src/site');

const TEXT = {
  ru: {
    kicker: '3D-печать на заказ · Ташкент и Чирчик',
    title: 'Напечатаем деталь, которую <em>больше нигде</em> не купить',
    sub: 'Заказ от 100 000 сум · 3D-сканирование',
    img1: '/images/work-grille.webp', cap1: 'Решётка для авто',
    img2: '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', cap2: 'Переходник для электромобиля'
  },
  uz: {
    kicker: '3D chop etish · Toshkent va Chirchiq',
    title: 'Boshqa joyda <em>topilmaydigan</em> detalni chop etamiz',
    sub: "Buyurtma 100 000 so'mdan · 3D skanerlash",
    img1: '/images/work-grille.webp', cap1: 'Avtomobil panjarasi',
    img2: '/gallery/ev-charger-adapter/ev-charger-adapter-poster.webp', cap2: 'Elektromobil adapteri'
  }
};

async function main() {
  const tpl = fs.readFileSync(path.join(__dirname, 'og', 'template.html'), 'utf8');
  const pages = {};
  for (const [lang, t] of Object.entries(TEXT)) {
    pages[`/__og-${lang}.html`] = tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => (k === 'phone' ? CONTACTS.phoneHuman : t[k]));
  }
  const srv = await serve(pages);
  try {
    for (const lang of Object.keys(TEXT)) {
      const png = await screenshot(`${srv.url}/__og-${lang}.html`, path.join(SHOTS_DIR, `og-${lang}.png`), 1200, 630);
      const jpg = path.join(ROOT, 'images', `og-${lang}.jpg`);
      ffmpeg(['-i', png, '-q:v', '3', jpg]);
      console.log(jpg);
    }
  } finally {
    srv.close();
  }
}

main().catch(e => { console.error(e.message); process.exitCode = 1; });
