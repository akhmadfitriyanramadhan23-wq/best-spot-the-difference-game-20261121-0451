// Winter Market: the fifth and hardest scene. Snow, two striped stalls, a snowman, string
// lights, lanterns, gifts and a pine with a star. Same contract: `draw(ctx, active)` in
// 600x420 scene space; decoration comes from this scene's seed so both panels match.

import { SCENE } from './config.js';
import { createRandom, range } from './random.js';
import { circle, ellipse, pine, roundRect, star } from './draw.js';

/** The seed for this scene's decoration, so both panels match exactly. */
const SEED = 67;

/** This scene's eight differences, each with its click target in scene space. */
export const differences = [
  { id: 'awning-stripe', x: 150, y: 148, r: 26, hint: 'The left stall’s awning.' },
  { id: 'carrot', x: 300, y: 278, r: 22, hint: 'The snowman’s face.' },
  { id: 'lantern-color', x: 480, y: 178, r: 24, hint: 'The lantern by the stall.' },
  { id: 'bulb-out', x: 380, y: 100, r: 22, hint: 'The string of lights.' },
  { id: 'gift-bow', x: 200, y: 362, r: 22, hint: 'The pile of gifts.' },
  { id: 'tree-star', x: 540, y: 118, r: 24, hint: 'The top of the pine.' },
  { id: 'snowflake', x: 90, y: 80, r: 22, hint: 'A big snowflake in the sky.' },
  { id: 'chimney-smoke', x: 520, y: 218, r: 24, hint: 'Above the right stall.' },
];

