'use strict';

/**
 * Page shell: <head>, header, footer, mobile action bar and shared blocks
 * (spec list, order steps, FAQ, CTA band, related links, JSON-LD).
 */

const { SITE_URL, CONTACTS, T, STEPS, STEPS_TITLE, STEP_LABEL, businessNode } = require('./site');

const ASSET_VERSION = '20261012c';

function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Strip tags for plain-text JSON-LD answers.
function plain(html) {
  return String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function abs(p) {
  return SITE_URL + p;
}

// ---------- head ----------

const ANALYTICS = `
    <script>
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105486503', 'ym');
        ym(105486503, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
    </script>
    <noscript><div><img src="https://mc.yandex.ru/watch/105486503" style="position:absolute; left:-9999px;" alt=""></div></noscript>
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-HTLG7TDQV4"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-HTLG7TDQV4');
    </script>`;

function renderHead(page, alternates) {
  const t = T[page.lang];
  const url = abs(page.path);
  const ogImage = abs(page.ogImage || `/images/og-${page.lang}.jpg`);
  const altLinks = alternates.map(a =>
    `    <link rel="alternate" hreflang="${T[a.lang].hreflang}" href="${abs(a.path)}">`).join('\n');
  const ruAlt = alternates.find(a => a.lang === 'ru');
  const xDefault = ruAlt ? `\n    <link rel="alternate" hreflang="x-default" href="${abs(ruAlt.path)}">` : '';
  const ogAlt = alternates.filter(a => a.lang !== page.lang)
    .map(a => `\n    <meta property="og:locale:alternate" content="${T[a.lang].ogLocale}">`).join('');
  const preload = page.preloadImage
    ? `\n    <link rel="preload" as="image" href="${page.preloadImage}" fetchpriority="high">` : '';
  const galleryCss = page.hasGallery
    ? `\n    <link rel="stylesheet" href="/css/gallery.css?v=${ASSET_VERSION}">` : '';

  return `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <link rel="canonical" href="${url}">
${altLinks}${xDefault}
    <meta property="og:type" content="${page.type === 'article' ? 'article' : 'website'}">
    <meta property="og:site_name" content="3DPie">
    <meta property="og:title" content="${esc(page.ogTitle || page.title)}">
    <meta property="og:description" content="${esc(page.description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${ogImage}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="${t.ogLocale}">${ogAlt}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="geo.region" content="UZ-TO">
    <meta name="geo.placename" content="${esc(t.address.city)}">
    <meta name="geo.position" content="${CONTACTS.geo.lat};${CONTACTS.geo.lng}">
    <meta name="ICBM" content="${CONTACTS.geo.lat}, ${CONTACTS.geo.lng}">
    <meta name="theme-color" content="#0c0e0f">
    <meta name="yandex-verification" content="e333c0d704796c01">
    <link rel="icon" type="image/png" sizes="32x32" href="/images/icon-32.png">
    <link rel="apple-touch-icon" href="/images/icon-192.png">
    <link rel="manifest" href="/manifest.json">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600&family=Unbounded:wght@400;500;700&display=swap">
    <link rel="stylesheet" href="/css/styles.css?v=${ASSET_VERSION}">${galleryCss}${preload}
${ANALYTICS}
    <script type="application/ld+json">
${indentJson(buildSchema(page, alternates), 4)}
    </script>
</head>`;
}

function indentJson(obj, spaces) {
  const pad = ' '.repeat(spaces);
  return JSON.stringify(obj, null, 2).split('\n').map(l => pad + l).join('\n');
}

// ---------- JSON-LD ----------

function buildSchema(page, alternates) {
  const t = T[page.lang];
  const url = abs(page.path);
  const graph = [businessNode(page.lang)];

  if (page.type === 'home') {
    graph.push({
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: '3DPie',
      inLanguage: ['ru', 'uz'],
      publisher: { '@id': `${SITE_URL}/#business` }
    });
  } else {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: t.homeName, item: abs(t.home) },
        { '@type': 'ListItem', position: 2, name: page.breadcrumb, item: url }
      ]
    });
  }

  if (page.service) {
    const s = {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: page.service.name,
      serviceType: page.service.serviceType,
      description: page.description,
      url,
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'Country', name: t.areaNames.country },
      inLanguage: page.lang
    };
    if (page.service.minPrice) {
      s.offers = {
        '@type': 'Offer',
        priceCurrency: 'UZS',
        priceSpecification: {
          '@type': 'PriceSpecification',
          minPrice: page.service.minPrice,
          priceCurrency: 'UZS'
        }
      };
    }
    graph.push(s);
  }

  if (page.type === 'article') {
    graph.push({
      '@type': 'Article',
      headline: page.h1,
      description: page.description,
      inLanguage: page.lang,
      datePublished: page.published || page.updated,
      dateModified: page.updated,
      mainEntityOfPage: url,
      image: abs(page.ogImage || `/images/og-${page.lang}.jpg`),
      author: { '@type': 'Organization', name: '3DPie', url: `${SITE_URL}/` },
      publisher: { '@id': `${SITE_URL}/#business` }
    });
  }

  if (page.faq && page.faq.length) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: page.faq.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: plain(f.a) }
      }))
    });
  }

  return { '@context': 'https://schema.org', '@graph': graph };
}

