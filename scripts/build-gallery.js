#!/usr/bin/env node
/**
 * scripts/build-gallery.js
 *
 * Reads data/gallery.json and injects the rendered gallery HTML into
 * index.html (RU) and uz.html (UZ) between the markers:
 *   <!-- GALLERY:START -->
 *   <!-- GALLERY:END -->
 *
 * Usage:
 *   node scripts/build-gallery.js
 *
 * No external dependencies. Requires Node.js >= 16.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'gallery.json');

const TARGETS = [
  { file: path.join(ROOT, 'index.html'), lang: 'ru' },
  { file: path.join(ROOT, 'uz.html'),    lang: 'uz' }
];

const START_MARKER = '<!-- GALLERY:START -->';
const END_MARKER   = '<!-- GALLERY:END -->';
const SCHEMA_START = '<!-- GALLERY-SCHEMA:START -->';
const SCHEMA_END   = '<!-- GALLERY-SCHEMA:END -->';
const GENERATED_NOTICE = '<!-- Auto-generated from data/gallery.json by scripts/build-gallery.js. Do not edit by hand. -->';

const SITE_URL = 'https://3dpie.uz';

// ------- helpers -------

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function pickLang(field, lang) {
  if (field == null) return '';
  if (typeof field === 'string') return field;
  return field[lang] || field.ru || field.uz || '';
}

function formatNumber(n) {
  // Use narrow no-break space (U+202F) as thousands separator
  return Number(n).toLocaleString('ru-RU').replace(/\s/g, '\u202F');
}

function renderCardPriceTag(price, lang) {
  if (!price || price.current == null) return '';
  const currency = pickLang(price.currency, lang) || (lang === 'uz' ? "so'm" : 'сум');
  const current = formatNumber(price.current);
  let html = '<div class="work-price-tag">';
  if (price.original != null && Number(price.original) > Number(price.current)) {
    const original = formatNumber(price.original);
    const discount = Math.round((1 - Number(price.current) / Number(price.original)) * 100);
    html += `<span class="work-price-tag__old">${escapeHtml(original)}</span>`;
    html += `<span class="work-price-tag__current">${escapeHtml(current)}\u00A0${escapeHtml(currency)}</span>`;
    html += `<span class="work-price-tag__discount">-${discount}%</span>`;
  } else {
    html += `<span class="work-price-tag__current">${escapeHtml(current)}\u00A0${escapeHtml(currency)}</span>`;
  }
  html += '</div>';
  return html;
}

// ------- renderers -------

function renderMedia(media, lang) {
  const type = media.type || 'image';
  const href = escapeAttr(media.src);
  const caption = pickLang(media.caption, lang);
  const captionAttr = caption ? ` data-caption="${escapeAttr(caption)}"` : '';
  const posterAttr = (type === 'video' && media.poster) ? ` data-poster="${escapeAttr(media.poster)}"` : '';
  return `                    <a class="work-media" href="${href}" data-type="${escapeAttr(type)}"${posterAttr}${captionAttr} aria-hidden="true" tabindex="-1"></a>`;
}

function renderCard(item, lang) {
  const title = pickLang(item.title, lang);
  const description = pickLang(item.description, lang);
  const ariaLabel = escapeAttr(title);
  const type = item.type === 'video' ? 'video' : 'images';

  let thumbHtml;
  if (type === 'video') {
    const firstVideo = (item.medias || []).find(m => m.type === 'video') || {};
    const videoSrc = escapeAttr(firstVideo.src || '');
    const poster = escapeAttr(firstVideo.poster || item.thumb || '');
    const badge = pickLang(item.badge, lang) || (lang === 'uz' ? 'Video' : 'Видео');
    // Always use preload="none" — card videos only autoplay on hover, full load happens in modal.
    const posterAttr = poster ? ` poster="${poster}"` : '';
    const cardPriceTag = renderCardPriceTag(item.price, lang);
    const cardPriceHtml = cardPriceTag ? `\n                        ${cardPriceTag}` : '';
    thumbHtml =
`                    <div class="work-thumb">
                        <video class="work-video" src="${videoSrc}" muted loop playsinline preload="none"${posterAttr}></video>
                        <div class="work-badge">${escapeHtml(badge)}</div>${cardPriceHtml}
                    </div>`;
  } else {
    const firstImage = (item.medias || []).find(m => m.type === 'image') || {};
    const thumbSrc = escapeAttr(item.thumb || firstImage.src || '');
    const altText = pickLang(firstImage.alt, lang) || title;
    const cardPriceTag = renderCardPriceTag(item.price, lang);
    const cardPriceHtml = cardPriceTag ? `\n                        ${cardPriceTag}` : '';
    thumbHtml =
`                    <div class="work-thumb">
                        <img src="${thumbSrc}" alt="${escapeAttr(altText)}" loading="lazy">${cardPriceHtml}
                    </div>`;
  }

  const mediasHtml = (item.medias || []).map(m => renderMedia(m, lang)).join('\n');
  const idAttr = item.id ? ` id="work-${escapeAttr(item.id)}"` : '';

  // Long description (optional) — rendered as a hidden block so JS can pick it up for the modal.
  // Newlines are converted to <br> for display.
  const longDescription = pickLang(item.longDescription, lang);
  const priceHtml = renderCardPriceTag(item.price, lang);
  const longDescBody = longDescription
    ? escapeHtml(longDescription).replace(/\n/g, '<br>')
    : '';
  const longDescHtml = longDescBody
    ? `\n                    <div class="work-long-desc" hidden aria-hidden="true">${longDescBody}</div>`
    : '';
  const priceBlockHtml = priceHtml
    ? `\n                    <div class="work-price-data" hidden aria-hidden="true">${priceHtml}</div>`
    : '';

  return `                <article${idAttr} class="work-card" data-type="${escapeAttr(type)}" aria-label="${ariaLabel}">
${thumbHtml}
                    <div class="work-meta">
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(description)}</p>
                    </div>${priceBlockHtml}${longDescHtml}
${mediasHtml}
                </article>`;
}

function renderGallery(items, lang) {
  const cards = items.map(item => renderCard(item, lang)).join('\n\n');
  return `                ${START_MARKER}\n                ${GENERATED_NOTICE}\n${cards}\n                ${END_MARKER}`;
}

// ------- Schema.org JSON-LD generation -------

function absoluteUrl(rel) {
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel)) return rel;
  return SITE_URL + '/' + String(rel).replace(/^\.?\//, '');
}

function buildProductSchema(item, lang) {
  const title = pickLang(item.title, lang);
  const description = pickLang(item.description, lang);
  const pageUrl = `${SITE_URL}${lang === 'uz' ? '/uz.html' : '/'}#work-${item.id}`;
  // Try to find an image — first explicit thumb, then any image media, then any video poster
  const medias = item.medias || [];
  const firstImage = medias.find(m => m.type === 'image');
  const firstPoster = medias.find(m => m.poster);
  const imageRel = item.thumb || (firstImage && firstImage.src) || (firstPoster && firstPoster.poster) || '';
  const image = imageRel ? absoluteUrl(imageRel) : '';

  const hasOffer = !!(item.price && item.price.current != null);

  // Items without an offer are CreativeWork (Google does not require offers/review/aggregateRating).
  // Priced items are full Product entries with Offer (image required by Google).
  const node = {
    '@type': hasOffer ? 'Product' : 'CreativeWork',
    'name': title,
    'description': description,
    'url': pageUrl,
    'brand': { '@type': 'Brand', 'name': '3DPie' }
  };

  if (hasOffer) {
    // Product requires an image — fall back to brand logo if portfolio image is missing.
    node.image = image || `${SITE_URL}/images/logo.jpg`;
    node.offers = {
      '@type': 'Offer',
      'price': String(item.price.current),
      'priceCurrency': 'UZS',
      'availability': 'https://schema.org/InStock',
      'url': pageUrl,
      'seller': { '@type': 'Organization', 'name': '3DPie' }
    };
  } else if (image) {
    node.image = image;
  }

  return node;
}

function renderSchemaBlock(items, lang) {
  const products = items.map((item, idx) => ({
    '@type': 'ListItem',
    'position': idx + 1,
    'item': buildProductSchema(item, lang)
  }));
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': lang === 'uz'
      ? '3DPie ishlari galereyasi — 3D-chop etish namunalari'
      : 'Галерея работ 3DPie — примеры 3D-печати',
    'itemListElement': products
  };
  const json = JSON.stringify(itemList, null, 2)
    .split('\n').map(l => '    ' + l).join('\n');
  return `    ${SCHEMA_START}\n    <script type="application/ld+json">\n${json}\n    </script>\n    ${SCHEMA_END}`;
}

// ------- injector -------

function injectBlock(html, startMarker, endMarker, renderedBlock, fileLabel) {
  const startIdx = html.indexOf(startMarker);
  const endIdx   = html.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `Markers not found in ${fileLabel}. Expected "${startMarker}" ... "${endMarker}".`
    );
  }
  const lineStart = html.lastIndexOf('\n', startIdx) + 1;
  const blockEnd  = endIdx + endMarker.length;
  return html.slice(0, lineStart) + renderedBlock + html.slice(blockEnd);
}

function injectGallery(html, renderedBlock, fileLabel) {
  return injectBlock(html, START_MARKER, END_MARKER, renderedBlock, fileLabel);
}

function injectSchema(html, renderedBlock, fileLabel) {
  if (html.indexOf(SCHEMA_START) === -1) return html; // markers optional
  return injectBlock(html, SCHEMA_START, SCHEMA_END, renderedBlock, fileLabel);
}

// ------- main -------

function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error(`[build-gallery] Data file not found: ${DATA_FILE}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (err) {
    console.error(`[build-gallery] Failed to parse ${DATA_FILE}: ${err.message}`);
    process.exit(1);
  }

  const items = Array.isArray(data.items) ? data.items : [];
  if (!items.length) {
    console.warn('[build-gallery] No items in gallery.json — generated block will be empty.');
  }

  let updated = 0;
  for (const target of TARGETS) {
    if (!fs.existsSync(target.file)) {
      console.warn(`[build-gallery] Skipping (not found): ${target.file}`);
      continue;
    }
    const html = fs.readFileSync(target.file, 'utf8');
    const block = renderGallery(items, target.lang);
    let next = injectGallery(html, block, path.basename(target.file));
    const schemaBlock = renderSchemaBlock(items, target.lang);
    next = injectSchema(next, schemaBlock, path.basename(target.file));
    if (next !== html) {
      fs.writeFileSync(target.file, next, 'utf8');
      updated++;
      console.log(`[build-gallery] Updated ${path.basename(target.file)} (${target.lang}) — ${items.length} cards`);
    } else {
      console.log(`[build-gallery] No changes for ${path.basename(target.file)}`);
    }
  }

  console.log(`[build-gallery] Done. ${updated} file(s) updated.`);
}

main();
