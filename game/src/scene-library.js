// Cozy Library: the third scene, warmer and busier. Bookshelves with coloured spines, a
// rain-streaked window, a floor lamp, an armchair, a sleeping cat, a clock, a teacup and a
// potted plant. Same contract: `draw(ctx, active)` paints it in 600x420 scene space.

import { SCENE } from './config.js';
import { circle, ellipse, roundRect } from './draw.js';

/** The seed for this scene's decoration, so both panels match exactly. */
const SEED = 37;

/** This scene's eight differences, each with its click target in scene space. */
export const differences = [
  { id: 'clock-hands', x: 300, y: 62, r: 30, hint: 'What time is it?' },
  { id: 'book-color', x: 150, y: 150, r: 22, hint: 'One book spine changed.' },
  { id: 'lamp-on', x: 82, y: 205, r: 28, hint: 'The floor lamp.' },
  { id: 'cat-ear', x: 424, y: 348, r: 24, hint: 'The sleeping cat.' },
  { id: 'rain-drop', x: 520, y: 122, r: 22, hint: 'The windowpane.' },
  { id: 'steam', x: 482, y: 296, r: 22, hint: 'The teacup.' },
  { id: 'plant-leaf', x: 560, y: 372, r: 24, hint: 'The potted plant.' },
  { id: 'rug-stripe', x: 300, y: 392, r: 26, hint: 'The rug under the chair.' },
];

