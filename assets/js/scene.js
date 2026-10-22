// The riverside diorama on the home page: a canvas scene drawn in code, plus the pins and their cards.
(() => {
  const W = 880, H = 600;
  const A = 30, B = 15, Z = 30, OX = 440, OY = 170;
  const cv = document.getElementById('scene');
  const ctx = cv.getContext('2d');
  const quipEl = document.getElementById('quip');
  const nameEl = document.getElementById('name');
  const pinsEl = document.getElementById('pins');
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const prog = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
  const eOut = t => 1 - Math.pow(1 - t, 3);
  const eInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const eBack = t => { const c = 1.7; return t <= 0 ? 0 : 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const norm = v => { const l = Math.hypot(...v) || 1; return v.map(c => c / l); };
  const L2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
  const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
  const LT = norm([.15, .55, 1]);

  // ---------- colours from tokens ----------
  const KEYS = ['ink', 'grass', 'grass2', 'paddy', 'laterite', 'path', 'water', 'water2', 'hill', 'hill2', 'wall', 'roof', 'wood', 'trunk', 'leaf', 'leaf2', 'mango', 'unripe', 'stone', 'cloud', 'cloudsh', 'win', 'slate', 'chalk', 'skin', 'tee', 'denim', 'hair', 'cat', 'crt', 'pot'];
  let C = {};
  function hex(h) { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function readColors() {
    const s = getComputedStyle(document.documentElement);
    for (const k of KEYS) C[k] = hex(s.getPropertyValue('--' + k).trim());
    cacheDirty = true;
    if (still) frameStill();
  }
  const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
  const shade = (c, f) => [Math.min(255, c[0] * f), Math.min(255, c[1] * f), Math.min(255, c[2] * f)];

  // ---------- iso drawing (g = current target context, logical px) ----------
  let g = ctx, rise = 0;
  const P = (x, y, z = 0) => [OX + (x - y) * A, OY + (x + y) * B - z * Z + rise];
  function poly(pts) { g.beginPath(); pts.forEach((p, i) => { const [x, y] = P(...p); i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); }
  function fillWorld(pts, col) { poly(pts); g.fillStyle = col; g.fill(); }
  function face(pts, n, col, alpha = 1) {
    if (n[0] + n[1] + n[2] <= 0) return;
    const nn = norm(n), f = .62 + .42 * Math.max(0, nn[0] * LT[0] + nn[1] * LT[1] + nn[2] * LT[2]);
    const c = rgba(shade(col, f), alpha);
    poly(pts); g.fillStyle = c; g.fill(); g.strokeStyle = c; g.lineWidth = .6; g.stroke();
  }
  function box(x0, y0, z0, x1, y1, z1, col, top = col) {
    face([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [0, 0, 1], top);
    face([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [1, 0, 0], col);
    face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [0, 1, 0], col);
  }
  const quadY = (y, xa, xb, za, zb, col) => face([[xa, y, za], [xb, y, za], [xb, y, zb], [xa, y, zb]], [0, 1, 0], col);
  const quadX = (x, ya, yb, za, zb, col) => face([[x, ya, za], [x, yb, za], [x, yb, zb], [x, ya, zb]], [1, 0, 0], col);
  function ln(a, b, col, w) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.strokeStyle = col; g.lineWidth = w; g.stroke(); }
  const seg3 = (a, b, col, w) => ln(P(...a), P(...b), col, w);
  const L3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  function hipRoof(x0, y0, x1, y1, h, r, o, col) {
    x0 -= o; y0 -= o; x1 += o; y1 += o;
    const d = (y1 - y0) / 2, ym = (y0 + y1) / 2, R1 = [x0 + d, ym, h + r], R2 = [x1 - d, ym, h + r];
    face([[x1, y0, h], [x0, y0, h], R1, R2], [0, -r, d], col);
    face([[x0, y1, h], [x0, y0, h], R1], [-r, 0, d], col);
    face([[x0, y1, h], [x1, y1, h], R2, R1], [0, r, d], col);
    face([[x1, y0, h], [x1, y1, h], R2], [r, 0, d], col);
    const line = rgba(shade(col, .72), .55);
    for (let i = 1; i < 4; i++) { const f = i / 4; seg3(L3([x0, y1, h], R1, f), L3([x1, y1, h], R2, f), line, .8); seg3(L3([x1, y0, h], R2, f), L3([x1, y1, h], R2, f), line, .8); }
  }
  function wallText(plane, x, y, z, txt, unit, col, font) {
    const [sx, sy] = P(x, y, z), q = unit / 20;
    g.save(); g.translate(sx, sy);
    if (plane === 'y') g.transform(A * q, B * q, 0, Z * q, 0, 0); else g.transform(A * q, -B * q, 0, Z * q, 0, 0);
    g.font = font; g.fillStyle = col; g.textBaseline = 'top'; g.fillText(txt, 0, 0); g.restore();
  }
  function groundEllipse(x, y, r, col, sy = 1) { const [cx, cy] = P(x, y, 0); g.beginPath(); g.ellipse(cx, cy, r * A * 1.414, r * B * 1.414 * sy, 0, 0, Math.PI * 2); g.fillStyle = col; g.fill(); }
  function ringY(x, y, z, r, n = 18) { const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; pts.push(P(x + Math.cos(a) * r, y, z + Math.sin(a) * r)); } return pts; }
  function ring2(pts) { g.beginPath(); pts.forEach((p, i) => i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); }
  function pop(t, at, anchor, fn, dur = 420) {
    const s = still ? 1 : eBack(prog(t, at, at + dur));
    if (s <= 0) return;
    const [ax, ay] = P(...anchor);
    g.save(); g.globalAlpha *= still ? 1 : prog(t, at, at + 160);
    g.translate(ax, ay); g.scale(s, s); g.translate(-ax, -ay);
    fn(); g.restore();
  }

  // ---------- the river ----------
  function catmull(pts, per) {
    const out = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
      for (let k = 0; k < per; k++) {
        const t = k / per, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
      }
    }
    out.push(pts[pts.length - 1]); return out;
  }
  const RC = catmull([[8.7, -.2], [8.3, 1.8], [7.0, 3.4], [5.2, 4.5], [4.0, 6.0], [3.7, 8.0], [3.3, 10.2], [3.0, 12.2]], 10);
  const RN = RC.map((p, i) => { const a = RC[Math.max(0, i - 1)], b = RC[Math.min(RC.length - 1, i + 1)]; const tn = norm([b[0] - a[0], b[1] - a[1]]); return { t: tn, n: [-tn[1], tn[0]] }; });
  const RW = .62;
  const cl = v => clamp(v, 0, 12);
  function riverPts(w, fr = 1) {
    const k = Math.max(1, Math.floor(fr * (RC.length - 1)));
    const L = [], R = [];
    for (let i = 0; i <= k; i++) { const p = RC[i], n = RN[i].n; L.push([cl(p[0] + n[0] * w), cl(p[1] + n[1] * w), .004]); R.push([cl(p[0] - n[0] * w), cl(p[1] - n[1] * w), .004]); }
    return L.concat(R.reverse());
  }
  const BRIDGE_I = RC.findIndex(p => p[1] > 4.5) - 1;

  // ---------- static scenery ----------
  function hill(x, y, r, h, seed) {
    const [cx, cy] = P(x, y, 0), rx = r * A * 1.414, ry = r * B * 1.414, hh = h * Z;
    const gr = g.createLinearGradient(cx - rx, 0, cx + rx, 0);
    gr.addColorStop(0, rgba(C.hill)); gr.addColorStop(1, rgba(C.hill2));
    g.beginPath(); g.moveTo(cx - rx, cy);
    g.bezierCurveTo(cx - rx * .55, cy - hh * 1.35, cx + rx * .55, cy - hh * 1.35, cx + rx, cy);
    g.ellipse(cx, cy, rx, ry, 0, 0, Math.PI); g.closePath(); g.fillStyle = gr; g.fill();
    const R = rng(seed);
    for (let i = 0; i < 9; i++) {
      const u = (R() - .5) * 1.5, tx = cx + u * rx, top = cy - hh * (1 - u * u) * .95, ty = lerp(top + 6, cy, R() * .8);
      g.beginPath(); g.arc(tx, ty, 3 + R() * 3, 0, 7); g.fillStyle = rgba(R() < .5 ? C.leaf : shade(C.hill2, .9), .85); g.fill();
    }
  }
  function stoneWall(x0, x1, y, seed) {
    const R = rng(seed);
    for (const [row, z] of [[0, .09], [1, .25], [2, .4]]) {
      for (let x = x0 + (row % 2) * .14; x < x1; x += .26 + R() * .06) {
        const [sx, sy] = P(x, y, z), c = mix(C.stone, C.laterite, R() * .45);
        g.beginPath(); g.ellipse(sx, sy, 4.4 + R() * 1.2, 2.8 + R() * .6, 0, 0, 7);
        g.fillStyle = rgba(c); g.fill(); g.strokeStyle = rgba(shade(c, .7), .7); g.lineWidth = .7; g.stroke();
      }
    }
  }
  function drawBack(t) {
    const ink = C.ink;
    { const [cx, cy] = P(6, 6, 0); g.beginPath(); g.ellipse(cx, cy + 210, 300, 24, 0, 0, Math.PI * 2); g.fillStyle = rgba(ink, .07); g.fill(); }
    // plot sides
    face([[12, 0, -1.3], [12, 12, -1.3], [12, 12, -.16], [12, 0, -.16]], [1, 0, 0], C.laterite);
    face([[0, 12, -1.3], [12, 12, -1.3], [12, 12, -.16], [0, 12, -.16]], [0, 1, 0], C.laterite);
    face([[12, 0, -.16], [12, 12, -.16], [12, 12, 0], [12, 0, 0]], [1, 0, 0], C.grass2);
    face([[0, 12, -.16], [12, 12, -.16], [12, 12, 0], [0, 12, 0]], [0, 1, 0], C.grass2);
    const strata = rgba(shade(C.laterite, .78), .7);
    for (const z of [-.55, -.95]) { seg3([12, 0, z], [12, 12, z], strata, 1); seg3([0, 12, z], [12, 12, z], strata, 1); }
    for (const [x, z] of [[1.4, -.4], [6.5, -.75], [9, -.5], [10.5, -1.05]]) { const p = P(x, 12, z); g.beginPath(); g.ellipse(p[0], p[1], 3, 1.6, 0, 0, 7); g.fillStyle = strata; g.fill(); }
    const ex = riverPts(RW).filter(p => p[1] >= 11.99).map(p => p[0]);
    face([[Math.min(...ex), 12, -.3], [Math.max(...ex), 12, -.3], [Math.max(...ex), 12, 0], [Math.min(...ex), 12, 0]], [0, 1, 0], C.water);
    // ground
    face([[0, 0, 0], [12, 0, 0], [12, 12, 0], [0, 12, 0]], [0, 0, 1], C.grass);
    g.globalAlpha *= .8;
    groundEllipse(7.4, 9.6, 1.3, rgba(C.grass2)); groundEllipse(9.6, 2.4, 1.4, rgba(C.grass2)); groundEllipse(5.6, 10.8, .9, rgba(C.grass2));
    g.globalAlpha /= .8;
    fillWorld([[10.4, 0, .002], [11.7, 0, .002], [11.7, 12, .002], [10.4, 12, .002]], rgba(C.path));
    for (let y = .5; y < 12; y += .8) { const p = P(10.7 + (y * 13 % 1) * .8, y, 0); g.fillStyle = rgba(shade(C.path, .85)); g.fillRect(p[0], p[1], 2, 1); }
    fillWorld([[9.3, 11.3, .002], [10.5, 10.7, .002], [10.5, 12, .002], [9.3, 12, .002]], rgba(C.path));
    groundEllipse(9.3, 7.4, 1.8, rgba(C.grass2, .9), .9);
    // river bed fills in during the intro
    const fr = still ? 1 : eOut(prog(t, 600, 1500));
    if (fr > 0) { fillWorld(riverPts(RW + .14, fr), rgba(mix(C.path, C.grass2, .35))); fillWorld(riverPts(RW, fr), rgba(C.water)); fillWorld(riverPts(RW * .4, fr), rgba(C.water2, .22)); }
    // paddy and channel
    pop(t, 900, [1.4, 9.8, 0], () => {
      fillWorld([[.4, 6.4, .003], [2.4, 6.4, .003], [2.4, 9.8, .003], [.4, 9.8, .003]], rgba(C.paddy));
      for (let y = 6.65; y < 9.8; y += .3) seg3([.5, y, .01], [2.3, y, .01], rgba(shade(C.paddy, .78), .8), 1.1);
      fillWorld([[2.4, 6.86, .004], [3.35, 6.86, .004], [3.35, 7.14, .004], [2.4, 7.14, .004]], rgba(C.water));
    });
    // hills
    const hs = still ? 1 : eOut(prog(t, 700, 1300));
    if (hs > 0) { g.save(); const [hx, hy] = P(1.1, 1.1, 0); g.translate(hx, hy); g.scale(1, hs); g.translate(-hx, -hy); hill(1.1, 1.1, 1.1, 1.7, 4); g.restore(); g.save(); const [h2x, h2y] = P(10.8, 1.1, 0); g.translate(h2x, h2y); g.scale(1, hs); g.translate(-h2x, -h2y); hill(10.8, 1.1, .95, 1.2, 9); g.restore(); }
    // house with veranda, old computer, purifier on the sill
    pop(t, 1150, [1.4, 5.3, 0], () => {
      box(.4, 2.9, 0, 2.4, 4.7, .16, C.laterite);
      box(.5, 3.0, .16, 2.3, 4.6, 1.35, C.wall);
      box(.4, 4.6, 0, 2.4, 5.35, .16, shade(C.roof, .92));
      quadX(2.301, 3.35, 3.85, .55, .98, C.win);
      box(2.3, 3.25, .52, 2.42, 3.95, .56, C.wall);
      box(2.32, 3.4, .56, 2.6, 3.7, .82, C.chalk);
      const fc = P(2.601, 3.55, .69); g.beginPath(); g.ellipse(fc[0], fc[1], 3.6, 3.2, -.45, 0, 7); g.strokeStyle = rgba(C.ink, .8); g.lineWidth = .9; g.stroke();
      box(2.32, 3.78, .56, 2.37, 3.93, .9, C.chalk);
      quadY(4.601, 1.55, 2.0, .16, 1.05, C.wood);
      quadY(4.601, .7, 1.15, .55, .98, C.win);
      box(1.15, 4.75, .16, 1.45, 5.15, .44, C.wood);
      box(1.12, 4.8, .44, 1.45, 5.1, .8, C.crt);
      quadY(5.101, 1.16, 1.4, .5, .74, C.slate);
      for (const x of [.5, 1.4, 2.2]) box(x, 5.2, .16, x + .1, 5.3, 1.24, C.wall);
      hipRoof(.5, 3.0, 2.3, 4.6, 1.35, .82, .25, C.roof);
      face([[.25, 4.6, 1.46], [2.55, 4.6, 1.46], [2.55, 5.5, 1.22], [.25, 5.5, 1.22]], [0, .26, .92], C.roof);
      for (let i = 1; i < 4; i++) { const f = i / 4; seg3([.25, lerp(4.6, 5.5, f), lerp(1.46, 1.22, f)], [2.55, lerp(4.6, 5.5, f), lerp(1.46, 1.22, f)], rgba(shade(C.roof, .72), .55), .8); }
    });
    pop(t, 1250, [2.0, 5.95, 0], () => stoneWall(.45, 3.5, 5.95, 5));
    // sluice gate with a meter
    pop(t, 1400, [2.85, 7.0, 0], () => {
      box(2.8, 6.7, 0, 2.9, 6.8, .78, C.wood);
      box(2.79, 6.8, .26, 2.88, 7.2, .62, C.wood);
      box(2.8, 7.2, 0, 2.9, 7.3, .78, C.wood);
      box(2.79, 6.7, .7, 2.9, 7.3, .8, C.wood);
      const dc = P(2.86, 7.31, .5); g.beginPath(); g.arc(dc[0], dc[1], 5.5, 0, 7); g.fillStyle = rgba(C.chalk); g.fill(); g.strokeStyle = rgba(C.ink); g.lineWidth = 1; g.stroke();
    });
  }
  function drawFront(t) {
    pop(t, 1600, [9.85, 11.1, 0], () => {
      box(9.4, 10.2, .42, 10.3, 11.0, .86, C.wood, shade(C.wood, 1.15));
      for (const x of [9.42, 10.2]) for (const y of [10.22, 10.9]) box(x, y, .86, x + .07, y + .07, 1.62, C.wood);
      const wp = ringY(9.62, 11.02, .33, .32); ring2(wp); g.strokeStyle = rgba(shade(C.wood, .7)); g.lineWidth = 1.8; g.stroke();
      const wc = P(9.62, 11.02, .33); for (let i = 0; i < 4; i++) ln(wc, wp[i * 4 + 1], rgba(shade(C.wood, .7)), .8);
      const wp2 = ringY(10.1, 11.02, .33, .32); ring2(wp2); g.strokeStyle = rgba(shade(C.wood, .7)); g.lineWidth = 1.8; g.stroke();
      face([[9.25, 10.05, 1.62], [10.45, 10.05, 1.62], [10.45, 11.15, 1.62], [9.25, 11.15, 1.62]], [0, 0, 1], C.chalk);
      for (let i = 0; i < 5; i++) { const x0 = 9.25 + i * .24; face([[x0, 10.05, 1.621], [x0 + .12, 10.05, 1.621], [x0 + .12, 11.15, 1.621], [x0, 11.15, 1.621]], [0, 0, 1], C.roof); }
      quadY(11.15, 9.25, 10.45, 1.55, 1.62, shade(C.roof, .9));
      box(9.58, 10.45, .86, 9.8, 10.67, 1.05, [150, 157.4, 160]);
      for (const x of [9.95, 10.1]) box(x, 10.7, .86, x + .09, 10.79, .98, mix(C.water2, C.chalk, .5));
    });
    pop(t, 1700, [9.95, 11.55, 0], () => {
      seg3([9.55, 11.52, 0], [9.62, 11.52, .75], rgba(C.wood), 1.4); seg3([10.35, 11.52, 0], [10.28, 11.52, .75], rgba(C.wood), 1.4);
      quadY(11.55, 9.55, 10.35, .18, .76, C.wood); quadY(11.555, 9.6, 10.3, .22, .72, C.slate);
    });
  }

  // ---------- palms and banana (they sway, so they are live) ----------
  function palm(t, x, y, h, lx, ly, seed) {
    const R = rng(seed), sw = swayAmt(t), base = P(x, y, 0);
    const top = add(P(x + lx, y + ly, h), [Math.sin(t * .0007 + seed) * 1.5 * sw, 0]);
    const ctl = [lerp(base[0], top[0], .2) + lx * 6, lerp(base[1], top[1], .55)];
    let prev = base;
    for (let i = 1; i <= 12; i++) {
      const s = i / 12, u = 1 - s;
      const p = [u * u * base[0] + 2 * u * s * ctl[0] + s * s * top[0], u * u * base[1] + 2 * u * s * ctl[1] + s * s * top[1]];
      g.lineCap = 'butt'; ln(prev, p, rgba(i % 2 ? C.trunk : shade(C.trunk, .82)), lerp(6, 3.6, s)); prev = p;
    }
    g.lineCap = 'round';
    const fr = []; for (let i = 0; i < 9; i++) fr.push(i / 9 * Math.PI * 2 + R() * .5);
    fr.sort((a, b) => Math.sin(a) - Math.sin(b));
    for (const a0 of fr) {
      const a = a0 + Math.sin(t * .0011 + a0 * 3 + seed) * .06 * sw;
      const L = 46 + R() * 14, ex = top[0] + Math.cos(a) * L, ey = top[1] + Math.sin(a) * L * .5 + 20 + Math.sin(t * .0013 + a0) * 2 * sw;
      const cx = top[0] + Math.cos(a) * L * .55, cy = top[1] + Math.sin(a) * L * .3 - 16;
      const col = rgba(Math.sin(a) > 0 ? C.leaf2 : C.leaf);
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(cx, cy, ex, ey); g.strokeStyle = col; g.lineWidth = 2.2; g.stroke();
      g.lineWidth = 1.4; g.beginPath();
      for (let k = 2; k < 11; k++) {
        const s = k / 11, u = 1 - s, px = u * u * top[0] + 2 * u * s * cx + s * s * ex, py = u * u * top[1] + 2 * u * s * cy + s * s * ey, len = 9 * (1 - s * .55);
        g.moveTo(px, py); g.lineTo(px + Math.cos(a + 1.2) * len * .5, py + len); g.moveTo(px, py); g.lineTo(px + Math.cos(a - 1.2) * len * .5, py + len * .8);
      }
      g.stroke();
    }
    g.beginPath(); g.arc(top[0], top[1] + 3, 3.4, 0, 7); g.fillStyle = rgba(C.leaf); g.fill();
  }
  function banana(t, x, y) {
    const sw = swayAmt(t), [bx, by] = P(x, y, 0), top = [bx, by - 30];
    ln([bx, by], top, rgba(mix(C.leaf2, C.trunk, .3)), 4.5);
    const leaves = [-2.7, -2.2, -1.75, -1.3, -.9, -.45];
    for (const [i, a0] of leaves.entries()) {
      const a = a0 + Math.sin(t * .0012 + i * 1.7) * .07 * sw, L = 34 + (i % 3) * 6;
      const tip = [top[0] + Math.cos(a) * L, top[1] + Math.sin(a) * L * .6 + 14], mid = [top[0] + Math.cos(a) * L * .5, top[1] + Math.sin(a) * L * .55 - 4];
      const nx = -Math.sin(a) * 7, ny = Math.cos(a) * 3;
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(mid[0] + nx, mid[1] + ny - 5, tip[0], tip[1]); g.quadraticCurveTo(mid[0] - nx, mid[1] - ny + 5, top[0], top[1]);
      g.fillStyle = rgba(i % 2 ? C.leaf2 : mix(C.leaf, C.leaf2, .4)); g.fill();
      g.beginPath(); g.moveTo(top[0], top[1]); g.quadraticCurveTo(mid[0], mid[1] - 2, tip[0], tip[1]); g.strokeStyle = rgba(C.leaf, .7); g.lineWidth = .8; g.stroke();
    }
  }

  // ---------- clouds and birds ----------
  const CLOUDS = [[150, 78, 1.0, .9], [430, 42, 1.3, .6], [720, 96, .95, .75]];
  const PUFFS = [[-40, 0, 20], [-16, -13, 26], [14, -9, 23], [38, 1, 17], [0, 5, 20]];
  function drawClouds(t) {
    for (const [i, [bx, by, s, sp]] of CLOUDS.entries()) {
      const intro = still ? 0 : (1 - eOut(prog(t, 1100 + i * 150, 2200 + i * 150))) * (i % 2 ? 260 : -260);
      const x = ((bx + (still ? 0 : t * .006 * sp) + 160) % (W + 320)) - 160 + intro, y = by;
      g.save(); g.globalAlpha *= still ? 1 : prog(t, 1100 + i * 150, 1700 + i * 150);
      g.beginPath(); for (const [dx, dy, r] of PUFFS) { g.moveTo(x + dx * s + r * s, y + dy * s); g.arc(x + dx * s, y + dy * s, r * s, 0, 7); }
      g.fillStyle = rgba(C.cloud); g.fill(); g.clip();
      g.fillStyle = rgba(C.cloudsh, .9); g.fillRect(x - 70 * s, y + 6 * s, 140 * s, 40 * s);
      g.restore();
    }
  }
  function drawBirds(t) {
    if (still || t < 6000) return;
    const per = 15000, ph = (t - 6000) % per; if (ph > 9000) return;
    const f = ph / 9000;
    for (const k of [0, 1]) {
      const x = lerp(-30, W + 30, f) - k * 22, y = lerp(130, 60, f) + Math.sin(f * 9 + k) * 6 + k * 8, w = Math.sin(t * .02 + k * 2) * 3.5;
      g.beginPath(); g.moveTo(x - 6, y - w); g.quadraticCurveTo(x - 3, y - 1, x, y); g.quadraticCurveTo(x + 3, y - 1, x + 6, y - w);
      g.strokeStyle = rgba(C.ink, .7); g.lineWidth = 1.3; g.stroke();
    }
  }

  // ---------- water life ----------
  function drawRiverLife(t) {
    if (still || t < 1500) return;
    for (let j = 0; j < 18; j++) {
      const s = ((t * .00009 + j / 18) % 1), fi = s * (RC.length - 2), i = Math.floor(fi), f = fi - i;
      if (Math.abs(i - BRIDGE_I) < 2) continue;
      const p = L2(RC[i], RC[i + 1], f), { n, t: tn } = RN[i], o = (((j * .37) % 1) - .5) * RW * 1.2;
      const a = [p[0] + n[0] * o, p[1] + n[1] * o, .01], b = [a[0] + tn[0] * .35, a[1] + tn[1] * .35, .01];
      seg3(a, b, rgba(C.water2, .75 * Math.sin(s * Math.PI)), 1.2);
    }
    // fish
    const per = 8000, ph = (t - 1500) % per, k = Math.floor((t - 1500) / per);
    if (ph < 1400) {
      const i = 12 + (k * 23) % (RC.length - 30), [cx, cy] = P(RC[i][0], RC[i][1], 0), f = ph / 900;
      if (f <= 1) {
        const x = cx - 9 + f * 18, y = cy - Math.sin(f * Math.PI) * 15;
        g.save(); g.translate(x, y); g.rotate((f - .5) * 2.2);
        g.beginPath(); g.ellipse(0, 0, 4.5, 1.8, 0, 0, 7); g.fillStyle = rgba(mix(C.water2, C.chalk, .5)); g.fill();
        g.beginPath(); g.moveTo(-4, 0); g.lineTo(-7, -2.2); g.lineTo(-7, 2.2); g.fill(); g.restore();
      }
      for (const [rx0, t0] of [[cx - 9, 0], [cx + 9, 900]]) {
        const r = prog(ph, t0, t0 + 500); if (r <= 0 || r >= 1) continue;
        g.beginPath(); g.ellipse(rx0, cy, 3 + r * 10, 1.5 + r * 5, 0, 0, 7); g.strokeStyle = rgba(C.water2, 1 - r); g.lineWidth = 1; g.stroke();
      }
    }
    // the channel into the paddy
    for (let j = 0; j < 4; j++) { const s = (t * .0005 + j / 4) % 1, x = lerp(3.3, 2.45, s); seg3([x, 7.0, .01], [x - .14, 7.0, .01], rgba(C.water2, .8 * Math.sin(s * Math.PI)), 1.2); }
    // water spilling off the front edge
    const ex = riverPts(RW).filter(p => p[1] >= 11.99).map(p => p[0]), x0 = Math.min(...ex), x1 = Math.max(...ex);
    for (let i = 0; i < 5; i++) {
      const x = lerp(x0, x1, (i + .5) / 5), z = -((t * .0011 + i * .37) % 1.7);
      seg3([x, 12.01, z + .05], [x, 12.01, z - .25], rgba(C.water2, .7 * (1 - prog(-z, 1.2, 1.7))), 1.3);
    }
  }
  function drawBridge() {
    const p = RC[BRIDGE_I], { n, t: tn } = RN[BRIDGE_I], w = RW + .38;
    const c = (s, u, z) => [p[0] + n[0] * s + tn[0] * u, p[1] + n[1] * s + tn[1] * u, z];
    for (let k = -4; k <= 4; k++) { const s0 = k / 4.5 * w; face([c(s0 - .09, -.3, .14), c(s0 + .09, -.3, .14), c(s0 + .09, .3, .14), c(s0 - .09, .3, .14)], [0, 0, 1], k % 2 ? C.wood : shade(C.wood, 1.12)); }
    for (const u of [-.3, .3]) { seg3(c(-w, u, .14), c(w, u, .14), rgba(shade(C.wood, .7)), 1.2); for (const s of [-w, 0, w]) seg3(c(s, u, .14), c(s, u, .5), rgba(C.wood), 1.3); seg3(c(-w, u, .5), c(w, u, .5), rgba(C.wood), 1.1); }
  }
  function drawGauge(t) {
    const dc = P(2.86, 7.31, .5), k = still ? 3 : Math.floor(t / 650) % 12, a = -2.5 + k * .42;
    ln(dc, [dc[0] + Math.cos(a) * 4.2, dc[1] + Math.sin(a) * 4.2], rgba(C.roof), 1.3);
  }
  function drawHaze(t) {
    if (still || t < 2600) return;
    for (let i = 0; i < 5; i++) {
      const ph = ((t / 7000) + i / 5) % 1, [x, y] = P(2.7 + (1 - ph) * 1.2, 3.55 + Math.sin(i * 2.1) * .5 * (1 - ph), .72 + Math.cos(i) * .25 * (1 - ph));
      g.beginPath(); g.arc(x, y, 3 + 6 * (1 - ph), 0, 7); g.fillStyle = rgba(mix(C.ink, C.chalk, .55), .16 * Math.sin(ph * Math.PI)); g.fill();
    }
  }
  function drawScreen(t) { const f = .85 + Math.sin(t * .013) * .05 + Math.sin(t * .0021) * .05; quadY(5.102, 1.18, 1.38, .53, .72, mix(C.slate, C.win, still ? .8 : f * .85)); }

  // ---------- tea cart: board and steam ----------
  const PRICES = ['₹12', '₹2/sip', '₹99/mo', 'free*'];
  function drawBoard(t) {
    const chalk = C.chalk;
    wallText('y', 9.66, 11.56, .69, 'chaya', .24, rgba(chalk, .92), '600 20px Caveat, cursive');
    const cyc = 6500, tt = Math.max(0, t - 2400), k = Math.floor(tt / cyc), ph = tt % cyc;
    let a = 1;
    if (!still && t > 2400) { if (ph > cyc - 500) a = 1 - (ph - (cyc - 500)) / 500; else if (ph < 400 && k > 0) a = ph / 400; }
    if (a > 0) wallText('y', 9.66, 11.56, .46, PRICES[k % PRICES.length], .26, rgba(chalk, .92 * a), '600 20px Caveat, cursive');
  }
  function drawSteam(t) {
    if (still || t < 2000) return;
    const [kx, ky] = P(9.69, 10.56, 1.08);
    for (let i = 0; i < 3; i++) {
      const ph = (t * .0005 + i / 3) % 1, y = ky - ph * 26, x = kx + Math.sin(ph * 6 + i) * 3;
      g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 4, y - 4, x, y - 8); g.strokeStyle = rgba(C.chalk, .55 * Math.sin(ph * Math.PI)); g.lineWidth = 1.4; g.stroke();
    }
  }

  // ---------- crow and scarecrow ----------
  const ROOF = [10.15, 10.6, 1.66], COUNTER = [9.98, 10.9, .88], PADDY = [2.0, 8.5, .02];
  function crowState(t) {
    const r = P(...ROOF);
    if (still || t < 6000) return { p: r, fly: false, peck: false, dir: -1 };
    const ph = (t - 6000) % 18000, c = P(...COUNTER), pd = P(...PADDY);
    const arc = (a, b, f, h) => [lerp(a[0], b[0], f), lerp(a[1], b[1], f) - Math.sin(f * Math.PI) * h];
    if (ph < 3000) return { p: r, dir: -1 };
    if (ph < 3500) return { p: arc(r, c, eInOut((ph - 3000) / 500), 10), dir: -1 };
    if (ph < 4700) return { p: c, peck: true, dir: -1 };
    if (ph < 5200) return { p: arc(c, r, eInOut((ph - 4700) / 500), 10), dir: 1 };
    if (ph < 9000) return { p: r, dir: -1 };
    if (ph < 11000) return { p: arc(r, pd, eInOut((ph - 9000) / 2000), 70), fly: true, dir: -1 };
    if (ph < 12500) return { p: pd, peck: true, dir: -1 };
    if (ph < 14600) return { p: arc(pd, r, eInOut((ph - 12500) / 2100), 80), fly: true, dir: 1 };
    return { p: r, dir: -1 };
  }
  function drawCrow(t) {
    const a = still ? 1 : prog(t, 1800, 2200); if (a <= 0) return;
    const s = crowState(t), [x, y0] = s.p, d = s.dir, y = y0 - 3 + (s.peck ? 0 : Math.sin(t * .006) * .4);
    g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(d, 1);
    const ink = rgba(mix(C.ink, [20, 20, 24], .5));
    g.beginPath(); g.ellipse(0, 0, 5, 3.1, -.15, 0, 7); g.fillStyle = ink; g.fill();
    const hy = s.peck ? 2 + Math.abs(Math.sin(t * .015)) * 2 : -2;
    g.beginPath(); g.arc(4.6, hy, 2.4, 0, 7); g.fill();
    g.beginPath(); g.moveTo(6.6, hy - .6); g.lineTo(9, hy + .3); g.lineTo(6.6, hy + 1); g.fillStyle = rgba(C.ink); g.fill();
    g.beginPath(); g.moveTo(-4.5, -.5); g.lineTo(-8.5, -2); g.lineTo(-8, 1); g.fillStyle = ink; g.fill();
    if (s.fly) { const w = Math.sin(t * .03) * 6; g.beginPath(); g.moveTo(-1, -1); g.quadraticCurveTo(-3, -5 - w, -7, -3 - w * 1.2); g.moveTo(1, -1); g.quadraticCurveTo(0, -6 - w, -2, -6 - w * 1.4); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); }
    else { ln([-1, 3], [-1, 5], ink, .8); ln([1.5, 3], [1.5, 5], ink, .8); }
    g.restore();
  }
  function drawScarecrow(t) {
    pop(t, 1500, [1.4, 8.0, 0], () => {
      const ph = still ? 0 : (t - 6000) % 18000, scare = !still && t > 6000 && ph > 11000 && ph < 12700;
      const flap = scare ? Math.sin(t * .03) * .55 : Math.sin(t * .0015) * .05 * swayAmt(t);
      const base = P(1.4, 8.0, 0), top = P(1.4, 8.0, 1.6), sh = P(1.4, 8.0, 1.22);
      ln(base, top, rgba(C.wood), 2);
      g.save(); g.translate(sh[0], sh[1]); g.rotate(scare ? Math.sin(t * .012) * .12 : 0);
      g.beginPath(); g.moveTo(-6, 0); g.lineTo(6, 0); g.lineTo(8, 17); g.lineTo(-8, 17); g.closePath(); g.fillStyle = rgba(C.roof); g.fill();
      for (const sd of [-1, 1]) { g.save(); g.rotate(sd * flap); ln([0, 1], [sd * 17, 1 - (scare ? 4 : 0)], rgba(C.wood), 1.8); g.beginPath(); g.moveTo(sd * 4, -1); g.lineTo(sd * 14, -1); g.lineTo(sd * 13, 5); g.lineTo(sd * 4, 6); g.closePath(); g.fillStyle = rgba(C.roof); g.fill(); g.restore(); }
      g.restore();
      const hd = P(1.4, 8.0, 1.62);
      g.beginPath(); g.arc(hd[0], hd[1], 6, 0, 7); g.fillStyle = rgba(C.pot); g.fill(); g.strokeStyle = rgba(C.ink, .5); g.lineWidth = .7; g.stroke();
      g.fillStyle = rgba(C.ink); g.fillRect(hd[0] - 2.6, hd[1] - 1.5, 1.4, 1.4); g.fillRect(hd[0] + 1.2, hd[1] - 1.5, 1.4, 1.4);
      g.beginPath(); g.arc(hd[0], hd[1] + 1, 2.6, .2, Math.PI - .2); g.strokeStyle = rgba(C.ink); g.lineWidth = .8; g.stroke();
      const tg = P(1.4, 8.0, .92); g.fillStyle = rgba(C.chalk); g.fillRect(tg[0] + 9, tg[1] - 2, 18, 8);
      g.font = '600 6px "JetBrains Mono", monospace'; g.fillStyle = rgba(C.ink); g.textBaseline = 'top'; g.fillText('₹/crow', tg[0] + 9.6, tg[1] - .5);
    });
  }

  // ---------- cyclist ----------
  function drawCyclist(t) {
    if (still || t < 3000) return;
    const ph = (t - 3000) % 17000;
    let y, moving = true;
    if (ph < 6500) y = lerp(-.6, 10.4, eOut(ph / 6500));
    else if (ph < 8200) { y = 10.4; moving = false; }
    else if (ph < 13500) y = lerp(10.4, 12.9, eInOut((ph - 8200) / 5300));
    else return;
    const a = clamp(Math.min((y + .6) / .8, (12.6 - y) / .6), 0, 1); if (a <= 0) return;
    const x = 11.05, w1 = P(x, y - .32, .25), w2 = P(x, y + .32, .25);
    g.save(); g.globalAlpha *= a;
    const ink = rgba(C.ink);
    for (const yc of [y - .32, y + .32]) { const pts = []; for (let i = 0; i < 16; i++) { const q = i / 16 * Math.PI * 2; pts.push(P(x, yc + Math.cos(q) * .25, .25 + Math.sin(q) * .25)); } ring2(pts); g.strokeStyle = ink; g.lineWidth = 1.2; g.stroke(); }
    const seat = P(x, y - .12, .62), bar = P(x, y + .3, .7), crank = P(x, y, .25);
    ln(w1, seat, ink, 1.1); ln(seat, crank, ink, 1.1); ln(crank, w2, ink, 1.1); ln(w2, bar, ink, 1.1); ln(seat, bar, ink, 1.1);
    const rack = P(x, y - .45, .6); g.fillStyle = rgba(C.wood); g.fillRect(rack[0] - 5, rack[1] - 7, 10, 7); g.strokeStyle = rgba(shade(C.wood, .7)); g.lineWidth = .6; g.strokeRect(rack[0] - 5, rack[1] - 7, 10, 7);
    const sh = [seat[0] - 1, seat[1] - 13], ped = moving ? t * .012 : 0;
    for (const s of [0, Math.PI]) { const f = [crank[0] + Math.cos(ped + s) * 3, crank[1] + Math.sin(ped + s) * 2]; const k = [lerp(seat[0], f[0], .5) - 3, lerp(seat[1], f[1], .5) - 1]; ln(seat, k, rgba(C.denim), 2.2); ln(k, f, rgba(C.skin), 1.8); }
    ln(seat, sh, rgba(C.chalk), 4.5); ln(sh, bar, rgba(C.skin), 1.6);
    g.beginPath(); g.arc(sh[0] - .5, sh[1] - 4, 3.2, 0, 7); g.fillStyle = rgba(C.skin); g.fill();
    g.beginPath(); g.arc(sh[0] - .5, sh[1] - 4.6, 3.4, Math.PI, 0); g.fillStyle = rgba(C.hair); g.fill();
    g.restore();
  }

  // ---------- the mango tree ----------
  const TR = rng(21), TC = [8.8, 6.8];
  const blobs = [];
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + .3; blobs.push({ x: TC[0] + Math.cos(a) * 1.25, y: TC[1] + Math.sin(a) * 1.25, z: 3.35 + TR() * .3, r: 1.05 + TR() * .3 }); }
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + 1; blobs.push({ x: TC[0] + Math.cos(a) * .65, y: TC[1] + Math.sin(a) * .65, z: 4.2 + TR() * .3, r: 1.1 + TR() * .2 }); }
  blobs.push({ x: TC[0], y: TC[1], z: 5.0, r: 1.0 });
  blobs.forEach(b => { b.d = b.x + b.y + b.z; b.ph = TR() * 6; });
  blobs.sort((p, q) => p.d - q.d);
  const frontBlobs = blobs.filter(b => b.x + b.y > 16.0 && b.z < 3.8);
  const SLOTS = [[8.1, 7.65, 2.9], [9.25, 7.95, 2.85], [9.95, 6.9, 3.0]];
  function blobPos(b, t) {
    let [x, y] = P(b.x, b.y, b.z);
    for (const im of impacts) {
      const dx = x - im.x, dy = y - im.y, d = Math.hypot(dx, dy) || 1;
      if (d > im.r) continue;
      const lt = t - im.t0 - d * 1.6; if (lt < 0 || lt > 1600) continue;
      const a = im.str * (1 - d / im.r) * Math.exp(-lt / 320) * Math.sin(lt * .03);
      x += dx / d * a; y += dy / d * a;
    }
    const sw = swayAmt(t); if (sw) x += Math.sin(t * .0008 + b.ph) * 1.1 * sw;
    return [x, y];
  }
  function drawTree(t) {
    const tg = still ? 1 : eOut(prog(t, 1300, 1700)); if (tg <= 0) return;
    box(TC[0] - .15, TC[1] - .15, 0, TC[0] + .15, TC[1] + .15, 2.8 * tg, C.trunk);
    const top = P(TC[0], TC[1], 2.4 * tg);
    g.lineCap = 'round';
    const lp = still ? 1 : eOut(prog(t, 1500, 1800));
    if (lp > 0) for (const b of blobs.filter(b => b.z < 3.8)) { const [bx, by] = P(b.x, b.y, b.z - .3); ln(top, [lerp(top[0], bx, lp * .85), lerp(top[1], by, lp * .85)], rgba(C.trunk), 3.6); }
    for (const [i, b] of blobs.entries()) {
      const at = 1550 + b.z * 90 + i * 22, s = still ? 1 : eBack(prog(t, at, at + 380)); if (s <= 0) continue;
      const [x, y] = blobPos(b, t), r = b.r * 30 * s;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fillStyle = rgba(C.leaf); g.fill();
      g.beginPath(); g.arc(x - r * .22, y - r * .28, r * .7, 0, Math.PI * 2); g.fillStyle = rgba(C.leaf2, .55); g.fill();
      for (let k = 0; k < 3; k++) { const a = b.ph + k * 2.1, lx = x + Math.cos(a) * r * .55, ly = y + Math.sin(a) * r * .45; g.beginPath(); g.ellipse(lx, ly, 4.5, 1.6, a, 0, 7); g.fillStyle = rgba(C.leaf2, .5); g.fill(); }
    }
  }
  function drawCat(t) {
    const a = still ? 1 : prog(t, 2200, 2700); if (a <= 0) return;
    const [x, y] = P(9.75, 8.05, 0), br = 1 + Math.sin(t * .0025) * .05, tail = Math.sin(t * .004) * (Math.sin(t * .0007) > .6 ? 3 : .6);
    g.save(); g.globalAlpha *= a; const col = rgba(C.cat);
    g.beginPath(); g.ellipse(x, y - 4 * br, 9, 5 * br, 0, 0, 7); g.fillStyle = col; g.fill();
    g.beginPath(); g.arc(x - 8, y - 4, 3.8, 0, 7); g.fill();
    g.beginPath(); g.moveTo(x - 11, y - 6); g.lineTo(x - 10.5, y - 10); g.lineTo(x - 8, y - 7); g.moveTo(x - 7, y - 7.5); g.lineTo(x - 5.5, y - 10.5); g.lineTo(x - 4.5, y - 6.5); g.fill();
    g.beginPath(); g.moveTo(x + 8, y - 2); g.quadraticCurveTo(x + 9 + tail, y + 3, x - 4, y + 1 + tail * .3); g.strokeStyle = col; g.lineWidth = 2.2; g.lineCap = 'round'; g.stroke();
    g.restore();
  }

  // ---------- mangoes ----------
  let slots, loose, stones, impacts, drift, events, busyUntil, throwCount, sinceDrop, pointer, gaze, duck, shot, cacheDirty = true;
  function drawMango(x, y, rot, s, col, sx = 1, sy = 1, alpha = 1) {
    if (s <= .01) return;
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * sx * .72, s * sy * .72);
    g.beginPath(); g.moveTo(0, -11);
    g.bezierCurveTo(8, -11, 9.5, 1, 4.5, 8); g.bezierCurveTo(1.5, 12.5, -6, 11.5, -7, 4); g.bezierCurveTo(-8, -3, -6, -11, 0, -11);
    g.fillStyle = rgba(col, alpha); g.fill();
    g.beginPath(); g.ellipse(-3, 2, 3, 5, .2, 0, Math.PI * 2); g.fillStyle = rgba(C.unripe, .35 * alpha); g.fill();
    g.beginPath(); g.ellipse(2.6, -4.5, 1.4, 2.6, -.4, 0, Math.PI * 2); g.fillStyle = `rgba(255,255,255,${.35 * alpha})`; g.fill();
    g.restore();
  }
  function hangAngle(s, t) {
    let th = 0; const m = s.m;
    if (m.wobT != null && t > m.wobT) { const d = t - m.wobT; th += m.wobA * Math.exp(-d / 420) * Math.sin(d * .017); }
    return th + swayAmt(t) * Math.sin(t * .0011 + s.wx) * .05;
  }
  function hangCenter(s, t) { const [ax, ay] = P(s.wx, s.wy, s.wz + .3); const th = hangAngle(s, t), L = 6 + 8 * s.m.size; return [ax - Math.sin(th) * L, ay + Math.cos(th) * L]; }
  const groundY = s => P(s.wx, s.wy, 0)[1];
  const available = s => s.m && s.m.fallAt == null && s.m.size > .95 && s.m.ripe > .95;
  function newMango(growT, dur = 2800, ripen = true) { return { growT, dur, ripen, size: 0, ripe: ripen ? 0 : 1, wobT: null, wobA: 0, fallAt: null }; }
  function wobble(s, t, amp) { s.m.wobT = t; s.m.wobA = amp * (Math.random() < .5 ? -1 : 1); }
  function scheduleFall(s, at) {
    s.m.fallAt = at;
    events.push({ at, fn: t => {
      const [x, y] = hangCenter(s, t), th = hangAngle(s, t), gy = groundY(s) - 5;
      const gF = .0016, land = Math.sqrt(2 * Math.max(4, gy - y) / gF), dir = Math.random() < .5 ? -1 : 1;
      loose.push({ x0: x, y0: y, gy, rot0: th, t0: t, g: gF, landT: t + land, dir, roll: dir * (6 + Math.random() * 8), thud: false, fadeAt: null, quip: s.quip });
      s.quip = null; s.m = newMango(t + land + 2600);
      if (loose.length > 4) loose[0].fadeAt = loose[0].fadeAt ?? t;
    } });
  }
  function drawHanging(t) {
    for (const s of slots) {
      const m = s.m;
      m.size = eBack(prog(t, m.growT, m.growT + m.dur));
      m.ripe = m.ripen ? prog(t, m.growT + m.dur * .3, m.growT + m.dur * 1.2) : 1;
      if (m.fallAt != null && t >= m.fallAt) continue;
      const th = hangAngle(s, t), [ax, ay] = P(s.wx, s.wy, s.wz + .3), [cx, cy] = hangCenter(s, t);
      if (m.size > .05) ln([ax, ay - 2], [cx + Math.sin(th) * 7, cy - 7], rgba(C.trunk), 1);
      drawMango(cx, cy, th, m.size, mix(C.unripe, C.mango, m.ripe));
    }
  }
  function drawLoose(t) {
    const rx = A / Math.hypot(A, B), ry = B / Math.hypot(A, B);
    for (const m of loose) {
      let x, y, rot, sx = 1, sy = 1;
      if (t < m.landT) { const dt = t - m.t0; x = m.x0 + dt * .01 * m.dir; y = m.y0 + .5 * m.g * dt * dt; rot = m.rot0 + dt * .0025 * m.dir; }
      else {
        if (!m.thud) { m.thud = true; thud(); quip(m.quip); }
        const d2 = t - m.landT, fd = m.landT - m.t0, xL = m.x0 + fd * .01 * m.dir, rL = m.rot0 + fd * .0025 * m.dir;
        const sq = .3 * Math.exp(-d2 / 80) * Math.cos(d2 * .028); sy = 1 - sq; sx = 1 + sq * .7;
        const rp = eOut(prog(d2, 110, 950)), hop = d2 > 110 && d2 < 360 ? Math.sin(Math.PI * (d2 - 110) / 250) * 4 : 0;
        x = xL + m.roll * rx * rp; rot = rL + (m.roll / 7) * rp;
        y = m.gy + m.roll * ry * rp - hop;
      }
      const a = m.fadeAt != null ? 1 - prog(t, m.fadeAt, m.fadeAt + 600) : 1;
      drawMango(x, y, rot, 1, C.mango, sx, sy, a);
    }
    loose = loose.filter(m => m.fadeAt == null || t - m.fadeAt < 650);
  }

  // ---------- stones ----------
  const ballistic = (t0, x0, y0, vx, vy, gr, dur) => ({ t0, x0, y0, vx, vy, g: gr, dur });
  const endOf = p => ({ x: p.x0 + p.vx * p.dur, y: p.y0 + p.vy * p.dur + .5 * p.g * p.dur * p.dur, vx: p.vx, vy: p.vy + p.g * p.dur });
  const tToY = (y0, vy, gr, yT) => { const a = .5 * gr, b = vy, c = y0 - yT; return (-b + Math.sqrt(Math.max(0, b * b - 4 * a * c))) / (2 * a); };
  const aim = (t0, x0, y0, tx, ty, T, gr) => ballistic(t0, x0, y0, (tx - x0) / T, (ty - y0 - .5 * gr * T * T) / T, gr, T);
  function hop(ph, gy) { const last = ph[ph.length - 1], e = endOf(last), hv = -Math.abs(e.vy) * .26, d = 2 * Math.abs(hv) / last.g; if (d > 40) ph.push(ballistic(last.t0 + last.dur, e.x, gy, e.vx * .35, hv, last.g, d)); }
  function settle(ph, from, t, vx, vy, gr, gy) { const p = ballistic(t, from.x, from.y, vx, vy, gr, 0); p.dur = tToY(from.y, vy, gr, gy); ph.push(p); hop(ph, gy); }
  function stonePos(st, t) {
    for (const p of st.ph) { if (t < p.t0) return null; if (t <= p.t0 + p.dur) { const d = t - p.t0; return [p.x0 + p.vx * d, p.y0 + p.vy * d + .5 * p.g * d * d, true]; } }
    if (st.off) return null;
    const e = endOf(st.ph[st.ph.length - 1]); return [e.x, e.y, false];
  }
  const stoneEnd = st => { const p = st.ph[st.ph.length - 1]; return p.t0 + p.dur; };

  // ---------- the boy with the slingshot ----------
  const BOYW = [5.9, 9.5], S = .64, REL = 420;
  function knee(h, f) {
    const dx = f[0] - h[0], dy = f[1] - h[1], d = Math.min(Math.hypot(dx, dy), 37.9), off = Math.sqrt(Math.max(0, 361 - (d / 2) ** 2));
    let nx = -dy / d, ny = dx / d; if (nx < 0) { nx = -nx; ny = -ny; }
    return [(h[0] + f[0]) / 2 + nx * off, (h[1] + f[1]) / 2 + ny * off];
  }
  function poseAt(t) {
    let a = 0, p = 0, r = 0, ang = -.6;
    const s = shot;
    if (s && t >= s.t0 && t < s.t0 + 1050) {
      const q = t - s.t0; ang = s.ang;
      if (q < 320) { a = eInOut(q / 320); p = eInOut(prog(q, 80, 320)); }
      else if (q < REL) { a = 1; p = 1; ang += Math.sin(t * .08) * .012; }
      else if (q < 560) { a = 1; r = 1 - eOut(prog(q, REL, 560)); }
      else a = 1 - eInOut(prog(q, 560, 1050));
    }
    let d = 0;
    if (duck) d = Math.min(eOut(prog(t, duck.a, duck.a + 180)), 1 - eInOut(prog(t, duck.b, duck.b + 320)));
    return { a, p, r, ang, d, lean: a * .12 + d * .45, crouch: d * 14 + Math.sin(t * .003) * .5 * swayAmt(t) };
  }
  function boyGeo(ps) {
    const [bx, by] = P(BOYW[0], BOYW[1], 0), T = q => [bx + q[0] * S, by + q[1] * S];
    const hip = [ps.lean * 4, -36 + ps.crouch], dir = [Math.sin(ps.lean), -Math.cos(ps.lean)];
    const sh = add(hip, dir, 23), head = add(sh, dir, 11.5), u = [Math.cos(ps.ang), Math.sin(ps.ang)];
    let lE = L2(add(sh, [4, 11]), add(sh, u, 11), ps.a), lH = L2(add(sh, [7, 20]), add(sh, u, 21.5), ps.a);
    let rH1 = add(add(sh, u, lerp(19, 3, ps.p)), [0, -2 * ps.p]); rH1 = L2(rH1, add(sh, u, 10), ps.r);
    let rE = L2(add(sh, [-3, 11]), add(add(sh, u, lerp(9, -7, ps.p)), [0, lerp(1, -3, ps.p)]), ps.a), rH = L2(add(sh, [-5, 20]), rH1, ps.a);
    if (ps.d > 0) { lE = L2(lE, add(head, [6, 4]), ps.d); lH = L2(lH, add(head, [2, -7]), ps.d); rE = L2(rE, add(head, [-6, 4]), ps.d); rH = L2(rH, add(head, [-1, -7]), ps.d); }
    const fd = norm(L2([.45, 1], u, ps.a)), fp = [-fd[1], fd[0]], fc = add(lH, fd, 5);
    const tips = [add(add(fc, fd, 2), fp, 3.6), add(add(fc, fd, 2), fp, -3.6)];
    const drawn = ps.p > .02 && ps.a > .5, pouch = drawn ? rH : add(fc, fd, 3);
    const FL = [-9, 0], FR = [9, 0];
    return { base: [bx, by], hip: T(hip), sh: T(sh), head: T(head), lE: T(lE), lH: T(lH), rE: T(rE), rH: T(rH), kL: T(knee(hip, FL)), kR: T(knee(hip, FR)), FL: T(FL), FR: T(FR), fc: T(fc), handle: T(add(lH, fd, -3)), tips: tips.map(T), pouch: T(pouch), drawn };
  }
  function drawBoy(t) {
    const pb = still ? 1 : eBack(prog(t, 2300, 2650)); if (pb <= 0) return;
    const ps = poseAt(t), b = boyGeo(ps);
    g.save(); g.translate(b.base[0], b.base[1]); g.scale(pb, pb); g.translate(-b.base[0], -b.base[1]); g.lineCap = 'round';
    g.beginPath(); g.ellipse(b.base[0], b.base[1], 10, 3.6, 0, 0, 7); g.fillStyle = rgba(C.ink, .15); g.fill();
    const skin = rgba(C.skin), ink = rgba(C.ink), wood = rgba(C.wood), shorts = rgba(C.denim);
    for (const [k, f] of [[b.kL, b.FL], [b.kR, b.FR]]) { ln(b.hip, k, skin, 3); ln(k, f, skin, 3); }
    for (const k of [b.kL, b.kR]) { ln(b.hip, L2(b.hip, k, .62), rgba(C.ink, .6), 7.4); ln(b.hip, L2(b.hip, k, .6), shorts, 6); }
    ln(b.sh, b.rE, skin, 2.8); ln(b.rE, b.rH, skin, 2.8);
    ln(b.hip, b.sh, ink, 10); ln(b.hip, b.sh, rgba(C.tee), 8.4);
    ln(b.sh, L2(b.sh, b.rE, .5), rgba(C.tee), 4.4);
    // slingshot
    ln(b.lH, b.handle, wood, 2.2); ln(b.lH, b.fc, wood, 2.2); for (const tp of b.tips) ln(b.fc, tp, wood, 1.8);
    for (const tp of b.tips) ln(tp, b.pouch, rgba(C.ink, .65), .9);
    const s = shot; if (s && t >= s.t0 && t < s.t0 + REL && b.drawn) { g.beginPath(); g.arc(b.pouch[0], b.pouch[1], 2, 0, 7); g.fillStyle = ink; g.fill(); }
    ln(b.sh, b.lE, skin, 2.8); ln(b.lE, b.lH, skin, 2.8);
    ln(b.sh, L2(b.sh, b.lE, .5), rgba(C.tee), 4.4);
    // head, eyes follow the aim, the stone, or you
    let want;
    if (s && t >= s.t0 && t < s.t0 + 900) want = s.ang;
    else {
      let target = P(TC[0], TC[1], 3.2);
      const flying = stones.map(st => stonePos(st, t)).find(q => q && q[2]);
      if (pointer && t - pointer.t < 2500) target = [pointer.x, pointer.y]; else if (flying) target = flying;
      want = Math.atan2(target[1] - b.head[1], target[0] - b.head[0]);
    }
    gaze += (((want - gaze + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * .15;
    const r = 5.6, hx = b.head[0] + Math.cos(gaze) * .8, hy = b.head[1] + Math.sin(gaze) * .8, hair = rgba(C.hair);
    g.beginPath(); g.arc(hx, hy, r, 0, 7); g.fillStyle = skin; g.fill();
    g.beginPath(); g.arc(hx, hy, r + .3, gaze + Math.PI * .45, gaze + Math.PI * 1.6); g.closePath(); g.fillStyle = hair; g.fill();
    for (const [dx, dy, rr] of [[-3.5, -4.5, 3], [0, -6, 3.2], [3.4, -5, 2.8], [-5.5, -1, 2.6]]) { g.beginPath(); g.arc(hx + dx, hy + dy, rr, 0, 7); g.fill(); }
    g.fillStyle = rgba(mix(C.ink, [20, 30, 40], .5)); g.beginPath(); g.ellipse(hx - 1, hy - 7.6, 2.2, 1.3, -.1, 0, 7); g.ellipse(hx + 3.6, hy - 7.2, 2.2, 1.3, -.1, 0, 7); g.fill();
    ln([hx + 1.1, hy - 7.6], [hx + 1.5, hy - 7.4], rgba(C.chalk), .8);
    g.beginPath(); g.arc(hx + Math.cos(gaze) * 3.2, hy + Math.sin(gaze) * 3.2 - .4, 1, 0, 7); g.fillStyle = ink; g.fill();
    g.restore();
  }

  // ---------- shooting ----------
  const QUIPS = {
    short: ['short.', 'not even close.', 'the grass thanks you.'],
    over: ['over the tree.', 'ambitious.', 'somewhere, a neighbour’s roof.'],
    clip: ['just leaves.', 'the tree is unbothered.', 'close.'],
    wobble: ['it held on.', 'almost.', 'so close.'],
    drop: ['mango.', 'there it is.', 'worth it.'],
    double: ['two. don’t get used to it.'],
    bounce: ['rude.', 'the tree shot back.']
  };
  let quipTimer;
  function quip(kind) {
    if (!kind) return;
    quipEl.textContent = pick(QUIPS[kind]); quipEl.classList.add('on');
    clearTimeout(quipTimer); quipTimer = setTimeout(() => quipEl.classList.remove('on'), 2600);
  }
  function chooseOutcome() {
    throwCount++;
    const avail = slots.filter(available);
    if (throwCount === 1) return 'short';
    if (!avail.length) return pick(['short', 'over', 'clip', 'clip']);
    if (sinceDrop >= 5) return 'drop';
    const table = [['short', .17], ['over', .17], ['clip', .22], ['wobble', .2], ['drop', .14], ['double', .04], ['bounce', .06]];
    let r = Math.random();
    for (const [k, w] of table) if ((r -= w) <= 0) return k === 'double' && avail.length < 2 ? 'drop' : k;
    return 'clip';
  }
  function hitLeaves(t, x, y, str) {
    impacts.push({ x, y, t0: t, str, r: 150 });
    for (const s of slots) {
      if (s.m.fallAt != null) continue;
      const [sx, sy] = P(s.wx, s.wy, s.wz), d = Math.hypot(sx - x, sy - y);
      if (d < 80 && (s.m.wobT == null || t - s.m.wobT > 600)) wobble(s, t + d * 1.6, .16 * (1 - d / 80));
    }
  }
  function dropLeaf(t, x, y, gy) { drift.push({ x0: x, y0: y, gy, t0: t, ph: Math.random() * 6, land: null }); }
  function fire(t, kind, opts = {}) {
    const avail = slots.filter(available), g0 = .00045;
    let target, plan = {};
    if (kind === 'short') { const w = [6.5 + Math.random() * .7, 8.5 + Math.random() * .5]; target = P(w[0], w[1], 0); plan = { gy: target[1] }; }
    else if (kind === 'over') target = [940, 110];
    else if (kind === 'clip') { const b = pick(frontBlobs), [bx, by] = P(b.x, b.y, b.z); target = [bx + (Math.random() - .5) * 20, by + b.r * 18]; plan = { gy: P(b.x, b.y, 0)[1] }; }
    else if (kind === 'bounce') target = P(TC[0], TC[1], 1.1);
    else { const s = opts.slot ?? pick(avail); target = hangCenter(s, t + REL + 450); plan = { s }; }
    const sh0 = boyGeo({ a: 1, p: 1, r: 0, ang: 0, d: 0, lean: .12, crouch: 0 }).sh;
    const ang = Math.atan2(target[1] - sh0[1], target[0] - sh0[0]) - (kind === 'over' ? .35 : .1);
    shot = { t0: t, ang };
    const rt = t + REL, [hx, hy] = boyGeo({ a: 1, p: 1, r: 0, ang, d: 0, lean: .12, crouch: 0 }).fc;
    const st = { ph: [], off: false };
    const [tx, ty] = target;
    if (kind === 'short') { st.ph.push(aim(rt, hx, hy, tx, ty, 420, .0008)); hop(st.ph, ty); events.push({ at: rt + 420, fn: () => quip(kind) }); }
    else if (kind === 'over') { st.ph.push(aim(rt, hx, hy, tx, ty, 1300, .001)); st.off = true; events.push({ at: rt + 1000, fn: () => quip(kind) }); }
    else if (kind === 'clip') {
      const T = 300 + Math.hypot(tx - hx, ty - hy) * .9; st.ph.push(aim(rt, hx, hy, tx, ty, T, g0));
      const hit = rt + T, e = endOf(st.ph[0]); settle(st.ph, e, hit, -e.vx * .15, .03, .0015, plan.gy);
      events.push({ at: hit, fn: tt => { hitLeaves(tt, tx, ty, 5); dropLeaf(tt, tx + 3, ty, plan.gy); quip(kind); } });
    } else if (kind === 'bounce') {
      const T = 380; st.ph.push(aim(rt, hx, hy, tx, ty, T, g0));
      const hit = rt + T, [lx, ly] = P(4.9, 10.6, 0); st.ph.push(aim(hit, tx, ty, lx, ly, 850, .0007)); hop(st.ph, ly);
      duck = { a: hit + 200, b: hit + 1050 };
      events.push({ at: hit, fn: tt => { const [cx, cy] = P(TC[0], TC[1], 3.3); hitLeaves(tt, cx, cy, 2.4); quip(kind); } });
    } else {
      const s = plan.s, T = 300 + Math.hypot(tx - hx, ty - hy) * 1.0;
      st.ph.push(aim(rt, hx, hy, tx - 3, ty, T, g0));
      const hit = rt + T, e = endOf(st.ph[0]); settle(st.ph, e, hit, -e.vx * .2, .02, .0015, groundY(s));
      events.push({ at: hit, fn: tt => { hitLeaves(tt, tx, ty - 8, 4); wobble(s, tt, kind === 'wobble' ? .5 : .42); if (kind === 'wobble') quip(kind); } });
      if (kind !== 'wobble') {
        s.quip = opts.silent ? null : kind; scheduleFall(s, hit + (opts.fallDelay ?? 680));
        if (kind === 'double') { const o = avail.filter(q => q !== s)[0]; o.quip = null; events.push({ at: hit + 260, fn: tt => wobble(o, tt, .3) }); scheduleFall(o, hit + (opts.fallDelay ?? 680) + 480); }
        sinceDrop = -1;
      }
    }
    sinceDrop++; stones.push(st);
    busyUntil = Math.max(t + 1150, st.off ? rt + 1300 : stoneEnd(st) + 150);
  }
  function drawStones(t) {
    for (const st of stones) {
      const q = stonePos(st, t); if (!q) continue;
      let a = 1; if (!q[2]) { const e = stoneEnd(st); a = 1 - prog(t, e + 1400, e + 1900); } if (a <= 0) continue;
      if (q[2]) { let prev = q; for (let i = 1; i <= 10; i++) { const pq = stonePos(st, t - i * 16); if (!pq || !pq[2]) break; ln(prev, pq, rgba(C.ink, .26 * (1 - i / 11)), 2.2 - i * .16); prev = pq; } }
      g.beginPath(); g.arc(q[0], q[1], 2.1, 0, 7); g.fillStyle = rgba(C.ink, a); g.fill();
    }
    stones = stones.filter(st => st.off ? t < stoneEnd(st) + 50 : t < stoneEnd(st) + 2000);
  }
  function drawDrift(t) {
    for (const d of drift) {
      const dt = t - d.t0; let y = d.y0 + dt * .04, x = d.x0 + Math.sin(dt * .004 + d.ph) * 7, r = Math.sin(dt * .005 + d.ph) * .9;
      if (y >= d.gy) { if (!d.land) d.land = { t, x }; y = d.gy; x = d.land.x; r = .1; }
      const a = d.land ? 1 - prog(t, d.land.t + 2500, d.land.t + 3300) : 1; if (a <= 0) continue;
      g.save(); g.translate(x, y); g.rotate(r); g.beginPath(); g.moveTo(-5, 0); g.quadraticCurveTo(0, -2.6, 5, 0); g.quadraticCurveTo(0, 2.6, -5, 0); g.fillStyle = rgba(C.leaf2, a); g.fill(); g.restore();
    }
    drift = drift.filter(d => !d.land || t - d.land.t < 3400);
  }

  // ---------- pins ----------
  const PINS = [
    { id: 'exp', label: 'Experiments', at: [8.2, 6.3, 5.5], title: 'Experiments', lede: 'Products I built independently, end to end.',
      items: [['LookupTax · 2024', 'Tax ID validation for 100+ countries. 50K+ monthly users, grown organically with no paid acquisition.'], ['UsagePricing · 2025', 'An LLM-maintained knowledge base tracking how 400+ usage-based companies price.'], ['Saafair · 2016', 'Affordable air purifiers, taken from prototype to launch and sold D2C with filter subscriptions. Shut down after weighing manufacturing complexity.'], ['Hedcet · 2011–15', 'Co-founded IT services and product company. Acqui-hired by Clairvolex.'], ['Metromeet · 2013', 'MIT Global Startup Labs, demo-day runner-up.']] },
    { id: 'meter', label: 'Usage metering', at: [2.85, 7.0, 1.25], title: 'Usage metering', lede: 'Usage-based billing and usage management infrastructure.',
      items: [['Chargebee', 'Built the usage-based billing platform from the ground up: event streaming, aggregation, rating and invoicing, plus rate cards for AI infrastructure companies.'], ['Salesforce', 'Building enterprise usage management in Revenue Cloud, with usage pooling and governance controls.']] },
    { id: 'revops', label: 'RevOps', at: [9.85, 10.6, 2.15], title: 'RevOps', lede: 'Pricing, invoicing, payments and tax compliance.',
      items: [['Tax', 'Led invoicing and taxation at Chargebee. Tax integrations grew from 2 to 9, VAT ID validation in ~40 countries, e-invoicing in 23.'], ['Pricing', 'UsagePricing tracks pricing models and trends across 400+ businesses.'], ['Payments', 'Grew PayU’s partner ecosystem through APIs and integrations with Shopify, Zoho, Tally and Wix.']] },
    { id: 'ai', label: 'AI economics', at: [1.4, 8.0, 2.35], title: 'AI economics', lede: 'How software gets priced as it moves from seats to usage to outcomes to autonomous agents.',
      items: [['Focus', 'AI token costs, metering and outcome-based pricing.'], ['Now', 'Leading research on outcome-based pricing at Salesforce.'], ['Before', 'Matrix pricing and rate cards for AI infrastructure companies at Chargebee.']] },
    { id: 'work', label: 'Work', at: [1.4, 3.8, 2.55], title: 'Work', lede: 'Taking products from 0 to 1 and to scale across enterprise SaaS, fintech and platforms.',
      items: [['Salesforce · Senior PM · 2026–', 'Enterprise usage management; integrating the rating engine after the m3ter acquisition.'], ['Chargebee · Staff → Principal PM · 2021–26', 'Usage-based billing; invoicing and global tax.'], ['PayU · Senior PM · 2019–21', 'Partner APIs and developer experience.'], ['Housing.com · PM · 2018–19', 'Research and experimentation on the consumer app.'], ['Industrybuying · PM · 2015–18', 'A 1.5M-SKU catalogue, supply chain (seller, order and warehouse systems, courier and serviceability) and the GST transition.']] }
  ];
  let card = null, openPin = null, closeTimer;
  function buildPins() {
    pinsEl.innerHTML = '';
    PINS.forEach((p, i) => {
      const x = OX + (p.at[0] - p.at[1]) * A, y = OY + (p.at[0] + p.at[1]) * B - p.at[2] * Z;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'pin';
      b.style.left = (x / W * 100) + '%'; b.style.top = (y / H * 100) + '%'; b.style.transitionDelay = (i * 140) + 'ms';
      b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', p.label); b.innerHTML = `<i></i><span class="t">${p.label}</span>`;
      b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') show(p, b); });
      b.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hideSoon(); });
      b.addEventListener('focus', () => show(p, b)); b.addEventListener('blur', hideSoon);
      b.addEventListener('click', e => { e.stopPropagation(); if (openPin === b && b.dataset.sticky) hide(); else { show(p, b); b.dataset.sticky = '1'; } });
      b._p = p; pinsEl.appendChild(b);
    });
  }
  function show(p, b) {
    clearTimeout(closeTimer);
    if (openPin && openPin !== b) { openPin.setAttribute('aria-expanded', 'false'); delete openPin.dataset.sticky; }
    if (!card) { card = document.createElement('div'); card.className = 'card'; card.addEventListener('pointerenter', () => clearTimeout(closeTimer)); card.addEventListener('pointerleave', hideSoon); card.addEventListener('click', e => e.stopPropagation()); pinsEl.appendChild(card); }
    card.innerHTML = `<h3>${p.title}</h3><p>${p.lede}</p><ul>${p.items.map(([k, v]) => `<li><b>${k}</b><span>${v}</span></li>`).join('')}</ul>`;
    card.hidden = false; openPin = b; b.setAttribute('aria-expanded', 'true');
    placeCard();
  }
  function placeCard() {
    if (!card || card.hidden || !openPin) return;
    const pin = openPin, sw = pinsEl.clientWidth, shh = pinsEl.clientHeight, cw = card.offsetWidth, ch = card.offsetHeight;
    if (sw < 560) { card.style.left = '8px'; card.style.top = (shh + 4) + 'px'; card.style.maxHeight = '60vh'; return; }
    card.style.maxHeight = '';
    const px = pin.offsetLeft, pTop = pin.offsetTop - pin.offsetHeight - 8, pBot = pin.offsetTop, pw = pin.offsetWidth;
    const cx = clamp(px - cw / 2, 8, Math.max(8, sw - cw - 8)), cy = clamp(pTop + pin.offsetHeight / 2 - ch / 2, 4, Math.max(4, shh - ch - 4));
    const spots = [[cx, pBot + 6, pBot + 6 + ch <= shh - 4], [cx, pTop - ch - 6, pTop - ch - 6 >= 4], [px + pw / 2 + 10, cy, px + pw / 2 + 10 + cw <= sw - 4], [px - pw / 2 - 10 - cw, cy, px - pw / 2 - 10 - cw >= 4]];
    const [left, top] = spots.find(q => q[2]) || [cx, Math.max(4, shh - ch - 4)];
    card.style.left = left + 'px'; card.style.top = top + 'px';
  }
  function hide() { if (card) card.hidden = true; if (openPin) { openPin.setAttribute('aria-expanded', 'false'); delete openPin.dataset.sticky; } openPin = null; }
  function hideSoon() { clearTimeout(closeTimer); closeTimer = setTimeout(() => { if (!openPin || !openPin.dataset.sticky) hide(); }, 220); }
  document.addEventListener('keydown', e => { if (e.key === 'Escape') hide(); });
  document.addEventListener('click', () => { if (card && !card.hidden) hide(); });

  // ---------- state ----------
  const INTRO_DONE = 5300, CACHE_AT = 2600;
  const swayAmt = t => still ? 0 : prog(t, 4500, 6500);
  function reset() {
    slots = SLOTS.map(([wx, wy, wz], i) => ({ wx, wy, wz, m: newMango(2050 + i * 110, 520, false), quip: null }));
    loose = []; stones = []; impacts = []; drift = []; events = [];
    busyUntil = Infinity; throwCount = 0; sinceDrop = 0; duck = null; shot = null; gaze = -.6; pointer = null;
    quipEl.classList.remove('on'); hide(); pinsEl.classList.remove('on');
    if (!still) {
      events.push({ at: 2800, fn: t => fire(t, 'drop', { slot: slots[0], fallDelay: 1150, silent: true }) });
      events.push({ at: INTRO_DONE, fn: () => { busyUntil = 0; pinsEl.classList.add('on'); } });
    } else { slots.forEach(s => { s.m.growT = -1e6; }); pinsEl.classList.add('on'); }
  }

  // ---------- render ----------
  let K = 1;
  const backC = document.createElement('canvas'), frontC = document.createElement('canvas');
  function buildCaches() {
    for (const [c, fn] of [[backC, drawBack], [frontC, drawFront]]) {
      c.width = cv.width; c.height = cv.height;
      const cc = c.getContext('2d'); g = cc; rise = 0;
      cc.setTransform(K, 0, 0, K, 0, 0); cc.clearRect(0, 0, W, H); cc.lineCap = 'round'; cc.lineJoin = 'round';
      fn(1e6);
    }
    g = ctx; cacheDirty = false;
  }
  const blit = c => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(c, 0, 0); ctx.setTransform(K, 0, 0, K, 0, 0); };
  function render(t) {
    g = ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    const live = !still && t < CACHE_AT;
    if (!live && cacheDirty) buildCaches();
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    rise = 0; ctx.globalAlpha = 1;
    drawClouds(t);
    rise = live ? (1 - eBack(prog(t, 0, 1000))) * 70 : 0;
    ctx.globalAlpha = live ? prog(t, 0, 350) : 1;
    if (live) drawBack(t); else blit(backC);
    drawRiverLife(t);
    if (t > 1150 || still) { drawScreen(t); drawGauge(t); }
    drawHaze(t);
    pop(t, 1450, RC[BRIDGE_I].concat(0), drawBridge);
    pop(t, 1000, [6.3, .9, 0], () => palm(t, 6.3, .9, 4.4, .2, -.2, 3));
    pop(t, 1100, [11.3, 4.2, 0], () => palm(t, 11.3, 4.2, 4.0, .25, -.3, 11));
    pop(t, 1250, [.7, 10.9, 0], () => palm(t, .7, 10.9, 3.6, -.2, .15, 7));
    pop(t, 1300, [.5, 6.2, 0], () => banana(t, .5, 6.2));
    drawScarecrow(t);
    drawTree(t);
    impacts = impacts.filter(im => t - im.t0 < 2200);
    drawHanging(t);
    drawCat(t);
    if (live) drawFront(t); else blit(frontC);
    pop(t, 1700, [9.95, 11.55, 0], () => drawBoard(t));
    drawSteam(t);
    drawCyclist(t);
    drawDrift(t);
    drawLoose(t);
    drawBoy(t);
    drawStones(t);
    drawCrow(t);
    rise = 0; drawBirds(t);
    ctx.globalAlpha = 1;
  }
  function thud() { nameEl.classList.remove('thud'); void nameEl.offsetWidth; nameEl.classList.add('thud'); }

  // ---------- loop, input, sizing ----------
  let start = 0, running = false, visible = true;
  const now = () => performance.now() - start;
  function frame() {
    if (!running) return;
    const t = now();
    events.sort((a, b) => a.at - b.at);
    while (events.length && events[0].at <= t) { const e = events.shift(); e.fn(e.at); }
    render(t);
    requestAnimationFrame(frame);
  }
  function play() { if (still || running || !visible) return; running = true; requestAnimationFrame(frame); }
  function frameStill() { if (C.ink && still) render(1e6); }

  function hot(x, y) { const [cx, cy] = P(TC[0], TC[1], 3.8), [bx, by] = P(BOYW[0], BOYW[1], 0); return Math.hypot(x - cx, y - cy) < 105 || Math.hypot(x - bx, y - by + 22) < 30; }
  function tryFire() { if (still) return; const t = now(); if (t < busyUntil) return; fire(t, chooseOutcome()); }
  const toLogical = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H]; };
  cv.addEventListener('click', e => { const [x, y] = toLogical(e); if (hot(x, y)) tryFire(); });
  cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tryFire(); } });
  cv.addEventListener('pointermove', e => { const [x, y] = toLogical(e); pointer = { x, y, t: now() }; cv.classList.toggle('hot', !still && hot(x, y)); });
  cv.addEventListener('pointerleave', () => { pointer = null; cv.classList.remove('hot'); });
  document.getElementById('replay').addEventListener('click', e => { e.stopPropagation(); start = performance.now(); reset(); nameEl.classList.remove('thud'); });

  const txt = nameEl.textContent, acAt = txt.lastIndexOf('AI.'); nameEl.textContent = '';
  txt.split(/( )/).reduce((i, w) => {
    if (w === ' ') { nameEl.appendChild(document.createTextNode(' ')); return i + 1; }
    const word = document.createElement('span'); word.setAttribute('aria-hidden', 'true'); word.style.whiteSpace = 'nowrap';
    [...w].forEach((ch, k) => { const s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i + k); if (i + k >= acAt) s.className = 'ac'; word.appendChild(s); });
    nameEl.appendChild(word); return i + w.length;
  }, 0);


  function resize() {
    const w = cv.clientWidth || W, dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr);
    K = w / W * dpr; cacheDirty = true; frameStill(); placeCard();
  }
  new ResizeObserver(resize).observe(cv);
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) play(); else running = false; }).observe(cv);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
  new MutationObserver(readColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (document.fonts) document.fonts.ready.then(() => { cacheDirty = true; frameStill(); });

  buildPins();
  if (still) document.getElementById('replay').hidden = true;
  start = performance.now();
  reset(); readColors(); resize(); play();
})();
