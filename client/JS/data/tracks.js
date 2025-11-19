// client/js/data/tracks.js

/**
 * @typedef {'math' | 'chem' | 'lore' | 'physeng'} TrackId
 */

/**
 * @typedef {Object} TrackMeta
 * @property {TrackId} id
 * @property {string} name
 * @property {string} description
 * @property {string} hallIdHint - Primary Hall associated with this track.
 */

/** @type {TrackMeta[]} */
export const TRACKS = [
  {
    id: 'math',
    name: 'Math Sanctum',
    description:
      'Symbolic “spells” of quantity and pattern. Operations as transformations, scaling, and power.',
    hallIdHint: 'math-sanctum'
  },
  {
    id: 'chem',
    name: 'Matter Lab',
    description:
      'States, elements, and building blocks of matter. Bridges Khemia lore to modern chemistry.',
    hallIdHint: 'matter-lab'
  },
  {
    id: 'lore',
    name: 'Hall of Ma’at',
    description:
      'Khemia, Ma’at, and Trivium. Story, balance, and clear explanations that support all other paths.',
    hallIdHint: 'hall-of-maat'
  },
  {
    id: 'physeng',
    name: 'Machina Workshop',
    description:
      'Forces, simple machines, and proto-robotics. The movement and builds that emerge from math and matter.',
    hallIdHint: 'machina-workshop'
  }
];