// ---------- header / footer ----------

function renderHeader(page, alternates) {
  const t = T[page.lang];
  const nav = t.nav.map(n => {
    const current = page.nav === n.key ? ' aria-current="page"' : '';
    return `                    <li><a href="${n.href}"${current}>${esc(n.label)}</a></li>`;
  }).join('\n');
  const langs = ['ru', 'uz'].map(l => {
    const target = alternates.find(a => a.lang === l);
    const href = target ? target.path : T[l].home;
    const active = l === page.lang ? ' class="is-active" aria-current="true"' : '';
    return `<a href="${href}" hreflang="${l}" lang="${l}"${active}>${l.toUpperCase()}</a>`;
  }).join('<span aria-hidden="true">/</span>');

  return `    <a class="skip-link" href="#main">${page.lang === 'uz' ? "Asosiy matnga o'tish" : 'Перейти к содержимому'}</a>
    <header class="site-header">
        <div class="wrap header-row">
            <a class="brand" href="${t.home}">
                <img src="/images/logo.webp" width="34" height="34" alt="" decoding="async">
                <span class="brand-name">3DPie</span>
                <span class="brand-loc">${esc(t.brandLoc)}</span>
            </a>
            <nav class="main-nav" id="main-nav" aria-label="${esc(t.navLabel)}">
                <ul>
${nav}
                </ul>
            </nav>
            <div class="header-tools">
                <div class="lang" role="group" aria-label="${esc(t.langLabel)}">${langs}</div>
                <a class="header-phone" href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a>
                <a class="btn btn-accent btn-sm header-tg" href="${CONTACTS.telegram}" target="_blank" rel="noopener">${esc(t.ctaTelegramShort)}</a>
                <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
                    <span class="nav-toggle-bars" aria-hidden="true"></span>${esc(t.menu)}
                </button>
            </div>
        </div>
    </header>`;
}

function renderFooter(page, registry) {
  const t = T[page.lang];
  const services = registry
    .filter(p => p.lang === page.lang && p.type === 'service')
    .map(p => `                    <li><a href="${p.path}">${esc(p.navTitle || p.breadcrumb)}</a></li>`).join('\n');
  const info = t.footerInfoLinks
    .map(l => `                    <li><a href="${l.href}">${esc(l.label)}</a></li>`).join('\n');

  return `    <footer class="site-footer">
        <div class="wrap footer-grid">
            <div class="footer-about">
                <a class="brand brand-invert" href="${t.home}">
                    <img src="/images/logo.webp" width="34" height="34" alt="" loading="lazy">
                    <span class="brand-name">3DPie</span>
                </a>
                <p>${esc(t.footerAbout)}</p>
                <address>${esc(t.address.full)}<br>${esc(t.address.landmark)}</address>
            </div>
            <div>
                <h2 class="footer-h">${esc(t.footerServices)}</h2>
                <ul class="footer-links">
${services}
                </ul>
            </div>
            <div>
                <h2 class="footer-h">${esc(t.footerInfo)}</h2>
                <ul class="footer-links">
${info}
                </ul>
            </div>
            <div>
                <h2 class="footer-h">${esc(t.footerContacts)}</h2>
                <ul class="footer-links">
                    <li><a href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a></li>
                    <li><a href="${CONTACTS.telegram}" target="_blank" rel="noopener">Telegram ${CONTACTS.telegramHandle}</a></li>
                    <li><a href="${CONTACTS.instagram}" target="_blank" rel="noopener">Instagram ${CONTACTS.instagramHandle}</a></li>
                </ul>
            </div>
        </div>
        <div class="wrap footer-mark" aria-hidden="true">3DPie</div>
        <div class="wrap footer-bottom">
            <p>${esc(t.copyright)}</p>
            <p><a href="/" hreflang="ru">Русский</a> · <a href="/uz.html" hreflang="uz">O'zbekcha</a></p>
        </div>
    </footer>

    <div class="mobile-bar">
        <a href="tel:${CONTACTS.phone}">${esc(t.ctaCall)}</a>
        <a class="is-accent" href="${CONTACTS.telegram}" target="_blank" rel="noopener">${esc(t.ctaTelegramShort)}</a>
    </div>`;
}

// ---------- shared blocks ----------

function renderSpec(rows, extraClass) {
  const items = rows.map(([k, v]) =>
    `                    <div><dt>${esc(k)}</dt><dd>${v}</dd></div>`).join('\n');
  return `                <dl class="spec${extraClass ? ' ' + extraClass : ''}">
${items}
                </dl>`;
}

