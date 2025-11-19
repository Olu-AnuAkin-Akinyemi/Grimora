// client/js/data/halls_level1.js

/**
 * @typedef {'math-sanctum' | 'matter-lab' | 'hall-of-maat' | 'machina-workshop'} HallId
 */

/**
 * @typedef {Object} HallMeta
 * @property {HallId} id
 * @property {string} name
 * @property {string} subtitle
 * @property {string[]} paths - High-level path tags (“Mind”, “Matter”, “Motion”, “Heart”, “Code & Flow”).
 * @property {string} description
 * @property {string} sigilName - Key for whatever icon/sigil set you use later.
 */

/** @type {HallMeta[]} */
export const HALLS_LEVEL1 = [
  {
    id: 'math-sanctum',
    name: 'Math Sanctum',
    subtitle: 'Spells of number and pattern',
    paths: ['Mind', 'Code & Flow'],
    description:
      'Lessons on operations as transformations: opposites, scaling, and power, forming the symbolic language behind all later engineering.',
    sigilName: 'sigil-math-sanctum'
  },
  {
    id: 'matter-lab',
    name: 'Matter Lab',
    subtitle: 'States, stuff, and building blocks',
    paths: ['Matter', 'Mind'],
    description:
      'Lessons on matter, states, and atoms/molecules, linking ancient Khemia lore with modern chemistry basics.',
    sigilName: 'sigil-matter-lab'
  },
  {
    id: 'hall-of-maat',
    name: 'Hall of Ma’at',
    subtitle: 'Balance, story, and clear speech',
    paths: ['Mind', 'Heart'],
    description:
      'Lore lessons on Ma’at, Khemia→Chemistry, and the Trivium—how we name, reason, and explain what we discover.',
    sigilName: 'sigil-hall-of-maat'
  },
  {
    id: 'machina-workshop',
    name: 'Machina Workshop',
    subtitle: 'Forces, machines, and proto-robots',
    paths: ['Motion', 'Heart', 'Code & Flow'],
    description:
      'Physics + engineering lessons: forces, simple machines, work, and how mechanisms grow into robotics.',
    sigilName: 'sigil-machina-workshop'
  }
];
