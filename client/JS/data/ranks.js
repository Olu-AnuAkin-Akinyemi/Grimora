// client/js/data/ranks.js

/**
 * @typedef {'initiate' | 'acolyte' | 'knight' | 'ranger' | 'guardian'} RankId
 */

/**
 * @typedef {Object} RankMeta
 * @property {RankId} id
 * @property {string} name
 * @property {number} order - Lower means earlier in the path.
 * @property {string} description
 * @property {boolean} visibleInUI - Whether this rank is visible at Level 1.
 */

/** Rank ladder for KemKnightRanger Academy (KRA). */
/** @type {RankMeta[]} */
export const RANKS = [
  {
    id: 'initiate',
    name: 'Initiate',
    order: 1,
    description:
      'First contact with Grimora. Foundations in math, matter, Ma’at, and simple machines.',
    visibleInUI: true
  },
  {
    id: 'acolyte',
    name: 'Acolyte',
    order: 2,
    description:
      'Deeper practice, more complex builds, and increased responsibility. Hinted but not yet unlocked in Level 1.',
    visibleInUI: false
  },
  {
    id: 'knight',
    name: 'Knight',
    order: 3,
    description:
      'Can wield tools responsibly. Future rank for learners who have mastered multiple paths.',
    visibleInUI: false
  },
  {
    id: 'ranger',
    name: 'Ranger',
    order: 4,
    description:
      'Moves between domains and paths, connecting ideas across systems and communities.',
    visibleInUI: false
  },
  {
    id: 'guardian',
    name: 'Guardian',
    order: 5,
    description:
      'Mentor and protector. Extends and stewards the knowledge for others.',
    visibleInUI: false
  }
];
