// client/js/data/glossary_core.js

/**
 * @typedef {Object} GlossaryEntry
 * @property {string} id
 * @property {string} term
 * @property {string} simpleDefinition
 * @property {string} [notes] - Optional extra note for deeper study.
 * @property {string[]} [tags] - e.g., ['math', 'chem', 'lore', 'physeng', 'metaphor']
 */

/** @type {GlossaryEntry[]} */
export const GLOSSARY_CORE = [
  {
    id: 'maat',
    term: 'Ma’at',
    simpleDefinition:
      'In Kemet (ancient Egypt), Ma’at represents balance, truth, and right-measure in the universe and in human conduct.',
    notes:
      'In Grimora, Ma’at is used as a metaphor for balanced equations, fair systems, and responsible use of power.',
    tags: ['lore', 'metaphor']
  },
  {
    id: 'khemia',
    term: 'Khemia / Kimia',
    simpleDefinition:
      'Historical practices in Kemet and nearby regions focused on transformation of materials and self—an ancestor to what we now call alchemy and chemistry.',
    notes:
      'Grimora separates symbolic/spiritual aspects of Khemia from modern, evidence-based chemistry and engineering.',
    tags: ['lore', 'chem', 'metaphor']
  },
  {
    id: 'matter',
    term: 'Matter',
    simpleDefinition:
      'Anything that has mass and takes up space (solids, liquids, gases, and plasma).',
    tags: ['chem']
  },
  {
    id: 'force',
    term: 'Force',
    simpleDefinition:
      'A push or pull that can change an object’s motion or shape.',
    tags: ['physeng']
  },
  {
    id: 'mechanical-advantage',
    term: 'Mechanical Advantage',
    simpleDefinition:
      'When a machine lets you use a smaller force to move a load, usually by moving through a larger distance.',
    tags: ['physeng']
  },
  {
    id: 'exponent',
    term: 'Exponent',
    simpleDefinition:
      'A small raised number that tells how many times to multiply the base by itself.',
    tags: ['math']
  }
];
