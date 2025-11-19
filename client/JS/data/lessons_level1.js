// client/js/data/lessons_level1.js

/**
 * Import shared typedefs if you like, or keep local.
 * Here we define a local LessonMeta type for clarity.
 */

/**
 * @typedef {import('./tracks.js').TrackId} TrackId
 * @typedef {import('./halls_level1.js').HallMeta['id']} HallId
 */

/**
 * @typedef {Object} LessonMeta
 * @property {string} id - Unique lesson id (stable, used in routing/state).
 * @property {TrackId} track - Content track (math, chem, lore, physeng).
 * @property {HallId} hallId - Which Grimora Hall this lesson belongs to.
 * @property {number} level - Curriculum level (1 for Initiate chapter).
 * @property {number} order - Order inside the hall/module.
 * @property {string} title - Display title for the lesson.
 * @property {string} shortSummary - 1–2 line summary for cards/lists.
 * @property {number} estimatedMinutes - Rough completion time.
 * @property {string[]} paths - Tags like "Mind", "Matter", "Motion", "Heart", "Code & Flow".
 * @property {string} filePath - Path to the markdown source for this lesson.
 * @property {string[]} [connectedLessonIds] - Optional ids for “Before / After / Related” links.
 */

/**
 * Level 1 lessons across all four Halls of Grimora.
 *
 * Used by:
 * - Hub (progress per Hall)
 * - Room views (lesson lists per Hall)
 * - Lesson router (open by id)
 *
 * Text content lives in /docs/Lessons/... as markdown.
 * This file is the structural map.
 *
 * @type {LessonMeta[]}
 */
