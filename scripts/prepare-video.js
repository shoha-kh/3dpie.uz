#!/usr/bin/env node
/**
 * scripts/prepare-video.js — turns a raw video (e.g. an Instagram reel) into a gallery item.
 *
 * 1) Contact sheet first — check that no printer brand is visible (owner's rule):
 *      node scripts/prepare-video.js raw.mp4 my-work --sheet
 *    -> .shots/my-work-sheet.jpg (16 frames) + the timestamp of each frame in the console
 *
 * 2) Encode (720px wide, H.264 CRF 27, AAC, faststart) and make a poster:
 *      node scripts/prepare-video.js raw.mp4 my-work --cut=0-38,54-75 --poster=12
 *    --cut     keep only these second ranges (drop frames showing printers)
 *    --poster  second of the OUTPUT video used for the poster (default 2)
 *    -> gallery/my-work/my-work.mp4 and gallery/my-work/my-work-poster.webp
 *
 * Then add the item to data/gallery.json (the script prints a skeleton) and run `npm run build`.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { ROOT, SHOTS_DIR, run, ffmpeg } = require('./lib/tools');

const [input, id, ...rest] = process.argv.slice(2);
const opt = name => (rest.find(a => a.startsWith(`--${name}=`)) || '').split('=')[1];

if (!input || !id || !/^[a-z0-9-]+$/.test(id)) {
  console.error('Usage: node scripts/prepare-video.js <input.mp4> <id-in-kebab-case> [--sheet] [--cut=a-b,c-d] [--poster=sec]');
  process.exit(1);
}

const duration = Number(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', input]).trim());

if (rest.includes('--sheet')) {
  const n = 16;
  const out = path.join(SHOTS_DIR, `${id}-sheet.jpg`);
  fs.mkdirSync(SHOTS_DIR, { recursive: true });
  ffmpeg(['-i', input, '-vf', `fps=${n / duration},scale=180:-2,tile=8x2`, '-frames:v', '1', out]);
  const times = Array.from({ length: n }, (_, i) => (i * duration / n).toFixed(1) + 's');
  console.log(out);
  console.log(`duration ${duration.toFixed(1)}s; frames (row by row): ${times.join(', ')}`);
  process.exit(0);
}

const dir = path.join(ROOT, 'gallery', id);
fs.mkdirSync(dir, { recursive: true });
const mp4 = path.join(dir, `${id}.mp4`);
const poster = path.join(dir, `${id}-poster.webp`);
const enc = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart'];

const cut = opt('cut');
if (cut) {
  const ranges = cut.split(',').map(r => r.split('-').map(Number));
  const parts = ranges.map(([a, b], i) =>
    `[0:v]trim=${a}:${b},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS[a${i}]`);
  const concat = ranges.map((_, i) => `[v${i}][a${i}]`).join('') + `concat=n=${ranges.length}:v=1:a=1[v][a];[v]scale=720:-2[vs]`;
  ffmpeg(['-i', input, '-filter_complex', parts.join(';') + ';' + concat, '-map', '[vs]', '-map', '[a]', ...enc, mp4]);
} else {
  ffmpeg(['-i', input, '-vf', 'scale=720:-2', ...enc, mp4]);
}
ffmpeg(['-ss', String(opt('poster') || 2), '-i', mp4, '-frames:v', '1', '-vf', 'scale=720:-2', '-c:v', 'libwebp', '-quality', '80', poster]);

const rel = p => './' + path.relative(ROOT, p).replace(/\\/g, '/');
console.log(`${rel(mp4)} (${(fs.statSync(mp4).size / 1e6).toFixed(1)} MB)\n${rel(poster)}`);
console.log('\ndata/gallery.json skeleton:\n' + JSON.stringify({
  id, type: 'video', badge: { ru: 'Видео', uz: 'Video' }, thumb: rel(poster),
  title: { ru: '', uz: '' }, description: { ru: '', uz: '' }, longDescription: { ru: '', uz: '' },
  tags: [], medias: [{ type: 'video', src: rel(mp4), poster: rel(poster), caption: { ru: '', uz: '' } }]
}, null, 2));
