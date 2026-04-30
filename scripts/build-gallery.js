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
const GENERATED_NOTICE = '<!-- Auto-generated from data/gallery.json by scripts/build-gallery.js. Do not edit by hand. -->';

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

// ------- renderers -------

function renderMedia(media, lang) {
  const type = media.type || 'image';
  const href = escapeAttr(media.src);
  const caption = pickLang(media.caption, lang);
  const captionAttr = caption ? ` data-caption="${escapeAttr(caption)}"` : '';
  const posterAttr = (type === 'video' && media.poster) ? ` data-poster="${escapeAttr(media.poster)}"` : '';
  return `                    <a class="work-media" href="${href}" data-type="${escapeAttr(type)}"${posterAttr}${captionAttr} aria-hidden="true"></a>`;
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
    // Without a poster, preload metadata so the browser can show the first frame.
    const preload = poster ? 'none' : 'metadata';
    const posterAttr = poster ? ` poster="${poster}"` : '';
    thumbHtml =
`                    <div class="work-thumb">
                        <video class="work-video" src="${videoSrc}" muted loop playsinline preload="${preload}"${posterAttr}></video>
                        <div class="work-badge">${escapeHtml(badge)}</div>
                    </div>`;
  } else {
    const firstImage = (item.medias || []).find(m => m.type === 'image') || {};
    const thumbSrc = escapeAttr(item.thumb || firstImage.src || '');
    const altText = pickLang(firstImage.alt, lang) || title;
    thumbHtml =
`                    <div class="work-thumb">
                        <img src="${thumbSrc}" alt="${escapeAttr(altText)}" loading="lazy">
                    </div>`;
  }

  const mediasHtml = (item.medias || []).map(m => renderMedia(m, lang)).join('\n');
  const idAttr = item.id ? ` id="work-${escapeAttr(item.id)}"` : '';

  // Long description (optional) — rendered as a hidden block so JS can pick it up for the modal.
  // Newlines are converted to <br> for display.
  const longDescription = pickLang(item.longDescription, lang);
  const longDescHtml = longDescription
    ? `\n                    <div class="work-long-desc" hidden aria-hidden="true">${escapeHtml(longDescription).replace(/\n/g, '<br>')}</div>`
    : '';

  return `                <article${idAttr} class="work-card" data-type="${escapeAttr(type)}" aria-label="${ariaLabel}">
${thumbHtml}
                    <div class="work-meta">
                        <h3>${escapeHtml(title)}</h3>
                        <p>${escapeHtml(description)}</p>
                    </div>${longDescHtml}
${mediasHtml}
                </article>`;
}

function renderGallery(items, lang) {
  const cards = items.map(item => renderCard(item, lang)).join('\n\n');
  return `                ${START_MARKER}\n                ${GENERATED_NOTICE}\n${cards}\n                ${END_MARKER}`;
}

// ------- injector -------

function injectGallery(html, renderedBlock, fileLabel) {
  const startIdx = html.indexOf(START_MARKER);
  const endIdx   = html.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `Markers not found in ${fileLabel}. Expected "${START_MARKER}" ... "${END_MARKER}".`
    );
  }

  // Replace from the start of the line containing START_MARKER to the end of END_MARKER
  const lineStart = html.lastIndexOf('\n', startIdx) + 1;
  const blockEnd  = endIdx + END_MARKER.length;

  return html.slice(0, lineStart) + renderedBlock + html.slice(blockEnd);
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
    const next = injectGallery(html, block, path.basename(target.file));
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
