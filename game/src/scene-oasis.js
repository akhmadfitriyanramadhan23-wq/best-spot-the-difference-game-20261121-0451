// Desert Oasis: the fourth scene, hotter and harder. Dunes, a striped tent, a camel, a pond,
// palms, a cactus and a wide sky. Same contract: `draw(ctx, active)` in 600x420 scene space.

import { SCENE } from './config.js';
import { bird, circle, ellipse } from './draw.js';

/** The seed for this scene's decoration, so both panels match exactly. */
const SEED = 51;

/** This scene's eight differences, each with its click target in scene space. */
export const differences = [
  { id: 'sun-rays', x: 500, y: 68, r: 38, hint: 'Count the sun’s rays.' },
  { id: 'palm-coconuts', x: 122, y: 142, r: 24, hint: 'The palm’s coconuts.' },
  { id: 'camel-hump', x: 350, y: 292, r: 30, hint: 'The camel’s back.' },
  { id: 'tent-flag', x: 220, y: 148, r: 22, hint: 'The top of the tent.' },
  { id: 'pond-ripple', x: 450, y: 352, r: 26, hint: 'The pond’s ripples.' },
  { id: 'cactus-arm', x: 80, y: 300, r: 24, hint: 'The cactus arms.' },
  { id: 'bird-count', x: 300, y: 80, r: 22, hint: 'How many birds?' },
  { id: 'rug-color', x: 250, y: 382, r: 26, hint: 'The rug on the sand.' },
];

