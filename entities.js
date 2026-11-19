/**
 * Drawable entities — Young-hee doll, guards, players, particles.
 * Isolated for reuse across acts and cleaner code review.
 */
import { COLORS } from "./config.js";
import { rand, drawShape } from "./utils.js";

export class ParticleSystem {
  constructor() {
    this.items = [];
  }

  burst(x, y, color, n = 24, confetti = false) {
    for (let i = 0; i < n; i++) {
      const ang = rand(0, Math.PI * 2);
      const sp = rand(40, 240);
      this.items.push({
        x, y,
        vx: Math.cos(ang) * sp * (confetti ? 0.3 : 1),
        vy: Math.sin(ang) * sp - rand(30, 140),
        life: rand(0.6, confetti ? 3.5 : 1.2),
        max: confetti ? 3.5 : 1.2,
        r: rand(2, confetti ? 7 : 5),
        color,
        g: confetti ? 70 : 400,
        confetti,
        rot: rand(0, Math.PI * 2),
        spin: rand(-5, 5),
      });
    }
  }

  confettiRain(w) {
    const palette = [COLORS.pink, COLORS.glow, COLORS.cream, COLORS.tracksuit, "#ffd700"];
    for (let i = 0; i < 100; i++) {
      this.items.push({
        x: rand(0, w),
        y: rand(-100, 80),
        vx: rand(-50, 50),
        vy: rand(50, 180),
        life: rand(2.5, 4),
        max: 4,
        r: rand(3, 7),
        color: palette[i % palette.length],
        g: 55,
        confetti: true,
        rot: rand(0, Math.PI * 2),
        spin: rand(-4, 4),
      });
    }
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const p = this.items[i];
      p.life -= dt;
      p.vy += p.g * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.confetti) p.rot += p.spin * dt;
      if (p.life <= 0) this.items.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const p of this.items) {
      const a = Math.max(0, p.life / p.max);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      if (p.confetti) {
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r * 0.4, p.r * 2, p.r * 0.8);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(0, 0, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
}

export function drawDoll(ctx, cx, cy, scale, dollAngle, lightGreen) {
  ctx.save();
  ctx.translate(cx, cy);

  ctx.fillStyle = "#7a5a12";
  ctx.fillRect(-scale * 0.55, scale * 0.85, scale * 1.1, scale * 0.18);
  ctx.fillStyle = "#a67c1a";
  ctx.fillRect(-scale * 0.48, scale * 0.78, scale * 0.96, scale * 0.1);

  const face = Math.cos(dollAngle);
  const sx = 0.22 + Math.abs(face) * 0.78;
  ctx.save();
  ctx.scale((Math.sign(face) || 1) * sx, 1);

  const dress = ctx.createLinearGradient(0, -scale * 0.2, 0, scale * 0.9);
  dress.addColorStop(0, "#f3d0de");
  dress.addColorStop(0.45, "#e89ab8");
  dress.addColorStop(1, "#c85a82");
  ctx.fillStyle = dress;
  ctx.beginPath();
  ctx.moveTo(0, -scale * 0.15);
  ctx.lineTo(scale * 0.55, scale * 0.85);
  ctx.quadraticCurveTo(0, scale * 0.95, -scale * 0.55, scale * 0.85);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#f7e8ef";
  ctx.beginPath();
  ctx.moveTo(-scale * 0.18, scale * 0.05);
  ctx.lineTo(scale * 0.18, scale * 0.05);
  ctx.lineTo(scale * 0.28, scale * 0.7);
  ctx.lineTo(-scale * 0.28, scale * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = COLORS.skin;
  ctx.lineWidth = scale * 0.08;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-scale * 0.2, scale * 0.05);
  ctx.lineTo(-scale * 0.55, scale * 0.35);
  ctx.moveTo(scale * 0.2, scale * 0.05);
  ctx.lineTo(scale * 0.55, scale * 0.35);
  ctx.stroke();

  ctx.fillStyle = COLORS.skin;
  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.38, scale * 0.28, scale * 0.32, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#3d2314";
  ctx.beginPath();
  ctx.ellipse(0, -scale * 0.5, scale * 0.3, scale * 0.22, 0, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(-scale * 0.22, -scale * 0.35, scale * 0.1, scale * 0.18, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(scale * 0.22, -scale * 0.35, scale * 0.1, scale * 0.18, 0.3, 0, Math.PI * 2);
  ctx.fill();

  if (face < 0.15) {
    const eyeAlpha = Math.min(1, (0.15 - face) / 0.3);
    ctx.globalAlpha = eyeAlpha;
    ctx.fillStyle = "#1a1008";
    ctx.beginPath();
    ctx.ellipse(-scale * 0.1, -scale * 0.4, scale * 0.045, scale * 0.055, 0, 0, Math.PI * 2);
    ctx.ellipse(scale * 0.1, -scale * 0.4, scale * 0.045, scale * 0.055, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c45a6a";
    ctx.lineWidth = scale * 0.025;
    ctx.beginPath();
    ctx.arc(0, -scale * 0.28, scale * 0.1, 0.15, Math.PI - 0.15);
    ctx.stroke();
    ctx.fillStyle = "rgba(237,100,120,0.35)";
    ctx.beginPath();
    ctx.ellipse(-scale * 0.18, -scale * 0.3, scale * 0.06, scale * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(scale * 0.18, -scale * 0.3, scale * 0.06, scale * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    if (!lightGreen) {
      const eg = ctx.createRadialGradient(0, -scale * 0.4, 0, 0, -scale * 0.4, scale * 0.85);
      eg.addColorStop(0, "rgba(255,20,60,0.4)");
      eg.addColorStop(1, "rgba(255,0,40,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(0, -scale * 0.2, scale * 0.95, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.beginPath();
  ctx.ellipse(0, scale * 1.02, scale * 0.5, scale * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGuard(ctx, x, y, scale, mask) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = "#c45a8a";
  ctx.fillRect(-scale * 0.18, scale * 0.35, scale * 0.14, scale * 0.45);
  ctx.fillRect(scale * 0.04, scale * 0.35, scale * 0.14, scale * 0.45);

  ctx.fillStyle = COLORS.guard;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-scale * 0.32, -scale * 0.15, scale * 0.64, scale * 0.55, 4);
    ctx.fill();
  } else {
    ctx.fillRect(-scale * 0.32, -scale * 0.15, scale * 0.64, scale * 0.55);
  }

  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(-scale * 0.32, scale * 0.28, scale * 0.64, scale * 0.06);
  ctx.fillStyle = COLORS.guard;
  ctx.fillRect(-scale * 0.48, -scale * 0.05, scale * 0.16, scale * 0.4);
  ctx.fillRect(scale * 0.32, -scale * 0.05, scale * 0.16, scale * 0.4);

  ctx.fillStyle = COLORS.mask;
  ctx.beginPath();
  ctx.arc(0, -scale * 0.35, scale * 0.28, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = COLORS.cream;
  ctx.lineWidth = 2.5;
  ctx.save();
  ctx.translate(0, -scale * 0.35);
  drawShape(ctx, mask, scale * 0.24);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, scale * 0.82, scale * 0.28, scale * 0.06, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawPlayer(ctx, x, y, scale, number, highlight, wobble, moving) {
  ctx.save();
  ctx.translate(x, y + Math.sin(wobble) * 2);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(0, scale * 0.72, scale * 0.28, scale * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();

  const swing = highlight && moving ? Math.sin(wobble * 1.2) * scale * 0.12 : 0;
  ctx.fillStyle = COLORS.tracksuitDark;
  ctx.fillRect(-scale * 0.16, scale * 0.25, scale * 0.12, scale * 0.42 + swing);
  ctx.fillRect(scale * 0.04, scale * 0.25, scale * 0.12, scale * 0.42 - swing);

  ctx.fillStyle = highlight ? "#6fa86e" : COLORS.tracksuit;
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(-scale * 0.28, -scale * 0.2, scale * 0.56, scale * 0.5, 3);
    ctx.fill();
  } else {
    ctx.fillRect(-scale * 0.28, -scale * 0.2, scale * 0.56, scale * 0.5);
  }

  ctx.fillStyle = "#111";
  ctx.font = `bold ${Math.max(9, scale * 0.28)}px "IBM Plex Mono", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(number).padStart(3, "0"), 0, scale * 0.05);

  ctx.fillStyle = COLORS.skin;
  ctx.beginPath();
  ctx.arc(0, -scale * 0.35, scale * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = COLORS.hair;
  ctx.beginPath();
  ctx.arc(0, -scale * 0.42, scale * 0.2, Math.PI, Math.PI * 2);
  ctx.fill();

  if (highlight) {
    ctx.strokeStyle = "rgba(61,255,106,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, scale * 0.72, scale * 0.38, scale * 0.1, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}
