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
                ${layout.renderCtaButtons(page.lang)}
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
    layout.renderCtaBand(page.lang)
  ];
  return parts.filter(Boolean).join('\n\n');
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

function main() {
  const pages = loadPages();
  const galleryItems = JSON.parse(fs.readFileSync(GALLERY_DATA, 'utf8')).items || [];
  const ctx = { layout, T, CONTACTS, galleryItems };

  for (const page of pages) {
    const mainHtml = page.type === 'home'
      ? page.render(ctx)
      : renderInnerPage(page, pages, galleryItems);
    const html = layout.renderDocument(page, pages, mainHtml);
    const file = outputFile(page.path);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, html, 'utf8');
    console.log(`[build-site] ${page.lang} ${page.path} -> ${path.relative(ROOT, file)}`);
  }

  // Fill gallery markers on the home pages (index.html, uz.html).
  gallery.main();

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), buildSitemap(pages), 'utf8');
  console.log(`[build-site] sitemap.xml — ${pages.length} URLs`);
}

main();
