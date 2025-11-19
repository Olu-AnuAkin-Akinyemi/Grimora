<!-- grimora_ux_flow_level1.md -->

# Grimora – Level 1 UX Flow (Initiate)

This document describes how an **Initiate** moves through Grimora in Level 1:  
from opening the spellbook to exploring Halls, Lesson Pages, and simple practice.

It defines **app states**, **screen purposes**, and **basic navigation**,  
so that UI, HTML structure, and JS state management can align.

---

## 0. Guiding Principles

- Using Grimora should feel like opening and moving through a **living spellbook**,  
  not a noisy, gamified app.
- Every screen should answer:
  - “Where am I in Grimora?”  
    (Cover, Hub, Hall/Room, Lesson Page, Practice, Reflection)
  - “What is my next small step?”
- Motion and sigils are **subtle**:  
  the focus is still reading, thinking, drawing, and reflecting.
- Core text stays accessible; **deeper notes** are layered behind optional hints.

---

## 1. Entry Flow – Opening Grimora

### 1.1 Launch → Cover

**State:** `COVER`

**Purpose**

- Introduce Grimora as an **artifact**.  
- Offer a single clear action: open the spellbook.

**Visual**

- Dark, calm background (deep gradient, very subtle glyphs/geometry).  
- Center: stylized **Grimora book** or emblem.

Text:

- Title: **GRIMORA**  
- Tagline: *“A living spellbook, as your companion”*  
- Optional small line near bottom:
  - *KemKnightRanger Academy · Rank: Initiate*

**Actions**

- Primary button: **“Open Grimora”**
- Optional tiny link (for later): **“What is KRA?”**

**State Transition**

- First-time users: `COVER` → `ONBOARD_INITIATE`  
- Returning users: `COVER` → `HUB`

---

### 1.2 First-Time Onboarding (one-time ritual)

**State:** `ONBOARD_INITIATE`

**Purpose**

- Welcome the learner as an **Initiate**.  
- Set expectations: magical *and* grounded.  
- Invite physical tools (ruler, compass, journal).

**Content (draft)**

Header:

> “Welcome, Initiate.”

Body:

> “Grimora is your living spellbook for math, matter, and Ma’at.  
> Here, you’ll explore numbers, elements, and simple machines  
> through both clear reasoning and symbolic stories.

> To get the most from this journey, it helps to have a few tools nearby:
> - A simple **ruler**  
> - A basic **compass** for drawing circles  
> - A small **journal** or notebook

> Grimora lives on your device,  
> but some of your strongest insights will grow on paper.”

**Actions**

- Primary button: **“I’m ready”** → `HUB`  
- Secondary small text: **“Continue without tools for now”** → `HUB`

---

## 2. Hub – The Four Halls of Grimora

### 2.1 Hub Layout

**State:** `HUB`

**Purpose**

- Act as the **main map** for Level 1.  
- Present the four Halls clearly and calmly.

**Visual Concept – Open-Book Spread**

The Hub appears as an **open book**:

- **Left Page:**
  - Small Grimora title & tag.  
  - Short intro text like:
    > “Four Halls hold your first pages as an Initiate.  
    > You may enter them in any order.”
  - Rank badge: **Initiate**.  
  - Optional minimal diagram of the three Paths (Matter & Mind, Motion & Heart, Code & Flow).

- **Right Page:**
  - Four **Hall sigils/cards**, each clickable:
    - Math Sanctum  
    - Matter Lab  
    - Hall of Ma’at  
    - Machina Workshop  
  - Under each: short one-line description and progress (`0 / 3 pages`).

### 2.2 Hall Cards (Right Page)

Each Hall card includes:

- **Name**  
- **One-line tagline**  
- **Path tags**  
- **Progress indicator** (simple fraction: `completed / total pages`)

Example content:

1. **Math Sanctum**  
   - Tagline: *“Where patterns and operations become spells.”*  
   - Paths: Mind · Code & Flow  
   - Progress: `0 / 3 pages complete`

2. **Matter Lab**  
   - Tagline: *“Where matter reveals its forms and building blocks.”*  
   - Paths: Matter · Mind  
   - Progress: `0 / 3 pages complete`

3. **Hall of Ma’at**  
   - Tagline: *“Where balance, truth, and clear thinking meet.”*  
   - Paths: Mind · Heart  
   - Progress: `0 / 3 pages complete`

4. **Machina Workshop**  
   - Tagline: *“Where forces, tools, and motion begin to dance.”*  
   - Paths: Motion · Heart · Code & Flow  
   - Progress: `0 / 3 pages complete`

**Actions**

- Tap/click a Hall card → `ROOM_VIEW(hallId)`  
- Back navigation from Room → `HUB`

---

## 3. Room View – Choosing a Lesson Page

Each Hall has a **Room View**, still mostly 2D/layout with light room flavor.

**State:** `ROOM_VIEW: HALL_ID`

### 3.1 Shared Structure

**Header**

- Hall name (e.g., “Math Sanctum”)  
- Path tags (e.g., “Mind · Code & Flow”)  
- Small label: **Rank: Initiate**  

**Background**

- Subtle visual hint matching the Hall:
  - Math Sanctum: geometry lines, faint circle + triangle  
  - Matter Lab: soft atoms/molecules motif  
  - Hall of Ma’at: scales, symmetry lines  
  - Machina Workshop: silhouettes of levers/ramps/wheels

**Lesson List**

- Vertical list or row of **3 Lesson Pages**:

  Example for Math Sanctum:
  - **Math L1-01 – Addition & Subtraction as Opposite Transformations**  
  - **Math L1-02 – Multiplication & Division: Scaling & Unscaling**  
  - **Math L1-03 – Exponents & Roots: Powering Up & Revealing the Seed**

