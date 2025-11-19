// client/js/data/roadmap_level1.js

/**
 * @typedef {Object} RoadmapStep
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string[]} lessonIds - Core lessons associated with this step.
 */

/**
 * High-level roadmap for Grimora Level 1 (Initiate).
 *
 * This is more “chapter level” than per-lesson detail.
 *
 * @type {RoadmapStep[]}
 */
export const ROADMAP_LEVEL1 = [
  {
    id: 'step-1-foundations-of-balance',
    title: 'Foundations of Balance',
    description:
      'Meet Ma’at, equation balance, and basic operations as opposite transformations. Learn what matter is and how forces act on it.',
    lessonIds: [
      'lore-l1-01-maat-balance-equations',
      'math-l1-01-add-sub-transformations',
      'chem-l1-01-matter-elements',
      'physeng-l1-01-forces-balance-simple-machines'
    ]
  },
  {
    id: 'step-2-scaling-and-states',
    title: 'Scaling & States',
    description:
      'Explore scaling via multiplication/division, states of matter, and how simple machines trade force for distance.',
    lessonIds: [
      'math-l1-02-mult-div-scaling',
      'chem-l1-02-states-of-matter',
      'physeng-l1-02-work-distance-mech-advantage'
    ]
  },
  {
    id: 'step-3-power-and-building-blocks',
    title: 'Power & Building Blocks',
    description:
      'Learn about exponents and roots, atoms and molecules, and how combinations of simple machines grow into mechanisms and robotics.',
    lessonIds: [
      'math-l1-03-exponents-roots',
      'chem-l1-03-atoms-molecules',
      'physeng-l1-03-simple-machines-to-robotics'
    ]
  },
  {
    id: 'step-4-story-and-clear-explanations',
    title: 'Story & Clear Explanations',
    description:
      'Trace Khemia to chemistry and practice the Trivium—naming, reasoning, and explaining—in your own words across math, matter, and machines.',
    lessonIds: [
      'lore-l1-02-khemia-to-chemistry-method',
      'lore-l1-03-trivium-in-science-explanations'
    ]
  }
];
