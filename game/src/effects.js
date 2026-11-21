// The short-lived effects: the ring that blooms on a find, the sparkle particles it throws,
// and the shake of a miss. An effect is plain data with an age; the renderer draws it and the
// loop ages it. Nothing here touches the game state.

/** A burst of sparks from a found difference: 14 particles with a velocity and a life. */
export function createBurst(x, y, rng) {
  const particles = [];
  for (let i = 0; i < 14; i++) {
    const angle = rng() * Math.PI * 2;
    const speed = 40 + rng() * 110;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      life: 0.55 + rng() * 0.35,
      age: 0,
      size: 2 + rng() * 3,
    });
  }
  return { x, y, particles, age: 0, life: 0.9 };
}

/** Age a burst by `dt` seconds; false when it is spent. */
export function ageBurst(burst, dt) {
  burst.age += dt;
  for (const p of burst.particles) {
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 160 * dt;
  }
  return burst.age < burst.life;
}

/** Draw a burst on a panel: gold sparks fading as they age. */
export function drawBurst(ctx, burst) {
  for (const p of burst.particles) {
    if (p.age >= p.life) continue;
    const alpha = 1 - p.age / p.life;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha + 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/**
 * Draw a found marker on a panel: a green ring and a check, the newest one larger and gold
 * while it blooms. `pulse` is 0..1 while the find is fresh, else 0.
 */
export function drawMarker(ctx, x, y, r, pulse) {
  const bloom = pulse > 0 ? 1 + (1 - pulse) * 0.45 : 1;
  const ringR = r * bloom;
  ctx.save();
  ctx.strokeStyle = pulse > 0 ? '#ffd166' : '#7ee787';
  ctx.lineWidth = pulse > 0 ? 4.5 : 3.5;
  ctx.beginPath();
  ctx.arc(x, y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = '#2ea043';
  ctx.lineWidth = pulse > 0 ? 4 : 3;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.45, y);
  ctx.lineTo(x - r * 0.12, y + r * 0.38);
  ctx.lineTo(x + r * 0.5, y - r * 0.35);
  ctx.stroke();
  ctx.restore();
}

/** Draw a hint ring: a dashed purple circle breathing around a difference. */
export function drawHintRing(ctx, x, y, r, time) {
  const breathe = 1 + Math.sin(time * 6) * 0.08;
  ctx.save();
  ctx.strokeStyle = '#d2a8ff';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.arc(x, y, r * breathe, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** Draw a miss: a red X where the click landed, fading with `age` (0..0.6). */
export function drawMiss(ctx, x, y, age) {
  const alpha = Math.max(0, 1 - age / 0.6);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ff7b72';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  const s = 10;
  ctx.beginPath();
  ctx.moveTo(x - s, y - s);
  ctx.lineTo(x + s, y + s);
  ctx.moveTo(x + s, y - s);
  ctx.lineTo(x - s, y + s);
  ctx.stroke();
  ctx.restore();
}
