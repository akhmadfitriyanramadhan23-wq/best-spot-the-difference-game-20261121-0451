// Input: mouse, touch and keyboard, turned into two kinds of calls: a pointer down at field
// coordinates, and an action. The game (main.js) decides what a click means on each screen;
// this file only reads the devices. `toField` converts a client point to the game's logical
// field, so clicks land where the eye sees them at any window size.

/** The actions a key can mean. */
export const ACTION = {
  CONFIRM: 'confirm',
  PAUSE: 'pause',
  HINT: 'hint',
  MUTE: 'mute',
  RESTART: 'restart',
};

/**
 * Listen on `canvas` and the keyboard. `onPointer(x, y)` fires on a pointer down with the
 * field coordinates; `onAction(action)` fires on a key. Returns a function that removes the
 * listeners.
 */
export function createInput(canvas, toField, onPointer, onAction) {
  function pointer(event) {
    event.preventDefault();
    const point = toField(event.clientX, event.clientY);
    if (point !== null) onPointer(point.x, point.y);
  }

  function key(event) {
    if (event.repeat) return;
    const code = event.code;
    if (code === 'Enter' || code === 'Space') {
      event.preventDefault();
      onAction(ACTION.CONFIRM);
    } else if (code === 'KeyP' || code === 'Escape') {
      onAction(ACTION.PAUSE);
    } else if (code === 'KeyH') {
      onAction(ACTION.HINT);
    } else if (code === 'KeyM') {
      onAction(ACTION.MUTE);
    } else if (code === 'KeyR') {
      onAction(ACTION.RESTART);
    }
  }

  canvas.addEventListener('pointerdown', pointer);
  window.addEventListener('keydown', key);
  return function detach() {
    canvas.removeEventListener('pointerdown', pointer);
    window.removeEventListener('keydown', key);
  };
}
