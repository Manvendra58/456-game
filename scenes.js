/**
 * Five-act generative journey — creative interpretation of Squid Game.
 * Each act is a self-contained visual system with its own update/draw.
 */
import { COLORS, RLGL } from "./config.js";
import { rand, clamp, morphShape, drawShape } from "./utils.js";
import { drawDoll, drawGuard, drawPlayer } from "./entities.js";

/* ---------- ACT I: Ritual — morphing ○△□ cosmos ---------- */
export class RitualScene {
  constructor() {
    this.shapes = [];
    this.t = 0;
    this.reset();
  }

  reset() {
    this.t = 0;
    this.shapes = Array.from({ length: 36 }, (_, i) => ({
      type: ["circle", "triangle", "square"][i % 3],
      orbit: rand(0.08, 0.42),
      speed: rand(0.15, 0.55) * (Math.random() < 0.5 ? -1 : 1),
      size: rand(14, 48),
      phase: rand(0, Math.PI * 2),
      depth: rand(0.3, 1),
    }));
  }

  update(dt) {
    this.t += dt;
  }

  draw(ctx, w, h) {
    const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.7);
    g.addColorStop(0, "#1a0a14");
    g.addColorStop(0.5, "#0a1f1a");
    g.addColorStop(1, COLORS.void);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Central morphing emblem
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.strokeStyle = COLORS.pink;
    ctx.lineWidth = 4;
    ctx.shadowColor = COLORS.pink;
    ctx.shadowBlur = 24;
    morphShape(ctx, this.t * 0.35, Math.min(w, h) * 0.28);
    ctx.restore();

