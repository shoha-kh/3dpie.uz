(function () {
    'use strict';

    // STL price calculator (prices page). Files are read in the browser and never uploaded.
    // One estimate holds several models, each on its own plate with its own settings; the order total
    // is the sum of the plates. Only the active plate is shown in the 3D preview.
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
    var addBtn = $('.calc-plate-add');
    var curEl = $('.calc-cur');
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
    //            min, max, size, support (mm³ under overhangs), set (its settings), est (last estimate),
    //            thumb (small canvas with its picture), notice }
    var items = [];
    var active = null;      // the plate in the preview and in the settings form
    var work = null;        // rotated copy of the active mesh: what the preview draws and picks faces on
    var set = defaults();   // settings in the form: the active plate's, or what the first model will get
    var viewer = null;
    var order = null;       // totals over all plates
    var copyText = '';
    var tracked = false;
    var replacing = null;   // the plate whose file is being replaced

    function defaults() {
        return {
            mat: C.materialDefault, qty: 1, unit: C.units[0][0], infill: C.infillDefault,
            layer: C.layerDefault, walls: C.walls.def, overhang: C.overhangDeg, supports: true
        };
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
        var s = item.set;
        var k = unitScale(s.unit);
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
            mat: mat, qty: s.qty, size: size, vol: vol, grams: grams, sup: sup, piece: piece, sum: piece * s.qty,
            seconds: T.startSec + print,                 // one piece printed alone
            plateSeconds: T.startSec + print * s.qty,    // the whole plate: one warm-up, then every copy
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
            var e = item.est, s = item.set;
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
            item.sumEl.textContent = item.est.qty + NBSP + t.pcs + ' · ' + approx + int(item.est.sum) + NBSP + t.sum;
            item.box.classList.toggle('is-warn', !!item.est.warn);
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
            item.support = supportSpace(work, item, overLimit(item.set)); // before the preview re-centres work in place
        }
        if (viewer) {
            viewer.setOver(overLimit(item.set));
            viewer.setMesh(work, item, keepView);
            shoot(item);
        }
    }

    // Support space of a plate that is not in the preview right now.
    function remeasure(item) {
        var buf = new Float32Array(item.orig.length);
        rotateInto(item.orig, item.R, buf);
        item.support = supportSpace(buf, item, overLimit(item.set));
    }

    function applyOrientation(R, keepView) {
        active.R = R;
        place(active, keepView, true);
        update();
    }

    // The plate's small picture: a copy of the preview as it looks now.
    function shoot(item) {
        var src = viewer.snapshot();
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
        var limit = overLimit(current.set);
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
            text.appendChild(el('span', 'calc-plate-n', t.plate + ' ' + (i + 1)));
            text.appendChild(el('span', 'calc-plate-name', item.name));
            item.sumEl = el('span', 'calc-plate-sum');
            text.appendChild(item.sumEl);
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
    }

    function setActive(item, fresh) {
        active = item;
        if (item) set = item.set;
        setPicking(false);
        setBusy(false);
        drop.hidden = !!item;
        bar.hidden = !item;
        canvas.hidden = zoomBar.hidden = !(item && viewer);
        nameEl.textContent = item ? item.name : '';
        curEl.textContent = item ? t.plate + ' ' + (items.indexOf(item) + 1) : '';
        syncForm();
        renderPlates();
        if (item) {
            place(item, false, fresh);
            // bring its chip into view inside the strip (sideways only: the page itself must not jump)
            var left = item.box.offsetLeft, right = left + item.box.offsetWidth;
            if (left < platesList.scrollLeft) platesList.scrollLeft = left;
            else if (right > platesList.scrollLeft + platesList.clientWidth) platesList.scrollLeft = right - platesList.clientWidth;
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
            // the first model takes the settings already chosen in the form, the next ones copy the current plate
            var own = set;
            if (items.length) {
                own = {};
                Object.keys(set).forEach(function (k) { own[k] = set[k]; });
                own.qty = 1;
            }
            item = { set: own, thumb: el('canvas', 'calc-plate-thumb') };
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
                var pos = parseStl(buf);
                var m = pos && pos.length >= 9 ? measure(pos) : null;
                if (!m || !(m.volume > 0)) throw new Error('bad stl');
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

    // ---------- settings of the active plate ----------

    function syncForm() {
        matSel.value = set.mat;
        unitSel.value = set.unit;
        qtyIn.value = set.qty;
        rangeIn.value = set.infill;
        rangeOut.textContent = set.infill + '%';
        presetRadios.forEach(function (r) { r.checked = +r.value === set.infill; });
        layerRadios.forEach(function (r) { r.checked = +r.value === set.layer; });
        wallsIn.value = set.walls;
        supSel.value = set.supports ? String(set.overhang) : 'off';
        legend.hidden = !set.supports;
    }

    function setInfill(v) {
        set.infill = Math.max(0, Math.min(100, Math.round(v)));
        rangeIn.value = set.infill;
        rangeOut.textContent = set.infill + '%';
        presetRadios.forEach(function (r) { r.checked = +r.value === set.infill; });
        update();
    }

    // Supports changed: the space under overhangs depends on the threshold, so measure again.
    function supportsChanged() {
        legend.hidden = !set.supports;
        if (active) {
            active.notice = '';
            applyOrientation(active.R, true);
        } else update();
    }

    // Back to the simple-mode values. Returns true when the support settings changed.
    function resetSet(s, keepInfill) {
        var changed = !s.supports || s.overhang !== C.overhangDeg;
        s.layer = C.layerDefault;
        s.walls = C.walls.def;
        s.overhang = C.overhangDeg;
        s.supports = true;
        // a value between the presets has no button in the simple mode, so it goes back to the default
        if (!keepInfill || C.infill.indexOf(s.infill) === -1) s.infill = C.infillDefault;
        return changed;
    }

    matSel.addEventListener('input', function () {
        set.mat = matSel.value;
        update();
    });
    unitSel.addEventListener('input', function () {
        set.unit = unitSel.value;
        update();
    });
    qtyIn.addEventListener('input', function () {
        var q = Math.round(+qtyIn.value);
        set.qty = q >= 1 ? Math.min(q, 10000) : 1;
        update();
    });
    qtyIn.addEventListener('change', function () { qtyIn.value = set.qty; });
    presetRadios.forEach(function (r) {
        r.addEventListener('change', function () { setInfill(+r.value); });
    });
    rangeIn.addEventListener('input', function () { setInfill(+rangeIn.value); });
    layerRadios.forEach(function (r) {
        r.addEventListener('change', function () {
            set.layer = +r.value;
            update();
        });
    });
    wallsIn.addEventListener('input', function () {
        var n = Math.round(+wallsIn.value);
        set.walls = n >= C.walls.min ? Math.min(n, C.walls.max) : C.walls.def;
        update();
    });
    wallsIn.addEventListener('change', function () { wallsIn.value = set.walls; });
    supSel.addEventListener('change', function () {
        set.supports = supSel.value !== 'off';
        if (set.supports) set.overhang = +supSel.value;
        supportsChanged();
    });
    $('.calc-reset').addEventListener('click', function () {
        var changed = resetSet(set, false);
        syncForm();
        if (changed) supportsChanged();
        else update();
    });
    advToggle.addEventListener('change', function () {
        advBox.hidden = !advToggle.checked;
        if (advToggle.checked) return;
        // Hidden settings must not keep changing the price: leaving the advanced mode restores
        // the defaults on every plate.
        var changed = resetSet(set, true);
        items.forEach(function (item) {
            if (item.set !== set && resetSet(item.set, true)) remeasure(item);
        });
        syncForm();
        if (changed) supportsChanged();
        else update();
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
                    ? items[0].name.replace(/\.stl$/i, '').replace(/[^\wЀ-ӿ-]+/g, '-').slice(0, 40)
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
        ctx.fillStyle = '#6f787b';
        ctx.font = '400 26px ' + SANS;
        ctx.fillText(two(d.getDate()) + '.' + two(d.getMonth() + 1) + '.' + d.getFullYear(), W - P, y - 34);
        ctx.fillStyle = '#a9b0b2';
        ctx.font = '500 30px ' + SANS;
        ctx.fillText(t.card.title, W - P, y + 4);
        ctx.textAlign = 'left';
        y = P + 96;

        // plates
        items.forEach(function (item, i) {
            var e = item.est, s = item.set;
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
            ctx.fillStyle = '#6f787b';
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
        ctx.fillStyle = '#6f787b';
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
        gl.uniform1f(uOver, overLimit(set));
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

        function draw() {
            frame = 0;
            var w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            if (!count) return;
            var fov = 0.6;
            var dist = radius / Math.sin(fov / 2) * 1.08 * zoom;
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
            drawLines(gridBuf, gridCount, 0.204, 0.227, 0.239);
            if (zoom > 1.3) drawLines(bedBuf, 8, 0.44, 0.55, 0.15); // only when zoomed out: up close it is a stray line

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
        function snapshot() {
            if (frame) cancelAnimationFrame(frame);
            draw();
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
