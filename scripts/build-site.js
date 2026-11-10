#!/usr/bin/env node
/**
 * scripts/build-site.js
 *
 * Builds every HTML page of the site from src/pages/*.js using the shared layout
 * (src/layout.js), then fills the home-page galleries (scripts/build-gallery.js)
 * and regenerates sitemap.xml.
 *
 * Usage:  npm run build      (or: node scripts/build-site.js)
 *
 * No external dependencies. Requires Node.js >= 18.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const layout = require('../src/layout');
const { SITE_URL, CONTACTS, T } = require('../src/site');
const gallery = require('./build-gallery');
const taplink = require('../src/taplink');

const ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');
const GALLERY_DATA = path.join(ROOT, 'data', 'gallery.json');

function loadPages() {
  const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.js')).sort();
  const pages = [];
  for (const f of files) {
    const mod = require(path.join(PAGES_DIR, f));
    pages.push(...(Array.isArray(mod) ? mod : [mod]));
  }
  // Keep a stable order: home first, then the rest as declared.
  return pages.sort((a, b) => (a.type === 'home' ? -1 : 0) - (b.type === 'home' ? -1 : 0));
}

function outputFile(pagePath) {
  if (pagePath === '/') return path.join(ROOT, 'index.html');
  if (pagePath.endsWith('.html')) return path.join(ROOT, pagePath.slice(1));
  return path.join(ROOT, pagePath.slice(1), 'index.html');
}

function renderWorks(page, galleryItems) {
  const t = T[page.lang];
  const cards = (page.works || [])
    .map(id => galleryItems.find(i => i.id === id))
    .filter(Boolean)
    .map(item => gallery.renderCard(item, page.lang))
    .join('\n\n');
  if (!cards) return '';
  return `    <section class="section section-works">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">${layout.esc(t.worksTitle)}</h2>
                <a class="link-arrow" href="${t.home}#gallery">${layout.esc(t.worksMore)} <span aria-hidden="true">→</span></a>
            </div>
            <div class="works-grid">
${cards}
            </div>
        </div>
    </section>`;
}

// Service and article pages share one template; home pages render themselves.
function renderInnerPage(page, registry, galleryItems) {
  const t = T[page.lang];
  const figure = page.heroImage ? `
                <figure class="fig">
                    <img src="${page.heroImage.src}" width="${page.heroImage.w}" height="${page.heroImage.h}" alt="${layout.esc(page.heroImage.alt)}" fetchpriority="high">
                    <figcaption>${page.heroImage.caption}</figcaption>
                </figure>` : '';
  const spec = page.spec ? '\n' + layout.renderSpec(page.spec) : '';

  const sections = (page.sections || []).map(s => `    <section class="section section-prose"${s.id ? ` id="${s.id}"` : ''}>
        <div class="wrap prose-grid">
            <h2 class="h2">${layout.esc(s.title)}</h2>
            <div class="prose">
${s.html.trim().split('\n').map(l => '                ' + l.trim()).join('\n')}
            </div>
        </div>
    </section>`).join('\n\n');

  const parts = [
    `    <section class="page-hero">
        <div class="wrap page-hero-grid">
            <div class="page-hero-copy">
                <nav class="crumbs" aria-label="${layout.esc(t.breadcrumbLabel)}">
                    <a href="${t.home}">${layout.esc(t.homeName)}</a><span aria-hidden="true">/</span><span aria-current="page">${layout.esc(page.breadcrumb)}</span>
                </nav>
                <p class="kicker">${layout.esc(page.kicker)}</p>
                <h1 class="h1">${page.h1Html || layout.esc(page.h1)}</h1>
                <p class="lead">${page.lead}</p>
                ${page.type === 'info' ? '' : layout.renderCtaButtons(page.lang)}
            </div>
            <div class="page-hero-aside">${figure}${spec}
            </div>
        </div>
    </section>`,
    page.calc ? layout.renderCalc(page.lang) : '',
    sections,
    renderWorks(page, galleryItems),
    page.type === 'service' ? layout.renderSteps(page.lang) : '',
    page.faq && page.faq.length ? layout.renderFaq(page.lang, page.faq, { openFirst: true }) : '',
    layout.renderRelated(page, registry),
    page.type === 'info' ? '' : layout.renderCtaBand(page.lang)
  ];
  return parts.filter(Boolean).join('\n\n');
}

// One page per gallery work, in both languages: /raboty/<id>/ and /uz/ishlar/<id>/.
// Everything comes from data/gallery.json, so a new work gets its page with the next build.
function workPages(galleryItems, updated, servicePages) {
  const pages = [];
  for (const item of galleryItems) {
    if (!item.id) continue;
    for (const lang of ['ru', 'uz']) {
      const t = T[lang];
      const title = gallery.pickLang(item.title, lang);
      let description = gallery.pickLang(item.description, lang).replace(/[.!\s]+$/, '') + '.';
      if ((description + t.workDescTail).length <= 160) description += t.workDescTail;
      if (description.length > 160) description = description.slice(0, 157).replace(/\s+\S*$/, '') + '…';
      const medias = item.medias || [];
      const video = medias.find(m => m.type === 'video');
      const image = item.thumb || (video && video.poster) || (medias.find(m => m.type === 'image') || {}).src || '';
      // the services that show this work on their pages
      const related = servicePages.filter(p => p.lang === lang && (p.works || []).includes(item.id)).map(p => p.id);
      pages.push({
        id: 'work-' + item.id,
        lang,
        type: 'work',
        path: gallery.workPath(item.id, lang),
        updated,
        nav: 'works',
        breadcrumb: title,
        title: (title + t.workTitleTail).length <= 80 ? title + t.workTitleTail : title + ' | 3DPie',
        description,
        tg: t.workTg + title,
        kicker: t.workKicker,
        h1: title,
        lead: gallery.pickLang(item.description, lang),
        related: related.length ? related.slice(0, 4) : ['modeling', 'scanning', 'prices'],
        hasGallery: true,
        ogImage: /\.(jpe?g|png)$/i.test(image) ? gallery.assetUrl(image) : undefined,
        work: { item, image: gallery.assetUrl(image) },
        sitemapImages: image ? [gallery.assetUrl(image)] : []
      });
    }
  }
  return pages;
}

function renderWorkPage(page, registry, galleryItems) {
  const t = T[page.lang];
  const item = page.work.item;
  const esc = layout.esc;
  const medias = item.medias || [];
  const video = medias.find(m => m.type === 'video');
  const images = medias.filter(m => m.type === 'image');
  const alt = m => esc(gallery.pickLang(m.alt, page.lang) || gallery.pickLang(m.caption, page.lang) || page.h1);

  const hero = video
    ? `<video controls playsinline preload="none" poster="${gallery.assetUrl(video.poster || item.thumb || '')}" src="${gallery.assetUrl(video.src)}"></video>`
    : images[0] ? `<img src="${gallery.assetUrl(images[0].src)}" alt="${alt(images[0])}" fetchpriority="high">` : '';
  const rest = video ? images : images.slice(1);

  const long = gallery.pickLang(item.longDescription, page.lang).trim();
  const paragraphs = long
    ? long.split(/\n{2,}/).map(p => `<p>${esc(p.trim()).replace(/\n/g, '<br>')}</p>`).join('\n                ')
    : `<p>${esc(page.lead)}</p>`;
  const photos = rest.length ? `
                <h3>${esc(t.workPhotos)}</h3>
                <div class="work-photos">
${rest.map(m => `                    <img src="${gallery.assetUrl(m.src)}" alt="${alt(m)}" loading="lazy">`).join('\n')}
                </div>` : '';

  const others = galleryItems.filter(i => i.id && i.id !== item.id);
  const start = galleryItems.findIndex(i => i.id === item.id) % Math.max(others.length, 1);
  const cards = others.slice(start).concat(others.slice(0, start)).slice(0, 4)
    .map(i => gallery.renderCard(i, page.lang)).join('\n\n');

  return [
    `    <section class="page-hero">
        <div class="wrap page-hero-grid">
            <div class="page-hero-copy">
                <nav class="crumbs" aria-label="${esc(t.breadcrumbLabel)}">
                    <a href="${t.home}">${esc(t.homeName)}</a><span aria-hidden="true">/</span><a href="${t.home}#gallery">${esc(t.worksMore)}</a><span aria-hidden="true">/</span><span aria-current="page">${esc(page.breadcrumb)}</span>
                </nav>
                <p class="kicker">${esc(page.kicker)}</p>
                <h1 class="h1">${esc(page.h1)}</h1>
                <p class="lead">${esc(page.lead)}</p>
                ${layout.renderCtaButtons(page.lang)}
            </div>
            <div class="page-hero-aside">
                <figure class="fig work-figure">
                    ${hero}
                </figure>
            </div>
        </div>
    </section>`,
    `    <section class="section section-prose">
        <div class="wrap prose-grid">
            <h2 class="h2">${esc(t.workAbout)}</h2>
            <div class="prose">
                ${paragraphs}${photos}
            </div>
        </div>
    </section>`,
    cards ? `    <section class="section section-works">
        <div class="wrap">
            <div class="section-head">
                <h2 class="h2">${esc(t.workOthers)}</h2>
                <a class="link-arrow" href="${t.home}#gallery">${esc(t.worksMore)} <span aria-hidden="true">→</span></a>
            </div>
            <div class="works-grid">
${cards}
            </div>
        </div>
    </section>` : '',
    layout.renderRelated(page, registry, t.workServices),
    layout.renderCtaBand(page.lang)
  ].filter(Boolean).join('\n\n');
}

function buildSitemap(pages) {
  const urls = pages.map(p => {
    const alts = pages.filter(a => a.id === p.id);
    const ruAlt = alts.find(a => a.lang === 'ru');
    const altLinks = alts.map(a =>
      `        <xhtml:link rel="alternate" hreflang="${T[a.lang].hreflang}" href="${SITE_URL}${a.path}"/>`);
    if (ruAlt) altLinks.push(`        <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${ruAlt.path}"/>`);
    const images = (p.sitemapImages || []).map(src =>
      `        <image:image><image:loc>${SITE_URL}${src}</image:loc></image:image>`);
    return `    <url>
        <loc>${SITE_URL}${p.path}</loc>
        <lastmod>${p.updated}</lastmod>
${altLinks.concat(images).join('\n')}
    </url>`;
  });
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/build-site.js -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>
`;
}

// GitHub Pages serves /404.html for unknown URLs (with HTTP 404). Bilingual, noindex, links to key pages.
function render404(pages) {
  const link = p => `<a href="${p.path}">${layout.esc(p.breadcrumb || p.h1)}</a>`;
  const list = lang => pages.filter(p => p.lang === lang && p.type !== 'home' && p.type !== 'work').map(link).join(' · ');
  return `<!DOCTYPE html>
<!-- Generated by scripts/build-site.js — edit render404(), not this file. -->
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Страница не найдена — 3DPie</title>
    <meta name="robots" content="noindex">
    <meta name="theme-color" content="#0c0e0f">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/icon-32.png">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="${layout.asset('/css/styles.css')}">
</head>
<body class="page-404">
    <main id="main">
    <section class="page-hero">
        <div class="wrap">
            <p class="kicker">404</p>
            <h1 class="h1">Страница не найдена</h1>
            <p class="lead">Возможно, она переехала. Начните с <a href="/">главной</a> или напишите нам — напечатаем нужную деталь.<br>
            ${list('ru')}</p>
            <p class="lead" lang="uz">Sahifa topilmadi. <a href="/uz.html">Bosh sahifa</a> · ${list('uz')}</p>
            ${layout.renderCtaButtons('ru')}
        </div>
    </section>
    </main>
</body>
</html>
`;
}

function main() {
  const galleryData = JSON.parse(fs.readFileSync(GALLERY_DATA, 'utf8'));
  const galleryItems = galleryData.items || [];
  const sourcePages = loadPages();
  const pages = sourcePages.concat(workPages(galleryItems, galleryData.updated, sourcePages.filter(p => p.type === 'service')));
  const ctx = { layout, T, CONTACTS, galleryItems };

  for (const page of pages) {
    layout.setPage(page);
    const mainHtml = page.type === 'home' ? page.render(ctx)
      : page.type === 'work' ? renderWorkPage(page, pages, galleryItems)
      : renderInnerPage(page, pages, galleryItems);
    const html = layout.renderDocument(page, pages, mainHtml);
    const file = outputFile(page.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html, 'utf8');
    console.log(`[build-site] ${page.lang} ${page.path} -> ${path.relative(ROOT, file)}`);
  }

  layout.setPage(null);

  // Fill gallery markers on the home pages (index.html, uz.html).
  gallery.main();

  // The Uzbek home page is /uz.html while its other pages live under /uz/…: without this file
  // /uz/ (and /uz) answer 404. A tiny page that sends the visitor on; search engines get the canonical.
  fs.writeFileSync(path.join(ROOT, 'uz', 'index.html'), `<!DOCTYPE html>
<!-- Generated by scripts/build-site.js — edit it there, not this file. -->
<html lang="uz-Latn-UZ">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>3DPie — Toshkent va Chirchiqda 3D chop etish</title>
    <meta name="robots" content="noindex, follow">
    <link rel="canonical" href="${SITE_URL}/uz.html">
    <meta http-equiv="refresh" content="0; url=/uz.html">
    <meta name="theme-color" content="#0c0e0f">
    <style>body{margin:0;padding:24px;font:16px/1.5 sans-serif;color:#eceeed;background:#0c0e0f}a{color:#c6f432}</style>
</head>
<body>
    <p><a href="/uz.html">3DPie — bosh sahifa</a></p>
    <script>location.replace('/uz.html' + location.search + location.hash)</script>
</body>
</html>
`, 'utf8');

  fs.writeFileSync(path.join(ROOT, '404.html'), render404(pages), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'taplink.html'), taplink.render(), 'utf8');
  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(pages), 'utf8');
  console.log(`[build-site] sitemap.xml — ${pages.length} URLs`);
}

main();
