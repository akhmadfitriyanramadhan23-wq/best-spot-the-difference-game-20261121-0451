// Harbor at Dawn: the first, gentlest scene. A striped lighthouse on the rocks, a pier, two
// sailboats, gulls and a jumping fish, all in a 600x420 space. `draw(ctx, active)` paints the
// scene; `active` is the set of difference ids applied to this panel, so the left panel is
// drawn with an empty set and the right with the differences that are still hidden.

import { SCENE } from './config.js';
import { bird, boat, circle, cloud, ellipse, fish } from './draw.js';

/** The seed for this scene's decoration, so both panels match exactly. */
const SEED = 11;

/** This scene's eight differences, each with its click target in scene space. */
export const differences = [
  { id: 'sun-rays', x: 520, y: 70, r: 40, hint: 'Count the sun’s rays.' },
  { id: 'cloud-missing', x: 300, y: 62, r: 34, hint: 'Look at the clouds.' },
  { id: 'lighthouse-stripe', x: 95, y: 245, r: 26, hint: 'The lighthouse stripes.' },
  { id: 'sail-color', x: 430, y: 288, r: 30, hint: 'The big boat’s sail.' },
  { id: 'gull-extra', x: 390, y: 95, r: 22, hint: 'How many gulls are there?' },
  { id: 'buoy-color', x: 350, y: 360, r: 22, hint: 'The buoy in the water.' },
  { id: 'fish-missing', x: 500, y: 348, r: 24, hint: 'Something jumps near the boat.' },
  { id: 'pier-plank', x: 205, y: 330, r: 22, hint: 'The pier’s planks.' },
];

export const harborScene = {
  id: 'harbor',
  name: 'Harbor at Dawn',
  tagline: 'Eight things changed while the tide came in.',
  seed: SEED,
  differences,
  draw(ctx, active) {
    const W = SCENE.width;
    const H = SCENE.height;

    // Dawn sky, then the sea.
    const sky = ctx.createLinearGradient(0, 0, 0, 270);
    sky.addColorStop(0, '#ffcf9e');
    sky.addColorStop(0.55, '#ffd9a8');
    sky.addColorStop(1, '#a8d8e8');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 270);
    const sea = ctx.createLinearGradient(0, 260, 0, H);
    sea.addColorStop(0, '#4b8ab0');
    sea.addColorStop(1, '#2b5f82');
    ctx.fillStyle = sea;
    ctx.fillRect(0, 260, W, H - 260);

    // The sun and its rays: eight rays, or five when the difference is active.
    ctx.save();
    ctx.translate(520, 70);
    ctx.strokeStyle = '#ffb703';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    const rays = active.has('sun-rays') ? 5 : 8;
    for (let i = 0; i < rays; i++) {
      const a = (i * Math.PI * 2) / 8 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 42, Math.sin(a) * 42);
      ctx.lineTo(Math.cos(a) * 56, Math.sin(a) * 56);
      ctx.stroke();
    }
    circle(ctx, 0, 0, 34, '#ffdf6b');
    ctx.restore();

    // Clouds: the middle one is gone when its difference is active.
    cloud(ctx, 110, 55, 1.0, '#fff6e8');
    if (!active.has('cloud-missing')) cloud(ctx, 280, 62, 0.8, '#fff6e8');
    cloud(ctx, 440, 45, 0.9, '#fff6e8');

    // Gulls: three, or four when the extra one is active.
    bird(ctx, 180, 110, 12, '#3a3f4a');
    bird(ctx, 260, 90, 10, '#3a3f4a');
    bird(ctx, 340, 130, 11, '#3a3f4a');
    if (active.has('gull-extra')) bird(ctx, 390, 95, 10, '#3a3f4a');

    // Wave lines on the water.
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 2;
    for (const [x, y, w] of [[60, 300, 70], [200, 330, 90], [420, 310, 80], [90, 390, 100], [330, 395, 90]]) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + w / 2, y - 6, x + w, y);
      ctx.stroke();
    }

    // The rocks and the lighthouse: white tower, two red stripes, or one when active.
    ctx.fillStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(30, 420);
    ctx.lineTo(55, 330);
    ctx.lineTo(95, 300);
    ctx.lineTo(140, 335);
    ctx.lineTo(165, 420);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8f4e8';
    ctx.beginPath();
    ctx.moveTo(82, 300);
    ctx.lineTo(88, 185);
    ctx.lineTo(102, 185);
    ctx.lineTo(108, 300);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e5534b';
    ctx.fillRect(85, 205, 20, 14);
    if (!active.has('lighthouse-stripe')) ctx.fillRect(84, 248, 22, 14);
    ctx.fillStyle = '#2b3a55';
    ctx.fillRect(86, 178, 18, 10);
    ctx.fillStyle = '#ffd166';
    circle(ctx, 95, 172, 7, '#ffd166');
    ctx.fillStyle = '#2b3a55';
    ctx.fillRect(82, 158, 26, 6);

    // The pier: posts and five planks, one missing when its difference is active.
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(150, 318, 130, 10);
    for (let i = 0; i < 5; i++) {
      if (active.has('pier-plank') && i === 2) continue;
      ctx.fillRect(156 + i * 24, 318, 18, 10);
    }
    ctx.fillStyle = '#5b4636';
    ctx.fillRect(160, 328, 8, 40);
    ctx.fillRect(252, 328, 8, 40);

    // The boats: the big one's sail is coral, or teal when its difference is active.
    boat(ctx, 430, 300, 1.0, '#8b5a2b', active.has('sail-color') ? '#2ec4b6' : '#ff7b72');
    boat(ctx, 250, 335, 0.7, '#6b4a2b', '#f2c94c');

    // Buoys: the near one is orange, or yellow when its difference is active.
    circle(ctx, 350, 360, 10, active.has('buoy-color') ? '#f2c94c' : '#ff8c42');
    ctx.fillStyle = '#fff';
    ctx.fillRect(346, 356, 8, 3);
    circle(ctx, 480, 382, 9, '#e5534b');
    ctx.fillStyle = '#fff';
    ctx.fillRect(476, 378, 8, 3);

    // A fish jumps near the big boat, unless its difference hides it.
    if (!active.has('fish-missing')) fish(ctx, 500, 348, 1.0, '#7ec8e3');
    fish(ctx, 300, 378, 0.7, '#9fd8ef', true);

    // A quiet vignette so the panels read as pictures.
    const edge = ctx.createLinearGradient(0, 0, 0, H);
    edge.addColorStop(0, 'rgba(0,0,0,0.08)');
    edge.addColorStop(0.12, 'rgba(0,0,0,0)');
    edge.addColorStop(0.9, 'rgba(0,0,0,0)');
    edge.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = edge;
    ctx.fillRect(0, 0, W, H);
  },
};
