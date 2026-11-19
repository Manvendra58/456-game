/**
 * Global art direction & timing constants.
 * Squid Game palette + act choreography for the generative journey.
 */
export const COLORS = Object.freeze({
  pink: "#ed1b76",
  pinkDeep: "#9e104e",
  teal: "#0a2f2a",
  void: "#030908",
  sand: "#c9a86c",
  sandDeep: "#9a7a48",
  cream: "#f3ead9",
  glow: "#3dff6a",
  danger: "#ff2d55",
  tracksuit: "#5d915c",
  tracksuitDark: "#3d6b3c",
  skin: "#e8c4a0",
  hair: "#2a1a10",
  guard: "#ed1b76",
  mask: "#141414",
});

/** Five acts — creative narrative arc (not a single static scene). */
export const ACTS = Object.freeze([
  {
    id: "ritual",
    name: "ACT I — RITUAL",
    legend: "○ △ □ awaken. Geometry remembers the games.",
    hint: "Watch · click to advance when ready",
    duration: 9,
  },
  {
    id: "dorm",
    name: "ACT II — THE DORMITORY",
    legend: "456 beds. One number that still matters.",
    hint: "Move the pointer — lights follow Player 456",
    duration: 10,
  },
  {
    id: "rlgl",
    name: "ACT III — RED LIGHT, GREEN LIGHT",
    legend: "Hold SPACE / click to run. Freeze on RED.",
    hint: "SPACE · W · ↑ or hold pointer · A/D to strafe",
    duration: 0, // player-driven
  },
  {
    id: "dalgona",
    name: "ACT IV — DALGONA",
    legend: "Trace the honeycomb. One crack ends everything.",
    hint: "Trace the shape slowly with your pointer",
    duration: 0,
  },
  {
    id: "finale",
    name: "ACT V — SURVIVAL",
    legend: "Player 456 remains. The shapes endure.",
    hint: "Artwork complete — capture a frame for submission",
    duration: 12,
  },
]);

export const RLGL = Object.freeze({
  greenMin: 2.0,
  greenMax: 3.5,
  redMin: 1.3,
  redMax: 2.5,
  turnSpeedGreen: 2.6,
  turnSpeedRed: 2.1,
  playerSpeed: 0.2,
  finishY: 0.545,
  startY: 0.9,
});
