# Grimora

> *A living spellbook, as your companion*

**Grimora** is a digital grimoire—a structured learning companion for students of the **KemKnightRanger Academy (KRA)**. It weaves together mathematics, chemistry, physics, and engineering with the historical and philosophical roots of science in African alchemy (Khemia/Kimia) and the principle of Ma'at (balance, truth, and order).

---

## 🌟 Vision

Grimora transforms STEM education into an immersive journey where:
- **Mathematics** becomes symbolic "spells" of quantity and pattern
- **Chemistry** reveals the transformation of matter
- **Physics & Engineering** demonstrate applied motion, force, and design
- **Khemia/Alchemy lore** provides historical and philosophical context

This is not a gamified point-chasing app—it's a **living spellbook** that helps learners bring order to chaos and create with awareness, discipline, and curiosity.

---

## 🎯 Target Audience

**Age Range:** 13+ (8th grade through adult re-learners)

**Reading Level:** 7th–10th grade, with optional deeper study notes

**Personas:**

- **Young Initiates (13-16):** Curious students who want science to feel alive and meaningful
- **Returning Learners (17+):** Adults re-learning foundational concepts with renewed purpose
- **Guides/Mentors:** Teachers, parents, and tutors supporting learners

---

## 📚 Level 1: Initiate Chapter

### Four Halls of Grimora

**Level 1** introduces core foundations through four thematic "Halls":

#### 1. **Math Sanctum** 🔢

**Operations as Transformations**

- Addition ↔ Subtraction as opposite transformations
- Multiplication ↔ Division as scaling & unscaling
- Exponents ↔ Roots as "powering up" & "revealing the seed"

#### 2. **Matter Lab** ⚗️

**Matter & Elements**

- Understanding matter, mass, and volume
- States of matter (solid, liquid, gas, plasma)
- Atoms, molecules, and the periodic table

#### 3. **Hall of Ma'at** ⚖️

**Balance, Truth & Clear Thinking**

- Ma'at as a principle of balance and order
- The Trivium (Grammar, Logic, Rhetoric) in scientific thinking
- From Khemia to Chemistry: historical evolution

#### 4. **Machina Workshop** ⚙️

**Forces & Simple Machines**

- Understanding forces as pushes and pulls
- Balance vs. imbalance in physical systems
- Simple machines (lever, ramp, pulley, wheel)

---

## 🏗️ Project Structure

```text
Grimora/
├── client/                    # Front-end application
│   ├── index.html            # Entry point
│   ├── CSS/                  # Stylesheets
│   ├── JS/
│   │   ├── app/              # Application orchestration
│   │   ├── core/             # Pure logic (math, chemistry, progression)
│   │   ├── ui/               # DOM rendering and views
│   │   └── data/             # Lesson metadata, tracks, halls, paths
│   └── assets/               # Images, icons, diagrams
│
├── Content/                   # Lesson content (Markdown)
│   └── Grimora_Level1/
│       ├── Math_Sanctum/
│       ├── Matter_Lab/
│       ├── Hall_of_Maat/
│       └── Machina_Workshop/
│
├── Primers/                   # Design documents & templates
│   ├── A_Primers/            # Project vision, UX flows, charters
│   └── Templates/            # Lesson templates by subject
│
└── References/                # Reference materials (PDFs, etc.)
```

---

## 🛠️ Technology Stack

**Front-End Only (Phase 1):**

- **HTML5** - Semantic structure
- **CSS3** - Styling and layout
- **Vanilla JavaScript (ES6+)** - No frameworks, modular architecture
- **JSDoc** - Comprehensive documentation
- **JSON/JS modules** - Content and configuration data

### Architecture Principles

**Separation of Concerns:**

- `core/` - Pure functions (no DOM, no side effects)
- `ui/` - DOM rendering and event handling
- `app/` - Orchestration and coordination
- `data/` - Content definitions and metadata

**Clean Code Practices:**

- Single Responsibility Principle
- Domain-Driven Design concepts
- Comprehensive JSDoc annotations

---

## 🚀 Getting Started

### Prerequisites

None! Just a modern web browser.

### Running Locally

Clone the repository:

```bash
git clone https://github.com/Olu-AnuAkin-Akinyemi/Grimora.git
cd Grimora
```

Open in browser:

```bash
open client/index.html
# or
python3 -m http.server 8000  # Then visit http://localhost:8000/client
```

---

## 📖 Content Structure

Each lesson follows a consistent template:

- **Lesson Snapshot** - ID, objectives, key terms, estimated time
- **Narrative Hook** - Story or scenario to engage curiosity
- **Core Concepts** - Main teaching content with examples
- **Worked Examples** - Step-by-step demonstrations
- **Practice Exercises** - Hands-on application
- **Reflection Prompts** - Deeper thinking and connections
- **Deeper Study Notes** - Optional advanced content (collapsible)

### Lesson Metadata

Lessons are tracked in `client/JS/data/lessons_level1.js` with:

- Unique IDs for routing and state management
- Track/Hall associations
- Learning paths (Mind, Matter, Motion, Heart, Code & Flow)
- Cross-lesson connections
- Estimated completion times

---

## 🎨 Design Philosophy

### The Trivium in Learning

- **Grammar** - Names, symbols, and vocabulary
- **Logic** - Structure of reasoning and relationships
- **Rhetoric** - Clear expression and explanation

### Ma'at as Metaphor

Balance, truth, and order inform:

- Equation balance in mathematics
- Conservation laws in chemistry
- Force equilibrium in physics
- Responsible creation in engineering

### Optional Depth

- Core content accessible at 7th-10th grade level
- Advanced concepts available via "Deeper Study" sections
- Clearly marked as enrichment, never required

---

## 🗺️ Roadmap

### Current Status: Level 1 (Initiate)

✅ Content structure defined  
✅ Lesson templates created  
✅ Initial lessons drafted  
🔄 UI implementation in progress

### Future Levels

- **Level 2 (Apprentice):** Deeper chemical reactions, algebraic thinking, compound machines
- **Level 3 (Journeyman):** Stoichiometry, functions, energy systems
- **Level 4+:** Engineering applications (chemical, mechanical, electrical, robotics)

---

## 🤝 Contributing

This project is in active development. Contributions welcome in:

- Content review and editing
- UI/UX design
- JavaScript implementation
- Accessibility improvements
- Lesson creation

Please review the primers in `/Primers/A_Primers/` before contributing to understand the project philosophy.

---

## 📜 License

[License information to be added]

---

## 🙏 Acknowledgments

**Grimora** draws inspiration from:

- Ancient Kemetic (Egyptian) wisdom and Ma'at philosophy
- Historical alchemy and Khemia traditions
- The classical Trivium and Quadrivium
- Modern STEM education best practices
- African-centered approaches to science and mathematics

---

## 📞 Contact

**Repository:** [github.com/Olu-AnuAkin-Akinyemi/Grimora](https://github.com/Olu-AnuAkin-Akinyemi/Grimora)

---

> *"Science is the modern form of alchemy—the art of transformation guided by truth and balance."*