export const marketScene = {
  id: 'market',
  name: 'Winter Market',
  tagline: 'Eight changes hiding in the snow.',
  seed: SEED,
  differences,
  draw(ctx, active) {
    const W = SCENE.width;
    const H = SCENE.height;
    const rng = createRandom(SEED);

    // Evening sky and snow-covered ground.
    const sky = ctx.createLinearGradient(0, 0, 0, 280);
    sky.addColorStop(0, '#2b3a55');
    sky.addColorStop(0.7, '#5a6b8c');
    sky.addColorStop(1, '#8fa3c8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 280);
    ctx.fillStyle = '#eef2f8';
    ctx.fillRect(0, 280, W, H - 280);
    ctx.fillStyle = '#dfe6f2';
    ctx.beginPath();
    ctx.moveTo(0, 300);
    ctx.quadraticCurveTo(150, 280, 320, 300);
    ctx.quadraticCurveTo(480, 320, 600, 298);
    ctx.lineTo(600, 340);
    ctx.lineTo(0, 340);
    ctx.closePath();
    ctx.fill();

    // Falling snow from the seed, plus one big flake unless hidden.
    for (let i = 0; i < 60; i++) {
      const x = range(rng, 8, W - 8);
      const y = range(rng, 8, 400);
      const r = range(rng, 1.2, 3);
      circle(ctx, x, y, r, 'rgba(255,255,255,0.85)');
    }
    if (!active.has('snowflake')) star(ctx, 90, 80, 12, 5, 6, '#ffffff');

    // String lights between the stalls: five bulbs, one dark when active.
    ctx.strokeStyle = '#3a2f28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(150, 130);
    ctx.quadraticCurveTo(300, 175, 480, 128);
    ctx.stroke();
    const bulbs = [180, 245, 310, 380, 445];
    for (let i = 0; i < bulbs.length; i++) {
      const bx = bulbs[i];
      const by = 130 + Math.sin((bx - 150) / 330 * Math.PI) * 38;
      ctx.strokeStyle = '#3a2f28';
      ctx.beginPath();
      ctx.moveTo(bx, by - 4);
      ctx.lineTo(bx, by + 2);
      ctx.stroke();
      const lit = !(active.has('bulb-out') && i === 3);
      circle(ctx, bx, by + 8, 6, lit ? '#ffd166' : '#5a5560');
      if (lit) circle(ctx, bx, by + 8, 12, 'rgba(255,209,102,0.25)');
    }

    // The left stall: counter, striped awning, gifts.
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(120, 220, 150, 110);
    ctx.fillStyle = '#a06a35';
    ctx.fillRect(120, 220, 150, 12);
    for (let i = 0; i < 6; i++) {
      const stripe = i % 2 === 0;
      let colour = stripe ? '#e5534b' : '#f8f4e8';
      if (active.has('awning-stripe') && i === 2) colour = '#2ea043';
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.moveTo(110 + i * 25, 168);
      ctx.lineTo(135 + i * 25, 168);
      ctx.lineTo(135 + i * 25, 148);
      ctx.lineTo(110 + i * 25, 148);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(112, 232, 166, 8);
    // Gifts: three boxes, the middle bow gone when active.
    const gifts = [[150, 350, '#58a6ff'], [185, 356, '#e5534b'], [222, 352, '#2ea043']];
    for (let i = 0; i < gifts.length; i++) {
      const [gx, gy, gc] = gifts[i];
      ctx.fillStyle = gc;
      ctx.fillRect(gx, gy, 26, 22);
      ctx.fillStyle = '#ffd166';
      ctx.fillRect(gx + 11, gy, 4, 22);
      if (!(active.has('gift-bow') && i === 1)) {
        ctx.beginPath();
        ctx.moveTo(gx + 13, gy);
        ctx.lineTo(gx + 4, gy - 8);
        ctx.lineTo(gx + 12, gy - 4);
        ctx.lineTo(gx + 14, gy - 4);
        ctx.lineTo(gx + 22, gy - 8);
        ctx.closePath();
        ctx.fill();
      }
    }

    // The right stall with its chimney: smoke, unless hidden.
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(430, 220, 140, 110);
    ctx.fillStyle = '#7d5a38';
    ctx.fillRect(430, 220, 140, 12);
    ctx.fillStyle = '#2ec4b6';
    ctx.beginPath();
    ctx.moveTo(420, 168);
    ctx.lineTo(580, 168);
    ctx.lineTo(580, 148);
    ctx.lineTo(420, 148);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8f4e8';
    for (let i = 0; i < 4; i++) ctx.fillRect(430 + i * 40, 148, 20, 20);
    ctx.fillStyle = '#5b4636';
    ctx.fillRect(520, 130, 18, 40);
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(516, 124, 26, 8);
    if (!active.has('chimney-smoke')) {
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      circle(ctx, 529, 108, 8, 'rgba(255,255,255,0.75)');
      circle(ctx, 536, 94, 10, 'rgba(255,255,255,0.6)');
      circle(ctx, 546, 78, 12, 'rgba(255,255,255,0.45)');
    }
    // The lantern by the right stall: orange, or purple when active.
    ctx.strokeStyle = '#3a2f28';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(480, 168);
    ctx.lineTo(480, 178);
    ctx.stroke();
    ctx.fillStyle = '#3a2f28';
    roundRect(ctx, 470, 178, 20, 26, 4, '#3a2f28');
    ctx.fillStyle = active.has('lantern-color') ? '#d2a8ff' : '#ff8c42';
    roundRect(ctx, 473, 182, 14, 18, 3, active.has('lantern-color') ? '#d2a8ff' : '#ff8c42');

    // The snowman between the stalls.
    circle(ctx, 300, 330, 34, '#ffffff');
    circle(ctx, 300, 272, 26, '#ffffff');
    circle(ctx, 300, 228, 19, '#ffffff');
    ctx.fillStyle = '#2b2b33';
    circle(ctx, 293, 224, 2.5, '#2b2b33');
    circle(ctx, 307, 224, 2.5, '#2b2b33');
    ctx.fillStyle = '#ff8c42';
    ctx.beginPath();
    if (!active.has('carrot')) {
      ctx.moveTo(300, 230);
      ctx.lineTo(322, 234);
      ctx.lineTo(300, 238);
      ctx.closePath();
    }
    ctx.fill();
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(292, 240);
    ctx.quadraticCurveTo(300, 244, 308, 240);
    ctx.stroke();
    ctx.fillStyle = '#e5534b';
    ctx.fillRect(284, 210, 32, 6);
    ctx.fillRect(288, 196, 24, 16);
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(274, 272);
    ctx.lineTo(250, 252);
    ctx.moveTo(326, 272);
    ctx.lineTo(350, 252);
    ctx.stroke();
    ctx.fillStyle = '#2b2b33';
    circle(ctx, 300, 310, 3, '#2b2b33');
    circle(ctx, 300, 330, 3, '#2b2b33');

    // The pine with its star: the star is gone when active.
    pine(ctx, 540, 330, 110, '#2f7d4f');
    if (!active.has('tree-star')) star(ctx, 540, 206, 12, 5, 5, '#ffd166');
    ellipse(ctx, 540, 344, 30, 7, '#dfe6f2');

    // Footprints in the snow.
    ctx.fillStyle = 'rgba(120,130,160,0.35)';
    for (const [fx, fy] of [[120, 380], [140, 392], [165, 380], [420, 386], [445, 396], [470, 384]]) {
      ellipse(ctx, fx, fy, 8, 4, 'rgba(120,130,160,0.35)');
    }
  },
};
