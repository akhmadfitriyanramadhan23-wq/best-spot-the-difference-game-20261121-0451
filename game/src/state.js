// The game's state: which scene is playing, what is found, the score, the streak, the timer
// and the hints. State is plain data; the renderer reads it and the input writes to it through
// the small functions here, so a click is one call and the rules live in one place.

import { HINT, LEVELS, POINTS, SCENE, SCREEN } from './config.js';
import { SCENES } from './scenes.js';

/**
 * A fresh game: title screen, first scene staged, nothing found yet. `best` is the stored best
 * score the title screen shows.
 */
export function createGame(best = 0) {
  return {
    screen: SCREEN.TITLE,
    levelIndex: 0,
    /** The scene playing now. */
    scene: SCENES[0],
    /** The ids of the differences found in this scene. */
    found: new Set(),
    /** The ids the right panel shows applied: the differences still hidden. */
    hidden: new Set(SCENES[0].differences.map((d) => d.id)),
    /** Seconds left in this scene. */
    timeLeft: LEVELS[0].timeLimit,
    score: 0,
    /** Consecutive finds with no miss: raises the multiplier. */
    streak: 0,
    hintsLeft: HINT.perScene,
    /** Seconds until another hint may be used. */
    hintCooldown: 0,
    /** The difference a hint is pointing at, and for how long, in seconds. */
    hintTarget: null,
    hintTimeLeft: 0,
    /** The newest find, for its ring pulse: {id, age}. */
    freshFind: null,
    /** A miss flash: {x, y, age} in scene space, on the panel it happened. */
    miss: null,
    /** Seconds of screen shake left after a miss. */
    shake: 0,
    /** Seconds into the scene, for the timer's tick sound. */
    elapsed: 0,
    best,
    /** The breakdown of the last cleared scene, for the scene-done screen. */
    lastClear: null,
    /** The reason the game ended, 'time' when the timer ran out. */
    overReason: null,
  };
}

/** The level table's row for the scene now playing. */
export function levelOf(game) {
  return LEVELS[game.levelIndex];
}

/** How many differences this scene hides, and how many are found. */
export function foundCount(game) {
  return game.found.size;
}

export function totalCount(game) {
  return game.scene.differences.length;
}

/** The score multiplier from the streak: x1, x2 from 2, x3 from 4. */
export function multiplier(game) {
  if (game.streak >= POINTS.streakForX3) return 3;
  if (game.streak >= POINTS.streakForX2) return 2;
  return 1;
}

/** Stage a scene by index: fresh found set, hidden set, timer and hints. */
export function stageLevel(game, levelIndex) {
  game.levelIndex = levelIndex;
  game.scene = SCENES[levelIndex];
  game.found = new Set();
  game.hidden = new Set(game.scene.differences.map((d) => d.id));
  game.timeLeft = LEVELS[levelIndex].timeLimit;
  game.hintsLeft = HINT.perScene;
  game.hintCooldown = 0;
  game.hintTarget = null;
  game.hintTimeLeft = 0;
  game.freshFind = null;
  game.miss = null;
  game.shake = 0;
  game.elapsed = 0;
  game.screen = SCREEN.PLAY;
}

/** Start the game over from the first scene, keeping the best score. */
export function startGame(game) {
  game.score = 0;
  game.streak = 0;
  game.lastClear = null;
  game.overReason = null;
  stageLevel(game, 0);
}

/** The difference at scene point (x, y) that is still hidden, or null. */
export function differenceAt(game, x, y) {
  for (const d of game.scene.differences) {
    if (game.found.has(d.id)) continue;
    const dx = x - d.x;
    const dy = y - d.y;
    if (dx * dx + dy * dy <= d.r * d.r) return d;
  }
  return null;
}

/**
 * Click a difference: mark it found on both panels, add points with the streak multiplier,
 * and return the difference. Returns null when the click found nothing.
 */
export function findDifference(game, diff) {
  game.found.add(diff.id);
  game.hidden.delete(diff.id);
  game.streak += 1;
  const gained = POINTS.find * multiplier(game);
  game.score += gained;
  game.freshFind = { id: diff.id, age: 0 };
  game.miss = null;
  return { diff, gained };
}