    for (const s of this.shapes) {
      const ang = s.phase + this.t * s.speed;
      const x = w / 2 + Math.cos(ang) * s.orbit * Math.min(w, h);
      const y = h / 2 + Math.sin(ang) * s.orbit * Math.min(w, h) * 0.65;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang * 0.5);
      ctx.globalAlpha = 0.25 + s.depth * 0.5;
      ctx.strokeStyle = COLORS.pink;
      ctx.lineWidth = 2;
      drawShape(ctx, s.type, s.size * s.depth);
      ctx.stroke();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.cream;
    ctx.font = `600 ${Math.min(w, h) * 0.035}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.globalAlpha = 0.55 + Math.sin(this.t * 2) * 0.15;
    ctx.fillText("THE SHAPES REMEMBER", w / 2, h * 0.86);
    ctx.globalAlpha = 1;
  }
}

/* ---------- ACT II: Dormitory — beds + spotlight on 456 ---------- */
export class DormScene {
  constructor() {
    this.t = 0;
    this.pointer = { x: 0.5, y: 0.5 };
  }

  reset() {
    this.t = 0;
  }

  setPointer(nx, ny) {
    this.pointer.x = nx;
    this.pointer.y = ny;
  }

  update(dt) {
    this.t += dt;
  }

  draw(ctx, w, h) {
    ctx.fillStyle = "#0d3d36";
    ctx.fillRect(0, 0, w, h);

    // Floor perspective
    const floor = ctx.createLinearGradient(0, h * 0.35, 0, h);
    floor.addColorStop(0, "#0a2f2a");
    floor.addColorStop(1, "#061a16");
    ctx.fillStyle = floor;
    ctx.fillRect(0, h * 0.35, w, h * 0.65);

    // Pink door glow at far wall
    const doorG = ctx.createRadialGradient(w / 2, h * 0.28, 0, w / 2, h * 0.28, w * 0.25);
    doorG.addColorStop(0, "rgba(237,27,118,0.55)");
    doorG.addColorStop(1, "rgba(237,27,118,0)");
    ctx.fillStyle = doorG;
    ctx.fillRect(0, 0, w, h * 0.45);

    ctx.fillStyle = COLORS.pink;
    ctx.fillRect(w * 0.42, h * 0.12, w * 0.16, h * 0.22);
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(w * 0.44, h * 0.14, w * 0.12, h * 0.18);

    // Grid of beds
    const cols = 9;
    const rows = 6;
    const spotlight = this.pointer;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = ((c + 0.5) / cols) * w;
        const y = h * 0.4 + ((r + 0.5) / rows) * h * 0.55;
        const num = r * cols + c + 1;
        const is456 = num === 56; // visual stand-in near center — label 456 on special bed
        const special = c === 4 && r === 3;
        const dx = x / w - spotlight.x;
        const dy = y / h - spotlight.y;
        const dist = Math.hypot(dx, dy);
        const lit = Math.max(0, 1 - dist * 2.2);

        ctx.save();
        ctx.globalAlpha = 0.35 + lit * 0.65;
        // mattress
        ctx.fillStyle = special ? COLORS.tracksuit : "#2a6b5e";
        ctx.fillRect(x - 22, y - 8, 44, 18);
        ctx.fillStyle = "#1a4038";
        ctx.fillRect(x - 22, y - 14, 44, 8);
        if (special) {
          ctx.fillStyle = COLORS.cream;
          ctx.font = 'bold 11px "IBM Plex Mono", monospace';
          ctx.textAlign = "center";
          ctx.fillText("456", x, y + 4);
          ctx.strokeStyle = COLORS.glow;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x - 26, y - 18, 52, 30);
        }
        ctx.restore();
      }
    }

    // Pointer light
    const lx = spotlight.x * w;
    const ly = spotlight.y * h;
    const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, 180);
    lg.addColorStop(0, "rgba(255,240,200,0.12)");
    lg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);
  }
}

/* ---------- ACT III: Red Light Green Light ---------- */
export class RlglScene {
  constructor(particles, audio) {
    this.particles = particles;
    this.audio = audio;
    this.reset();
  }

  reset() {
    this.t = 0;
    this.lightGreen = true;
    this.lightTimer = 0;
    this.nextSwitch = rand(RLGL.greenMin, RLGL.greenMax);
    this.dollAngle = 0;
    this.dollTurning = false;
    this.turnProgress = 0;
    this.shake = 0;
    this.moving = false;
    this.gameOver = false;
    this.won = false;
    this.player = { x: 0.5, y: RLGL.startY, wobble: 0, alive: true };
    this.npcs = Array.from({ length: 16 }, () => ({
      x: rand(0.08, 0.92),
      y: rand(0.62, 0.92),
      speed: rand(0.03, 0.065),
      alive: true,
      number: Math.floor(rand(1, 455)),
      phase: rand(0, Math.PI * 2),
      fear: Math.random(),
    }));
    this.dust = Array.from({ length: 50 }, () => ({
      x: rand(0, 1),
      y: rand(0.45, 1),
      r: rand(0.5, 2),
      a: rand(0.1, 0.3),
      vx: rand(-0.01, 0.01),
      vy: rand(-0.008, -0.002),
    }));
  }

  update(dt, input) {
    if (this.gameOver) {
      this.t += dt;
      if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
      return { done: this.won, eliminated: !this.won && this.gameOver };
    }

    this.t += dt;
    this.lightTimer += dt;

    if (!this.dollTurning && this.lightTimer >= this.nextSwitch) {
      this.dollTurning = true;
      this.turnProgress = 0;
    }
    if (this.dollTurning) {
      const speed = this.lightGreen ? RLGL.turnSpeedGreen : RLGL.turnSpeedRed;
      this.turnProgress += dt * speed;
      this.dollAngle = this.lightGreen
        ? Math.min(Math.PI, this.turnProgress * Math.PI)
        : Math.max(0, Math.PI - this.turnProgress * Math.PI);
      if (this.turnProgress >= 1) {
        this.dollTurning = false;
        this.lightGreen = !this.lightGreen;
        this.lightTimer = 0;
        this.nextSwitch = this.lightGreen
          ? rand(RLGL.greenMin, RLGL.greenMax)
          : rand(RLGL.redMin, RLGL.redMax);
        if (this.lightGreen) this.audio?.chimeGreen();
        else this.audio?.chimeRed();
      }
    }

    this.moving = false;
    if (this.player.alive) {
      let dx = 0;
      let dy = 0;
      if (input.up) dy -= 1;
      if (input.down) dy += 1;
      if (input.left) dx -= 1;
      if (input.right) dx += 1;
      if (dx || dy) {
        this.moving = true;
        const len = Math.hypot(dx, dy) || 1;
        this.player.x = clamp(this.player.x + (dx / len) * RLGL.playerSpeed * dt, 0.06, 0.94);
        this.player.y = clamp(this.player.y + (dy / len) * RLGL.playerSpeed * dt, 0.54, 0.94);
        this.player.wobble += dt * 16;
      }
      if (!this.lightGreen && !this.dollTurning && this.moving) {
        this._eliminate();
      }
      if (this.player.y <= RLGL.finishY) this._win();
    }

    for (const n of this.npcs) {
      if (!n.alive) continue;
      n.phase += dt;
      if (this.lightGreen && !this.dollTurning && n.fear < 0.75) {
        n.y -= n.speed * dt * (0.7 + Math.sin(n.phase) * 0.3);
        n.x += Math.sin(n.phase * 1.3) * 0.01 * dt;
      } else if (!this.lightGreen && !this.dollTurning && n.fear > 0.93 && Math.random() < 0.01) {
        n.alive = false;
        this.particles.burst(n.x * input.w, n.y * input.h, COLORS.pink, 14);
        this.shake = 0.2;
      }
      n.y = Math.max(0.54, n.y);
    }

    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.y < 0.4) { d.y = 1; d.x = rand(0, 1); }
      if (d.x < 0) d.x = 1;
      if (d.x > 1) d.x = 0;
    }

    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt);
    return {
      done: false,
      status: this.lightGreen ? "GREEN LIGHT" : "RED LIGHT",
      statusClass: this.lightGreen ? "green" : "red",
      progress: clamp((RLGL.startY - this.player.y) / (RLGL.startY - RLGL.finishY), 0, 1),
    };
  }

  _eliminate() {
    this.gameOver = true;
    this.won = false;
    this.player.alive = false;
    this.shake = 0.55;
    this.audio?.eliminate();
  }

  _win() {
    this.gameOver = true;
    this.won = true;
    this.audio?.victory();
    this.particles.confettiRain(typeof window !== "undefined" ? window.innerWidth : 800);
  }

  draw(ctx, w, h) {
    ctx.save();
    if (this.shake > 0) {
      ctx.translate((Math.random() - 0.5) * this.shake * 24, (Math.random() - 0.5) * this.shake * 24);
    }

    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    if (this.lightGreen) {
      sky.addColorStop(0, "#5ec8d8");
      sky.addColorStop(0.5, "#87c9b8");
      sky.addColorStop(1, "#b8d4a8");
    } else {
      sky.addColorStop(0, "#2a1a28");
      sky.addColorStop(0.45, "#4a2038");
      sky.addColorStop(1, "#6b3a3a");
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h * 0.55);

    const sx = w * 0.78;
    const sy = h * 0.14;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, h * 0.28);
    if (this.lightGreen) {
      sg.addColorStop(0, "rgba(255,236,170,0.85)");
      sg.addColorStop(1, "rgba(255,180,100,0)");
    } else {
      sg.addColorStop(0, "rgba(255,40,80,0.5)");
      sg.addColorStop(1, "rgba(80,0,20,0)");
    }
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, h * 0.28, 0, Math.PI * 2);
    ctx.fill();

    // Trees
    const baseY = h * 0.48;
    ctx.fillStyle = this.lightGreen ? "#1a4a38" : "#0d241c";
    for (let i = 0; i < 40; i++) {
      const x = (i / 40) * w + Math.sin(i * 2.1) * 18;
      const th = 40 + (Math.sin(i * 1.7) * 0.5 + 0.5) * 90;
      ctx.beginPath();
      ctx.moveTo(x, baseY);
      ctx.lineTo(x - 18, baseY);
      ctx.lineTo(x, baseY - th);
      ctx.lineTo(x + 18, baseY);
      ctx.closePath();
      ctx.fill();
    }

    // Field
    const field = ctx.createLinearGradient(0, baseY, 0, h);
    field.addColorStop(0, "#d4b896");
    field.addColorStop(1, "#a88858");
    ctx.fillStyle = field;
    ctx.fillRect(0, baseY, w, h - baseY);

    // Finish
    const fy = h * 0.52;
    for (let x = 0; x < w; x += 18) {
      ctx.fillStyle = x % 36 === 0 ? "rgba(255,255,255,0.85)" : "rgba(20,20,20,0.85)";
      ctx.fillRect(x, fy - 4, 9, 8);
    }

    // Side walls
    ctx.fillStyle = "rgba(237,27,118,0.3)";
    ctx.fillRect(0, baseY, w * 0.03, h - baseY);
    ctx.fillRect(w * 0.97, baseY, w * 0.03, h - baseY);

    drawDoll(ctx, w * 0.5, h * 0.38, Math.min(w, h) * 0.14, this.dollAngle, this.lightGreen);
    drawGuard(ctx, w * 0.12, h * 0.5, Math.min(w, h) * 0.055, "circle");
    drawGuard(ctx, w * 0.88, h * 0.5, Math.min(w, h) * 0.055, "square");
    drawGuard(ctx, w * 0.2, h * 0.46, Math.min(w, h) * 0.045, "triangle");
    drawGuard(ctx, w * 0.8, h * 0.46, Math.min(w, h) * 0.045, "circle");

    const figures = this.npcs
      .filter((n) => n.alive)
      .map((n) => ({ ...n, isPlayer: false }))
      .concat(
        this.player.alive
          ? [{ x: this.player.x, y: this.player.y, number: 456, isPlayer: true, phase: this.player.wobble }]
          : []
      )
      .sort((a, b) => a.y - b.y);

    for (const f of figures) {
      const scale = Math.min(w, h) * 0.035 * (0.85 + f.y * 0.25);
      drawPlayer(ctx, f.x * w, f.y * h, scale, f.number, f.isPlayer, f.phase || 0, f.isPlayer && this.moving);
    }

    for (const d of this.dust) {
      ctx.fillStyle = `rgba(255,240,200,${d.a})`;
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, d.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!this.lightGreen) {
      ctx.fillStyle = `rgba(120,0,30,${0.08 + Math.sin(this.t * 8) * 0.04})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();
  }
}