export const oasisScene = {
  id: 'oasis',
  name: 'Desert Oasis',
  tagline: 'Water in the sand, and eight things out of place.',
  seed: SEED,
  differences,
  draw(ctx, active) {
    const W = SCENE.width;
    const H = SCENE.height;

    // Sky and sun.
    const sky = ctx.createLinearGradient(0, 0, 0, 260);
    sky.addColorStop(0, '#7ec8e3');
    sky.addColorStop(1, '#cfeef7');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 260);
    ctx.save();
    ctx.translate(500, 68);
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const rays = active.has('sun-rays') ? 6 : 8;
    for (let i = 0; i < rays; i++) {
      const a = (i * Math.PI * 2) / 8 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 40, Math.sin(a) * 40);
      ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52);
      ctx.stroke();
    }
    circle(ctx, 0, 0, 32, '#ffdf6b');
    ctx.restore();

    // Birds: two, or three when the extra one is active.
    bird(ctx, 250, 80, 11, '#3a3f4a');
    bird(ctx, 330, 62, 9, '#3a3f4a');
    if (active.has('bird-count')) bird(ctx, 300, 80, 10, '#3a3f4a');

    // Dunes.
    ctx.fillStyle = '#e8c07a';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.quadraticCurveTo(150, 250, 320, 295);
    ctx.quadraticCurveTo(450, 330, 600, 290);
    ctx.lineTo(600, 420);
    ctx.lineTo(0, 420);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2d49b';
    ctx.beginPath();
    ctx.moveTo(0, 340);
    ctx.quadraticCurveTo(200, 300, 420, 345);
    ctx.quadraticCurveTo(520, 365, 600, 345);
    ctx.lineTo(600, 420);
    ctx.lineTo(0, 420);
    ctx.closePath();
    ctx.fill();

    // The pond with ripples: two rings, or three when active.
    ellipse(ctx, 450, 352, 62, 16, '#4b8ab0');
    ellipse(ctx, 450, 350, 56, 13, '#7ec8e3');
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(450, 350, 34, 7, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(450, 350, 48, 10, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (active.has('pond-ripple')) {
      ctx.beginPath();
      ctx.ellipse(450, 350, 20, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // The rug on the sand: red, or blue when active.
    ctx.fillStyle = active.has('rug-color') ? '#58a6ff' : '#b0413e';
    ctx.beginPath();
    ctx.moveTo(210, 372);
    ctx.lineTo(290, 372);
    ctx.lineTo(300, 396);
    ctx.lineTo(200, 396);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.fillRect(222, 380, 56, 6);

    // The tent: striped canvas, a flag on top unless hidden.
    ctx.fillStyle = '#f8f4e8';
    ctx.beginPath();
    ctx.moveTo(170, 260);
    ctx.lineTo(220, 170);
    ctx.lineTo(270, 260);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e5534b';
    ctx.beginPath();
    ctx.moveTo(195, 260);
    ctx.lineTo(220, 170);
    ctx.lineTo(220, 260);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(220, 170);
    ctx.lineTo(245, 260);
    ctx.lineTo(220, 260);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(220, 170);
    ctx.lineTo(220, 140);
    ctx.stroke();
    if (!active.has('tent-flag')) {
      ctx.fillStyle = '#ffd166';
      ctx.beginPath();
      ctx.moveTo(220, 140);
      ctx.lineTo(244, 146);
      ctx.lineTo(220, 152);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#3a2f28';
    ctx.beginPath();
    ctx.moveTo(208, 260);
    ctx.lineTo(232, 260);
    ctx.lineTo(232, 236);
    ctx.lineTo(208, 236);
    ctx.closePath();
    ctx.fill();

    // The palm: trunk, fronds and coconuts — three, or two when active.
    ctx.save();
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(120, 330);
    ctx.quadraticCurveTo(112, 240, 122, 160);
    ctx.stroke();
    ctx.strokeStyle = '#2f7d4f';
    ctx.lineWidth = 6;
    for (const [dx, dy, cx, cy] of [[-52, -8, -30, -26], [52, -8, 30, -26], [-40, 18, -24, 2], [40, 18, 24, 2], [0, -30, -6, -34]]) {
      ctx.beginPath();
      ctx.moveTo(122, 160);
      ctx.quadraticCurveTo(122 + cx, 160 + cy, 122 + dx, 160 + dy);
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, 112, 162, 6, '#6b4a2b');
    circle(ctx, 130, 166, 6, '#6b4a2b');
    if (!active.has('palm-coconuts')) circle(ctx, 122, 172, 6, '#6b4a2b');

    // The camel: body, neck, head, legs, and one hump or two.
    ctx.fillStyle = '#c99b5f';
    ellipse(ctx, 350, 300, 46, 24, '#c99b5f');
    circle(ctx, 322, 282, 16, '#c99b5f');
    if (active.has('camel-hump')) circle(ctx, 372, 282, 16, '#c99b5f');
    ctx.strokeStyle = '#c99b5f';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(388, 290);
    ctx.quadraticCurveTo(404, 268, 402, 246);
    ctx.stroke();
    circle(ctx, 404, 240, 10, '#c99b5f');
    ctx.fillStyle = '#3a2f28';
    circle(ctx, 407, 237, 1.8, '#3a2f28');
    ctx.strokeStyle = '#c99b5f';
    ctx.lineWidth = 7;
    for (const lx of [318, 334, 366, 382]) {
      ctx.beginPath();
      ctx.moveTo(lx, 318);
      ctx.lineTo(lx, 348);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8b5a2b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(398, 250);
    ctx.lineTo(412, 252);
    ctx.stroke();

    // The cactus: a trunk and one arm, or two when active.
    ctx.fillStyle = '#2f7d4f';
    roundRectPath(ctx, 72, 280, 16, 70, 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(72, 310);
    ctx.lineTo(56, 310);
    ctx.lineTo(56, 296);
    ctx.lineTo(72, 296);
    ctx.closePath();
    ctx.fill();
    if (active.has('cactus-arm')) {
      ctx.beginPath();
      ctx.moveTo(88, 318);
      ctx.lineTo(104, 318);
      ctx.lineTo(104, 304);
      ctx.lineTo(88, 304);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#ff8c42';
    circle(ctx, 80, 276, 5, '#ff8c42');
  },
};