/** A miss: the streak breaks, the timer loses seconds and the screen shakes. */
export function missClick(game, x, y, panel) {
  game.streak = 0;
  game.timeLeft = Math.max(0, game.timeLeft - POINTS.missSeconds);
  game.miss = { x, y, panel, age: 0 };
  game.shake = 0.35;
}

/**
 * Spend a hint: point at a random still-hidden difference for a while. Returns the
 * difference, or null when no hint is left or one is cooling down.
 */
export function useHint(game, rng) {
  if (game.hintsLeft <= 0 || game.hintCooldown > 0) return null;
  const remaining = game.scene.differences.filter((d) => !game.found.has(d.id));
  if (remaining.length === 0) return null;
  const diff = remaining[Math.floor(rng() * remaining.length)];
  game.hintsLeft -= 1;
  game.hintCooldown = HINT.cooldownSeconds;
  game.hintTarget = diff.id;
  game.hintTimeLeft = HINT.showSeconds;
  game.score = Math.max(0, game.score - POINTS.hintCost);
  return diff;
}

/** Advance the timer and the short-lived effects by `dt` seconds; returns 'time' when time runs out. */
export function tick(game, dt) {
  game.elapsed += dt;
  if (game.screen !== SCREEN.PLAY) return null;
  game.timeLeft = Math.max(0, game.timeLeft - dt);
  if (game.hintCooldown > 0) game.hintCooldown = Math.max(0, game.hintCooldown - dt);
  if (game.hintTimeLeft > 0) {
    game.hintTimeLeft -= dt;
    if (game.hintTimeLeft <= 0) game.hintTarget = null;
  }
  if (game.freshFind !== null) {
    game.freshFind.age += dt;
    if (game.freshFind.age > 0.9) game.freshFind = null;
  }
  if (game.miss !== null) {
    game.miss.age += dt;
    if (game.miss.age > 0.6) game.miss = null;
  }
  if (game.shake > 0) game.shake = Math.max(0, game.shake - dt);
  if (game.timeLeft <= 0) return 'time';
  return null;
}

/** Is the scene cleared: every difference found. */
export function isSceneCleared(game) {
  return game.found.size === game.scene.differences.length;
}

/**
 * Clear the scene: the time bonus joins the score and the breakdown is kept for the
 * scene-done screen. Returns the breakdown.
 */
export function clearScene(game) {
  const timeBonus = Math.round(game.timeLeft) * POINTS.timeBonusPerSecond;
  game.score += timeBonus;
  const breakdown = {
    sceneName: game.scene.name,
    found: game.found.size,
    total: game.scene.differences.length,
    timeLeft: Math.round(game.timeLeft),
    timeBonus,
    score: game.score,
  };
  game.lastClear = breakdown;
  game.screen = SCREEN.SCENE_DONE;
  return breakdown;
}

/** Move to the next scene, or to the win screen when the last one is cleared. */
export function nextLevel(game) {
  if (game.levelIndex + 1 >= SCENES.length) {
    game.screen = SCREEN.WIN;
    return false;
  }
  stageLevel(game, game.levelIndex + 1);
  return true;
}

/** The panel geometry a scene point belongs to: 'left', 'right' or null (outside both). */
export function panelAt(fieldX, fieldY, panels) {
  const { leftX, rightX, topY, width, height } = panels;
  if (fieldY < topY || fieldY > topY + height) return null;
  if (fieldX >= leftX && fieldX <= leftX + width) return { side: 'left', x: fieldX - leftX, y: fieldY - topY };
  if (fieldX >= rightX && fieldX <= rightX + width) return { side: 'right', x: fieldX - rightX, y: fieldY - topY };
  return null;
}

/** A field point in scene space, or null when it is outside both panels. */
export function scenePointAt(fieldX, fieldY, panels) {
  const hit = panelAt(fieldX, fieldY, panels);
  if (hit === null) return null;
  return {
    side: hit.side,
    x: (hit.x / panels.width) * SCENE.width,
    y: (hit.y / panels.height) * SCENE.height,
  };
}
