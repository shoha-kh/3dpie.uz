'use strict';

/**
 * Shared helpers for the dev scripts: project root, a tiny static server,
 * headless Chrome screenshots and ffmpeg calls. No npm dependencies.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SHOTS_DIR = path.join(ROOT, '.shots');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4'
};

function chromePath() {
  const candidates = [
    process.env.CHROME,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].filter(Boolean);
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) throw new Error('Chrome not found — set the CHROME env variable');
  return found;
}

function run(cmd, args, opts) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${path.basename(cmd)} failed:\n${r.stderr || r.stdout}`);
  return r.stdout;
}

/** Static server for the site root. `extra` maps url paths to in-memory HTML. */
function serve(extra) {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (extra && extra[urlPath]) {
      res.writeHead(200, { 'Content-Type': MIME['.html'] });
      return res.end(extra[urlPath]);
    }
    let file = path.join(ROOT, urlPath);
    if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => {
      resolve({ url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() });
    });
  });
}

/** Headless Chrome screenshot. Runs async so the in-process server keeps answering. */
function screenshot(url, out, width, height) {
  const { spawn } = require('child_process');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  return new Promise((resolve, reject) => {
    const p = spawn(chromePath(), [
      '--headless=new', '--disable-gpu', '--hide-scrollbars', '--allow-file-access-from-files',
      '--virtual-time-budget=9000', `--window-size=${width},${height}`, `--screenshot=${out}`, url
    ], { stdio: 'ignore' });
    p.on('error', reject);
    p.on('exit', () => (fs.existsSync(out) ? resolve(out) : reject(new Error('no screenshot: ' + url))));
  });
}

function ffmpeg(args) {
  return run('ffmpeg', ['-y', '-v', 'error', ...args]);
}

module.exports = { ROOT, SHOTS_DIR, chromePath, run, serve, screenshot, ffmpeg };
