/**
 * Procedural soundtrack via Web Audio API — no external assets.
 * Demonstrates effective use of technology for atmosphere.
 */
export class ArtAudio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this._droneNodes = [];
    this._melodyTimer = null;
    this._started = false;
  }

  async unlock() {
    if (this._started) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    if (this.ctx.state === "suspended") await this.ctx.resume();
    this._started = true;
    this.startDrone();
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.22;
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /** Low teal-colored drone + soft pink overtone. */
  startDrone() {
    if (!this.ctx || !this.master) return;
    this.stopDrone();
    const freqs = [55, 82.5, 110];
    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.value = f;
      g.gain.value = i === 0 ? 0.35 : 0.12;
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      this._droneNodes.push({ osc, g });
    });
  }

  stopDrone() {
    for (const n of this._droneNodes) {
      try { n.osc.stop(); } catch (_) { /* already stopped */ }
    }
    this._droneNodes = [];
  }

  /** Soft beep — green light / safe. */
  chimeGreen() {
    this._blip(523.25, 0.15, "sine", 0.2);
    this._blip(659.25, 0.2, "sine", 0.12, 0.08);
  }

  /** Harsh stinger — red light. */
  chimeRed() {
    this._blip(180, 0.35, "sawtooth", 0.18);
    this._blip(90, 0.4, "square", 0.1, 0.05);
  }

  /** Elimination thud. */
  eliminate() {
    this._blip(60, 0.5, "sine", 0.35);
    this._noiseBurst(0.25);
  }

  /** Victory sparkles. */
  victory() {
    [523, 659, 784, 1046].forEach((f, i) => {
      this._blip(f, 0.35, "sine", 0.15, i * 0.1);
    });
  }

  /** Approximate playground melody motif (original synth arrangement). */
  playMotif() {
    if (!this.ctx) return;
    const notes = [392, 440, 494, 523, 494, 440, 392, 349];
    notes.forEach((f, i) => this._blip(f, 0.22, "triangle", 0.1, i * 0.28));
  }

  _blip(freq, dur, type, vol, delay = 0) {
    if (!this.ctx || !this.master || this.muted) return;
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  _noiseBurst(dur) {
    if (!this.ctx || !this.master || this.muted) return;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    src.buffer = buf;
    g.gain.value = 0.2;
    src.connect(g);
    g.connect(this.master);
    src.start();
  }
}
