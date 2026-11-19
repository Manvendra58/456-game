/** Shared math & canvas helpers — keeps scene code readable. */

export const rand = (a, b) => a + Math.random() * (b - a);

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const lerp = (a, b, t) => a + (b - a) * t;

export const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Fit canvas to viewport with devicePixelRatio for crisp art. */
export function fitCanvas(canvas, ctx) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, dpr };
}

export function drawShape(ctx, type, size) {
  ctx.beginPath();
  if (type === "circle") {
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
  } else if (type === "square") {
    ctx.rect(-size / 2, -size / 2, size, size);
  } else {
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.lineTo(-size / 2, size / 2);
    ctx.closePath();
  }
}

/** Morph factor 0→1→2 cycles circle → triangle → square visually. */
export function morphShape(ctx, t, size) {
  const phase = ((t % 3) + 3) % 3;
  const local = phase % 1;
  const from = Math.floor(phase);
  const types = ["circle", "triangle", "square"];
  // Cross-fade two shapes for generative originality
  ctx.save();
  ctx.globalAlpha *= 1 - local;
  drawShape(ctx, types[from], size);
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.globalAlpha *= local;
  drawShape(ctx, types[(from + 1) % 3], size);
  ctx.stroke();
  ctx.restore();
}
