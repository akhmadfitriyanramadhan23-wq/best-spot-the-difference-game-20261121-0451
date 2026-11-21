// Boot and the one loop: input is read on every pointer and key event, the timer and the
// effects advance in fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between six screens: title, play, paused, scene done, game over and win.
//
// ?seed=N fixes the decorative random of the scenes. ?shot=start|play|play2|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice and sets
// window.__shotReady for a screenshot.
import { BEST_KEY, PANELS, SCREEN, STEP } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import { createGame, clearScene, differenceAt, findDifference, isSceneCleared, missClick, nextLevel, scenePointAt, startGame, tick, useHint } from './state.js';
import { createRenderer, HINT_BUTTON as HINT_RECT, MUTE_BUTTON as MUTE_RECT } from './render.js';
import { ACTION, createInput } from './input.js';
import { ageBurst, createBurst } from './effects.js';
import { stageShot } from './shots.js';

/** The longest frame the loop catches up on; a longer stall (a hidden tab) is dropped. */
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const hintRng = createRandom(seed);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const audio = createAudio();
const renderer = createRenderer(canvas);
const game = createGame(readBest());

/** The short-lived bursts, each tagged with the panel it burst on. */
let bursts = [];
/** The message line the footer shows. */
let message = 'Find every difference before the timer runs out.';
/** The whole second the timer last ticked at, for the low-time tick sound. */
let lastTickSecond = -1;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function announce(text) {
  status.textContent = text;
  message = text;
}

function endGame(reason) {
  game.screen = SCREEN.OVER;
  game.overReason = reason;
  if (game.score > game.best) {
    game.best = game.score;
    saveBest(game.best);
  }
  announce(`Time's up! Score ${game.score}. Best ${game.best}.`);
}

function beginPlay() {
  audio.unlock();
  audio.click();
  startGame(game);
  announce(`Playing ${game.scene.name}. Find ${game.scene.differences.length} differences!`);
}

function advance() {
  audio.click();
  if (nextLevel(game)) {
    announce(`Playing ${game.scene.name}. Find ${game.scene.differences.length} differences!`);
  } else {
    audio.win();
    if (game.score > game.best) {
      game.best = game.score;
      saveBest(game.best);
    }
    announce(`You found them all! Final score ${game.score}.`);
  }
}

function handlePointer(fieldX, fieldY) {
  audio.unlock();
  if (game.screen === SCREEN.TITLE) {
    beginPlay();
    return;
  }
  if (game.screen === SCREEN.SCENE_DONE) {
    advance();
    return;
  }
  if (game.screen === SCREEN.OVER || game.screen === SCREEN.WIN) {
    beginPlay();
    return;
  }
  if (game.screen === SCREEN.PAUSED) {
    game.screen = SCREEN.PLAY;
    announce('Playing.');
    return;
  }
  if (game.screen !== SCREEN.PLAY) return;

  // The footer buttons first: hint and mute.
  if (fieldX >= HINT_RECT.x && fieldX <= HINT_RECT.x + HINT_RECT.w && fieldY >= HINT_RECT.y && fieldY <= HINT_RECT.y + HINT_RECT.h) {
    handleHint();
    return;
  }
  if (fieldX >= MUTE_RECT.x && fieldX <= MUTE_RECT.x + MUTE_RECT.w && fieldY >= MUTE_RECT.y && fieldY <= MUTE_RECT.y + MUTE_RECT.h) {
    const muted = audio.toggle();
    announce(muted ? 'Sound off.' : 'Sound on.');
    return;
  }

  const point = scenePointAt(fieldX, fieldY, PANELS);
  if (point === null) return;
  const diff = differenceAt(game, point.x, point.y);
  if (diff !== null) {
    const { gained } = findDifference(game, diff);
    audio.found();
    for (const side of ['left', 'right']) {
      const burst = createBurst(diff.x, diff.y, hintRng);
      burst.panel = side;
      bursts.push(burst);
    }
    announce(`Found it! +${gained}`);
    if (isSceneCleared(game)) {
      audio.level();
      const clear = clearScene(game);
      announce(`${clear.sceneName} complete! Time bonus +${clear.timeBonus}.`);
    }
  } else {
    missClick(game, point.x, point.y, point.side);
    audio.wrong();
    announce('Not quite — 5 seconds lost.');
  }
}

function handleHint() {
  if (game.screen !== SCREEN.PLAY) return;
  const diff = useHint(game, hintRng);
  if (diff !== null) {
    audio.hint();
    announce(`Hint: ${diff.hint}`);
  } else if (game.hintsLeft <= 0) {
    announce('No hints left in this scene.');
  } else {
    announce('The hint is cooling down.');
  }
}

function handleAction(action) {
  audio.unlock();
  if (action === ACTION.MUTE) {
    const muted = audio.toggle();
    announce(muted ? 'Sound off.' : 'Sound on.');
    return;
  }
  if (action === ACTION.CONFIRM) {
    if (game.screen === SCREEN.TITLE || game.screen === SCREEN.OVER || game.screen === SCREEN.WIN) beginPlay();
    else if (game.screen === SCREEN.SCENE_DONE) advance();
    else if (game.screen === SCREEN.PAUSED) {
      game.screen = SCREEN.PLAY;
      announce('Playing.');
    }
    return;
  }
  if (action === ACTION.PAUSE) {
    if (game.screen === SCREEN.PLAY) {
      game.screen = SCREEN.PAUSED;
      announce('Paused.');
    } else if (game.screen === SCREEN.PAUSED) {
      game.screen = SCREEN.PLAY;
      announce('Playing.');
    }
    return;
  }
  if (action === ACTION.HINT) {
    handleHint();
    return;
  }
  if (action === ACTION.RESTART) {
    if (game.screen === SCREEN.PLAY || game.screen === SCREEN.PAUSED) {
      startGame(game);
      announce(`Playing ${game.scene.name}. Find ${game.scene.differences.length} differences!`);
    }
  }
}

function runShot(name) {
  const shotMessage = stageShot(name, game);
  message = shotMessage;
  let painted = 0;
  function paint() {
    renderer.draw(game, bursts, 0, message);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  createInput(canvas, (x, y) => renderer.toField(x, y), handlePointer, handleAction);
  let last = performance.now();
  let accumulator = 0;

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    while (accumulator >= STEP) {
      accumulator -= STEP;
      const ended = tick(game, STEP);
      if (ended === 'time') endGame('time');
      if (game.screen === SCREEN.PLAY && game.timeLeft <= 10) {
        const whole = Math.ceil(game.timeLeft);
        if (whole !== lastTickSecond) {
          lastTickSecond = whole;
          audio.tick();
        }
      }
    }
    bursts = bursts.filter((burst) => ageBurst(burst, STEP));
    renderer.draw(game, bursts, now / 1000, message);
  }

  // Leaving the tab pauses a running game rather than letting the timer run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && game.screen === SCREEN.PLAY) {
      game.screen = SCREEN.PAUSED;
      announce('Paused.');
    }
  });

  announce('Twin Worlds. Click or press Enter to play.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
