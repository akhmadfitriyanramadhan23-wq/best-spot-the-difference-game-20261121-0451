// The scene registry: the five scenes in play order, looked up by id. A scene is an object
// with an id, a name, a tagline, a seed, a draw(ctx, active) and its differences. Adding a
// scene is adding one file and one line here.

import { harborScene } from './scene-harbor.js';
import { gardenScene } from './scene-garden.js';
import { libraryScene } from './scene-library.js';
import { oasisScene } from './scene-oasis.js';
import { marketScene } from './scene-market.js';

/** Every scene, in the order the game plays them. */
export const SCENES = [harborScene, gardenScene, libraryScene, oasisScene, marketScene];

/** A scene by its id, or undefined. */
export function sceneById(id) {
  return SCENES.find((scene) => scene.id === id);
}