function renderCtaButtons(lang) {
  const t = T[lang];
  return `<div class="cta-row">
                    <a class="btn btn-accent" href="${CONTACTS.telegram}" target="_blank" rel="noopener">${esc(t.ctaTelegram)} <span aria-hidden="true">→</span></a>
                    <a class="btn btn-line" href="tel:${CONTACTS.phone}">${CONTACTS.phoneHuman}</a>
                </div>`;
}

function renderSteps(lang, id) {
  const steps = STEPS[lang].map((s, i) => `                <li>
                    <span class="step-n" aria-label="${STEP_LABEL[lang]} ${i + 1}">${i + 1}</span>
                    <h3>${esc(s.t)}</h3>
                    <p>${esc(s.d)}</p>
                </li>`).join('\n');
  return `    <section class="section section-steps"${id ? ` id="${id}"` : ''}>
        <div class="wrap">
            <h2 class="h2">${esc(STEPS_TITLE[lang])}</h2>
            <ol class="steps">
${steps}
            </ol>
        </div>
    </section>`;
}

function renderFaq(lang, faq, opts) {
  const o = opts || {};
  const items = faq.map((f, i) => `                <details class="faq-item"${i === 0 && o.openFirst ? ' open' : ''}>
                    <summary>${esc(f.q)}</summary>
                    <div class="faq-a">${f.a}</div>
                </details>`).join('\n');
  return `    <section class="section section-faq" id="faq">
        <div class="wrap faq-grid">
            <h2 class="h2">${esc(o.title || T[lang].faqTitle)}</h2>
            <div class="faq-list">
${items}
            </div>
        </div>
    </section>`;
}

function renderCtaBand(lang) {
  const t = T[lang];
  return `    <section class="cta-band">
        <div class="wrap cta-band-inner">
            <div>
                <h2>${esc(t.ctaBandTitle)}</h2>
                <p>${esc(t.ctaBandText)}</p>
            </div>
            ${renderCtaButtons(lang)}
        </div>
    </section>`;
}

function renderRelated(page, registry) {
  const t = T[page.lang];
  const items = (page.related || [])
    .map(id => registry.find(p => p.id === id && p.lang === page.lang))
    .filter(Boolean)
    .map(p => `                <li><a href="${p.path}"><span>${esc(p.navTitle || p.breadcrumb)}</span><span class="arrow" aria-hidden="true">→</span></a></li>`)
    .join('\n');
  if (!items) return '';
  return `    <section class="section section-related">
        <div class="wrap">
            <h2 class="h2">${esc(t.relatedTitle)}</h2>
            <ul class="related">
${items}
            </ul>
        </div>
    </section>`;
}

// ---------- full document ----------

function renderDocument(page, registry, mainHtml) {
  const alternates = registry.filter(p => p.id === page.id);
  const t = T[page.lang];
  const scripts = [`    <script src="/js/scripts.js?v=${ASSET_VERSION}" defer></script>`];
  if (page.hasGallery) scripts.push(`    <script src="/js/gallery.js?v=${ASSET_VERSION}" defer></script>`);
  const gallerySchema = page.type === 'home'
    ? `\n    <!-- GALLERY-SCHEMA:START -->\n    <!-- GALLERY-SCHEMA:END -->` : '';

  return `<!DOCTYPE html>
<!-- Generated by scripts/build-site.js from src/pages — edit the source, not this file. -->
<html lang="${t.htmlLang}">
${renderHead(page, alternates)}
<body class="page-${page.type}">
${renderHeader(page, alternates)}

    <main id="main">
${mainHtml}
    </main>

${renderFooter(page, registry)}

${scripts.join('\n')}${gallerySchema}
</body>
</html>
`;
}

// Decorative "printing" panel: the 3DPie logo mark is built layer by layer (pure CSS animation,
// paused off-screen by js/scripts.js, disabled for prefers-reduced-motion).
function renderPrintViz(lang) {
  const t = lang === 'uz'
    ? { file: 'logo-3dpie.gcode', layer: 'qatlam', mat: 'PETG-CF' }
    : { file: 'logo-3dpie.gcode', layer: 'слой', mat: 'PETG-CF' };
  return `<div class="printviz" aria-hidden="true">
                    <div class="printviz-bar"><span>${t.file}</span><span class="printviz-pct"></span></div>
                    <div class="printviz-bed">
                        <svg class="printviz-model" viewBox="0 0 640 640"><path d="M325,310 L465,310 A140,140 0 1,0 325,450 Z"/><path class="arc" d="M325,100 A210,210 0 0,0 325,520"/><path class="arc" d="M24,310 A301,301 0 0,0 325,611"/></svg>
                        <div class="printviz-cover"></div>
                        <div class="printviz-nozzle"><span></span></div>
                    </div>
                    <div class="printviz-bar"><span>${t.layer} <b class="printviz-layer"></b>/240</span><span>${t.mat}</span></div>
                </div>`;
}

module.exports = {
  esc, renderPrintViz, renderDocument, renderSpec, renderCtaButtons, renderSteps, renderFaq, renderCtaBand, renderRelated
};
