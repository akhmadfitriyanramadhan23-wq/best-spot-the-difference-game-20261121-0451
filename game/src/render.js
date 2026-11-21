// The renderer: everything the eye sees. The field is 1280x800 logical pixels, scaled to the
// window. Each scene is painted once per change onto two offscreen panels (left: the original,
// right: the differences still hidden), and every frame blits them and paints the markers, the
// HUD, the footer and the screen's overlay on top.

import { FIELD, FONT, FOOTER, HUD, PANELS, PALETTE, SCENE, SCREEN } from './config.js';
import { foundCount, levelOf, multiplier, totalCount } from './state.js';
import { SCENES } from './scenes.js';
import { drawBurst, drawHintRing, drawMarker, drawMiss } from './effects.js';

/** The hint button's rectangle in field coordinates, for click hit-testing. */
export const HINT_BUTTON = { x: 1016, y: 566, w: 120, h: 40 };
/** The mute button's rectangle in field coordinates. */
export const MUTE_BUTTON = { x: 1150, y: 566, w: 106, h: 40 };

/**
 * A renderer for `canvas`. `draw(game, bursts, now, message)` paints the current screen;
 * `toField(clientX, clientY)` turns a pointer point into field coordinates, or null when it
 * falls outside the field.
 */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  /** The scale and offset that centre the field in the window. */
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  /** The offscreen panels and the key of what they show. */
  let panelKey = '';
  let leftPanel = null;
  let rightPanel = null;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    scale = Math.min(w / FIELD.width, h / FIELD.height);
    offsetX = (w - FIELD.width * scale) / 2;
    offsetY = (h - FIELD.height * scale) / 2;
  }

  function toField(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left - offsetX) / scale;
    const y = (clientY - rect.top - offsetY) / scale;
    if (x < 0 || y < 0 || x > FIELD.width || y > FIELD.height) return null;
    return { x, y };
  }

  /** Paint a scene to a fresh 600x420 canvas with `active` differences applied. */
  function paintPanel(scene, active) {
    const panel = document.createElement('canvas');
    panel.width = SCENE.width;
    panel.height = SCENE.height;
    scene.draw(panel.getContext('2d'), active);
    return panel;
  }

  /** The panels for this game state, re-painted when the scene or the hidden set changes. */
  function panelsFor(game) {
    const key = `${game.scene.id}|${[...game.hidden].sort().join(',')}`;
    if (key !== panelKey || leftPanel === null || rightPanel === null) {
      panelKey = key;
      leftPanel = paintPanel(game.scene, new Set());
      rightPanel = paintPanel(game.scene, game.hidden);
    }
    return { left: leftPanel, right: rightPanel };
  }

  /** A centred card: a dark panel with a title, lines of text and a prompt. */
  function card(title, lines, prompt, titleColor = PALETTE.text) {
    const w = 640;
    const h = 150 + lines.length * 36;
    const x = (FIELD.width - w) / 2;
    const y = (FIELD.height - h) / 2 - 20;
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 24, 0.82)';
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 18);
    ctx.fill();
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = titleColor;
    ctx.font = `700 44px ${FONT}`;
    ctx.fillText(title, FIELD.width / 2, y + 66);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `400 21px ${FONT}`;
    lines.forEach((line, i) => ctx.fillText(line, FIELD.width / 2, y + 116 + i * 36));
    if (prompt !== '') {
      ctx.fillStyle = PALETTE.accent;
      ctx.font = `600 20px ${FONT}`;
      ctx.fillText(prompt, FIELD.width / 2, y + h - 26);
    }
    ctx.restore();
  }

  /** The top bar: title, scene and level dots, timer bar, score. */
  function drawHud(game) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `800 30px ${FONT}`;
    ctx.fillText('TWIN WORLDS', 24, 44);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `400 17px ${FONT}`;
    ctx.fillText('spot the difference', 24, 68);

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `600 22px ${FONT}`;
    ctx.fillText(`${game.scene.name}  ·  Scene ${game.levelIndex + 1} of 5`, FIELD.width / 2, 40);
    for (let i = 0; i < 5; i++) {
      ctx.fillStyle = i < game.levelIndex ? PALETTE.good : i === game.levelIndex ? PALETTE.accent : '#39415a';
      ctx.beginPath();
      ctx.arc(FIELD.width / 2 - 44 + i * 22, 62, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 26px ${FONT}`;
    ctx.fillText(`Score ${game.score}`, FIELD.width - 24, 44);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `400 16px ${FONT}`;
    ctx.fillText(`Best ${game.best}`, FIELD.width - 24, 68);

    // The timer bar drains across the panel width; red under thirty seconds.
    const limit = levelOf(game).timeLimit;
    const frac = Math.max(0, game.timeLeft / limit);
    ctx.fillStyle = '#2a3040';
    ctx.fillRect(24, 86, FIELD.width - 48, 7);
    ctx.fillStyle = game.timeLeft <= 30 ? PALETTE.timerLow : PALETTE.timer;
    ctx.fillRect(24, 86, (FIELD.width - 48) * frac, 7);
    ctx.restore();
  }

  /** The footer: found counter with dots, hints, streak, buttons and the message line. */
  function drawFooter(game, message) {
    const y = FOOTER.topY;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `700 24px ${FONT}`;
    const left = totalCount(game) - foundCount(game);
    ctx.fillText(`Found ${foundCount(game)} / ${totalCount(game)}  ·  ${left} left`, 24, y + 30);
    game.scene.differences.forEach((d, i) => {
      ctx.fillStyle = game.found.has(d.id) ? PALETTE.good : '#39415a';
      ctx.beginPath();
      ctx.arc(24 + i * 26 + 8, y + 52, 7, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.fillStyle = PALETTE.muted;
    ctx.font = `400 17px ${FONT}`;
    ctx.fillText(game.scene.tagline, 24, y + 92);
    ctx.fillText('Click a difference on either picture  ·  H hint  ·  P pause  ·  M sound  ·  R restart', 24, y + 122);

    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `600 20px ${FONT}`;
    ctx.fillText(message, FIELD.width / 2, y + 30);
    const mult = multiplier(game);
    if (mult > 1 && game.screen === SCREEN.PLAY) {
      ctx.fillStyle = PALETTE.accent;
      ctx.font = `700 20px ${FONT}`;
      ctx.fillText(`Streak x${mult}`, FIELD.width / 2, y + 62);
    }

    // Hint and mute buttons.
    ctx.fillStyle = game.hintsLeft > 0 && game.hintCooldown <= 0 ? '#3a2f5a' : '#252b38';
    ctx.strokeStyle = PALETTE.hint;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(HINT_BUTTON.x, HINT_BUTTON.y, HINT_BUTTON.w, HINT_BUTTON.h, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.hint;
    ctx.font = `600 17px ${FONT}`;
    ctx.fillText(`Hint (${game.hintsLeft})`, HINT_BUTTON.x + HINT_BUTTON.w / 2, HINT_BUTTON.y + 26);

    ctx.fillStyle = '#252b38';
    ctx.strokeStyle = PALETTE.muted;
    ctx.beginPath();
    ctx.roundRect(MUTE_BUTTON.x, MUTE_BUTTON.y, MUTE_BUTTON.w, MUTE_BUTTON.h, 9);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = PALETTE.text;
    ctx.fillText('Sound', MUTE_BUTTON.x + MUTE_BUTTON.w / 2, MUTE_BUTTON.y + 26);
    ctx.restore();
  }

  /** The two panels with their frames, markers, hint ring, miss and bursts. */
  function drawPanels(game, bursts, now) {
    const { left, right } = panelsFor(game);
    const shakeX = game.shake > 0 ? (Math.random() - 0.5) * 10 * game.shake : 0;
    const shakeY = game.shake > 0 ? (Math.random() - 0.5) * 10 * game.shake : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    for (const [panel, x] of [[left, PANELS.leftX], [right, PANELS.rightX]]) {
      ctx.drawImage(panel, x, PANELS.topY);
      ctx.strokeStyle = PALETTE.panelEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, PANELS.topY, PANELS.width, PANELS.height);
    }
    // Found markers on both panels; the newest blooms gold.
    for (const d of game.scene.differences) {
      if (!game.found.has(d.id)) continue;
      const fresh = game.freshFind !== null && game.freshFind.id === d.id;
      const pulse = fresh ? 1 - game.freshFind.age / 0.9 : 0;
      for (const x of [PANELS.leftX, PANELS.rightX]) {
        drawMarker(ctx, x + d.x, PANELS.topY + d.y, d.r, pulse);
      }
    }
    // A hint's ring on both panels, and a miss X where the click landed.
    if (game.hintTarget !== null) {
      const d = game.scene.differences.find((item) => item.id === game.hintTarget);
      if (d !== undefined) {
        for (const x of [PANELS.leftX, PANELS.rightX]) drawHintRing(ctx, x + d.x, PANELS.topY + d.y, d.r, now);
      }
    }
    if (game.miss !== null) {
      const baseX = game.miss.panel === 'left' ? PANELS.leftX : PANELS.rightX;
      drawMiss(ctx, baseX + game.miss.x, PANELS.topY + game.miss.y, game.miss.age);
    }
    for (const burst of bursts) {
      const baseX = burst.panel === 'left' ? PANELS.leftX : PANELS.rightX;
      ctx.save();
      ctx.translate(baseX, PANELS.topY);
      drawBurst(ctx, burst);
      ctx.restore();
    }
    ctx.restore();
  }

  /** The title screen: the first scene dimmed behind a card that explains the game. */
  function drawTitle(game) {
    drawPanels(game, [], 0);
    ctx.save();
    ctx.fillStyle = 'rgba(10, 14, 24, 0.62)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.restore();
    card(
      'TWIN WORLDS',
      [
        'Two pictures, side by side — almost the same.',
        'Find every difference before the timer runs out.',
        'Five scenes, eight differences each. Wrong clicks cost 5 seconds.',
        'Hints help, but they cost 50 points. Streaks multiply your score.',
      ],
      game.best > 0 ? `Best score ${game.best}  ·  Click or press Enter to play` : 'Click or press Enter to play',
      PALETTE.accent,
    );
  }

  function draw(game, bursts, now, message) {
    resize();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, dpr * offsetX, dpr * offsetY);

    if (game.screen === SCREEN.TITLE) {
      drawTitle(game);
      return;
    }
    drawHud(game);
    drawPanels(game, bursts, now);
    drawFooter(game, message);

    if (game.screen === SCREEN.PAUSED) {
      ctx.fillStyle = 'rgba(10, 14, 24, 0.6)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      card('PAUSED', ['Take a breath. The timer is waiting.'], 'P or Esc to resume');
    } else if (game.screen === SCREEN.SCENE_DONE && game.lastClear !== null) {
      ctx.fillStyle = 'rgba(10, 14, 24, 0.55)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      const clear = game.lastClear;
      card('SCENE COMPLETE!', [
        `${clear.sceneName}: all ${clear.total} differences found.`,
        `Time left ${clear.timeLeft}s  ·  Time bonus +${clear.timeBonus}`,
        `Score ${clear.score}`,
      ], game.levelIndex + 1 >= SCENES.length ? 'Click or press Enter to see your results' : 'Click or press Enter for the next scene', PALETTE.good);
    } else if (game.screen === SCREEN.OVER) {
      ctx.fillStyle = 'rgba(10, 14, 24, 0.6)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      card('TIME’S UP!', [
        `${game.scene.name}: ${foundCount(game)} of ${totalCount(game)} differences found.`,
        `Score ${game.score}  ·  Best ${game.best}`,
      ], 'Click or press Enter to try again', PALETTE.bad);
    } else if (game.screen === SCREEN.WIN) {
      ctx.fillStyle = 'rgba(10, 14, 24, 0.6)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      card('YOU FOUND THEM ALL!', [
        'Five scenes, forty differences, every one of them spotted.',
        `Final score ${game.score}  ·  Best ${game.best}`,
      ], 'Click or press Enter to play again', PALETTE.accent);
    }
  }

  return { draw, toField, resize };
}