export const libraryScene = {
  id: 'library',
  name: 'Cozy Library',
  tagline: 'Rain on the window, tea going cold.',
  seed: SEED,
  differences,
  draw(ctx, active) {
    const W = SCENE.width;
    const H = SCENE.height;

    // Warm wall and wooden floor.
    ctx.fillStyle = '#e8d5b0';
    ctx.fillRect(0, 0, W, 330);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 330, W, H - 330);
    ctx.fillStyle = '#7a4e24';
    for (let y = 350; y < H; y += 22) ctx.fillRect(0, y, W, 2);

    // The clock: 3 o'clock, or half past 4 when its difference is active.
    circle(ctx, 300, 62, 30, '#f8f4e8');
    ctx.strokeStyle = '#5b4636';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(300, 62, 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(300, 62);
    ctx.lineTo(300, 44);
    ctx.moveTo(300, 62);
    if (active.has('clock-hands')) ctx.lineTo(282, 68);
    else ctx.lineTo(318, 62);
    ctx.stroke();
    circle(ctx, 300, 62, 3, '#2b2b33');

    // Bookshelves: three shelves, spines in a fixed palette.
    const palette = ['#e5534b', '#2ea043', '#58a6ff', '#ffd166', '#d2a8ff', '#ff8c42', '#2ec4b6'];
    ctx.fillStyle = '#6b4a2b';
    ctx.fillRect(40, 100, 300, 190);
    for (let shelf = 0; shelf < 3; shelf++) {
      const y = 108 + shelf * 60;
      for (let i = 0; i < 9; i++) {
        const x = 48 + i * 32;
        const h = 40 + ((i * 7 + shelf * 13) % 12);
        let colour = palette[(i + shelf * 3) % palette.length];
        if (active.has('book-color') && shelf === 1 && i === 3) colour = '#2ea043';
        ctx.fillStyle = colour;
        ctx.fillRect(x, y + 48 - h, 26, h);
      }
      ctx.fillStyle = '#5b4636';
      ctx.fillRect(40, y + 48, 300, 8);
    }

    // The window: night rain outside, one drop more or fewer.
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(430, 90, 130, 150);
    ctx.fillStyle = '#1b2a52';
    ctx.fillRect(438, 98, 114, 134);
    circle(ctx, 520, 120, 16, '#f4ead2');
    ctx.strokeStyle = 'rgba(174,220,240,0.8)';
    ctx.lineWidth = 2;
    for (const [x, y, len] of [[460, 120, 26], [490, 150, 30], [540, 180, 24], [470, 200, 28]]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y + len);
      ctx.stroke();
    }
    if (!active.has('rain-drop')) {
      circle(ctx, 520, 122, 4, 'rgba(174,220,240,0.9)');
      circle(ctx, 520, 122, 7, 'rgba(174,220,240,0.25)');
    }
    ctx.strokeStyle = '#3a2f28';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(495, 98);
    ctx.lineTo(495, 232);
    ctx.moveTo(438, 165);
    ctx.lineTo(552, 165);
    ctx.stroke();

    // The floor lamp: glowing warm, or dark when its difference is active.
    const lit = !active.has('lamp-on');
    ctx.fillStyle = '#3a2f28';
    ctx.fillRect(78, 200, 6, 130);
    ellipse(ctx, 81, 332, 22, 6, '#3a2f28');
    ctx.fillStyle = lit ? '#ffd166' : '#8a7f6a';
    ctx.beginPath();
    ctx.moveTo(60, 200);
    ctx.lineTo(102, 200);
    ctx.lineTo(92, 168);
    ctx.lineTo(70, 168);
    ctx.closePath();
    ctx.fill();
    if (lit) {
      ctx.fillStyle = 'rgba(255,209,102,0.14)';
      ctx.beginPath();
      ctx.moveTo(60, 200);
      ctx.lineTo(102, 200);
      ctx.lineTo(140, 330);
      ctx.lineTo(22, 330);
      ctx.closePath();
      ctx.fill();
    }

    // The rug under the armchair: a stripe red, or teal when active.
    ctx.fillStyle = '#b0413e';
    roundRect(ctx, 200, 372, 220, 34, 8, '#b0413e');
    ctx.fillStyle = active.has('rug-stripe') ? '#2ec4b6' : '#ffd166';
    ctx.fillRect(210, 384, 200, 8);

    // The armchair.
    ctx.fillStyle = '#7d5ba6';
    roundRect(ctx, 250, 280, 110, 92, 14, '#7d5ba6');
    roundRect(ctx, 238, 300, 24, 60, 10, '#6b4e8f');
    roundRect(ctx, 348, 300, 24, 60, 10, '#6b4e8f');
    ctx.fillStyle = '#e8d5b0';
    circle(ctx, 300, 300, 12, '#e8d5b0');

    // The sleeping cat on the rug: two ears, or one folded when active.
    ctx.fillStyle = '#e8a93d';
    ellipse(ctx, 420, 356, 26, 13, '#e8a93d');
    circle(ctx, 442, 344, 11, '#e8a93d');
    ctx.beginPath();
    ctx.moveTo(434, 336);
    ctx.lineTo(436, 326);
    ctx.lineTo(442, 334);
    ctx.closePath();
    ctx.fill();
    if (!active.has('cat-ear')) {
      ctx.beginPath();
      ctx.moveTo(446, 335);
      ctx.lineTo(450, 326);
      ctx.lineTo(453, 334);
      ctx.closePath();
      ctx.fill();
    }
    ctx.strokeStyle = '#e8a93d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(398, 354);
    ctx.quadraticCurveTo(384, 346, 386, 334);
    ctx.stroke();

    // The side table with a teacup: steam, or none when active.
    ctx.fillStyle = '#5b4636';
    ctx.fillRect(468, 320, 54, 8);
    ctx.fillRect(490, 328, 8, 30);
    ctx.fillStyle = '#f8f4e8';
    roundRect(ctx, 472, 296, 26, 20, 4, '#f8f4e8');
    ctx.strokeStyle = '#f8f4e8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(500, 306, 7, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    if (!active.has('steam')) {
      ctx.strokeStyle = 'rgba(120,120,120,0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(480, 292);
      ctx.quadraticCurveTo(476, 282, 482, 274);
      ctx.moveTo(490, 292);
      ctx.quadraticCurveTo(494, 282, 488, 274);
      ctx.stroke();
    }

    // The potted plant: five leaves, or four when active.
    ctx.fillStyle = '#b0413e';
    ctx.beginPath();
    ctx.moveTo(548, 380);
    ctx.lineTo(572, 380);
    ctx.lineTo(568, 404);
    ctx.lineTo(552, 404);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2f7d4f';
    ctx.lineWidth = 3;
    const leaves = [[552, 380], [560, 372], [568, 380], [556, 366], [564, 366]];
    for (let i = 0; i < leaves.length; i++) {
      if (active.has('plant-leaf') && i === 4) continue;
      const [lx, ly] = leaves[i];
      ctx.beginPath();
      ctx.moveTo(560, 380);
      ctx.quadraticCurveTo(lx, ly - 12, lx, ly - 22);
      ctx.stroke();
    }
  },
};
