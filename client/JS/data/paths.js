// client/js/data/paths.js

/**
 * @typedef {'mind' | 'matter' | 'motion' | 'heart' | 'code-flow'} PathId
 */

/**
 * @typedef {Object} PathMeta
 * @property {PathId} id
 * @property {string} name
 * @property {string} description
 */

/** Core learning “paths” used as tags on Halls and Lessons. */
/** @type {PathMeta[]} */
export const PATHS = [
  {
    id: 'mind',
    name: 'Mind',
    description:
      'Thinking, patterns, logic, and symbolic understanding. Where math and reasoning live.'
  },
  {
    id: 'matter',
    name: 'Matter',
    description:
      'Physical stuff, states, and building blocks. How Khemia and chemistry meet.'
  },
  {
    id: 'motion',
    name: 'Motion',
    description:
      'Forces, balance, movement, and mechanisms. The dynamics behind machines and robotics.'
  },
  {
    id: 'heart',
    name: 'Heart',
    description:
      'Values, balance, intention, and reflection. Where Ma’at and “alchemy of self” live.'
  },
  {
    id: 'code-flow',
    name: 'Code & Flow',
    description:
      'Information, logic structures, and future coding. How patterns become instructions and systems.'
  }
];
