/**
 * PLAYER 456 — The Geometry of Survival
 * Code Art Attack · Squid Game theme
 *
 * Architecture:
 *   config  → art direction constants
 *   audio   → procedural Web Audio soundtrack
 *   entities→ reusable drawables
 *   scenes  → five-act generative journey
 *   fx      → film-grain post layer
 *   main    → input, act state machine, render loop
 */
import { ACTS } from "./config.js";
import { fitCanvas } from "./utils.js";
import { ArtAudio } from "./audio.js";
import { ParticleSystem } from "./entities.js";
import { RitualScene, DormScene, RlglScene, DalgonaScene, FinaleScene } from "./scenes.js";
import { FxLayer } from "./fx.js";

const worldCanvas = document.getElementById("world");
const fxCanvas = document.getElementById("fx");
const worldCtx = worldCanvas.getContext("2d");
const fx = new FxLayer(fxCanvas);

const boot = document.getElementById("boot");
const hud = document.getElementById("hud");
const legend = document.getElementById("legend");
const legendText = document.getElementById("legendText");
const controlsHint = document.getElementById("controlsHint");
const sceneName = document.getElementById("sceneName");
const statusEl = document.getElementById("status");
const actDots = document.getElementById("actDots");
const endScreen = document.getElementById("endScreen");
const endKicker = document.getElementById("endKicker");
const endTitle = document.getElementById("endTitle");
const endMsg = document.getElementById("endMsg");

const audio = new ArtAudio();
const particles = new ParticleSystem();

const ritual = new RitualScene();
const dorm = new DormScene();
const rlgl = new RlglScene(particles, audio);
const dalgona = new DalgonaScene(audio);
const finale = new FinaleScene(particles);

let W = 0;
let H = 0;
let running = false;
let actIndex = 0;
let actTime = 0;
let awaitingAdvance = false;
let size = { w: 0, h: 0 };

const keys = new Set();
let pointerDown = false;
let pointer = { x: 0.5, y: 0.5 };

function resize() {
  size = fitCanvas(worldCanvas, worldCtx);
  fx.resize();
  W = size.w;
  H = size.h;
}

function buildActDots() {
  actDots.innerHTML = ACTS.map((_, i) => `<span data-i="${i}"></span>`).join("");
}

function setAct(i) {
  actIndex = i;
  actTime = 0;
  awaitingAdvance = false;
  const act = ACTS[i];
  sceneName.textContent = act.name;
  legendText.textContent = act.legend;
  controlsHint.textContent = act.hint;
  statusEl.textContent = "—";
  statusEl.className = "status neutral";

  actDots.querySelectorAll("span").forEach((el, idx) => {
    el.classList.toggle("on", idx === i);
  });

  if (act.id === "ritual") ritual.reset();
  if (act.id === "dorm") dorm.reset();
  if (act.id === "rlgl") rlgl.reset();
  if (act.id === "dalgona") dalgona.reset();
  if (act.id === "finale") {
    finale.reset();
    audio.playMotif();
  }
}

function advanceAct() {
  if (actIndex >= ACTS.length - 1) {
    showEnding(true);
    return;
  }
  setAct(actIndex + 1);
}

function showEnding(survived) {
  running = false;
  endScreen.classList.remove("hidden");
  if (survived) {
    endKicker.textContent = "SURVIVAL COMPLETE";
    endTitle.textContent = "PLAYER 456";
    endTitle.style.color = "#3dff6a";
    endMsg.textContent = "You walked through every game. Geometry favors the bold.";
    audio.victory();
  } else {
    endKicker.textContent = "GAME OVER";
    endTitle.textContent = "ELIMINATED";
    endTitle.style.color = "#ff2d55";
    endMsg.textContent = "The shapes forget no one. Try again.";
  }
}

function captureFrame() {
  // Composite world + a flat export (fx is blend-mode overlay in CSS)
  const out = document.createElement("canvas");
  out.width = worldCanvas.width;
  out.height = worldCanvas.height;
  const octx = out.getContext("2d");
  octx.drawImage(worldCanvas, 0, 0);
  octx.globalAlpha = 0.35;
  octx.drawImage(fxCanvas, 0, 0);
  octx.globalAlpha = 1;
  const a = document.createElement("a");
  a.download = "player-456-geometry-of-survival.png";
  a.href = out.toDataURL("image/png");
  a.click();
}

function getInput() {
  return {
    up: keys.has("ArrowUp") || keys.has("w") || keys.has("W") || keys.has(" ") || pointerDown,
    down: keys.has("ArrowDown") || keys.has("s") || keys.has("S"),
    left: keys.has("ArrowLeft") || keys.has("a") || keys.has("A"),
    right: keys.has("ArrowRight") || keys.has("d") || keys.has("D"),
    pointerDown,
    pointer,
    w: W,
    h: H,
  };
}