- Each lesson entry shows:
  - Title  
  - One-line description  
  - Status: `Locked` / `Available` / `Completed`

**Actions**

- Select a lesson → `LESSON_PAGE(lessonId)`  
- Back button → `HUB`

---

## 4. Lesson Page – Inside a Grimoire Page

**State:** `LESSON_PAGE: lessonId`

Each Lesson Page follows a standard layout.

### 4.1 Layout Regions

1. **Header Strip**

   - Lesson title and ID  
   - Rank badge: **Initiate**  
   - Hall name + Path tags (e.g., “Math Sanctum · Mind / Code & Flow”)  
   - Small symbol showing “tier” (dot, line, triangle, etc.)

2. **Main Content Panel (left/center)**

   - **Narrative Hook** – short KRA/Khem-flavored story beat.  
   - **Key Concepts** – bullet list of 3–5 terms/ideas.  
   - **Core Explanation** – main text and simple diagrams, written at ~7th–10th grade level.  
   - Optional **Deeper Side-Notes** for advanced learners:
     - Certain sentences or terms have a small hint icon (e.g., “⋰”, “ℹ︎”, or “For deeper study…” label).
     - On hover (desktop) or tap (mobile), a short drop-down/accordion opens with:
       - extra historical context,
       - more formal definitions,
       - or a connection to higher-level math/chem/engineering.
     - These notes are clearly marked as **optional enrichment** and not required to complete the lesson.

3. **Sigils Bar (right side)**

   - A vertical strip on the **right side** of the page on larger screens  
     (on small screens, it may stack below the Main Content Panel).
   - Calm background, with softly glowing **sigils/icons** relevant to the lesson.

   - Math lessons:
     - `+` & `−` pair → “opposite transformations”  
     - `×` & `÷` pair → “scaling pair”  
     - `aⁿ` & `√a` pair → “power & seed”

   - Chem lessons:
     - Element glyphs: H, O, C, Fe…  
     - State icons: solid (cube), liquid (drop), gas (wavy lines)

   - Lore lessons:
     - Feather of Ma’at  
     - Trivium triangle (G/L/R)  
     - Book+scale hybrid icon

   - **First version:** static icons with subtle CSS glow and simple tooltips.  
   - **Later:** upgraded to **“living sigils”** via THREE.js (slow float, soft light, no noisy game loop).

4. **Practice & Reflection Panel (bottom)**

   - Tabs or buttons:
     - **Practice** – guided → independent exercises  
     - **Reflect** – “Alchemy of Self” prompts  
     - **Engineering Glimpse** – short applied scenario linking to engineering

---

### 4.2 Lesson Page Flow

Typical flow:

1. Learner reads the **Main Content**.  
2. Optionally hovers/taps sigils (tooltips / future subtle animations).  
3. Opens **Practice** and attempts a small set of questions.  
4. Opens **Reflect** and considers or writes 1–2 prompts.  
5. Returns to Hall or Hub.

**Completion Rule (Level 1 simple):**

A lesson counts as **Completed** if:

- The learner has scrolled/read through the main content, **and**  
- Opened **Practice** *or* **Reflect** at least once.

No strict scoring needed at Level 1; focus is first contact and understanding.

---

## 5. Practice & Reflection Flows

### 5.1 Practice View

**State:** `PRACTICE_VIEW(lessonId)`  
(often rendered as a panel/section inside the Lesson Page)

**Content**

- 3–6 lightweight activities:
  - Multiple choice  
  - Short fill-in (numeric or word)  
  - “Draw this in your journal and think about X” style prompts

**Feedback**

- Simple responses:
  - “That checks out.”  
  - “Try again; consider how ___ changes when ___.”  

- Optional tiny icon on the lesson card indicating **Practice contacted**.

---

### 5.2 Reflection View

**State:** `REFLECTION_VIEW(lessonId)`  
(also a panel/section on the same page)

**Content**

- 1–2 prompts such as:
  - “Where have you seen this pattern in your life?”  
  - “How does Ma’at (balance) show up in this idea?”

**Options**

- Suggest writing in the **physical journal**.  
- Optional text area for short in-app notes (simple, not a full editor).

---

## 6. Minimal Progress & Rank Handling

### 6.1 Progress Model

Per-lesson:

- `not_started`  
- `in_progress`  
- `completed`

Per-Hall:

- Derived: number of **completed** lessons out of 3  
  - Displayed as `X / 3 pages complete` on Hub Hall cards and/or Room header.

### 6.2 Rank in Level 1

- Always show **Rank: Initiate** in headers.  
- On full Level 1 completion (all 12 lessons across 4 Halls):

  - Optional closing message, e.g.:

    > “You have completed the Initiate chapter of Grimora.  
    > The path of the **Acolyte** is now within sight.”

  - The visible rank remains **Initiate** until later versions introduce Acolyte content.

---

## 7. State Overview for Implementation

High-level app states:

- `COVER`  
- `ONBOARD_INITIATE`  
- `HUB`  
- `ROOM_VIEW: HALL_ID`  
- `LESSON_PAGE: LESSON_ID`  
- `PRACTICE_VIEW: LESSON_ID` (sub-state/section)  
- `REFLECTION_VIEW: LESSON_ID` (sub-state/section)

These can be expressed as:

- Sections in HTML (`<section data-state="hub">...</section>`)  
- Or a simple JS state machine, e.g.:

  - `setAppState('HUB')`  
  - `setAppState('ROOM', { hallId: 'MATH_SANCTUM' })`  
  - `setAppState('LESSON', { lessonId: 'math_l1_01_op_trans' })`

---

End of **Grimora – Level 1 UX Flow (Initiate)**.
