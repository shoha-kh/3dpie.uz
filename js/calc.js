(function () {
    'use strict';

    // Price calculator for 3D models — STL, OBJ, 3MF (prices page). Files are read in the browser and never uploaded.
    // One estimate holds several models, each on its own plate; the order total is the sum of the plates.
    // Print settings are common for all plates, and a plate may override any of them (as in a slicer).
    // Only the active plate is shown in the 3D preview.
    // Weight = solid shell (walls + top/bottom skin) + infill share of the inside, times plastic density.
    // Print time = those volumes divided by how fast the nozzle lays plastic, plus layer changes and warm-up.
    // Prices, build volumes, speeds and strings come from CALC / CALC_T in src/site.js (inline JSON block).

    var root = document.querySelector('.calc');
    var dataEl = document.querySelector('.calc-data');
    if (!root || !dataEl) return;

    var DATA = JSON.parse(dataEl.textContent);
    var C = DATA.calc;
    var t = DATA.t;
    var MAX_BYTES = 100 * 1024 * 1024;
    var NBSP = String.fromCharCode(160);

    var $ = function (sel) { return root.querySelector(sel); };
    var stage = $('.calc-stage');
    var fileInput = $('.calc-file');
    var drop = $('.calc-drop');
    var canvas = $('.calc-canvas');
    var zoomBar = $('.calc-zoom');
    var bar = $('.calc-bar');
    var nameEl = $('.calc-name');
    var hint = $('.calc-hint');
    var legend = $('.calc-legend');
    var alertEl = $('.calc-alert');
    var platesEl = $('.calc-plates');
    var platesList = $('.calc-plates-list');
    var platesCount = $('.calc-plates-count');
    var addBtn = $('.calc-plate-add');
    var scopeBtns = root.querySelectorAll('[data-scope]');
    var scopePlateEl = $('.calc-scope-plate');
    var scopeHint = $('.calc-scope-hint');
    var ownBtns = root.querySelectorAll('[data-own]');
    var resetBtn = $('.calc-reset');
    var matSel = $('.calc-mat');
    var qtyIn = $('.calc-qty');
    var unitSel = $('.calc-unit');
    var msgEl = $('.calc-msg');
    var orderMsgEl = $('.calc-order-msg');
    var copyBtn = $('.calc-copy');
    var saveBtn = $('.calc-save');
    var sendLink = $('.calc-send');
    var sendLabel = $('.calc-send-label');
    var statusEl = $('.calc-status');
    var advToggle = $('.calc-adv-toggle');
    var advBox = $('.calc-adv');
    var rangeIn = $('.calc-infill-range');
    var rangeOut = $('.calc-infill-val');
    var wallsIn = $('.calc-walls');
    var supSel = $('.calc-support');
    var presetRadios = root.querySelectorAll('input[name="calc-infill"]');
    var layerRadios = root.querySelectorAll('input[name="calc-layer"]');
    var out = {};
    root.querySelectorAll('[data-out]').forEach(function (el) { out[el.getAttribute('data-out')] = el; });

    // A plate: { name, orig (vertices as in the file), sign, volume, area, closed, R (rotation on the bed),
    //            min, max, size, support (mm³ under overhangs, measured for the threshold `limit`),
    //            qty, unit (of the file), own (print settings changed for this plate only),
    //            est (last estimate), thumb (small canvas with its picture), notice }
    var items = [];
    var active = null;      // the plate in the preview and in the settings form
    var work = null;        // rotated copy of the active mesh: what the preview draws and picks faces on
    var common = defaults(); // print settings of every plate, unless the plate has its own value
    var scope = 'common';   // what the form edits: 'common', or 'plate' = the active plate's own values
    var viewer = null;
    var order = null;       // totals over all plates
    var copyText = '';
    var tracked = false;
    var replacing = null;   // the plate whose file is being replaced

    function defaults() {
        return {
            mat: C.materialDefault, infill: C.infillDefault,
            layer: C.layerDefault, walls: C.walls.def, overhang: C.overhangDeg, supports: true
        };
    }

    // The settings a plate is printed with: its own values where it has them, the common ones elsewhere.
    function settingsOf(item) {
        var s = {};
        Object.keys(common).forEach(function (k) { s[k] = k in item.own ? item.own[k] : common[k]; });
        return s;
    }

    function hasOwn(item) {
        return Object.keys(item.own).length > 0;
    }

    function overLimit(s) {
        return s.supports ? -Math.sin(s.overhang * Math.PI / 180) : -2; // normal z below this = overhang
    }

    // ---------- formatting ----------

    function int(n) {
        return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    }

    function dec(n) {
        return n < 10 ? n.toFixed(1).replace('.', ',') : int(n);
    }

    function fill(str, vars) {
        return str.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    }

    function dims(arr) {
        return arr.map(dec).join(' × ');
    }

    function comma(n) {
        return String(n).replace('.', ',');
    }

    // Rounded on purpose (5–10 minute steps, whole hours for long prints): it is an estimate.
    function duration(sec) {
        var m = Math.max(5, Math.round(sec / 300) * 5);
        if (m < 60) return m + NBSP + t.min;
        if (m >= 600) return Math.round(m / 60) + NBSP + t.h;
        m = Math.round(m / 10) * 10;
        return Math.floor(m / 60) + NBSP + t.h + (m % 60 ? NBSP + m % 60 + NBSP + t.min : '');
    }

    function plain(str) {
        return str.replace(/ /g, ' ');
    }

    function el(tag, cls, text) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text != null) node.textContent = text;
        return node;
    }

    // ---------- STL parsing ----------

    function parseStl(buf) {
        var dv = new DataView(buf);
        var n = buf.byteLength >= 84 ? dv.getUint32(80, true) : 0;
        var binaryFits = n > 0 && 84 + n * 50 <= buf.byteLength;
        // Exact size match is binary even if the header starts with "solid" (some exporters do that).
        if (binaryFits && 84 + n * 50 === buf.byteLength) return parseBinary(dv, n);
        var head = new TextDecoder().decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 256)));
        if (/^\s*solid/i.test(head)) {
            var pos = parseAscii(buf);
            if (pos.length) return pos;
        }
        return binaryFits ? parseBinary(dv, n) : null;
    }

    function parseBinary(dv, n) {
        var pos = new Float32Array(n * 9);
        for (var i = 0, o = 96, k = 0; i < n; i++, o += 50) {
            for (var j = 0; j < 36; j += 4) pos[k++] = dv.getFloat32(o + j, true);
        }
        return pos;
    }

    function parseAscii(buf) {
        var text = new TextDecoder().decode(buf);
        var re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g;
        var arr = [];
        var m;
        while ((m = re.exec(text))) arr.push(+m[1], +m[2], +m[3]);
        arr.length -= arr.length % 9;
        return new Float32Array(arr);
    }

    // Volume as a sum of signed tetrahedra. It is computed from two reference points:
    // for a closed mesh both sums match, for a mesh with holes they drift apart.
    function measure(pos) {
        var min = [Infinity, Infinity, Infinity];
        var max = [-Infinity, -Infinity, -Infinity];
        for (var i = 0; i < pos.length; i += 3) {
            for (var a = 0; a < 3; a++) {
                var v = pos[i + a];
                if (!isFinite(v)) return null;
                if (v < min[a]) min[a] = v;
                if (v > max[a]) max[a] = v;
            }
        }
        var ox = pos[0], oy = pos[1], oz = pos[2];
        var qx = max[0], qy = max[1], qz = max[2];
        var volA = 0, volB = 0, area = 0;
        for (var k = 0; k < pos.length; k += 9) {
            var x1 = pos[k], y1 = pos[k + 1], z1 = pos[k + 2];
            var x2 = pos[k + 3], y2 = pos[k + 4], z2 = pos[k + 5];
            var x3 = pos[k + 6], y3 = pos[k + 7], z3 = pos[k + 8];
            var ux = x2 - x1, uy = y2 - y1, uz = z2 - z1;
            var wx = x3 - x1, wy = y3 - y1, wz = z3 - z1;
            var cx = uy * wz - uz * wy, cy = uz * wx - ux * wz, cz = ux * wy - uy * wx;
            area += Math.sqrt(cx * cx + cy * cy + cz * cz) / 2;
            // (p1 - o) · ((p2 - p1) × (p3 - p1)) equals the triple product for origin o
            volA += (x1 - ox) * cx + (y1 - oy) * cy + (z1 - oz) * cz;
            volB += (x1 - qx) * cx + (y1 - qy) * cy + (z1 - qz) * cz;
        }
        var sign = volA < 0 ? -1 : 1; // negative volume = inverted winding, normals point inward
        volA = Math.abs(volA / 6);
        volB = Math.abs(volB / 6);
        return {
            sign: sign,
            volume: volA,
            area: area,
            size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]],
            min: min,
            max: max,
            closed: Math.abs(volA - volB) <= volA * 0.005 + 1e-6
        };
    }

    // Space under overhangs, mm³, for the part as it lies in the file.
    // Every triangle is sampled on an XY grid (cell centres), giving per cell a list of surface heights.
    // A support column under an overhang sample reaches down to the nearest surface below it, or the bed.
    var GRID = 160;

    function supportSpace(pos, m, limit, grid) {
        var cell = Math.max(m.size[0], m.size[1], 0.01) / (grid || GRID);
        var nx = Math.ceil(m.size[0] / cell) + 1, ny = Math.ceil(m.size[1] / cell) + 1;
        var x0 = m.min[0], y0 = m.min[1], bed = m.min[2];
        var starts = new Uint32Array(nx * ny + 1);
        var zs = null, flags = null, fillAt = null;

        function raster(k, emit) {
            var ax = pos[k], ay = pos[k + 1], az = pos[k + 2];
            var bx = pos[k + 3], by = pos[k + 4], bz = pos[k + 5];
            var cx = pos[k + 6], cy = pos[k + 7], cz = pos[k + 8];
            var d = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
            if (Math.abs(d) < 1e-12) return; // vertical face: no footprint
            var i0 = Math.max(0, Math.ceil((Math.min(ax, bx, cx) - x0) / cell - 0.5));
            var i1 = Math.min(nx - 1, Math.floor((Math.max(ax, bx, cx) - x0) / cell - 0.5));
            var j0 = Math.max(0, Math.ceil((Math.min(ay, by, cy) - y0) / cell - 0.5));
            var j1 = Math.min(ny - 1, Math.floor((Math.max(ay, by, cy) - y0) / cell - 0.5));
            for (var j = j0; j <= j1; j++) {
                var py = y0 + (j + 0.5) * cell;
                for (var i = i0; i <= i1; i++) {
                    var px = x0 + (i + 0.5) * cell;
                    var wa = ((bx - px) * (cy - py) - (cx - px) * (by - py)) / d;
                    var wb = ((cx - px) * (ay - py) - (ax - px) * (cy - py)) / d;
                    var wc = 1 - wa - wb;
                    if (wa < -1e-9 || wb < -1e-9 || wc < -1e-9) continue;
                    emit(j * nx + i, wa * az + wb * bz + wc * cz);
                }
            }
        }

        // pass 1: count samples per cell; pass 2: store heights and overhang flags
        var k, n;
        for (k = 0; k < pos.length; k += 9) raster(k, function (c) { starts[c + 1]++; });
        for (n = 0; n < nx * ny; n++) starts[n + 1] += starts[n];
        zs = new Float32Array(starts[nx * ny]);
        flags = new Uint8Array(zs.length);
        fillAt = starts.slice(0, nx * ny);
        for (k = 0; k < pos.length; k += 9) {
            var ux = pos[k + 3] - pos[k], uy = pos[k + 4] - pos[k + 1], uz = pos[k + 5] - pos[k + 2];
            var wx = pos[k + 6] - pos[k], wy = pos[k + 7] - pos[k + 1], wz = pos[k + 8] - pos[k + 2];
            var nxv = uy * wz - uz * wy, nyv = uz * wx - ux * wz, nzv = ux * wy - uy * wx;
            var len = Math.sqrt(nxv * nxv + nyv * nyv + nzv * nzv) || 1;
            var over = nzv / len * m.sign < limit ? 1 : 0;
            raster(k, function (c, z) {
                var at = fillAt[c]++;
                zs[at] = z;
                flags[at] = over;
            });
        }

        var minH = Math.max(m.size[2] * 0.002, 1e-4);
        var height = 0;
        var idx = [];
        for (n = 0; n < nx * ny; n++) {
            var a = starts[n], b = starts[n + 1];
            if (b === a) continue;
            idx.length = 0;
            for (var s = a; s < b; s++) idx.push(s);
            idx.sort(function (p, q) { return zs[p] - zs[q]; });
            for (var r = 0; r < idx.length; r++) {
                if (!flags[idx[r]]) continue;
                var z = zs[idx[r]];
                // a surface right at this height (touching bodies in a multi-body STL) is contact, not air
                if (r + 1 < idx.length && zs[idx[r + 1]] - z < minH) continue;
                var below = r > 0 ? zs[idx[r - 1]] : bed;
                if (z - below > minH) height += z - below;
            }
        }
        return height * cell * cell;
    }

    // ---------- other formats: OBJ and 3MF ----------
    // Both end up as the same flat list of triangle vertices that parseStl returns.

    function parseObj(buf) {
        var text = new TextDecoder().decode(buf);
        var v = [], out = [];
        var at = 0, len = text.length;
        while (at < len) {
            var end = text.indexOf('\n', at);
            if (end === -1) end = len;
            var c0 = text.charCodeAt(at), c1 = text.charCodeAt(at + 1);
            if (c0 === 118 && (c1 === 32 || c1 === 9)) {            // "v x y z"
                var p = text.slice(at + 2, end).trim().split(/\s+/);
                v.push(+p[0], +p[1], +p[2]);
            } else if (c0 === 102 && (c1 === 32 || c1 === 9)) {     // "f a/b/c d/e/f …": a fan of triangles
                var f = text.slice(at + 2, end).trim().split(/\s+/);
                var idx = [];
                for (var i = 0; i < f.length; i++) {
                    var n = parseInt(f[i], 10);                    // the vertex index is what stands before "/"
                    if (n < 0) n += v.length / 3; else n -= 1;     // negative = counted from the end
                    if (!(n >= 0 && n < v.length / 3)) return null;
                    idx.push(n * 3);
                }
                for (var k = 1; k + 1 < idx.length; k++) {
                    out.push(v[idx[0]], v[idx[0] + 1], v[idx[0] + 2],
                        v[idx[k]], v[idx[k] + 1], v[idx[k] + 2],
                        v[idx[k + 1]], v[idx[k + 1] + 1], v[idx[k + 1] + 2]);
                }
            }
            at = end + 1;
        }
        return new Float32Array(out);
    }

    // A 3MF file is a zip archive with XML inside. Reads the archive's list of files; each entry can
    // then be unpacked (the browser's own DecompressionStream does the inflating).
    function zipEntries(buf) {
        var dv = new DataView(buf);
        var eocd = -1;
        for (var i = buf.byteLength - 22; i >= 0 && i > buf.byteLength - 66000; i--) {
            if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
        }
        if (eocd < 0) return null;
        var count = dv.getUint16(eocd + 10, true);
        var at = dv.getUint32(eocd + 16, true);
        var names = {};
        for (var n = 0; n < count && at + 46 <= buf.byteLength; n++) {
            if (dv.getUint32(at, true) !== 0x02014b50) break;
            var nameLen = dv.getUint16(at + 28, true);
            names[new TextDecoder().decode(new Uint8Array(buf, at + 46, nameLen))] = {
                method: dv.getUint16(at + 10, true), size: dv.getUint32(at + 20, true), local: dv.getUint32(at + 42, true)
            };
            at += 46 + nameLen + dv.getUint16(at + 30, true) + dv.getUint16(at + 32, true);
        }
        return {
            names: names,
            text: function (name) {
                var e = names[name];
                var start = e.local + 30 + dv.getUint16(e.local + 26, true) + dv.getUint16(e.local + 28, true);
                var bytes = new Uint8Array(buf, start, e.size);
                if (e.method === 0) return Promise.resolve(new TextDecoder().decode(bytes));
                if (e.method !== 8 || !('DecompressionStream' in window)) return Promise.reject(new Error('zip method'));
                var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
                return new Response(stream).text();
            }
        };
    }

    // 3MF transform: 12 numbers, a point is a row vector — p' = p × M.
    var M_ID = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];

    function mat3mf(str) {
        var m = (str || '').trim().split(/\s+/).map(Number);
        return m.length === 12 && m.every(isFinite) ? m : M_ID;
    }

    // first a, then b
    function mulM(a, b) {
        var o = [];
        for (var r = 0; r < 4; r++) {
            for (var c = 0; c < 3; c++) {
                o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c] + (r === 3 ? b[9 + c] : 0));
            }
        }
        return o;
    }

    var UNIT_MM = { micron: 0.001, millimeter: 1, centimeter: 10, inch: 25.4, foot: 304.8, meter: 1000 };

    // Collects every mesh the "build" section places on the bed, following components into other model
    // files of the archive (slicer project files keep the objects there). The result is in millimetres.
    function parse3mf(buf) {
        var zip = zipEntries(buf);
        if (!zip) return Promise.resolve(null);
        var all = Object.keys(zip.names);
        var rootName = all.filter(function (n) { return /^3D\/[^/]+\.model$/i.test(n); })[0] ||
            all.filter(function (n) { return /\.model$/i.test(n); })[0];
        if (!rootName) return Promise.resolve(null);

        var models = {}; // file name → promise of { scale, objects: { id: { verts, tris } | { parts } } }
        function model(name) {
            if (!models[name]) {
                models[name] = zip.text(name).then(function (xml) {
                    var doc = new DOMParser().parseFromString(xml, 'application/xml');
                    var root = doc.documentElement;
                    var res = { scale: UNIT_MM[root.getAttribute('unit')] || 1, objects: {}, items: [] };
                    Array.prototype.forEach.call(doc.getElementsByTagName('object'), function (o) {
                        var mesh = o.getElementsByTagName('mesh')[0];
                        if (mesh) {
                            var vs = mesh.getElementsByTagName('vertex'), ts = mesh.getElementsByTagName('triangle');
                            var verts = new Float32Array(vs.length * 3), tris = new Uint32Array(ts.length * 3);
                            for (var i = 0; i < vs.length; i++) {
                                verts[i * 3] = +vs[i].getAttribute('x');
                                verts[i * 3 + 1] = +vs[i].getAttribute('y');
                                verts[i * 3 + 2] = +vs[i].getAttribute('z');
                            }
                            for (var k = 0; k < ts.length; k++) {
                                tris[k * 3] = +ts[k].getAttribute('v1');
                                tris[k * 3 + 1] = +ts[k].getAttribute('v2');
                                tris[k * 3 + 2] = +ts[k].getAttribute('v3');
                            }
                            res.objects[o.getAttribute('id')] = { verts: verts, tris: tris };
                        } else {
                            res.objects[o.getAttribute('id')] = {
                                parts: Array.prototype.map.call(o.getElementsByTagName('component'), ref)
                            };
                        }
                    });
                    res.items = Array.prototype.map.call(doc.getElementsByTagName('item'), ref);
                    return res;
                });
            }
            return models[name];
        }
        function ref(node) {
            var path = node.getAttribute('p:path') || node.getAttribute('path');
            return { id: node.getAttribute('objectid'), file: path ? path.replace(/^\//, '') : null, m: mat3mf(node.getAttribute('transform')) };
        }

        var chunks = [];
        function emit(file, id, m, depth) {
            if (!zip.names[file] || depth > 8) return Promise.resolve();
            return model(file).then(function (mod) {
                var o = mod.objects[id];
                if (!o) return;
                if (o.parts) {
                    return o.parts.reduce(function (chain, part) {
                        return chain.then(function () { return emit(part.file || file, part.id, mulM(part.m, m), depth + 1); });
                    }, Promise.resolve());
                }
                var out = new Float32Array(o.tris.length * 3), s = mod.scale, v = o.verts;
                for (var i = 0; i < o.tris.length; i++) {
                    var a = o.tris[i] * 3;
                    if (a + 2 >= v.length) return;
                    var x = v[a], y = v[a + 1], z = v[a + 2];
                    out[i * 3] = (x * m[0] + y * m[3] + z * m[6] + m[9]) * s;
                    out[i * 3 + 1] = (x * m[1] + y * m[4] + z * m[7] + m[10]) * s;
                    out[i * 3 + 2] = (x * m[2] + y * m[5] + z * m[8] + m[11]) * s;
                }
                chunks.push(out);
            });
        }

        return model(rootName).then(function (root) {
            // no build section: take every object that has a mesh
            var items = root.items.length ? root.items : Object.keys(root.objects).map(function (id) {
                return { id: id, file: null, m: M_ID };
            });
            return items.reduce(function (chain, item) {
                return chain.then(function () { return emit(item.file || rootName, item.id, item.m, 0); });
            }, Promise.resolve());
        }).then(function () {
            var total = chunks.reduce(function (n, c) { return n + c.length; }, 0);
            var pos = new Float32Array(total), at = 0;
            chunks.forEach(function (c) {
                pos.set(c, at);
                at += c.length;
            });
            return pos;
        });
    }

    // By the file extension; anything unknown is tried as STL.
    function readModel(name, buf) {
        var ext = (/\.([a-z0-9]+)$/i.exec(name) || [])[1];
        ext = ext ? ext.toLowerCase() : '';
        if (ext === 'obj') return Promise.resolve(parseObj(buf));
        if (ext === '3mf') return parse3mf(buf);
        return Promise.resolve(parseStl(buf));
    }

    // ---------- estimate ----------

    function unitScale(id) {
        for (var i = 0; i < C.units.length; i++) if (C.units[i][0] === id) return C.units[i][1];
        return 1;
    }

    function material(id) {
        for (var i = 0; i < C.materials.length; i++) if (C.materials[i].id === id) return C.materials[i];
        return C.materials[0];
    }

    function fits(size, bed) {
        var a = size.slice().sort(function (x, y) { return y - x; });
        var b = bed.slice().sort(function (x, y) { return y - x; });
        return a[0] <= b[0] && a[1] <= b[1] && a[2] <= b[2];
    }

    function setLines(box, list) {
        box.textContent = '';
        list.forEach(function (text) { box.appendChild(el('span', '', text)); });
    }

    function setStatus(text) {
        statusEl.textContent = text || '';
    }

    // One plate with its own settings: numbers for one piece and for the whole plate.
    function estimate(item) {
        var s = settingsOf(item);
        var k = unitScale(item.unit);
        var mat = material(s.mat);
        var size = item.size.map(function (v) { return v * k; });
        var vol = item.volume * k * k * k / 1000;          // cm³
        var wallMm = C.shellMm * s.walls / C.walls.def;
        var shell = Math.min(vol, item.area * k * k / 100 * wallMm / 10);
        var inner = (vol - shell) * s.infill / 100;
        var supVol = s.supports ? item.support * k * k * k / 1000 * C.supportFill : 0;
        var sup = supVol * mat.density;
        var grams = (shell + inner) * mat.density + sup;
        var piece = Math.max(100, Math.round(grams * mat.price / 100) * 100);

        // Time: each kind of line has its own speed, capped by how much plastic the nozzle melts.
        var T = C.time;
        var rate = function (speed) {
            return Math.min(speed * T.lineWidth * s.layer, T.maxFlow) * (mat.speed || 1); // mm³ per second
        };
        var print = size[2] / s.layer * T.layerSec +
            (shell / rate(T.speed.wall) + inner / rate(T.speed.infill) + supVol / rate(T.speed.support)) * 1000 * T.travel;

        return {
            set: s, mat: mat, qty: item.qty, size: size, vol: vol, grams: grams, sup: sup, piece: piece,
            sum: piece * item.qty,
            seconds: T.startSec + print,                 // one piece printed alone
            plateSeconds: T.startSec + print * item.qty, // the whole plate: one warm-up, then every copy
            warn: !fits(size, C.bed) ? 'fit' : mat.composite && !fits(size, C.bedComposite) ? 'fitComposite' : ''
        };
    }

    function totals() {
        var o = { pieces: 0, grams: 0, seconds: 0, raw: 0 };
        items.forEach(function (item) {
            var e = item.est = estimate(item);
            o.pieces += e.qty;
            o.grams += e.grams * e.qty;
            o.seconds += e.plateSeconds;
            o.raw += e.sum;
        });
        o.raw = Math.round(o.raw / 1000) * 1000;
        o.total = Math.max(o.raw, C.minOrder);
        return o;
    }

    function supportText(e) {
        return e.sup > 0.05 ? fill(t.copySup, { sup: dec(e.sup) }) : t.copyNoSup;
    }

    // The estimate as text, for the clipboard and the Telegram message.
    function summaryText(short) {
        var lines = [fill(t.copyHead, { site: DATA.site })];
        items.forEach(function (item, i) {
            var e = item.est, s = e.set;
            lines.push(fill(short ? t.copyItemShort : t.copyItem, {
                n: i + 1, file: item.name, mat: e.mat.name, infill: s.infill, layer: comma(s.layer), walls: s.walls,
                qty: e.qty, size: dims(e.size), weight: dec(e.grams), time: duration(e.seconds), sum: int(e.sum),
                sup: supportText(e)
            }));
        });
        lines.push(fill(t.copyTotal, {
            count: items.length, pieces: order.pieces, weight: dec(order.grams),
            time: duration(order.seconds), total: int(order.total)
        }));
        return plain(lines.join('\n'));
    }

    function update() {
        var approx = '≈' + NBSP;
        setStatus('');
        markOrient();
        order = items.length ? totals() : null;

        // the active model
        if (!active) {
            ['size', 'volume', 'weight', 'supports', 'time', 'piece'].forEach(function (k) { out[k].textContent = '—'; });
            setLines(msgEl, []);
        } else {
            var e = active.est;
            out.size.textContent = dims(e.size) + NBSP + t.mm;
            out.volume.textContent = dec(e.vol) + NBSP + t.cm3;
            out.weight.textContent = approx + dec(e.grams) + NBSP + t.g;
            out.supports.textContent = e.sup > 0.05 ? approx + dec(e.sup) + NBSP + t.g : '—';
            out.time.textContent = approx + duration(e.seconds);
            out.piece.textContent = approx + int(e.piece) + NBSP + t.sum;

            var msgs = active.notice ? [active.notice] : [];
            if (!active.closed) msgs.push(t.msg.open);
            if (Math.max(e.size[0], e.size[1], e.size[2]) < 2) msgs.push(t.msg.tiny);
            if (e.warn === 'fit') msgs.push(fill(t.msg.fit, { bed: dims(C.bed) }));
            if (e.warn === 'fitComposite') msgs.push(fill(t.msg.fitComposite, { bed: dims(C.bedComposite) }));
            if (!viewer) msgs.push(t.msg.noGl);
            setLines(msgEl, msgs);
        }

        // the plates strip
        items.forEach(function (item) {
            if (!item.sumEl) return;
            item.infoEl.textContent = item.est.mat.name + ' · ' + item.est.qty + NBSP + t.pcs;
            item.sumEl.textContent = approx + int(item.est.sum) + NBSP + t.sum;
            item.box.classList.toggle('is-warn', !!item.est.warn);
            item.ownEl.hidden = !hasOwn(item);
        });

        // the order
        if (!order) {
            ['models', 'pieces', 'sumWeight', 'sumTime'].forEach(function (k) { out[k].textContent = '—'; });
            out.total.textContent = t.empty;
            setLines(orderMsgEl, []);
            copyText = '';
            copyBtn.disabled = saveBtn.disabled = true;
            sendLink.href = DATA.telegram;
            sendLabel.textContent = t.tg;
            return;
        }
        out.models.textContent = items.length;
        out.pieces.textContent = int(order.pieces);
        out.sumWeight.textContent = approx + dec(order.grams) + NBSP + t.g;
        out.sumTime.textContent = approx + duration(order.seconds);
        out.total.textContent = approx + int(order.total) + NBSP + t.sum;
        setLines(orderMsgEl, order.raw < C.minOrder ? [fill(t.msg.min, { min: int(C.minOrder) })] : []);

        copyText = summaryText(false);
        copyBtn.disabled = saveBtn.disabled = false;
        // t.me/<name>?text=… opens the chat with the message already typed in; a long list goes in short form
        var message = encodeURIComponent(copyText);
        if (message.length > 3500) message = encodeURIComponent(summaryText(true));
        sendLink.href = DATA.telegram + '?text=' + message;
        sendLabel.textContent = t.send;
    }

    // ---------- orientation on the bed ----------
    // 3×3 row-major rotations applied to the file coordinates. item.orig keeps the file as loaded,
    // `work` is the rotated copy of the active plate that is measured, drawn and re-centred by the preview.

    var IDENTITY = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    var TURN = {
        x: [1, 0, 0, 0, 0, -1, 0, 1, 0],
        y: [0, 0, 1, 0, 1, 0, -1, 0, 0]
    };

    function mul3(a, b) {
        var o = [];
        for (var r = 0; r < 3; r++) {
            for (var c = 0; c < 3; c++) o.push(a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c]);
        }
        return o;
    }

    // Rotation that turns the unit vector n into "down" (0, 0, -1): Rodrigues' formula.
    function downFrom(n) {
        var c = -n[2];
        if (c < -0.999999) return [1, 0, 0, 0, -1, 0, 0, 0, -1]; // n points up: half turn around X
        var vx = -n[1], vy = n[0]; // n × (0, 0, -1), its z is 0
        var k = [0, 0, vy, 0, 0, -vx, -vy, vx, 0];
        var k2 = mul3(k, k);
        var f = 1 / (1 + c);
        return IDENTITY.map(function (v, i) { return v + k[i] + k2[i] * f; });
    }

    function rotateInto(src, R, dst) {
        for (var i = 0; i < src.length; i += 3) {
            var x = src[i], y = src[i + 1], z = src[i + 2];
            dst[i] = R[0] * x + R[1] * y + R[2] * z;
            dst[i + 1] = R[3] * x + R[4] * y + R[5] * z;
            dst[i + 2] = R[6] * x + R[7] * y + R[8] * z;
        }
    }

    function bounds(pos) {
        var min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
        for (var i = 0; i < pos.length; i += 3) {
            for (var a = 0; a < 3; a++) {
                var v = pos[i + a];
                if (v < min[a]) min[a] = v;
                if (v > max[a]) max[a] = v;
            }
        }
        return { min: min, max: max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] };
    }

    // Outward unit normal of the triangle starting at offset k.
    function faceNormal(pos, k, sign) {
        var ux = pos[k + 3] - pos[k], uy = pos[k + 4] - pos[k + 1], uz = pos[k + 5] - pos[k + 2];
        var wx = pos[k + 6] - pos[k], wy = pos[k + 7] - pos[k + 1], wz = pos[k + 8] - pos[k + 2];
        var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
        var l = Math.sqrt(nx * nx + ny * ny + nz * nz);
        return l ? [nx / l * sign, ny / l * sign, nz / l * sign, l / 2] : null;
    }

    // Puts a plate into the preview. With `measureIt` its size and the space under overhangs are
    // taken again (after a turn or a change of the support threshold).
    function place(item, keepView, measureIt) {
        if (!work || work.length !== item.orig.length) work = new Float32Array(item.orig.length);
        rotateInto(item.orig, item.R, work);
        if (measureIt) {
            var b = bounds(work);
            item.min = b.min;
            item.max = b.max;
            item.size = b.size;
            item.limit = overLimit(settingsOf(item));
            item.support = supportSpace(work, item, item.limit); // before the preview re-centres work in place
        }
        if (viewer) {
            viewer.setOver(overLimit(settingsOf(item)));
            viewer.setMesh(work, item, keepView);
            shoot(item);
        }
    }

    // Support space of a plate that is not in the preview right now.
    function remeasure(item) {
        var buf = new Float32Array(item.orig.length);
        rotateInto(item.orig, item.R, buf);
        item.limit = overLimit(settingsOf(item));
        item.support = supportSpace(buf, item, item.limit);
    }

    function applyOrientation(R, keepView) {
        active.R = R;
        place(active, keepView, true);
        update();
    }

    // The plate's small picture: the model alone (no bed grid), turned as in the preview and fitted to the frame.
    function shoot(item) {
        var src = viewer.snapshot(true);
        if (!src.width || !src.height) return;
        var cv = item.thumb, ctx = cv.getContext('2d');
        var k = Math.max(cv.width / src.width, cv.height / src.height);
        ctx.fillStyle = '#121516';
        ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.drawImage(src, (cv.width - src.width * k) / 2, (cv.height - src.height * k) / 2, src.width * k, src.height * k);
        item.shot = true;
    }

    // Candidate "down" directions: the six axes plus the largest flat areas of the item.
    function candidates(item) {
        var bins = {};
        for (var k = 0; k < item.orig.length; k += 9) {
            var n = faceNormal(item.orig, k, item.sign);
            if (!n) continue;
            var key = Math.round(n[0] * 12) + ',' + Math.round(n[1] * 12) + ',' + Math.round(n[2] * 12);
            var bin = bins[key] || (bins[key] = { a: 0, x: 0, y: 0, z: 0 });
            bin.a += n[3];
            bin.x += n[0] * n[3];
            bin.y += n[1] * n[3];
            bin.z += n[2] * n[3];
        }
        var list = [[0, 0, -1], [0, 0, 1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
        Object.keys(bins).map(function (key) { return bins[key]; })
            .sort(function (a, b) { return b.a - a.a; })
            .slice(0, 6)
            .forEach(function (b) {
                var l = Math.sqrt(b.x * b.x + b.y * b.y + b.z * b.z);
                if (l) list.push([b.x / l, b.y / l, b.z / l]);
            });
        return list.filter(function (d, i) {
            for (var j = 0; j < i; j++) {
                if (d[0] * list[j][0] + d[1] * list[j][1] + d[2] * list[j][2] > 0.998) return false;
            }
            return true;
        });
    }

    // Tries each candidate (coarser grid, one per tick so the page stays responsive)
    // and keeps the one with the least support; near-ties go to the lower part.
    function autoOrient() {
        var current = active;
        var list = candidates(current);
        var tmp = new Float32Array(current.orig.length);
        var limit = overLimit(settingsOf(current));
        var best = null;
        var i = 0;
        setBusy(true);
        current.notice = '';
        setLines(msgEl, [t.msg.auto]);
        (function step() {
            if (active !== current) return setBusy(false); // another plate was opened or this one was removed
            var R = downFrom(list[i]);
            rotateInto(current.orig, R, tmp);
            var b = bounds(tmp);
            var score = supportSpace(tmp, { min: b.min, size: b.size, sign: current.sign }, limit, 100) +
                (fits(b.size, C.bed) ? 0 : 1e18);
            if (!best || score < best.score * 0.98 || (score <= best.score * 1.02 && b.size[2] < best.h)) {
                best = { R: R, score: score, h: b.size[2] };
            }
            if (++i < list.length) {
                setTimeout(step, 0);
                return;
            }
            setBusy(false);
            current.byAuto = true;
            current.notice = t.msg.autoDone;
            applyOrientation(best.R, true);
        })();
    }

    var orientBtns = root.querySelectorAll('[data-orient]');
    var faceBtn = $('[data-orient="face"]');
    var picking = false;

    function setBusy(on) {
        orientBtns.forEach(function (b) { b.disabled = on || !active; });
    }

    // The highlighted button says how the open model lies right now: as in the file (that is how every
    // model starts), as "Auto" laid it, or neither after a manual turn.
    function markOrient() {
        var asFile = !!active;
        for (var i = 0; asFile && i < 9; i++) asFile = Math.abs(active.R[i] - IDENTITY[i]) < 1e-6;
        var byAuto = !!active && active.byAuto;
        [['auto', byAuto], ['reset', asFile && !byAuto]].forEach(function (pair) {
            var btn = $('[data-orient="' + pair[0] + '"]');
            btn.classList.toggle('is-current', pair[1]);
            if (pair[1]) btn.setAttribute('aria-current', 'true');
            else btn.removeAttribute('aria-current');
        });
    }

    function setPicking(on) {
        picking = on && !!viewer && !!active;
        faceBtn.setAttribute('aria-pressed', picking ? 'true' : 'false');
        canvas.classList.toggle('is-picking', picking);
        hint.textContent = picking ? t.faceHint : t.rotate;
        hint.classList.toggle('is-on', picking);
        if (picking) hint.hidden = false;
    }

    orientBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!active) return;
            var kind = btn.getAttribute('data-orient');
            if (kind === 'face') return setPicking(!picking);
            setPicking(false);
            active.notice = '';
            if (kind !== 'auto') active.byAuto = false;
            if (kind === 'auto') autoOrient();
            else if (kind === 'reset') applyOrientation(IDENTITY, true);
            else applyOrientation(mul3(TURN[kind], active.R), true);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && picking) setPicking(false);
    });

    // A tap on the model in "face" mode lays that face on the bed.
    function onTap(k) {
        if (!picking || k < 0 || !active) return;
        var n = faceNormal(active.orig, k, active.sign);
        if (!n) return;
        setPicking(false);
        active.notice = '';
        active.byAuto = false;
        applyOrientation(downFrom(n), true);
    }

    // ---------- plates: add, open, remove ----------

    function renderPlates() {
        platesEl.hidden = !items.length;
        platesList.textContent = '';
        items.forEach(function (item, i) {
            var box = el('div', 'calc-plate' + (item === active ? ' is-active' : ''));
            var pick = el('button', 'calc-plate-pick');
            pick.type = 'button';
            if (item === active) pick.setAttribute('aria-current', 'true');
            if (viewer) pick.appendChild(item.thumb);
            var text = el('span', 'calc-plate-text');
            var label = el('span', 'calc-plate-n', t.plate + ' ' + (i + 1));
            item.ownEl = el('span', 'calc-plate-own', t.ownTag); // shown while the plate has its own settings
            item.ownEl.title = t.scopePlateSub;
            label.appendChild(item.ownEl);
            text.appendChild(label);
            text.appendChild(el('span', 'calc-plate-name', item.name));
            var meta = el('span', 'calc-plate-meta');
            item.infoEl = el('span', 'calc-plate-info'); // plastic and quantity
            item.sumEl = el('span', 'calc-plate-sum');
            meta.appendChild(item.infoEl);
            meta.appendChild(item.sumEl);
            text.appendChild(meta);
            pick.appendChild(text);
            pick.addEventListener('click', function () {
                if (item !== active) setActive(item, false);
            });
            var del = el('button', 'calc-plate-del', '×');
            del.type = 'button';
            del.title = t.remove;
            del.setAttribute('aria-label', t.remove + ': ' + item.name);
            del.addEventListener('click', function () { removeItem(item); });
            box.appendChild(pick);
            box.appendChild(del);
            item.box = box;
            platesList.appendChild(box);
        });
        addBtn.hidden = items.length >= C.maxPlates;
        platesCount.textContent = items.length + ' / ' + C.maxPlates;
    }

    function setActive(item, fresh) {
        active = item;
        setPicking(false);
        setBusy(false);
        drop.hidden = !!item;
        bar.hidden = !item;
        canvas.hidden = zoomBar.hidden = !(item && viewer);
        nameEl.textContent = item ? item.name : '';
        syncForm();
        renderPlates();
        if (item) {
            place(item, false, fresh);
            // bring its chip into view inside the strip (sideways only: the page itself must not jump)
            var left = item.box.offsetLeft, right = left + item.box.offsetWidth;
            if (left - 16 < platesList.scrollLeft) platesList.scrollLeft = left - 16;
            else if (right + 16 > platesList.scrollLeft + platesList.clientWidth) platesList.scrollLeft = right + 16 - platesList.clientWidth;
        }
        update();
    }

    function removeItem(item) {
        var i = items.indexOf(item);
        if (i === -1) return;
        setLines(alertEl, []);
        items.splice(i, 1);
        if (item === active) setActive(items[i] || items[i - 1] || null, false);
        else setActive(active, false);
    }

    function addItem(name, pos, m, slot) {
        var item = slot;
        if (!item) {
            // a new plate follows the common settings until something is changed for it
            item = { own: {}, qty: 1, unit: C.units[0][0], thumb: el('canvas', 'calc-plate-thumb') };
            item.thumb.width = 480;
            item.thumb.height = 360;
            items.push(item);
        }
        item.name = name;
        item.orig = pos;
        item.sign = m.sign;
        item.volume = m.volume;
        item.area = m.area;
        item.closed = m.closed;
        item.R = IDENTITY;
        item.byAuto = false;
        item.notice = '';
        if (viewer === null) {
            viewer = createViewer(canvas, { onTap: onTap, onGrab: function () { if (!picking) hint.hidden = true; } }) || false;
            if (!viewer) hint.hidden = faceBtn.hidden = true;
        }
        setActive(item, true);
    }

    // ---------- file loading ----------

    function load(fileList) {
        var files = Array.prototype.slice.call(fileList);
        var slot = replacing && items.indexOf(replacing) !== -1 ? replacing : null;
        var alerts = [];
        replacing = null;
        if (!files.length) return;
        if (slot) files = files.slice(0, 1);
        setLines(alertEl, [t.msg.reading]);
        var i = 0;
        (function next() {
            if (i < files.length && !slot && items.length >= C.maxPlates) {
                alerts.push(fill(t.msg.limit, { max: C.maxPlates }));
                i = files.length;
            }
            if (i >= files.length) return setLines(alertEl, alerts);
            var file = files[i++];
            if (file.size > MAX_BYTES) {
                alerts.push(file.name + ': ' + t.msg.big);
                return next();
            }
            file.arrayBuffer().then(function (buf) {
                return readModel(file.name, buf);
            }).then(function (pos) {
                var m = pos && pos.length >= 9 ? measure(pos) : null;
                if (!m || !(m.volume > 0)) throw new Error('bad model');
                addItem(file.name, pos, m, slot);
                if (!tracked) {
                    tracked = true;
                    goal('calc_stl');
                }
            }).catch(function () {
                alerts.push(file.name + ': ' + t.msg.bad);
            }).then(next);
        })();
    }

    fileInput.addEventListener('change', function () {
        load(fileInput.files);
        fileInput.value = '';
    });

    // The same hidden input serves three buttons: the drop zone, "add a model" and "replace the file".
    addBtn.addEventListener('click', function () {
        replacing = null;
        fileInput.multiple = true;
        fileInput.click();
    });
    $('.calc-other').addEventListener('click', function () {
        replacing = active;
        fileInput.multiple = false;
        fileInput.click();
    });
    drop.addEventListener('click', function (e) {
        if (e.target === fileInput) return; // the input sits inside this label: its own click() bubbles here
        replacing = null;
        fileInput.multiple = true;
    });

    // Files can be dropped anywhere on the calculator: they become new plates.
    ['dragenter', 'dragover'].forEach(function (type) {
        root.addEventListener(type, function (e) {
            e.preventDefault();
            stage.classList.add('is-over');
        });
    });
    ['dragleave', 'drop'].forEach(function (type) {
        root.addEventListener(type, function (e) {
            e.preventDefault();
            if (type === 'dragleave' && root.contains(e.relatedTarget)) return;
            stage.classList.remove('is-over');
            if (type === 'drop' && e.dataTransfer.files.length) {
                replacing = null;
                load(e.dataTransfer.files);
            }
        });
    });

    // ---------- print settings: common for all plates, with per-plate overrides ----------
    // `common` holds every print parameter. A plate keeps only what was changed for it (item.own) and reads
    // the rest from `common`, like per-object overrides in a slicer. Quantity and file units always belong
    // to the plate (they sit under its preview).

    // parameter of a form field → the setting keys behind it
    var PARAMS = { mat: ['mat'], infill: ['infill'], layer: ['layer'], walls: ['walls'], support: ['supports', 'overhang'] };
    var ADVANCED = ['layer', 'walls', 'support'];

    function editsPlate() {
        return scope === 'plate' && !!active;
    }

    function syncForm() {
        if (!active) scope = 'common';
        var onPlate = editsPlate();
        var real = active ? settingsOf(active) : common; // what the open plate is printed with
        var s = onPlate ? real : common;                 // what the form shows

        scopeBtns.forEach(function (b) {
            var kind = b.getAttribute('data-scope');
            b.setAttribute('aria-pressed', kind === scope ? 'true' : 'false');
            if (kind === 'plate') b.disabled = !active;
        });
        scopePlateEl.textContent = t.plate + (active ? ' ' + (items.indexOf(active) + 1) : '');
        scopeHint.textContent = onPlate ? t.hintPlate : t.hintCommon + (active && hasOwn(active) ? ' ' + t.hintCommonOwn : '');

        matSel.value = s.mat;
        rangeIn.value = s.infill;
        rangeOut.textContent = s.infill + '%';
        presetRadios.forEach(function (r) { r.checked = +r.value === s.infill; });
        layerRadios.forEach(function (r) { r.checked = +r.value === s.layer; });
        if (document.activeElement !== wallsIn) wallsIn.value = s.walls; // do not fight the typing
        supSel.value = s.supports ? String(s.overhang) : 'off';
        legend.hidden = !real.supports;

        qtyIn.disabled = unitSel.disabled = !active;
        if (document.activeElement !== qtyIn) qtyIn.value = active ? active.qty : 1;
        unitSel.value = active ? active.unit : C.units[0][0];

        // a parameter changed for this plate is marked and gets a button back to the common value
        ownBtns.forEach(function (btn) {
            var own = onPlate && PARAMS[btn.getAttribute('data-own')].some(function (k) { return k in active.own; });
            btn.hidden = !own;
            btn.closest('.calc-field').classList.toggle('is-own', own);
        });
        var d = defaults();
        resetBtn.textContent = onPlate ? t.resetPlate : t.reset;
        resetBtn.hidden = onPlate ? !hasOwn(active) : Object.keys(d).every(function (k) { return common[k] === d[k]; });
    }

    // The support threshold may have changed on any plate: those are measured again, then all is recounted.
    function refresh() {
        items.forEach(function (item) {
            if (item.limit === overLimit(settingsOf(item))) return;
            if (item === active) {
                item.notice = '';
                place(item, true, true);
            } else remeasure(item);
        });
        update();
    }

    // An edit in the form goes to the common settings or to the open plate's own ones.
    function setParam(values) {
        var target = editsPlate() ? active.own : common;
        Object.keys(values).forEach(function (k) { target[k] = values[k]; });
        syncForm();
        refresh();
    }

    scopeBtns.forEach(function (b) {
        b.addEventListener('click', function () {
            scope = b.getAttribute('data-scope');
            syncForm();
        });
    });
    ownBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!active) return;
            PARAMS[btn.getAttribute('data-own')].forEach(function (k) { delete active.own[k]; });
            syncForm();
            refresh();
        });
    });

    matSel.addEventListener('input', function () { setParam({ mat: matSel.value }); });
    presetRadios.forEach(function (r) {
        r.addEventListener('change', function () { setParam({ infill: +r.value }); });
    });
    rangeIn.addEventListener('input', function () {
        setParam({ infill: Math.max(0, Math.min(100, Math.round(+rangeIn.value))) });
    });
    layerRadios.forEach(function (r) {
        r.addEventListener('change', function () { setParam({ layer: +r.value }); });
    });
    wallsIn.addEventListener('input', function () {
        var n = Math.round(+wallsIn.value);
        setParam({ walls: n >= C.walls.min ? Math.min(n, C.walls.max) : C.walls.def });
    });
    wallsIn.addEventListener('change', syncForm);
    supSel.addEventListener('change', function () {
        var on = supSel.value !== 'off';
        var shown = editsPlate() ? settingsOf(active) : common;
        setParam({ supports: on, overhang: on ? +supSel.value : shown.overhang });
    });

    // quantity and file units: always the open plate's
    qtyIn.addEventListener('input', function () {
        if (!active) return;
        var q = Math.round(+qtyIn.value);
        active.qty = q >= 1 ? Math.min(q, 10000) : 1;
        update();
    });
    qtyIn.addEventListener('change', syncForm);
    unitSel.addEventListener('input', function () {
        if (!active) return;
        active.unit = unitSel.value;
        update();
    });

    resetBtn.addEventListener('click', function () {
        if (editsPlate()) active.own = {};
        else common = defaults();
        syncForm();
        refresh();
    });
    advToggle.addEventListener('change', function () {
        advBox.hidden = !advToggle.checked;
        if (advToggle.checked) return;
        // Hidden settings must not keep changing the price: leaving the advanced mode puts its parameters
        // back to the defaults, in the common settings and on every plate.
        var d = defaults();
        var offPreset = function (v) { return C.infill.indexOf(v) === -1; };
        ADVANCED.forEach(function (p) {
            PARAMS[p].forEach(function (k) {
                common[k] = d[k];
                items.forEach(function (item) { delete item.own[k]; });
            });
        });
        // an infill between the presets has no button in the simple mode
        if (offPreset(common.infill)) common.infill = d.infill;
        items.forEach(function (item) {
            if ('infill' in item.own && offPreset(item.own.infill)) delete item.own.infill;
        });
        syncForm();
        refresh();
    });

    // ---------- result: send, save, copy ----------

    function goal(name) {
        try { if (typeof ym === 'function') ym(105486503, 'reachGoal', name); } catch (err) {}
        try { if (typeof gtag === 'function') gtag('event', name, { page_path: location.pathname }); } catch (err) {}
    }

    function copyFallback(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) {}
        ta.remove();
        return ok;
    }

    copyBtn.addEventListener('click', function () {
        if (!copyText) return;
        var done = function () {
            setStatus(t.copied);
            goal('calc_copy');
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(copyText).then(done, function () { if (copyFallback(copyText)) done(); });
        } else if (copyFallback(copyText)) done();
    });

    sendLink.addEventListener('click', function () {
        if (!copyText) return;
        setStatus(t.sent);
        goal('calc_send');
    });

    saveBtn.addEventListener('click', function () {
        if (!order) return;
        var fail = function () { setStatus(t.saveFail); };
        try {
            if (viewer && active) shoot(active); // the open plate as it is turned right now
            drawCard().toBlob(function (blob) {
                if (!blob) return fail();
                var base = items.length === 1
                    ? items[0].name.replace(/\.(stl|obj|3mf)$/i, '').replace(/[^\wЀ-ӿ-]+/g, '-').slice(0, 40)
                    : items.length + '-stl';
                var a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = '3dpie-' + (base || 'stl') + '.png';
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
                setStatus(t.saved);
                goal('calc_save');
            }, 'image/png');
        } catch (err) { fail(); }
    });

    // The saved picture: every plate with its preview and settings, the totals and how to reach the studio.
    // Colours and fonts repeat the site tokens (css/styles.css :root).
    function drawCard() {
        var W = 1080, P = 64, BLOCK = 278, ROW = 58;
        var DISPLAY = '"Unbounded", "Onest", sans-serif', SANS = '"Onest", -apple-system, "Segoe UI", sans-serif';
        var cv = document.createElement('canvas');
        var ctx = cv.getContext('2d');
        var wrap = function (text, font, maxW) {
            ctx.font = font;
            var lines = [], line = '';
            text.split(' ').forEach(function (word) {
                var next = line ? line + ' ' + word : word;
                if (line && ctx.measureText(next).width > maxW) {
                    lines.push(line);
                    line = word;
                } else line = next;
            });
            if (line) lines.push(line);
            return lines;
        };
        var clip = function (text, maxW) {
            if (ctx.measureText(text).width <= maxW) return text;
            while (text.length > 1 && ctx.measureText(text + '…').width > maxW) text = text.slice(0, -1);
            return text + '…';
        };
        var rule = function (y) {
            ctx.fillStyle = '#252a2c';
            ctx.fillRect(P, y, W - P * 2, 2);
        };
        var NOTE_FONT = '400 26px ' + SANS;
        var note = wrap(t.card.note, NOTE_FONT, W - P * 2);
        var sums = [
            [t.models, String(items.length)],
            [t.pieces, int(order.pieces)],
            [t.sumWeight, '≈ ' + dec(order.grams) + ' ' + t.g],
            [t.sumTime, '≈ ' + duration(order.seconds)]
        ];
        cv.width = W;
        cv.height = P + 96 + items.length * BLOCK + sums.length * ROW + 40 + 150 + note.length * 36 + 30 + 44 + P;

        ctx.fillStyle = '#0c0e0f';
        ctx.fillRect(0, 0, W, cv.height);
        ctx.textBaseline = 'alphabetic';

        // header
        var y = P + 44;
        ctx.fillStyle = '#eceeed';
        ctx.font = '700 44px ' + DISPLAY;
        ctx.fillText('3DPie', P, y);
        var d = new Date();
        var two = function (n) { return (n < 10 ? '0' : '') + n; };
        ctx.textAlign = 'right';
        ctx.fillStyle = '#80898c';
        ctx.font = '400 26px ' + SANS;
        ctx.fillText(two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear(), W - P, y - 34);
        ctx.fillStyle = '#a9b0b2';
        ctx.font = '500 30px ' + SANS;
        ctx.fillText(t.card.title, W - P, y + 4);
        ctx.textAlign = 'left';
        y = P + 96;

        // plates
        items.forEach(function (item, i) {
            var e = item.est, s = e.set;
            var tw = 304, th = 228, x = P;
            rule(y);
            if (item.shot) {
                ctx.drawImage(item.thumb, P, y + 24, tw, th);
                ctx.strokeStyle = '#252a2c';
                ctx.lineWidth = 2;
                ctx.strokeRect(P + 1, y + 25, tw - 2, th - 2);
                x = P + tw + 32;
            }
            var room = W - P - x;
            var price = '≈ ' + plain(int(e.sum)) + ' ' + t.sum;
            ctx.font = '600 30px ' + SANS;
            var priceW = ctx.measureText(price).width;
            ctx.fillStyle = '#c6f432';
            ctx.font = '600 22px ' + SANS;
            ctx.fillText((t.plate + ' ' + (i + 1)).toUpperCase(), x, y + 52);
            ctx.fillStyle = '#eceeed';
            ctx.font = '600 30px ' + SANS;
            ctx.textAlign = 'right';
            ctx.fillText(price, W - P, y + 96);
            ctx.textAlign = 'left';
            ctx.fillText(clip(item.name, room - priceW - 24), x, y + 96);
            ctx.font = '400 25px ' + SANS;
            ctx.fillStyle = '#a9b0b2';
            [
                fill(t.card.line1, { mat: e.mat.name, infill: s.infill, layer: comma(s.layer), walls: s.walls }),
                fill(t.card.line2, { size: dims(e.size), qty: e.qty }),
                fill(t.card.line3, { weight: dec(e.grams), sup: supportText(e) }),
                fill(t.card.line4, { time: duration(e.seconds) })
            ].forEach(function (line, n) {
                ctx.fillText(clip(plain(line), room), x, y + 140 + n * 37);
            });
            y += BLOCK;
        });

        // totals
        sums.forEach(function (r) {
            rule(y);
            ctx.font = '400 27px ' + SANS;
            ctx.fillStyle = '#80898c';
            ctx.fillText(r[0], P, y + 38);
            ctx.font = '600 28px ' + SANS;
            ctx.fillStyle = '#eceeed';
            ctx.textAlign = 'right';
            ctx.fillText(plain(r[1]), W - P, y + 38);
            ctx.textAlign = 'left';
            y += ROW;
        });
        rule(y);
        y += 40;
        ctx.fillStyle = '#80898c';
        ctx.font = '500 26px ' + SANS;
        ctx.fillText(t.total.toUpperCase(), P, y + 26);
        ctx.fillStyle = '#c6f432';
        ctx.font = '500 68px ' + DISPLAY;
        ctx.fillText('≈ ' + plain(int(order.total)) + ' ' + t.sum, P, y + 110);
        y += 150;

        // note + contacts
        ctx.fillStyle = '#a9b0b2';
        ctx.font = NOTE_FONT;
        note.forEach(function (line) {
            ctx.fillText(line, P, y + 26);
            y += 36;
        });
        y += 30;
        ctx.fillStyle = '#eceeed';
        ctx.font = '600 28px ' + SANS;
        ctx.fillText('Telegram ' + DATA.handle + '  ·  ' + DATA.phone + '  ·  ' + DATA.site, P, y + 30);
        return cv;
    }

    zoomBar.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-zoom]');
        if (!btn || !viewer) return;
        var kind = btn.getAttribute('data-zoom');
        if (kind === 'fit') viewer.fit();
        else viewer.zoomBy(kind === 'in' ? 0.8 : 1.25);
    });

    // ---------- preview (plain WebGL, drawn on demand: no animation loop) ----------

    function mul(a, b) {
        var o = new Float32Array(16);
        for (var c = 0; c < 4; c++) {
            for (var r = 0; r < 4; r++) {
                var s = 0;
                for (var k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
                o[c * 4 + r] = s;
            }
        }
        return o;
    }

    // 4×4 inverse (column-major) for un-projecting a click into a ray.
    function invert(m) {
        var a00 = m[0], a01 = m[1], a02 = m[2], a03 = m[3], a10 = m[4], a11 = m[5], a12 = m[6], a13 = m[7];
        var a20 = m[8], a21 = m[9], a22 = m[10], a23 = m[11], a30 = m[12], a31 = m[13], a32 = m[14], a33 = m[15];
        var b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
        var b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
        var b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
        var b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1 / det;
        return [
            (a11 * b11 - a12 * b10 + a13 * b09) * det, (a02 * b10 - a01 * b11 - a03 * b09) * det,
            (a31 * b05 - a32 * b04 + a33 * b03) * det, (a22 * b04 - a21 * b05 - a23 * b03) * det,
            (a12 * b08 - a10 * b11 - a13 * b07) * det, (a00 * b11 - a02 * b08 + a03 * b07) * det,
            (a32 * b02 - a30 * b05 - a33 * b01) * det, (a20 * b05 - a22 * b02 + a23 * b01) * det,
            (a10 * b10 - a11 * b08 + a13 * b06) * det, (a01 * b08 - a00 * b10 - a03 * b06) * det,
            (a30 * b04 - a31 * b02 + a33 * b00) * det, (a21 * b02 - a20 * b04 - a23 * b00) * det,
            (a11 * b07 - a10 * b09 - a12 * b06) * det, (a00 * b09 - a01 * b07 + a02 * b06) * det,
            (a31 * b01 - a30 * b03 - a32 * b00) * det, (a20 * b03 - a21 * b01 + a22 * b00) * det
        ];
    }

    function unproject(inv, x, y, z) {
        var o = [0, 0, 0, 0];
        for (var i = 0; i < 4; i++) o[i] = inv[i] * x + inv[4 + i] * y + inv[8 + i] * z + inv[12 + i];
        return [o[0] / o[3], o[1] / o[3], o[2] / o[3]];
    }

    function perspective(fov, aspect, near, far) {
        var f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    }

    function rotX(a) {
        var c = Math.cos(a), s = Math.sin(a);
        return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    }

    function rotZ(a) {
        var c = Math.cos(a), s = Math.sin(a);
        return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }

    function translate(x, y, z) {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
    }

    var VS = 'attribute vec3 p;attribute vec3 n;uniform mat4 mvp;uniform mat4 rot;varying vec3 vn;varying float oz;' +
        'void main(){vn=(rot*vec4(n,0.)).xyz;oz=n.z;gl_Position=mvp*vec4(p,1.);}';
    // Two-sided lighting: STL normals and winding are often wrong, so the face is turned to the camera.
    // Overhangs (outward normal pointing down past the limit) are painted light grey.
    var FS = 'precision mediump float;varying vec3 vn;varying float oz;uniform vec3 col;uniform float lit;uniform float over;' +
        'void main(){if(lit<.5){gl_FragColor=vec4(col,1.);return;}vec3 N=normalize(vn);if(N.z<0.)N=-N;' +
        'float d=max(dot(N,normalize(vec3(-.45,.6,.75))),0.)*.8+max(dot(N,normalize(vec3(.7,-.3,.4))),0.)*.3;' +
        'bool o=oz<over;vec3 c=o?vec3(.86,.88,.88):col;gl_FragColor=vec4(c*((o?.55:.3)+.75*d),1.);}';

    function createViewer(cv, events) {
        var gl;
        try { gl = cv.getContext('webgl', { antialias: true }); } catch (err) {}
        if (!gl) return null;

        function shader(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }
        var prog = gl.createProgram();
        gl.attachShader(prog, shader(gl.VERTEX_SHADER, VS));
        gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FS));
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
        gl.useProgram(prog);

        var aP = gl.getAttribLocation(prog, 'p');
        var aN = gl.getAttribLocation(prog, 'n');
        var uMvp = gl.getUniformLocation(prog, 'mvp');
        var uRot = gl.getUniformLocation(prog, 'rot');
        var uCol = gl.getUniformLocation(prog, 'col');
        var uLit = gl.getUniformLocation(prog, 'lit');
        var uOver = gl.getUniformLocation(prog, 'over');
        gl.uniform1f(uOver, overLimit(common));
        var posBuf = gl.createBuffer();
        var nrmBuf = gl.createBuffer();
        var gridBuf = gl.createBuffer();
        var bedBuf = gl.createBuffer();
        var mesh = null, nrm = null;
        var count = 0, gridCount = 0, radius = 1, height = 0;
        var bedR = Math.sqrt(C.bed[0] * C.bed[0] + C.bed[1] * C.bed[1]) / 2;
        var yaw = -0.6, pitch = 0.45, zoom = 1, zoomMax = 3;
        var frame = 0, lastMvp = null;

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 0);

        // The print bed outline, so zooming out shows how big the part is.
        var bx = C.bed[0] / 2, by = C.bed[1] / 2;
        gl.bindBuffer(gl.ARRAY_BUFFER, bedBuf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -bx, -by, 0, bx, -by, 0, bx, -by, 0, bx, by, 0, bx, by, 0, -bx, by, 0, -bx, by, 0, -bx, -by, 0
        ]), gl.STATIC_DRAW);

        function setMesh(pos, m, keepView) {
            // Center on the bed: X/Y around zero, the lowest point on Z = 0.
            var cx = (m.min[0] + m.max[0]) / 2, cy = (m.min[1] + m.max[1]) / 2, cz = m.min[2];
            if (!nrm || nrm.length !== pos.length) nrm = new Float32Array(pos.length);
            for (var k = 0; k < pos.length; k += 9) {
                for (var v = 0; v < 9; v += 3) {
                    pos[k + v] -= cx;
                    pos[k + v + 1] -= cy;
                    pos[k + v + 2] -= cz;
                }
                var n = faceNormal(pos, k, m.sign) || [0, 0, 1];
                for (var j = 0; j < 9; j += 3) {
                    nrm[k + j] = n[0];
                    nrm[k + j + 1] = n[1];
                    nrm[k + j + 2] = n[2];
                }
            }
            mesh = pos;
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
            gl.bufferData(gl.ARRAY_BUFFER, nrm, gl.STATIC_DRAW);
            count = pos.length / 3;

            var sx = m.size[0], sy = m.size[1];
            height = m.size[2];
            radius = Math.sqrt(sx * sx + sy * sy + height * height) / 2 || 1;
            zoomMax = Math.max(3, bedR * 1.25 / radius);

            // Bed grid with a "round" step: about 8–20 cells across.
            var half = Math.max(sx, sy) * 0.8 || 1;
            var steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200];
            var step = steps[steps.length - 1];
            for (var i = 0; i < steps.length; i++) {
                if (half * 2 / steps[i] <= 20) { step = steps[i]; break; }
            }
            var g = Math.ceil(half / step) * step;
            var lines = [];
            for (var x = -g; x <= g + 1e-9; x += step) lines.push(x, -g, 0, x, g, 0, -g, x, 0, g, x, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lines), gl.STATIC_DRAW);
            gridCount = lines.length / 3;

            if (!keepView) {
                yaw = -0.6;
                pitch = 0.45;
                zoom = 1;
            }
            zoom = Math.min(zoom, zoomMax);
            resize();
        }

        function drawLines(buf, n, r, g, b) {
            gl.uniform3f(uCol, r, g, b);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, n);
        }

        function draw(clean) {
            clean = clean === true; // requestAnimationFrame calls this with a timestamp
            frame = 0;
            var w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            if (!count) return;
            var fov = 0.6;
            var dist = radius / Math.sin(fov / 2) * 1.08 * (clean ? 0.92 : zoom);
            var rot = mul(rotX(pitch - Math.PI / 2), rotZ(yaw));
            var view = mul(translate(0, 0, -dist), mul(rot, translate(0, 0, -height / 2)));
            var reach = Math.max(radius, bedR) * 2 + radius;
            lastMvp = mul(perspective(fov, w / h, Math.max(dist - reach, dist / 100), dist + reach), view);
            gl.uniformMatrix4fv(uMvp, false, lastMvp);
            gl.uniformMatrix4fv(uRot, false, rot);

            gl.uniform1f(uLit, 0);
            gl.disableVertexAttribArray(aN);
            gl.vertexAttrib3f(aN, 0, 0, 1);
            gl.enableVertexAttribArray(aP);
            if (!clean) {
                drawLines(gridBuf, gridCount, 0.204, 0.227, 0.239);
                if (zoom > 1.3) drawLines(bedBuf, 8, 0.44, 0.55, 0.15); // only when zoomed out: up close it is a stray line
            }

            gl.uniform1f(uLit, 1);
            gl.uniform3f(uCol, 0.776, 0.957, 0.196);
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
            gl.enableVertexAttribArray(aN);
            gl.vertexAttribPointer(aN, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, count);
        }

        function request() {
            if (!frame) frame = requestAnimationFrame(draw);
        }

        function resize() {
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            var w = Math.round(cv.clientWidth * dpr), h = Math.round(cv.clientHeight * dpr);
            if (w && h && (cv.width !== w || cv.height !== h)) {
                cv.width = w;
                cv.height = h;
            }
            request();
        }

        function zoomBy(f) {
            zoom = Math.max(0.35, Math.min(zoomMax, zoom * f));
            request();
        }

        function fit() {
            zoom = 1;
            request();
        }

        function setOver(limit) {
            gl.uniform1f(uOver, limit);
            request();
        }

        // Draws right now and hands over the canvas: a WebGL buffer can only be copied in the same task.
        // With `clean` the model is drawn alone and fitted (for the small pictures); the normal view
        // comes back on the next frame.
        function snapshot(clean) {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            draw(clean);
            if (clean) request();
            return cv;
        }

        // Nearest triangle under the pointer (ray cast, Möller–Trumbore); returns its offset or -1.
        function pick(clientX, clientY) {
            if (!mesh || !lastMvp) return -1;
            var inv = invert(lastMvp);
            if (!inv) return -1;
            var r = cv.getBoundingClientRect();
            var x = (clientX - r.left) / r.width * 2 - 1, y = 1 - (clientY - r.top) / r.height * 2;
            var o = unproject(inv, x, y, -1), e = unproject(inv, x, y, 1);
            var dx = e[0] - o[0], dy = e[1] - o[1], dz = e[2] - o[2];
            var best = Infinity, hit = -1, p = mesh;
            for (var k = 0; k < p.length; k += 9) {
                var e1x = p[k + 3] - p[k], e1y = p[k + 4] - p[k + 1], e1z = p[k + 5] - p[k + 2];
                var e2x = p[k + 6] - p[k], e2y = p[k + 7] - p[k + 1], e2z = p[k + 8] - p[k + 2];
                var px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
                var det = e1x * px + e1y * py + e1z * pz;
                if (Math.abs(det) < 1e-12) continue;
                var id = 1 / det;
                var tx = o[0] - p[k], ty = o[1] - p[k + 1], tz = o[2] - p[k + 2];
                var u = (tx * px + ty * py + tz * pz) * id;
                if (u < 0 || u > 1) continue;
                var qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
                var v = (dx * qx + dy * qy + dz * qz) * id;
                if (v < 0 || u + v > 1) continue;
                var tt = (e2x * qx + e2y * qy + e2z * qz) * id;
                if (tt > 0 && tt < best) {
                    best = tt;
                    hit = k;
                }
            }
            return hit;
        }

        if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cv);
        else window.addEventListener('resize', resize);

        // One pointer drags to rotate, two pointers pinch to zoom, a short tap picks a face.
        // touch-action: pan-y in CSS keeps vertical swipes scrolling the page.
        var pointers = {};
        var tap = null;
        var pinch = 0;

        function spread() {
            var ids = Object.keys(pointers);
            if (ids.length < 2) return 0;
            var a = pointers[ids[0]], b = pointers[ids[1]];
            return Math.hypot(a.x - b.x, a.y - b.y);
        }

        cv.addEventListener('pointerdown', function (e) {
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            try { cv.setPointerCapture(e.pointerId); } catch (err) {}
            tap = Object.keys(pointers).length === 1 ? { x: e.clientX, y: e.clientY } : null;
            pinch = spread();
            events.onGrab();
        });
        cv.addEventListener('pointermove', function (e) {
            var prev = pointers[e.pointerId];
            if (!prev) return;
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            if (tap && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) > 6) tap = null;
            if (pinch) {
                var d = spread();
                if (d) zoomBy(pinch / d);
                pinch = d;
                return;
            }
            yaw += (e.clientX - prev.x) * 0.01;
            pitch = Math.max(-0.2, Math.min(1.5, pitch + (e.clientY - prev.y) * 0.01));
            request();
        });
        ['pointerup', 'pointercancel'].forEach(function (type) {
            cv.addEventListener(type, function (e) {
                delete pointers[e.pointerId];
                pinch = spread();
                if (type === 'pointerup' && tap) events.onTap(pick(e.clientX, e.clientY));
                tap = null;
            });
        });

        // The wheel zooms only once the preview is focused (clicked), so it never traps page scrolling.
        cv.addEventListener('wheel', function (e) {
            if (document.activeElement !== cv) return;
            e.preventDefault();
            zoomBy(Math.exp(e.deltaY * 0.0015));
        }, { passive: false });
        cv.addEventListener('keydown', function (e) {
            var step = { ArrowLeft: [-0.15, 0], ArrowRight: [0.15, 0], ArrowUp: [0, -0.15], ArrowDown: [0, 0.15] }[e.key];
            if (step) {
                yaw += step[0];
                pitch = Math.max(-0.2, Math.min(1.5, pitch + step[1]));
                request();
            } else if (e.key === '+' || e.key === '=') zoomBy(0.8);
            else if (e.key === '-') zoomBy(1.25);
            else return;
            e.preventDefault();
        });

        return { setMesh: setMesh, zoomBy: zoomBy, fit: fit, setOver: setOver, snapshot: snapshot };
    }

    advToggle.checked = false; // browsers restore form state on reload: start from the defaults
    syncForm();
    update();
})();