function update(dt) {
  if (!running) return;
  actTime += dt;
  const act = ACTS[actIndex];
  const input = getInput();
  particles.update(dt);

  if (act.id === "ritual") {
    ritual.update(dt);
    statusEl.textContent = "AWAKENING";
    statusEl.className = "status neutral";
    if (actTime >= act.duration) advanceAct();
  } else if (act.id === "dorm") {
    dorm.setPointer(pointer.x, pointer.y);
    dorm.update(dt);
    statusEl.textContent = "PLAYER 456";
    statusEl.className = "status green";
    if (actTime >= act.duration) advanceAct();
  } else if (act.id === "rlgl") {
    const state = rlgl.update(dt, input);
    if (state.status) {
      statusEl.textContent = state.status;
      statusEl.className = "status " + state.statusClass;
    }
    if (rlgl.gameOver) {
      if (rlgl.won) {
        // brief beat then next act
        if (!awaitingAdvance) {
          awaitingAdvance = true;
          actTime = 0;
        }
        if (actTime > 2.2) advanceAct();
      } else {
        showEnding(false);
      }
    }
  } else if (act.id === "dalgona") {
    dalgona.onPointer(pointer.x, pointer.y, pointerDown);
    const state = dalgona.update(dt);
    statusEl.textContent = state.status;
    statusEl.className = "status " + state.statusClass;
    if (state.failed) {
      showEnding(false);
    } else if (state.done) {
      if (!awaitingAdvance) {
        awaitingAdvance = true;
        actTime = 0;
      }
      if (actTime > 1.8) advanceAct();
    }
  } else if (act.id === "finale") {
    finale.update(dt, W);
    statusEl.textContent = "SURVIVOR";
    statusEl.className = "status green";
    if (actTime >= act.duration) showEnding(true);
  }
}

function render(time) {
  const ctx = worldCtx;
  ctx.clearRect(0, 0, W, H);

  const act = ACTS[actIndex];
  if (!running && boot && !boot.classList.contains("fade")) {
    // Idle preview behind boot: ritual
    ritual.update(0.016);
    ritual.draw(ctx, W, H);
  } else {
    if (act.id === "ritual") ritual.draw(ctx, W, H);
    else if (act.id === "dorm") dorm.draw(ctx, W, H);
    else if (act.id === "rlgl") rlgl.draw(ctx, W, H);
    else if (act.id === "dalgona") dalgona.draw(ctx, W, H);
    else if (act.id === "finale") finale.draw(ctx, W, H);
  }

  particles.draw(ctx);

  // Soft vignette always on world for depth
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.85);
  vig.addColorStop(0, "rgba(0,0,0,0)");
  vig.addColorStop(1, "rgba(0,10,8,0.45)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  const danger =
    (act?.id === "rlgl" && !rlgl.lightGreen) ||
    (act?.id === "dalgona" && dalgona.cracked);
  fx.render(time, danger);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  update(dt);
  render(now / 1000);
  requestAnimationFrame(loop);
}

async function start() {
  await audio.unlock();
  audio.chimeGreen();
  boot.classList.add("fade");
  hud.classList.remove("hidden");
  legend.classList.remove("hidden");
  endScreen.classList.add("hidden");
  running = true;
  particles.items.length = 0;
  setAct(0);
}

function restart() {
  endScreen.classList.add("hidden");
  running = true;
  particles.items.length = 0;
  setAct(0);
}

// —— Events ——
document.getElementById("startBtn").addEventListener("click", start);
document.getElementById("retryBtn").addEventListener("click", restart);
document.getElementById("shotBtn").addEventListener("click", captureFrame);
document.getElementById("muteBtn").addEventListener("click", (e) => {
  const muted = audio.toggleMute();
  e.currentTarget.classList.toggle("muted", muted);
});

window.addEventListener("keydown", (e) => {
  keys.add(e.key);
  if ([" ", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
  }
  // Skip timed acts with Enter / N
  if (running && (e.key === "Enter" || e.key === "n" || e.key === "N")) {
    const id = ACTS[actIndex].id;
    if (id === "ritual" || id === "dorm") advanceAct();
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.key));

function trackPointer(e) {
  const rect = worldCanvas.getBoundingClientRect();
  pointer.x = (e.clientX - rect.left) / rect.width;
  pointer.y = (e.clientY - rect.top) / rect.height;
}
worldCanvas.addEventListener("pointerdown", (e) => {
  pointerDown = true;
  trackPointer(e);
  worldCanvas.setPointerCapture?.(e.pointerId);
});
window.addEventListener("pointerup", () => { pointerDown = false; });
window.addEventListener("pointermove", trackPointer);

window.addEventListener("resize", resize);

// Boot
buildActDots();
resize();
ritual.reset();
requestAnimationFrame(loop);
