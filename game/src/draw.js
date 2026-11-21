// The shapes the scenes share, drawn in a scene's 600x420 space: a rounded rectangle, a star,
// a cloud, a bird, a flower, a pine, a boat and a fish. Every helper takes the context and the
// numbers it needs and nothing else, so a scene reads as a list of what is in it.

/** Start a path that is a rectangle with rounded corners. */
export function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** Fill a rounded rectangle. */
export function roundRect(ctx, x, y, w, h, r, fill) {
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Fill a circle. */
export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Fill an ellipse. */
export function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Fill a star of `points` points, outer radius `rOuter`, inner radius `rInner`. */
export function star(ctx, x, y, rOuter, rInner, points, fill) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? rOuter : rInner;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** A soft cloud of three circles and a base, at opacity `alpha`. */
export function cloud(ctx, x, y, s, fill, alpha = 0.9) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y - 8 * s, 22 * s, 0, Math.PI * 2);
  ctx.arc(x + 42 * s, y, 18 * s, 0, Math.PI * 2);
  ctx.arc(x + 20 * s, y + 6 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A gull in flight: two arcs meeting at the middle, `s` its wingspan. */
export function bird(ctx, x, y, s, stroke, width = 2.5) {
  ctx.save();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s / 2, y - s * 0.7, x, y);
  ctx.quadraticCurveTo(x + s / 2, y - s * 0.7, x + s, y);
  ctx.stroke();
  ctx.restore();
}

/** A simple five-petal flower on a stem. */
export function flower(ctx, x, y, s, petal, centre) {
  ctx.save();
  ctx.strokeStyle = '#2f7d4f';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 22 * s);
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 - Math.PI / 2;
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * 7 * s, y + Math.sin(a) * 7 * s, 6 * s, 0, Math.PI * 2);
    ctx.fill();
  }
  circle(ctx, x, y, 5 * s, centre);
  ctx.restore();
}

/** A pine tree: three stacked triangles and a trunk. */
export function pine(ctx, x, y, h, green, trunk = '#6b4a2b') {
  ctx.save();
  ctx.fillStyle = trunk;
  ctx.fillRect(x - 4, y, 8, 14);
  ctx.fillStyle = green;
  const widths = [h * 0.52, h * 0.42, h * 0.3];
  const tops = [y - h * 0.28, y - h * 0.58, y - h * 0.88];
  for (let i = 0; i < 3; i++) {
    const w = widths[i];
    const top = tops[i];
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x - w / 2, top + h * 0.34);
    ctx.lineTo(x + w / 2, top + h * 0.34);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** A little sailboat: hull, mast and a triangular sail of `sail` colour. */
export function boat(ctx, x, y, s, hull, sail) {
  ctx.save();
  ctx.fillStyle = hull;
  ctx.beginPath();
  ctx.moveTo(x - 26 * s, y);
  ctx.lineTo(x + 26 * s, y);
  ctx.lineTo(x + 18 * s, y + 12 * s);
  ctx.lineTo(x - 18 * s, y + 12 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#5b4636';
  ctx.lineWidth = 2.5 * s;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y - 34 * s);
  ctx.stroke();
  ctx.fillStyle = sail;
  ctx.beginPath();
  ctx.moveTo(x + 2, y - 32 * s);
  ctx.lineTo(x + 2, y - 2);
  ctx.lineTo(x + 24 * s, y - 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** A jumping fish: an ellipse body, a tail triangle and an eye. */
export function fish(ctx, x, y, s, body, flip = false) {
  ctx.save();
  ctx.translate(x, y);
  if (flip) ctx.scale(-1, 1);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.ellipse(0, 0, 16 * s, 8 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-14 * s, 0);
  ctx.lineTo(-26 * s, -9 * s);
  ctx.lineTo(-26 * s, 9 * s);
  ctx.closePath();
  ctx.fill();
  circle(ctx, 7 * s, -2 * s, 1.8 * s, '#1c2733');
  ctx.restore();
}

/** A lit window: a frame with warm panes, or dark panes when `lit` is false. */
export function windowPane(ctx, x, y, w, h, lit) {
  roundRect(ctx, x, y, w, h, 3, '#3a2f28');
  ctx.fillStyle = lit ? '#ffd166' : '#2b3a55';
  ctx.fillRect(x + 3, y + 3, w - 6, h - 6);
  ctx.strokeStyle = '#3a2f28';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 3);
  ctx.lineTo(x + w / 2, y + h - 3);
  ctx.moveTo(x + 3, y + h / 2);
  ctx.lineTo(x + w - 3, y + h / 2);
  ctx.stroke();
}
