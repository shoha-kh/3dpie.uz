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
    var MAX_BYTES = 150 * 1024 * 1024;
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

    function supportSpace(pos, m) {
        var cell = Math.max(m.size[0], m.size[1], 0.01) / GRID;
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
                var below = r > 0 ? zs[idx[r - 1]] : bed;
                var h = zs[idx[r]] - below;
                if (h > minH) height += h;
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

        var msgs = [];
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
            m.support = supportSpace(pos, m); // before the preview re-centres pos in place
            model = m;
            showPreview(pos, m);
            update();
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

    // ---------- preview (plain WebGL, drawn on demand: no animation loop) ----------

    function showPreview(pos, m) {
        drop.hidden = true;
        bar.hidden = false;
        $('.calc-name').textContent = m.name;
        if (viewer === null) viewer = createViewer(canvas) || false;
        if (!viewer) {
            hint.hidden = true;
            return;
        }
        canvas.hidden = false;
        viewer.setMesh(pos, m);
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

    function createViewer(cv) {
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
        var count = 0, gridCount = 0, radius = 1, height = 0;
        var yaw = -0.6, pitch = 0.45;
        var frame = 0;

        gl.enable(gl.DEPTH_TEST);
        gl.clearColor(0, 0, 0, 0);

        function setMesh(pos, m) {
            // Center on the bed: X/Y around zero, the lowest point on Z = 0.
            var cx = (m.min[0] + m.max[0]) / 2, cy = (m.min[1] + m.max[1]) / 2, cz = m.min[2];
            var nrm = new Float32Array(pos.length);
            for (var k = 0; k < pos.length; k += 9) {
                for (var v = 0; v < 9; v += 3) {
                    pos[k + v] -= cx;
                    pos[k + v + 1] -= cy;
                    pos[k + v + 2] -= cz;
                }
                var ux = pos[k + 3] - pos[k], uy = pos[k + 4] - pos[k + 1], uz = pos[k + 5] - pos[k + 2];
                var wx = pos[k + 6] - pos[k], wy = pos[k + 7] - pos[k + 1], wz = pos[k + 8] - pos[k + 2];
                var nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
                var l = (Math.sqrt(nx * nx + ny * ny + nz * nz) || 1) * m.sign; // outward normals
                for (var j = 0; j < 9; j += 3) {
                    nrm[k + j] = nx / l;
                    nrm[k + j + 1] = ny / l;
                    nrm[k + j + 2] = nz / l;
                }
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
            gl.bufferData(gl.ARRAY_BUFFER, pos, gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
            gl.bufferData(gl.ARRAY_BUFFER, nrm, gl.STATIC_DRAW);
            count = pos.length / 3;

            var sx = m.size[0], sy = m.size[1];
            height = m.size[2];
            radius = Math.sqrt(sx * sx + sy * sy + height * height) / 2 || 1;

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

            yaw = -0.6;
            pitch = 0.45;
            resize();
        }

        function draw() {
            frame = 0;
            var w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
            gl.viewport(0, 0, w, h);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            if (!count) return;
            var fov = 0.6;
            var dist = radius / Math.sin(fov / 2) * 1.08;
            var rot = mul(rotX(pitch - Math.PI / 2), rotZ(yaw));
            var view = mul(translate(0, 0, -dist), mul(rot, translate(0, 0, -height / 2)));
            var mvp = mul(perspective(fov, w / h, Math.max(dist - radius * 3, dist / 100), dist + radius * 3), view);
            gl.uniformMatrix4fv(uMvp, false, mvp);
            gl.uniformMatrix4fv(uRot, false, rot);

            gl.uniform1f(uLit, 0);
            gl.uniform3f(uCol, 0.204, 0.227, 0.239);
            gl.disableVertexAttribArray(aN);
            gl.vertexAttrib3f(aN, 0, 0, 1);
            gl.bindBuffer(gl.ARRAY_BUFFER, gridBuf);
            gl.enableVertexAttribArray(aP);
            gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.LINES, 0, gridCount);

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

        if ('ResizeObserver' in window) new ResizeObserver(resize).observe(cv);
        else window.addEventListener('resize', resize);

        // Drag to rotate. touch-action: pan-y in CSS keeps vertical swipes scrolling the page.
        var drag = null;
        cv.addEventListener('pointerdown', function (e) {
            drag = { x: e.clientX, y: e.clientY };
            cv.setPointerCapture(e.pointerId);
            hint.hidden = true;
        });
        cv.addEventListener('pointermove', function (e) {
            if (!drag) return;
            yaw += (e.clientX - drag.x) * 0.01;
            pitch = Math.max(-0.2, Math.min(1.5, pitch + (e.clientY - drag.y) * 0.01));
            drag = { x: e.clientX, y: e.clientY };
            request();
        });
        ['pointerup', 'pointercancel'].forEach(function (type) {
            cv.addEventListener(type, function () { drag = null; });
        });

        return { setMesh: setMesh };
    }

    update();
})();
