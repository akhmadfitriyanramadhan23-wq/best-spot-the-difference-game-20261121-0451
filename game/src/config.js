// Every tuning number, colour and level of Twin Worlds in one place. The playfield is a fixed
// 1280x800 logical area; the renderer scales it to the window, so no rule below depends on the
// screen size. A scene is drawn in a 600x420 space, once for the left panel and once for the
// right, the right with the found differences applied.

export const FIELD = { width: 1280, height: 800 };

/** One scene panel's coordinate space. */
export const SCENE = { width: 600, height: 420 };

/** The panels' geometry inside the field: two 600x420 scenes side by side. */
export const PANELS = {
  gap: 32,
  leftX: 24,
  rightX: 656,
  topY: 96,
  width: 600,
  height: 420,
};

/** The top bar (title, level, timer, counter, score) and the bottom bar (hints, message). */
export const HUD = { height: 84 };
export const FOOTER = { topY: 540, height: 240 };

/** The fixed step the timer and the effects advance in, in seconds. */
export const STEP = 1 / 60;

/** Points for a find, what a hint costs, and what a wrong click costs in seconds. */
export const POINTS = {
  find: 100,
  hintCost: 50,
  missSeconds: 5,
  timeBonusPerSecond: 10,
  /** Consecutive finds without a miss raise the multiplier: 0-1 finds x1, 2-3 x2, 4+ x3. */
  streakForX2: 2,
  streakForX3: 4,
};

/** Hints each scene starts with, and how long one hint's ring stays on screen. */
export const HINT = { perScene: 3, showSeconds: 2.5, cooldownSeconds: 8 };

/** The scenes in play order, with the time each allows and how many differences it hides. */
export const LEVELS = [
  { scene: 'harbor', timeLimit: 150 },
  { scene: 'garden', timeLimit: 140 },
  { scene: 'library', timeLimit: 130 },
  { scene: 'oasis', timeLimit: 120 },
  { scene: 'market', timeLimit: 110 },
];

/** The screens the game moves between. */
export const SCREEN = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSED: 'paused',
  SCENE_DONE: 'scene-done',
  OVER: 'over',
  WIN: 'win',
};

export const PALETTE = {
  backdrop: '#141a26',
  panel: '#1d2436',
  panelEdge: '#39415a',
  text: '#f2f0e6',
  muted: '#9aa3b5',
  accent: '#ffd166',
  accentDark: '#e8a93d',
  good: '#7ee787',
  goodDark: '#2ea043',
  bad: '#ff7b72',
  timer: '#58a6ff',
  timerLow: '#ff7b72',
  hint: '#d2a8ff',
  marker: '#7ee787',
  markerNew: '#ffd166',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'twin-worlds.best';
