#!/usr/bin/env node
/**
 * scripts/indexnow.js
 *
 * Sends every URL from sitemap.xml to IndexNow (Bing, Yandex and other
 * participating search engines) so new and changed pages are crawled quickly.
 * Runs in GitHub Actions after each deploy; can also be run by hand:
 *   node scripts/indexnow.js
 *
 * The key file (<KEY>.txt in the site root) proves ownership of 3dpie.uz.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const HOST = '3dpie.uz';
const KEY = '1725b1a571c7b4f22b9d4454c47893bb';
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  if (!urlList.length) throw new Error('No URLs found in sitemap.xml');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList
    })
  });
  console.log(`[indexnow] ${urlList.length} URLs -> HTTP ${res.status}`);
  // 200/202 = accepted. 422/403 usually mean the key file is not live yet.
  if (res.status >= 400) process.exitCode = 1;
}

main().catch(err => {
  console.error('[indexnow]', err.message);
  process.exitCode = 1;
});
