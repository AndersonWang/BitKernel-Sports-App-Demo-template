// A generic, unbranded football match drawn live on a canvas, used as the Watch Party stream.
// Broadcast main-camera view: the pitch in perspective, a crowd band and plain ad boards, 22 players who keep their
// team shape around the ball, passes, turnovers, shots and the odd goal. The camera pans with the ball.
// No real players, kits or logos: the home side wears the theme's brand colour in stripes, the away side plain navy.
import { useEffect, useRef } from 'react';

const L = 105; const Wd = 68; // pitch size in metres
const FORM = [[3, 34], [18, 10], [16, 26], [16, 42], [18, 58], [35, 16], [32, 34], [35, 52], [50, 12], [52, 34], [50, 56]]; // 4-3-3, own half origin
const rnd = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function makeTeam(side) {
  return FORM.map(([x, z], i) => {
    const bx = side === 'home' ? x : L - x;
    return { side, i, bx, bz: z, x: bx, z, vx: 0, vz: 0, phase: Math.random() * 6 };
  });
}

/**
 * props: home/away short names (for the score bug), score, clock (seconds), onGoal(side)
 * Score and clock are owned by the room so they survive re-renders; the canvas only draws and simulates.
 */
export function MatchCanvas({ onGoal, className, paused = false }) {
  const ref = useRef(null);
  const pausedRef = useRef(paused);
  pausedRef.current = paused; // Watch Party replay: the host can pause; the picture freezes
  const goalCb = useRef(onGoal);
  goalCb.current = onGoal;
  useEffect(() => {
    const cv = ref.current; const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 375; let H = 241;
    const size = () => { const r = cv.getBoundingClientRect(); W = r.width || 375; H = r.height || 241; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    size();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(size) : null; ro?.observe(cv);
    const css = getComputedStyle(document.documentElement);
    const brand = (css.getPropertyValue('--colour-brand-primary') || '#008b28').trim() || '#008b28';
    const crowd = Array.from({ length: 900 }, () => ({ x: rnd(-40, L + 40), y: Math.random(), c: ['#e8e8e8', '#2b6e3f', '#c9d6cf', '#1d1d1d', brand, '#f2f2f2', '#3a3a3a'][Math.floor(Math.random() * 7)], p: Math.random() * 6 }));
    let players = [...makeTeam('home'), ...makeTeam('away')];
    const ball = { x: L / 2, z: Wd / 2, h: 0, from: null, to: null, t: 0, dur: 0, owner: null, shot: null };
    let attack = 'home'; let camX = L / 2; let next = 0; let celebrate = 0; let last = performance.now(); let raf;
    const dir = (side) => (side === 'home' ? 1 : -1);
    const team = (side) => players.filter((p) => p.side === side);
    const kickoff = (side) => {
      players = [...makeTeam('home'), ...makeTeam('away')];
      attack = side; ball.x = L / 2; ball.z = Wd / 2; ball.h = 0; ball.to = null; ball.shot = null;
      ball.owner = team(side)[9]; ball.owner.x = L / 2 - dir(side) * 0.8; ball.owner.z = Wd / 2; next = 1.2;
    };
    kickoff('home');
    const passTo = (target, speed = 22, lofted = false) => {
      ball.from = { x: ball.x, z: ball.z }; ball.to = { x: target.x + dir(target.side) * 1.5, z: target.z }; ball.recv = target;
      const d = Math.hypot(ball.to.x - ball.x, ball.to.z - ball.z); ball.dur = Math.max(0.35, d / speed); ball.t = 0; ball.loft = lofted ? Math.min(6, d / 6) : 0.3; ball.owner = null;
    };
    const decide = () => {
      const o = ball.owner; if (!o) return;
      const d = dir(o.side);
      const goalX = o.side === 'home' ? L : 0;
      const nearGoal = Math.abs(goalX - o.x) < 32 && o.z > 12 && o.z < 56;
      if (nearGoal && Math.random() < 0.7) {
        // Shot: on target lands between the posts (z 30.3–37.7)
        const on = Math.random() < 0.6; const z = on ? rnd(31, 37) : rnd(25, 43) + (Math.random() < 0.5 ? -6 : 6);
        ball.from = { x: ball.x, z: ball.z }; ball.to = { x: goalX + d * 1.2, z }; ball.dur = Math.abs(goalX - o.x) / 30 + 0.15; ball.t = 0; ball.loft = 1.6; ball.owner = null; ball.recv = null;
        const keeper = team(o.side === 'home' ? 'away' : 'home')[0];
        ball.shot = { side: o.side, goal: on && Math.random() < 0.5, keeper };
        return;
      }
      const mates = team(o.side).filter((p) => p !== o && p.i !== 0);
      const ahead = mates.filter((p) => (p.x - o.x) * d > -6).sort((a, b) => Math.hypot(a.x - o.x, a.z - o.z) - Math.hypot(b.x - o.x, b.z - o.z)).slice(0, 4);
      // Mostly play forward so attacks reach the box
      const fwd = [...ahead].sort((a, b) => (b.x - a.x) * d)[0];
      const target = (Math.random() < 0.45 ? fwd : ahead[Math.floor(Math.random() * ahead.length)]) || mates[0];
      const far = Math.hypot(target.x - o.x, target.z - o.z) > 25;
      // Opponents read some passes
      if (Math.random() < 0.12) {
        const opp = team(o.side === 'home' ? 'away' : 'home').filter((p) => p.i !== 0).sort((a, b) => Math.hypot(a.x - (o.x + target.x) / 2, a.z - (o.z + target.z) / 2) - Math.hypot(b.x - (o.x + target.x) / 2, b.z - (o.z + target.z) / 2))[0];
        passTo(opp, 20, false); return;
      }
      passTo(target, far ? 26 : 18, far);
    };
    const step = (dt) => {
      if (celebrate > 0) { celebrate -= dt; if (celebrate <= 0) kickoff(attack === 'home' ? 'away' : 'home'); }
      // Ball
      if (ball.to) {
        ball.t += dt; const k = clamp(ball.t / ball.dur, 0, 1);
        ball.x = ball.from.x + (ball.to.x - ball.from.x) * k; ball.z = ball.from.z + (ball.to.z - ball.from.z) * k;
        ball.h = Math.sin(Math.PI * k) * ball.loft;
        if (k >= 1) {
          ball.h = 0;
          if (ball.shot) {
            const s = ball.shot; ball.shot = null; ball.to = null;
            if (s.goal) { celebrate = 3; goalCb.current?.(s.side); ball.owner = null; attack = s.side; }
            else { ball.owner = s.keeper; s.keeper.x = ball.x - dir(s.side) * 1.5; s.keeper.z = ball.z; attack = s.keeper.side; next = 1.4; }
          } else { ball.owner = ball.recv; ball.to = null; attack = ball.owner.side; next = rnd(0.5, 1.4); }
        }
      } else if (ball.owner) {
        const o = ball.owner; ball.x = o.x + dir(o.side) * 0.7; ball.z = o.z + 0.3; ball.h = 0;
        next -= dt; if (next <= 0 && celebrate <= 0) decide();
      }
      // Players keep shape around the ball; the nearest defender presses, the carrier dribbles forward
      const bx = ball.to ? ball.to.x : ball.x; const bz = ball.to ? ball.to.z : ball.z;
      for (const p of players) {
        let tx; let tz;
        const att = p.side === attack;
        const shift = (bx - L / 2) * 0.7 + (att ? dir(p.side) * 12 : -dir(p.side) * 4);
        tx = p.bx + shift; tz = p.bz + (bz - Wd / 2) * 0.35;
        if (p.i === 0) { tx = p.side === 'home' ? clamp(2 + (bx < 20 ? 3 : 0), 1, 6) : clamp(L - 2 - (bx > 85 ? 3 : 0), 99, 104); tz = clamp(Wd / 2 + (bz - Wd / 2) * 0.15, 30, 38); }
        if (ball.owner === p) { tx = p.x + dir(p.side) * 4; tz = p.z + Math.sin(p.phase) * 2; }
        if (ball.recv === p && ball.to) { tx = ball.to.x - dir(p.side) * 1.5; tz = ball.to.z; }
        if (celebrate > 0 && att) { tx = p.side === 'home' ? 92 : 13; tz = 8 + p.i * 0.8; }
        tx = clamp(tx, 1, L - 1); tz = clamp(tz, 1, Wd - 1);
        const dx = tx - p.x; const dz = tz - p.z; const dist = Math.hypot(dx, dz);
        const vmax = ball.owner === p ? 5.5 : ball.recv === p ? 7 : 4.2 + (p.i % 3) * 0.6;
        const v = Math.min(vmax, dist * 1.4);
        p.vx = dist > 0.05 ? (dx / dist) * v : 0; p.vz = dist > 0.05 ? (dz / dist) * v : 0;
        p.x += p.vx * dt; p.z += p.vz * dt; p.phase += dt * (2 + Math.hypot(p.vx, p.vz) * 1.6);
      }
      // Nearest defender presses the carrier
      if (ball.owner && celebrate <= 0) {
        const def = players.filter((p) => p.side !== ball.owner.side && p.i !== 0).sort((a, b) => Math.hypot(a.x - ball.x, a.z - ball.z) - Math.hypot(b.x - ball.x, b.z - ball.z))[0];
        const dx = ball.x - def.x; const dz = ball.z - def.z; const d = Math.hypot(dx, dz);
        if (d > 1.2) { def.x += (dx / d) * 5 * dt; def.z += (dz / d) * 5 * dt; }
      }
      camX += (clamp(ball.x, 24, L - 24) - camX) * Math.min(1, dt * 1.6);
    };
    // Projection: broadcast camera high on the near side. z = 0 far touchline, z = Wd near touchline.
    const proj = (x, z, h = 0) => {
      const t = z / Wd; const far = H * 0.30; const near = H * 1.02;
      const y = far + (near - far) * (t > 0 ? Math.pow(t, 1.15) : t); // pow() of a negative depth is NaN
      const s = 0.55 + 0.75 * t; // px per metre factor
      const ppm = (W / 38) * s;
      return { x: W / 2 + (x - camX) * ppm, y: y - h * ppm * 0.9, s: ppm };
    };
    const quad = (pts, fill) => { ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); };
    const line = (a, b) => { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); };
    const draw = (t) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0e1512'; ctx.fillRect(0, 0, W, H);
      // Stands
      const top = proj(0, 0).y;
      const g = ctx.createLinearGradient(0, 0, 0, top); g.addColorStop(0, '#0e1512'); g.addColorStop(1, '#25302a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, top);
      for (const c of crowd) {
        const px = W / 2 + (c.x - camX) * (W / 46) * 0.42; if (px < -2 || px > W + 2) continue;
        const py = c.y * (top - 12) + Math.sin(t / 300 + c.p) * (celebrate > 0 ? 1.6 : 0.4);
        ctx.fillStyle = c.c; ctx.globalAlpha = 0.55 + 0.35 * Math.sin(t / 900 + c.p); ctx.fillRect(px, py, 1.6, 1.6);
      }
      ctx.globalAlpha = 1;
      // Plain ad boards (no brands)
      const b0 = proj(-10, -2.5); const b1 = proj(L + 10, -2.5);
      ctx.fillStyle = '#123b29'; ctx.fillRect(0, b0.y - 7, W, 7); ctx.fillStyle = 'rgba(255,255,255,.08)';
      for (let x = -10; x < L + 10; x += 12) { const a = proj(x, -2.5); ctx.fillRect(a.x, a.y - 6, (W / 46) * 0.55 * 10, 1.2); }
      // Grass with mowing stripes
      quad([proj(-6, -2), proj(L + 6, -2), proj(L + 6, Wd + 6), proj(-6, Wd + 6)], '#2f7d3a');
      for (let i = 0; i < 20; i += 2) quad([proj(i * 5.25, -2), proj((i + 1) * 5.25, -2), proj((i + 1) * 5.25, Wd + 6), proj(i * 5.25, Wd + 6)], '#338a40');
      // Lines
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1.1;
      line(proj(0, 0), proj(L, 0)); line(proj(0, Wd), proj(L, Wd)); line(proj(0, 0), proj(0, Wd)); line(proj(L, 0), proj(L, Wd)); line(proj(L / 2, 0), proj(L / 2, Wd));
      for (const [x0, x1] of [[0, 16.5], [L, L - 16.5]]) { line(proj(x0, 13.85), proj(x1, 13.85)); line(proj(x1, 13.85), proj(x1, Wd - 13.85)); line(proj(x1, Wd - 13.85), proj(x0, Wd - 13.85)); line(proj(x0, 24.85), proj(x0 + (x1 - x0) * 0.33, 24.85)); line(proj(x0 + (x1 - x0) * 0.33, 24.85), proj(x0 + (x1 - x0) * 0.33, Wd - 24.85)); line(proj(x0 + (x1 - x0) * 0.33, Wd - 24.85), proj(x0, Wd - 24.85)); }
      ctx.beginPath(); for (let a = 0; a <= 64; a++) { const th = (a / 64) * Math.PI * 2; const p = proj(L / 2 + Math.cos(th) * 9.15, Wd / 2 + Math.sin(th) * 9.15); a ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); } ctx.stroke();
      // Goals
      for (const gx of [0, L]) {
        const o = gx ? 1 : -1; const a = proj(gx, 30.34); const b = proj(gx, 37.66); const at = proj(gx, 30.34, 2.44); const bt = proj(gx, 37.66, 2.44); const back = proj(gx + o * 2, 30.34, 2.2); const backB = proj(gx + o * 2, 37.66, 2.2);
        ctx.fillStyle = 'rgba(255,255,255,.18)'; quad([at, bt, backB, back], 'rgba(255,255,255,.14)');
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6; line(a, at); line(b, bt); line(at, bt); ctx.lineWidth = 1.1;
      }
      // Players and ball, back to front
      const objs = players.map((p) => ({ z: p.z, p })); objs.push({ z: ball.z, ball: true }); objs.sort((a, b) => a.z - b.z);
      for (const o of objs) {
        if (o.ball) {
          const sh = proj(ball.x, ball.z); const b = proj(ball.x, ball.z, ball.h);
          ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(sh.x, sh.y, sh.s * 0.35, sh.s * 0.13, 0, 0, 7); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y - b.s * 0.25, Math.max(1.8, b.s * 0.25), 0, 7); ctx.fill();
          continue;
        }
        const p = o.p; const f = proj(p.x, p.z); const s = f.s; const hgt = s * 1.8; const wid = s * 0.62;
        const run = Math.hypot(p.vx, p.vz) > 0.3 ? Math.sin(p.phase) : 0;
        ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(f.x, f.y, wid * 0.9, s * 0.18, 0, 0, 7); ctx.fill();
        // legs
        ctx.fillStyle = p.side === 'home' ? '#f4f4f4' : '#0f1a33';
        ctx.fillRect(f.x - wid * 0.38 + run * wid * 0.2, f.y - hgt * 0.42, wid * 0.3, hgt * 0.42);
        ctx.fillRect(f.x + wid * 0.08 - run * wid * 0.2, f.y - hgt * 0.42, wid * 0.3, hgt * 0.42);
        // shorts
        ctx.fillStyle = p.side === 'home' ? '#ffffff' : '#0b1430'; ctx.fillRect(f.x - wid / 2, f.y - hgt * 0.56, wid, hgt * 0.16);
        // shirt (home: brand stripes; keepers in yellow / orange)
        const sy = f.y - hgt * 0.9; const sh = hgt * 0.36;
        if (p.i === 0) { ctx.fillStyle = p.side === 'home' ? '#f5c400' : '#ff7a1a'; ctx.fillRect(f.x - wid / 2, sy, wid, sh); }
        else if (p.side === 'home') { ctx.fillStyle = '#ffffff'; ctx.fillRect(f.x - wid / 2, sy, wid, sh); ctx.fillStyle = brand; for (let k = 0; k < 3; k++) ctx.fillRect(f.x - wid / 2 + (k * 2 + 0.5) * (wid / 6), sy, wid / 6, sh); }
        else { ctx.fillStyle = '#1f3a8a'; ctx.fillRect(f.x - wid / 2, sy, wid, sh); }
        // head
        ctx.fillStyle = ['#c68a5e', '#8d5a3b', '#e0b08a', '#5a3825'][p.i % 4]; ctx.beginPath(); ctx.arc(f.x, sy - s * 0.2, s * 0.2, 0, 7); ctx.fill();
      }
      // Broadcast vignette
      const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, W * 0.7); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.28)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    };
    const loop = (t) => { const dt = Math.min(0.05, (t - last) / 1000); last = t; if (!pausedRef.current) { step(dt); draw(t); } raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); };
  }, []);
  return <canvas ref={ref} className={className} aria-label="Live match" role="img" />;
}
