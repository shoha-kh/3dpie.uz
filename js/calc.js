(function () {
    'use strict';

    // STL price calculator (prices page). The file is read in the browser and never uploaded.
    // Weight = solid shell (walls + top/bottom skin) + infill share of the inside, times plastic density.
    // Prices, build volumes and strings come from CALC / CALC_T in src/site.js (inline JSON block).

    var root = document.querySelector('.calc');
    var dataEl = document.querySelector('.calc-data');
    if (!root || !dataEl) return;

    var cfg = JSON.parse(dataEl.textContent);
    var C = cfg.calc;
    var t = cfg.t;
    var MAX_BYTES = 100 * 1024 * 1024;
    var NBSP = String.fromCharCode(160);

    var $ = function (sel) { return root.querySelector(sel); };
    var stage = $('.calc-stage');
    var fileInput = $('.calc-file');
    var drop = $('.calc-drop');
    var canvas = $('.calc-canvas');
    var bar = $('.calc-bar');
    var hint = $('.calc-hint');
    var matSel = $('.calc-mat');
    var qtyIn = $('.calc-qty');
    var unitSel = $('.calc-unit');
    var msgEl = $('.calc-msg');
    var copyBtn = $('.calc-copy');
    var out = {};
    root.querySelectorAll('[data-out]').forEach(function (el) { out[el.getAttribute('data-out')] = el; });

    var model = null; // { name, volume mm³, area mm², size [x, y, z] mm, closed }
    var viewer = null;
    var copyText = '';
    var tracked = false;
    var notice = ''; // one-off note shown above the warnings (e.g. after auto-orientation)

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

    function supportSpace(pos, m, grid) {
        var cell = Math.max(m.size[0], m.size[1], 0.01) / (grid || GRID);
        var nx = Math.ceil(m.size[0] / cell) + 1, ny = Math.ceil(m.size[1] / cell) + 1;
        var x0 = m.min[0], y0 = m.min[1], bed = m.min[2];
        var limit = -Math.sin(C.overhangDeg * Math.PI / 180); // normal z below this = overhang
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

    function unitScale() {
        for (var i = 0; i < C.units.length; i++) if (C.units[i][0] === unitSel.value) return C.units[i][1];
        return 1;
    }

    function material() {
        for (var i = 0; i < C.materials.length; i++) if (C.materials[i].id === matSel.value) return C.materials[i];
        return C.materials[0];
    }

    function infill() {
        var el = root.querySelector('input[name="calc-infill"]:checked');
        return (el ? +el.value : C.infillDefault) / 100;
    }

    function qty() {
        var q = Math.round(+qtyIn.value);
        return q >= 1 ? Math.min(q, 10000) : 1;
    }

    function fits(size, bed) {
        var a = size.slice().sort(function (x, y) { return y - x; });
        var b = bed.slice().sort(function (x, y) { return y - x; });
        return a[0] <= b[0] && a[1] <= b[1] && a[2] <= b[2];
    }

    function setMsg(list) {
        msgEl.textContent = '';
        list.forEach(function (text) {
            var span = document.createElement('span');
            span.textContent = text;
            msgEl.appendChild(span);
        });
    }

    function update() {
        if (!model) {
            ['size', 'volume', 'weight', 'supports', 'piece'].forEach(function (k) { out[k].textContent = '—'; });
            out.total.textContent = t.empty;
            copyBtn.disabled = true;
            return;
        }
        var s = unitScale();
        var mat = material();
        var q = qty();
        var fillPct = infill();
        var size = model.size.map(function (v) { return v * s; });
        var vol = model.volume * s * s * s / 1000;          // cm³
        var shell = Math.min(vol, model.area * s * s / 100 * C.shellMm / 10);
        var sup = model.support * s * s * s / 1000 * C.supportFill * mat.density;
        var grams = (shell + (vol - shell) * fillPct) * mat.density + sup;
        var piece = Math.max(100, Math.round(grams * mat.price / 100) * 100);
        var raw = Math.round(piece * q / 1000) * 1000;
        var total = Math.max(raw, C.minOrder);

        out.size.textContent = dims(size) + NBSP + t.mm;
        out.volume.textContent = dec(vol) + NBSP + t.cm3;
        out.weight.textContent = '≈' + NBSP + dec(grams) + NBSP + t.g;
        out.supports.textContent = sup > 0.05 ? '≈' + NBSP + dec(sup) + NBSP + t.g : '—';
        out.piece.textContent = '≈' + NBSP + int(piece) + NBSP + t.sum;
        out.total.textContent = '≈' + NBSP + int(total) + NBSP + t.sum;

        var msgs = notice ? [notice] : [];
        if (!model.closed) msgs.push(t.msg.open);
        if (Math.max(size[0], size[1], size[2]) < 2) msgs.push(t.msg.tiny);
        if (!fits(size, C.bed)) msgs.push(fill(t.msg.fit, { bed: dims(C.bed) }));
        else if (mat.composite && !fits(size, C.bedComposite)) msgs.push(fill(t.msg.fitComposite, { bed: dims(C.bedComposite) }));
        if (raw < C.minOrder) msgs.push(fill(t.msg.min, { min: int(C.minOrder) }));
        if (!viewer) msgs.push(t.msg.noGl);
        setMsg(msgs);

        copyText = fill(t.copyText, {
            file: model.name, mat: mat.name, infill: Math.round(fillPct * 100), qty: q,
            size: dims(size), weight: dec(grams), sup: dec(sup), total: int(total)
        }).replace(/\u00a0/g, ' ');
        copyBtn.disabled = false;
        copyBtn.textContent = t.copy;
    }

    // ---------- orientation on the bed ----------
    // 3×3 row-major rotations applied to the file coordinates. model.orig keeps the file as loaded,
    // model.work is the rotated copy that is measured, drawn and re-centred by the preview.

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

    function applyOrientation(R, keepView) {
        model.R = R;
        rotateInto(model.orig, R, model.work);
        var b = bounds(model.work);
        model.min = b.min;
        model.max = b.max;
        model.size = b.size;
        model.support = supportSpace(model.work, model); // before the preview re-centres work in place
        if (viewer) viewer.setMesh(model.work, model, keepView);
        update();
    }

    // Candidate "down" directions: the six axes plus the largest flat areas of the model.
    function candidates() {
        var bins = {};
        for (var k = 0; k < model.orig.length; k += 9) {
            var n = faceNormal(model.orig, k, model.sign);
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
        var list = candidates();
        var tmp = new Float32Array(model.orig.length);
        var current = model;
        var best = null;
        var i = 0;
        setBusy(true);
        notice = '';
        setMsg([t.msg.auto]);
        (function step() {
            if (model !== current) return setBusy(false); // another file was loaded meanwhile
            var R = downFrom(list[i]);
            rotateInto(model.orig, R, tmp);
            var b = bounds(tmp);
            var score = supportSpace(tmp, { min: b.min, size: b.size, sign: model.sign }, 100) +
                (fits(b.size, C.bed) ? 0 : 1e18);
            if (!best || score < best.score * 0.98 || (score <= best.score * 1.02 && b.size[2] < best.h)) {
                best = { R: R, score: score, h: b.size[2] };
            }
            if (++i < list.length) {
                setTimeout(step, 0);
                return;
            }
            setBusy(false);
            notice = t.msg.autoDone;
            applyOrientation(best.R, true);
        })();
    }

    var orientBtns = root.querySelectorAll('[data-orient]');
    var faceBtn = $('[data-orient="face"]');
    var picking = false;

    function setBusy(on) {
        orientBtns.forEach(function (b) { b.disabled = on || !model; });
    }

    function setPicking(on) {
        picking = on && !!viewer;
        faceBtn.setAttribute('aria-pressed', picking ? 'true' : 'false');
        canvas.classList.toggle('is-picking', picking);
        hint.textContent = picking ? t.faceHint : t.rotate;
        hint.classList.toggle('is-on', picking);
        if (picking) hint.hidden = false;
    }

    orientBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!model) return;
            var kind = btn.getAttribute('data-orient');
            if (kind === 'face') return setPicking(!picking);
            setPicking(false);
            notice = '';
            if (kind === 'auto') autoOrient();
            else if (kind === 'reset') applyOrientation(IDENTITY, true);
            else applyOrientation(mul3(TURN[kind], model.R), true);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && picking) setPicking(false);
    });

    // A tap on the model in "face" mode lays that face on the bed.
    function onTap(k) {
        if (!picking || k < 0) return;
        var n = faceNormal(model.orig, k, model.sign);
        if (!n) return;
        setPicking(false);
        notice = '';
        applyOrientation(downFrom(n), true);
    }

    // ---------- file loading ----------

    function load(file) {
        if (!file) return;
        if (file.size > MAX_BYTES) {
            setMsg([t.msg.big]);
            return;
        }
        setMsg([t.msg.reading]);
        file.arrayBuffer().then(function (buf) {
            var pos = parseStl(buf);
            var m = pos && pos.length >= 9 ? measure(pos) : null;
            if (!m || !(m.volume > 0)) throw new Error('bad stl');
            m.name = file.name;
            m.orig = pos;
            m.work = new Float32Array(pos.length);
            model = m;
            notice = '';
            showPreview(m);
            setPicking(false);
            setBusy(false);
            applyOrientation(IDENTITY, false);
            if (!tracked) {
                tracked = true;
                try { if (typeof ym === 'function') ym(105486503, 'reachGoal', 'calc_stl'); } catch (err) {}
                try { if (typeof gtag === 'function') gtag('event', 'calc_stl', { page_path: location.pathname }); } catch (err) {}
            }
        }).catch(function () {
            model = null;
            drop.hidden = false;
            canvas.hidden = true;
            bar.hidden = true;
            zoomBar.hidden = true;
            setPicking(false);
            setBusy(false);
            update();
            setMsg([t.msg.bad]);
        });
    }

    fileInput.addEventListener('change', function () {
        load(fileInput.files[0]);
        fileInput.value = '';
    });

    $('.calc-other').addEventListener('click', function () { fileInput.click(); });

    ['dragenter', 'dragover'].forEach(function (type) {
        stage.addEventListener(type, function (e) {
            e.preventDefault();
            stage.classList.add('is-over');
        });
    });
    ['dragleave', 'drop'].forEach(function (type) {
        stage.addEventListener(type, function (e) {
            e.preventDefault();
            if (type === 'dragleave' && stage.contains(e.relatedTarget)) return;
            stage.classList.remove('is-over');
            if (type === 'drop' && e.dataTransfer.files.length) load(e.dataTransfer.files[0]);
        });
    });

    [matSel, unitSel, qtyIn].forEach(function (el) { el.addEventListener('input', update); });
    root.querySelectorAll('input[name="calc-infill"]').forEach(function (el) { el.addEventListener('change', update); });

    copyBtn.addEventListener('click', function () {
        if (!copyText || !navigator.clipboard) return;
        navigator.clipboard.writeText(copyText).then(function () { copyBtn.textContent = t.copied; }, function () {});
    });

    var zoomBar = $('.calc-zoom');
    zoomBar.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-zoom]');
        if (!btn || !viewer) return;
        var kind = btn.getAttribute('data-zoom');
        if (kind === 'fit') viewer.fit();
        else viewer.zoomBy(kind === 'in' ? 0.8 : 1.25);
    });

    // ---------- preview (plain WebGL, drawn on demand: no animation loop) ----------

    function showPreview(m) {
        drop.hidden = true;
        bar.hidden = false;
        $('.calc-name').textContent = m.name;
        if (viewer === null) viewer = createViewer(canvas, { onTap: onTap, onGrab: function () { if (!picking) hint.hidden = true; } }) || false;
        if (!viewer) {
            hint.hidden = true;
            faceBtn.hidden = true;
            return;
        }
        canvas.hidden = false;
        zoomBar.hidden = false;
    }

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
        gl.uniform1f(gl.getUniformLocation(prog, 'over'), -Math.sin(C.overhangDeg * Math.PI / 180));
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

        return { setMesh: setMesh, zoomBy: zoomBy, fit: fit };
    }

    update();
})();