export const LESSONS_LEVEL1 = [
  // --- Math Sanctum (Mind · Code & Flow) ---

  {
    id: 'math-l1-01-add-sub-transformations',
    track: 'math',
    hallId: 'math-sanctum',
    level: 1,
    order: 1,
    title: 'Addition & Subtraction as Opposite Transformations',
    shortSummary:
      'See addition and subtraction as opposite transformations on a quantity, like doing and undoing a move on a balanced scale.',
    estimatedMinutes: 25,
    paths: ['Mind', 'Code & Flow'],
    filePath: 'Content/Grimora_Level1/Math_Sanctum/math_l1_01_add-sub-transformations.md',
    connectedLessonIds: [
      'lore-l1-01-maat-balance-equations',
      'physeng-l1-01-forces-balance-simple-machines'
    ]
  },

  {
    id: 'math-l1-02-mult-div-scaling',
    track: 'math',
    hallId: 'math-sanctum',
    level: 1,
    order: 2,
    title: 'Multiplication & Division: Scaling and Unscaling',
    shortSummary:
      'Understand multiplication and division as scaling transformations: stretching and shrinking quantities in equal steps.',
    estimatedMinutes: 30,
    paths: ['Mind', 'Code & Flow'],
    filePath: 'Content/Grimora_Level1/Math_Sanctum/math_l1_02_mult-div-scaling.md',
    connectedLessonIds: [
      'physeng-l1-02-work-distance-mech-advantage',
      'physeng-l1-01-forces-balance-simple-machines'
    ]
  },

  {
    id: 'math-l1-03-exponents-roots',
    track: 'math',
    hallId: 'math-sanctum',
    level: 1,
    order: 3,
    title: 'Exponents & Roots: Powering Up and Revealing the Seed',
    shortSummary:
      'Meet exponents as repeated multiplication that “power up” a number, and roots as the inverse that reveals the original seed.',
    estimatedMinutes: 35,
    paths: ['Mind', 'Code & Flow'],
    filePath: 'Content/Grimora_Level1/Math_Sanctum/math_l1_03_exponents-roots.md',
    connectedLessonIds: [
      'physeng-l1-02-work-distance-mech-advantage',
      'physeng-l1-03-simple-machines-to-robotics'
    ]
  },

  // --- Matter Lab (Matter · Mind) ---

  {
    id: 'chem-l1-01-matter-elements',
    track: 'chem',
    hallId: 'matter-lab',
    level: 1,
    order: 1,
    title: 'What Is Matter? Stuff, Space, and States',
    shortSummary:
      'Define matter, explore how it takes up space and has mass, and meet simple examples across solids, liquids, and gases.',
    estimatedMinutes: 25,
    paths: ['Matter', 'Mind'],
    filePath: 'Content/Grimora_Level1/Matter_Lab/chem_l1_01_matter-elements.md',
    connectedLessonIds: [
      'chem-l1-02-states-of-matter',
      'lore-l1-02-khemia-to-chemistry-method'
    ]
  },

  {
    id: 'chem-l1-02-states-of-matter',
    track: 'chem',
    hallId: 'matter-lab',
    level: 1,
    order: 2,
    title: 'States of Matter: Solid, Liquid, Gas (and Plasma)',
    shortSummary:
      'Explore how solids, liquids, and gases behave, and how particle motion and spacing explain state changes like melting and boiling.',
    estimatedMinutes: 30,
    paths: ['Matter', 'Mind'],
    filePath: 'Content/Grimora_Level1/Matter_Lab/chem_l1_02_states-of-matter.md',
    connectedLessonIds: [
      'chem-l1-01-matter-elements',
      'chem-l1-03-atoms-molecules',
      'physeng-l1-01-forces-balance-simple-machines'
    ]
  },

  {
    id: 'chem-l1-03-atoms-molecules',
    track: 'chem',
    hallId: 'matter-lab',
    level: 1,
    order: 3,
    title: 'Atoms & Molecules: Invisible Building Blocks',
    shortSummary:
      'Meet atoms, molecules, and simple models for how they combine to form the matter we see and use every day.',
    estimatedMinutes: 35,
    paths: ['Matter', 'Mind'],
    filePath: 'Content/Grimora_Level1/Matter_Lab/chem_l1_03_atoms-molecules.md',
    connectedLessonIds: [
      'chem-l1-01-matter-elements',
      'physeng-l1-03-simple-machines-to-robotics'
    ]
  },

  // --- Hall of Ma’at (Mind · Heart) ---

  {
    id: 'lore-l1-01-maat-balance-equations',
    track: 'lore',
    hallId: 'hall-of-maat',
    level: 1,
    order: 1,
    title: 'Ma’at, Balance & Equations',
    shortSummary:
      'Use Ma’at and the image of a balance scale to understand equality, equation balance, and fair transformations in math and science.',
    estimatedMinutes: 25,
    paths: ['Mind', 'Heart'],
    filePath: 'Content/Grimora_Level1/Hall_of_Maat/lore_l1_01_maat-balance-equations.md',
    connectedLessonIds: [
      'math-l1-01-add-sub-transformations',
      'physeng-l1-01-forces-balance-simple-machines'
    ]
  },

  {
    id: 'lore-l1-02-khemia-to-chemistry-method',
    track: 'lore',
    hallId: 'hall-of-maat',
    level: 1,
    order: 2,
    title: 'From Khemia to Chemistry – Story, Experiment, Method',
    shortSummary:
      'Trace the story from Khemia and alchemy to modern chemistry and scientific method, separating myth, philosophy, and experiment.',
    estimatedMinutes: 30,
    paths: ['Mind', 'Heart'],
    filePath: 'Content/Grimora_Level1/Hall_of_Maat/lore_l1_02_khemia-to-chemistry-method.md',
    connectedLessonIds: [
      'chem-l1-01-matter-elements',
      'chem-l1-02-states-of-matter'
    ]
  },

  {
    id: 'lore-l1-03-trivium-in-science-explanations',
    track: 'lore',
    hallId: 'hall-of-maat',
    level: 1,
    order: 3,
    title: 'Trivium in Science Explanations',
    shortSummary:
      'Use Grammar, Logic, and Rhetoric to name ideas, reason clearly, and explain experiments so others can repeat and understand them.',
    estimatedMinutes: 30,
    paths: ['Mind', 'Heart'],
    filePath: 'Content/Grimora_Level1/Hall_of_Maat/lore_l1_03_trivium-in-science-explanations.md',
    connectedLessonIds: [
      'math-l1-01-add-sub-transformations',
      'physeng-l1-02-work-distance-mech-advantage',
      'physeng-l1-03-simple-machines-to-robotics'
    ]
  },

  // --- Machina Workshop (Motion · Heart · Code & Flow) ---

  {
    id: 'physeng-l1-01-forces-balance-simple-machines',
    track: 'physeng',
    hallId: 'machina-workshop',
    level: 1,
    order: 1,
    title: 'Forces, Balance & Simple Machines',
    shortSummary:
      'See forces as pushes and pulls, learn when they balance, and meet levers and ramps as simple machines that help us use force wisely.',
    estimatedMinutes: 30,
    paths: ['Motion', 'Heart', 'Code & Flow'],
    filePath:
      'Content/Grimora_Level1/Machina_Workshop/physeng_l1_01_forces-balance-simple-machines.md',
    connectedLessonIds: [
      'math-l1-01-add-sub-transformations',
      'chem-l1-02-states-of-matter',
      'lore-l1-01-maat-balance-equations'
    ]
  },

  {
    id: 'physeng-l1-02-work-distance-mech-advantage',
    track: 'physeng',
    hallId: 'machina-workshop',
    level: 1,
    order: 2,
    title: 'Work, Distance & Mechanical Advantage (Conceptual)',
    shortSummary:
      'Understand “work” as force over distance and see how simple machines trade less force for more distance (or the reverse).',
    estimatedMinutes: 35,
    paths: ['Motion', 'Heart', 'Code & Flow'],
    filePath:
      'Content/Grimora_Level1/Machina_Workshop/physeng_l1_02_work-distance-mech-advantage.md',
    connectedLessonIds: [
      'physeng-l1-01-forces-balance-simple-machines',
      'math-l1-02-mult-div-scaling',
      'math-l1-03-exponents-roots'
    ]
  },

  {
    id: 'physeng-l1-03-simple-machines-to-robotics',
    track: 'physeng',
    hallId: 'machina-workshop',
    level: 1,
    order: 3,
    title: 'From Simple Machines to Mechanisms & Robotics',
    shortSummary:
      'See how robots and complex machines are made from many simple machines plus sensors and control, linking mechanics to coding.',
    estimatedMinutes: 35,
    paths: ['Motion', 'Heart', 'Code & Flow'],
    filePath:
      'Content/Grimora_Level1/Machina_Workshop/physeng_l1_03_simple-machines-to-robotics.md',
    connectedLessonIds: [
      'physeng-l1-01-forces-balance-simple-machines',
      'physeng-l1-02-work-distance-mech-advantage',
      'chem-l1-03-atoms-molecules',
      'lore-l1-03-trivium-in-science-explanations'
    ]
  }
];