/* ---------- ACT IV: Dalgona — honeycomb trace ---------- */
export class DalgonaScene {
  constructor(audio) {
    this.audio = audio;
    this.reset();
  }

  reset() {
    this.t = 0;
    this.shape = "triangle"; // iconic
    this.progress = 0;
    this.cracked = false;
    this.done = false;
    this.pointer = null;
    this.last = null;
    this.trail = [];
  }

  onPointer(nx, ny, down) {
    if (!down || this.cracked || this.done) {
      this.last = null;
      return;
    }
    const p = { x: nx, y: ny };
    if (this.last) {
      const dist = Math.hypot(p.x - this.last.x, p.y - this.last.y);
      // Must stay near the shape path
      const err = this._pathError(p.x, p.y);
      if (err > 0.11) {
        this.cracked = true;
        this.audio?.eliminate();
        return;
      }
      if (err < 0.07) {
        this.progress = Math.min(1, this.progress + dist * 2.4);
        this.trail.push(p);
        if (this.trail.length > 200) this.trail.shift();
      }
    }
    this.last = p;
    if (this.progress >= 1) {
      this.done = true;
      this.audio?.victory();
    }
  }

  /** Distance from point to ideal triangle path (normalized coords). */
  _pathError(x, y) {
    // Equilateral triangle centered
    const cx = 0.5;
    const cy = 0.48;
    const s = 0.22;
    const pts = [
      { x: cx, y: cy - s },
      { x: cx + s * 0.95, y: cy + s * 0.7 },
      { x: cx - s * 0.95, y: cy + s * 0.7 },
    ];
    let min = Infinity;
    for (let i = 0; i < 3; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % 3];
      min = Math.min(min, distToSegment(x, y, a.x, a.y, b.x, b.y));
    }
    return min;
  }

  update(dt) {
    this.t += dt;
    return {
      done: this.done,
      failed: this.cracked,
      status: this.cracked ? "CRACKED" : this.done ? "PERFECT" : "TRACE THE △",
      statusClass: this.cracked ? "red" : this.done ? "green" : "neutral",
      progress: this.progress,
    };
  }

  draw(ctx, w, h) {
    const bg = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, h * 0.7);
    bg.addColorStop(0, "#3d2a14");
    bg.addColorStop(1, "#120c08");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Candy disc
    const cx = w / 2;
    const cy = h * 0.48;
    const R = Math.min(w, h) * 0.32;
    const candy = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, R * 0.1, cx, cy, R);
    candy.addColorStop(0, "#f0c878");
    candy.addColorStop(0.7, "#d4a04a");
    candy.addColorStop(1, "#a87830");
    ctx.fillStyle = candy;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fill();

    // Honeycomb hex pattern
    ctx.strokeStyle = "rgba(120,70,20,0.25)";
    ctx.lineWidth = 1;
    const hex = R * 0.12;
    for (let row = -4; row <= 4; row++) {
      for (let col = -4; col <= 4; col++) {
        const hx = cx + col * hex * 1.5;
        const hy = cy + row * hex * Math.sqrt(3) + (col % 2 ? hex * 0.86 : 0);
        if (Math.hypot(hx - cx, hy - cy) < R * 0.9) drawHex(ctx, hx, hy, hex * 0.55);
      }
    }

    // Target triangle
    ctx.strokeStyle = this.cracked ? COLORS.danger : "#5a3a10";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(cx, cy - R * 0.55);
    ctx.lineTo(cx + R * 0.52, cy + R * 0.38);
    ctx.lineTo(cx - R * 0.52, cy + R * 0.38);
    ctx.closePath();
    ctx.stroke();

    // Player trail
    if (this.trail.length > 1) {
      ctx.strokeStyle = this.done ? COLORS.glow : COLORS.pink;
      ctx.lineWidth = 3;
      ctx.lineJoin = "round";
      ctx.beginPath();
      this.trail.forEach((p, i) => {
        const x = p.x * w;
        const y = p.y * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    if (this.cracked) {
      ctx.strokeStyle = COLORS.danger;
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + this.t;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9);
        ctx.stroke();
      }
    }

    ctx.fillStyle = COLORS.cream;
    ctx.font = `600 ${Math.min(w, h) * 0.04}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(this.done ? "PASSED" : this.cracked ? "BROKEN" : "DALGONA", w / 2, h * 0.9);
  }
}

function drawHex(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/* ---------- ACT V: Finale ---------- */
export class FinaleScene {
  constructor(particles) {
    this.particles = particles;
    this.t = 0;
    this.started = false;
  }

  reset() {
    this.t = 0;
    this.started = false;
  }

  update(dt, w) {
    this.t += dt;
    if (!this.started) {
      this.started = true;
      this.particles.confettiRain(w);
    }
    return { done: this.t > 10 };
  }

  draw(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#1a0510");
    g.addColorStop(0.5, "#0a1f1a");
    g.addColorStop(1, COLORS.void);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Monumental shapes
    const types = ["circle", "triangle", "square"];
    types.forEach((type, i) => {
      const x = w * (0.25 + i * 0.25);
      const y = h * 0.42;
      const s = Math.min(w, h) * 0.16;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(this.t * 0.6 + i) * 0.08);
      ctx.strokeStyle = COLORS.pink;
      ctx.lineWidth = 5;
      ctx.shadowColor = COLORS.pink;
      ctx.shadowBlur = 30;
      ctx.globalAlpha = 0.85;
      drawShape(ctx, type, s);
      ctx.stroke();
      ctx.restore();
    });

    ctx.globalAlpha = 1;
    ctx.fillStyle = COLORS.cream;
    ctx.font = `${Math.min(w, h) * 0.1}px "Bebas Neue", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText("PLAYER 456", w / 2, h * 0.68);
    ctx.fillStyle = COLORS.pink;
    ctx.font = `${Math.min(w, h) * 0.035}px "Bebas Neue", sans-serif`;
    ctx.fillText("THE GEOMETRY OF SURVIVAL", w / 2, h * 0.76);

    // Silhouette of survivor
    drawPlayer(ctx, w / 2, h * 0.88, Math.min(w, h) * 0.05, 456, true, this.t * 2, false);
  }
}
