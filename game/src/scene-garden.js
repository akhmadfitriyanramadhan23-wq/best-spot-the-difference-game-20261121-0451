// Moonlit Garden: the second scene, a little harder. A walled garden at night: a cratered
// moon, a fountain, tulips, a cat on the wall, fireflies and a hanging lantern. Same contract
// as the harbor: `draw(ctx, active)` paints it, `active` the differences applied to this panel.

import { SCENE } from './config.js';
import { createRandom, range } from './random.js';
import { circle, cloud, ellipse, flower, star } from './draw.js';

/** The seed for this scene's decoration, so both panels match exactly. */
const SEED = 23;

/** This scene's eight differences, each with its click target in scene space. */
export const differences = [
  { id: 'moon-crater', x: 95, y: 75, r: 38, hint: 'Look closely at the moon.' },
  { id: 'star-missing', x: 420, y: 50, r: 22, hint: 'A bright star is gone.' },
  { id: 'fountain-color', x: 300, y: 285, r: 30, hint: 'The fountain’s water.' },
  { id: 'tulip-color', x: 180, y: 372, r: 22, hint: 'One tulip changed colour.' },
  { id: 'cat-tail', x: 520, y: 298, r: 26, hint: 'The cat’s tail.' },
  { id: 'firefly-count', x: 250, y: 180, r: 22, hint: 'Count the fireflies.' },
  { id: 'lantern-lit', x: 470, y: 150, r: 24, hint: 'The hanging lantern.' },
  { id: 'tree-branch', x: 80, y: 200, r: 26, hint: 'The tree’s branches.' },
];

export const gardenScene = {
  id: 'garden',
  name: 'Moonlit Garden',
  tagline: 'The garden keeps its secrets after dark.',
  seed: SEED,
  differences,
  draw(ctx, active) {
    const W = SCENE.width;
    const H = SCENE.height;
    const rng = createRandom(SEED);

    // Night sky, then the lawn and the garden wall.
    const sky = ctx.createLinearGradient(0, 0, 0, 300);
    sky.addColorStop(0, '#0d1530');
    sky.addColorStop(0.7, '#1b2a52');
    sky.addColorStop(1, '#2c3e6b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, 300);
    ctx.fillStyle = '#2f5d3a';
    ctx.fillRect(0, 300, W, H - 300);
    ctx.fillStyle = '#274b31';
    ctx.fillRect(0, 300, W, 10);

    // Stars from the seed: the bright one is gone when its difference is active.
    for (let i = 0; i < 46; i++) {
      const x = range(rng, 12, W - 12);
      const y = range(rng, 12, 250);
      const r = range(rng, 1, 2.4);
      star(ctx, x, y, r * 2.4, r, 4, 'rgba(255,255,220,0.9)');
    }
    if (!active.has('star-missing')) star(ctx, 420, 50, 9, 3.5, 4, '#fffbe0');

    // The moon: two craters, or three when its difference is active.
    circle(ctx, 95, 75, 42, '#f4ead2');
    circle(ctx, 95, 75, 42, 'rgba(244,234,210,0.25)');
    circle(ctx, 82, 62, 8, '#d9cba6');
    circle(ctx, 108, 88, 6, '#d9cba6');
    if (active.has('moon-crater')) circle(ctx, 100, 58, 5, '#d9cba6');

    // A thin cloud crossing the moonlight.
    cloud(ctx, 300, 48, 0.9, '#8fa3c8', 0.5);

    // The old tree on the left: a branch more, or one fewer, when active.
    ctx.save();
    ctx.strokeStyle = '#4a3226';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(80, 310);
    ctx.quadraticCurveTo(70, 250, 82, 200);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(78, 250);
    ctx.quadraticCurveTo(50, 225, 38, 205);
    ctx.stroke();
    if (!active.has('tree-branch')) {
      ctx.beginPath();
      ctx.moveTo(80, 232);
      ctx.quadraticCurveTo(108, 210, 122, 192);
      ctx.stroke();
    }
    ctx.restore();
    circle(ctx, 82, 185, 34, '#2c5d3a');
    circle(ctx, 55, 205, 24, '#356b44');
    circle(ctx, 110, 205, 24, '#356b44');

    // The fountain: a stone basin, a middle jet and a ring of water.
    ctx.fillStyle = '#8a8f98';
    ellipse(ctx, 300, 330, 92, 20, '#8a8f98');
    ctx.fillStyle = '#6b7280';
    ellipse(ctx, 300, 326, 78, 15, '#6b7280');
    ctx.fillStyle = active.has('fountain-color') ? '#2ec4b6' : '#7ec8e3';
    ellipse(ctx, 300, 324, 68, 12, active.has('fountain-color') ? '#2ec4b6' : '#7ec8e3');
    ctx.strokeStyle = active.has('fountain-color') ? '#2ec4b6' : '#a8dcf0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(300, 322);
    ctx.quadraticCurveTo(282, 292, 268, 300);
    ctx.moveTo(300, 322);
    ctx.quadraticCurveTo(318, 292, 332, 300);
    ctx.moveTo(300, 322);
    ctx.lineTo(300, 292);
    ctx.stroke();
    ctx.fillStyle = '#9aa0ab';
    ctx.fillRect(294, 322, 12, 14);

    // Fireflies: six drifting lights, or five when one is hidden.
    const flies = [[150, 160], [250, 180], [330, 150], [410, 210], [210, 240], [470, 250]];
    for (let i = 0; i < flies.length; i++) {
      if (active.has('firefly-count') && i === 1) continue;
      const [fx, fy] = flies[i];
      circle(ctx, fx, fy, 3.5, '#ffe66d');
      circle(ctx, fx, fy, 8, 'rgba(255,230,109,0.25)');
    }

    // The hanging lantern: lit and glowing, or dark when active.
    ctx.strokeStyle = '#4a3226';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(470, 110);
    ctx.lineTo(470, 132);
    ctx.stroke();
    ctx.fillStyle = '#3a2f28';
    ctx.beginPath();
    ctx.moveTo(462, 132);
    ctx.lineTo(478, 132);
    ctx.lineTo(476, 168);
    ctx.lineTo(464, 168);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = active.has('lantern-lit') ? '#4a4038' : '#ffd166';
    ctx.fillRect(465, 138, 10, 24);
    if (!active.has('lantern-lit')) circle(ctx, 470, 150, 18, 'rgba(255,209,102,0.22)');

    // Tulips along the lawn: one is yellow instead of red when active.
    const tulips = [60, 120, 180, 240, 360, 420, 480, 540];
    for (const tx of tulips) {
      const petal = active.has('tulip-color') && tx === 180 ? '#ffd166' : '#e5534b';
      flower(ctx, tx, 372, 1.0, petal, '#ffd166');
    }

    // The cat on the wall, right: tail up, or curled down when active.
    ctx.fillStyle = '#2b2b33';
    ellipse(ctx, 520, 308, 26, 15, '#2b2b33');
    circle(ctx, 540, 292, 11, '#2b2b33');
    ctx.beginPath();
    ctx.moveTo(532, 284);
    ctx.lineTo(534, 274);
    ctx.lineTo(540, 282);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(544, 283);
    ctx.lineTo(548, 274);
    ctx.lineTo(551, 282);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2b2b33';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (active.has('cat-tail')) {
      ctx.moveTo(498, 306);
      ctx.quadraticCurveTo(486, 316, 492, 324);
    } else {
      ctx.moveTo(498, 306);
      ctx.quadraticCurveTo(482, 296, 480, 280);
    }
    ctx.stroke();
    circle(ctx, 543, 290, 1.8, '#ffd166');
  },
};
