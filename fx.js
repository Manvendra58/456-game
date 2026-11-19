/**
 * Post-processing layer — film grain + scanlines on a second canvas.
 * Separating FX from world rendering keeps the pipeline clean.
 */
import { fitCanvas } from "./utils.js";

export class FxLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.w = 0;
    this.h = 0;
    this.grain = null;
    this.grainTick = 0;
  }

  resize() {
    const { w, h } = fitCanvas(this.canvas, this.ctx);
    this.w = w;
    this.h = h;
    this._rebuildGrain();
  }

  _rebuildGrain() {
    const gw = 128;
    const gh = 128;
    const c = document.createElement("canvas");
    c.width = gw;
    c.height = gh;
    const g = c.getContext("2d");
    const img = g.createImageData(gw, gh);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 40;
    }
    g.putImageData(img, 0, 0);
    this.grain = c;
  }

  render(time, danger = false) {
    const ctx = this.ctx;
    const { w, h } = this;
    ctx.clearRect(0, 0, w, h);

    // Animated grain
    if (this.grain) {
      ctx.globalAlpha = danger ? 0.22 : 0.12;
      const ox = (Math.sin(time * 17) * 40) | 0;
      const oy = (Math.cos(time * 13) * 40) | 0;
      ctx.drawImage(this.grain, ox, oy, w, h);
      ctx.globalAlpha = 1;
    }

    // Scanlines
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

    // Vignette
    const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.15, w / 2, h / 2, h * 0.75);
    vig.addColorStop(0, "rgba(0,0,0,0)");
    vig.addColorStop(1, danger ? "rgba(40,0,10,0.85)" : "rgba(0,0,0,0.7)");
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, w, h);
  }
}
