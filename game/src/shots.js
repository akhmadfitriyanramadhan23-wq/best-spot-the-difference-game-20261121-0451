// The screenshot scenes behind ?shot=start|play|play2|end. Each one stages a real game state
// — a title, a mid-hunt with markers on the differences found and several still unfound, or
// the win screen after the last scene is cleared — using the game's own rules, so a frame is what a short game really looks
// like and the same seed always gives the same frame.

import { SCREEN } from './config.js';
import { clearScene, findDifference, nextLevel, stageLevel } from './state.js';

/** The differences each play shot finds, by scene id, so the markers spread over the frame. */
const PLAY_FINDS = {
  harbor: ['sun-rays', 'lighthouse-stripe', 'buoy-color'],
  library: ['clock-hands', 'book-color', 'lamp-on', 'steam'],
};

/**
 * Set `game` to the named scene (start, play, play2 or end; any other name is start) and
 * return the message line the shot shows.
 */
export function stageShot(name, game) {
  if (name === 'play') {
    stageLevel(game, 0);
    let gained = 0;
    for (const id of PLAY_FINDS.harbor) {
      const diff = game.scene.differences.find((d) => d.id === id);
      if (diff !== undefined) gained = findDifference(game, diff).gained;
    }
    game.timeLeft = 98;
    return `Found it!  +${gained}`;
  }
  if (name === 'play2') {
    stageLevel(game, 2);
    let gained = 0;
    for (const id of PLAY_FINDS.library) {
      const diff = game.scene.differences.find((d) => d.id === id);
      if (diff !== undefined) gained = findDifference(game, diff).gained;
    }
    game.timeLeft = 74;
    return `Found it!  +${gained}`;
  }
  if (name === 'end') {
    stageLevel(game, 4);
    for (const diff of game.scene.differences) findDifference(game, diff);
    game.timeLeft = 41;
    clearScene(game);
    nextLevel(game);
    return 'You found them all!';
  }
  game.screen = SCREEN.TITLE;
  return 'Click or press Enter to play';
}
