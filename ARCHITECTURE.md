# Movement Map — Architecture

This document describes how Movement Map is put together: the concepts, the
layers, and the reasoning behind the structural decisions. It is written to
be useful both as a re-orientation reference and as an introduction for
someone reading the codebase for the first time.

For product intent, see `VISION.md`, `PURPOSE.md`, and `PRINCIPLES.md`.
For build sequence, see `ROADMAP.md`.

---

## The core conceptual model

Four concepts, in hierarchy:

```
Mode  →  Card  →  Exercise
                (referenced by ID)

Workout-specific data (prescriptions, completion, history)
lives separate from the Exercise Library definition.
```

**Mode** is the routine or experience the user chooses. There are three:
Flow Day, Grab & Go, and Full Body. Each Mode is structurally distinct — the
application does not try to make them interchangeable.

**Card** is an exercise grouping *within* a Mode. It is also called a
"Sequence" in the user-facing copy. A Card is not a routine; it is a
container of exercise references and curation metadata.

**Exercise** is the authoritative library entry. Defined once, referenced
everywhere by a stable `id`.

The distinction matters because it is what keeps the library reusable. A
Card does not contain exercises — it contains *references* to exercises.
Adding an exercise to two Cards in two Modes does not duplicate it.

---

## Directory map

```
src/
├── App.jsx                 Router setup. All routes declared here.
├── main.jsx                React entry point.
├── index.css               Global styles + page-level styles.
│
├── components/             Reusable UI, no Mode knowledge.
│   ├── Layout/             Shared page frame (header + nav + main).
│   ├── Navigation/         Top nav. Uses NavLink for active state.
│   ├── ModeCard/           Home page tile for a single Mode.
│   ├── Card/               Renders a Card. CardHeader + CardBody.
│   │   ├── Card.jsx        Owns expand/collapse, edit toggle, preview.
│   │   └── CardBody.jsx    Renders exercise rows, edit actions.
│   ├── Exercise/           ExerciseElement — renders one exercise.
│   ├── FilterPanel/        Purpose/Classification/Equipment selection.
│   └── ExercisePicker/     Searchable exercise selector. App level.
│
├── pages/                  One file per route.
│   ├── Home.jsx            Mode selection.
│   ├── FlowDay.jsx         Four TimeBlocks, per-TimeBlock curation.
│   ├── GrabAndGo.jsx       Flat Card list, one FilterPanel.
│   ├── FullBody.jsx        Workout-level curation, groups, prescriptions.
│   └── History.jsx         Completion records, 7-day windows.
│
├── engine/                 Non-UI logic. No React.
│   ├── filters.js          Eligibility filter. Vocabulary-driven.
│   ├── curateCard.js       Selection → one Card.
│   ├── curateFullBody.js   Selection → workout (groups + prescriptions).
│   ├── scoring.js          Prescription generation + work cost.
│   ├── storage.js          Working routines, fixed routines, saved.
│   ├── completion.js       Completion records. Separate key space.
│   ├── aggregate.js        Rollups over completion data.
│   └── intelligence.js     Derived context (fatigue, neglect, balance).
│
├── library/                Authoritative vocabularies + exercise data.
│   ├── classifications.js
│   ├── purposes.js
│   ├── equipment.js
│   ├── movementVocab.js
│   ├── anatomy.js
│   ├── cards.js            createCard factory.
│   └── exercises/          Aggregated exercise library (7 files).
│       ├── index.js        Aggregates all categories.
│       ├── core.js, integrated.js, joints.js, lowerBody.js,
│       ├── upperBody.js, cardioCalis.js, pushUp.js
```

## The vocabulary system

Movement Map uses controlled vocabularies with stable IDs. This is the
foundation everything else rests on.

Every exercise references IDs from:

- **classifications** — what the exercise broadly is (upperBody, mobility, pull, primalGround, skill, ...)
- **purposes** — why the app would choose it (jointPreparation, rangeDevelopment, movementControl, ...)
- **equipment** — what it needs
- **movementVocab** — families, chains, planes, patterns
- **anatomy** — muscles and joints

**Why IDs instead of strings:** filtering, aggregation, and history all
operate by ID. "Show me every exercise that works the glutes" is a
`primaryMuscles.includes("glutes")` check. Renaming a muscle does not
break a single record.

**Why centralized:** vocabularies are edited in one file. Adding a new
classification means adding it once and it becomes selectable in every
FilterPanel and every picker.

**Why exercises reference but do not contain:** an exercise contains IDs
and its own definition (name, coaching, accessibility, progression). It
does not contain its classification's *name* or the anatomy vocabulary's
*definitions*. Those live in one place.

---

## The engine layer

The engine contains all non-UI logic. It never imports React. It is
importable from anywhere — pages, components, tests, scripts — without
pulling in a rendering concern.

### filters.js

Eligibility. Given a library and a selection, returns the eligible subset.

- Purpose: OR
- Classification: OR
- Equipment: OR
- Empty selection means unrestricted
- `excludedExerciseIds` is a hard filter and wins first

`filters.js` does not rank, score, or order. It answers only "is this
exercise allowed right now."

### curateCard.js

One Card per call. Used by Flow Day and Grab & Go.

Flow: `filterExercises()` → take the first N eligible → `createCard()`.

The "take the first N" behavior is deliberately not randomized. Scoring
and ranking will replace it later. It is documented in the file.

### curateFullBody.js

One workout per call. Used only by Full Body.

Full Body is different from the other Modes: the Mode itself is the
workout, and Cards are groupings inside it. Curation therefore happens at
the workout level.

Flow: `filterExercises()` → purpose exclusion → balanced pool selection
→ grouping by movement chain → prescription generation per exercise.

**Purpose exclusion:** exercises whose *only* purposes are
`jointPreparation`, `recovery`, `decompression`, `downshift`, or
`rangeDevelopment` are removed from the workout pool. Those purposes
belong to warm-up and cool-down, which will be separate segments.
This exclusion is Full Body only.

**Grouping:** exercises are grouped by primary movement chain, then
tiebroken by movement pattern. Group type is derived from size:
1 exercise → straightSets, 2 → superset, 3 → circuit.

### scoring.js

Two responsibilities, currently in one file:

- **Prescription generation.** Given an exercise, produce sets/reps/load
  appropriate to it. `expandPrescriptionToSets()` turns a prescription
  into the per-set array the workout shape uses.
- **Work cost calculation.** `computeWorkCost()` produces a per-muscle
  cost for a single exercise occurrence, given the exercise's equipment
  and the session data (sets, reps, duration). Intelligence consumes this.

This file is mid-reorganization. The split between prescription
generation and work cost calculation is under review; both currently live
here. Future ranking (scoring exercises for curation priority) will also
land here once it is built.

### storage.js

Working routines, fixed routines, and saved routines.

- **Working routine** = what the user is currently editing. Date-scoped.
- **Fixed routine** = the user's intentionally established recurring routine.
- **Saved routine** = a named, reusable routine.

These three are separate concepts and remain separate in storage.

One localStorage key: `movement-map-state`.

Completions are *not* part of this key space — they live in their own
(see below). The header comment in `storage.js` still lists completions
as one of the persistence concepts; that comment is stale and is being
updated during the current reorganization.

### completion.js

Completion records. The only engine file besides storage.js that touches
localStorage directly.

**Separate key space:** `movement-map-completions:YYYY-MM-DD`. One key
per date. This is what makes it safe for history to grow without
degrading the performance of working-state operations, and it is what
makes a future backend swap tractable.

**Why completions are separate from working routines:** completing a
card should not rewrite working state, and opening a Mode should not
parse the entire history.

**What is stored:** the exercises that were completed, snapshotted. Not
the Card. Cards are containers; the exercises are the substance.

**Snapshot fields per exercise:** id, classifications, purposes, anatomy,
movementChains, movementPlanes, movementPatterns, level.

**Not snapshotted:** name, definition, coaching. These are resolved via
library lookup at render time so they stay current if the library changes.

**Full Body completion:** recorded at the workout level, once, when the
workout finishes. Carries planned duration, actual duration (once the
timer exists), exercise count, and per-exercise prescriptions.

This module is mid-reorganization. The write paths are stable; the read
paths and shape are being reviewed alongside `aggregate.js` and
`intelligence.js`.

### aggregate.js

Reads completion history and produces a summary of a time window. Pure
counting: patterns, classifications, chains, planes, muscles (primary
weighted 1, secondary weighted 0.5), joints, purposes, exercises, and a
raw chronological session list.

**Aggregation is a reader.** It does not interpret, does not model
recovery, does not decide what is neglected or fresh. It answers "what
did the user do" and stops. Interpretation is intelligence's job.

The `sessions` array it returns is the raw material everything downstream
reads. Each session carries `mode`, `timeBlock`, `dateKey`,
`completedAt`, and the exercise snapshots from the completion record.

**Why this split matters:** you can change how the app *interprets*
history (recovery model, neglect thresholds, balance bands) without
touching how it *counts* history. And you can change what gets counted
without touching any interpretation.

### intelligence.js

Reads aggregation output and produces interpretation: muscle recovery
percentages, neglected muscles, pattern balance classification, and
per-exercise readiness scores.

This is the layer between raw counts and curation decisions.

- **Aggregation says:** "the user did X."
- **Intelligence says:** "here's what that means."
- **Curation will say:** "given that, here's what to offer."

**Recovery model.** Each muscle carries a recovery value in 0–100 and a
`lastWorkedAt` timestamp. A session subtracts work cost (via
`computeWorkCost` in `scoring.js`). Between sessions, recovery climbs at
a rate set by the muscle's tier window — 48h for small/core muscles,
72h for large. Recovery is capped at 100 and floored at 0. It never
resets from a normal session.

**Tiers are defined in the module, not in the vocabulary.** `small`,
`large`, and `core` are inferred from the muscle ID; the muscle
vocabulary itself doesn't know about tiers. That's deliberate — recovery
is an intelligence concern, not a library concern.

**Neglect detection.** Absolute (no work in the window) or relative
(below 50% of the average per-muscle share among muscles that were
worked).

**Pattern balance.** Each pattern is classified `under`, `balanced`, or
`over` based on its share relative to the average.

**`scoreExerciseReadiness(exercise, state)`** produces a score in 0–1
and a list of reasons. Signals in v1:

- muscle recovery (dominant penalty — primary muscles penalized more than secondary)
- neglect (boost for under-represented primary muscles)
- pattern balance (small adjustment based on the exercise's primary pattern)

The score is what curation ranking will sort by. It is deliberately not
consumed by curation yet — intelligence *produces* the score, but
nothing currently *uses* it in curation.

---

## The UI layer

### Layout

Every page renders inside `Layout`. Layout provides the header (title +
tagline), the Navigation, and the `<main>` wrapper. Pages pass their
content as `children`. No page duplicates the frame.

### Navigation

Top nav. Uses React Router's `NavLink`, which supplies `isActive` for
the current route. The `getNavLinkClass` helper applies an `.active`
class automatically.

### Card / CardBody

`Card` is the container. It owns:

- Expand / collapse
- Edit mode toggle (disabled when the card is fixed)
- Mark complete
- Selected exercise preview
- Pass-through handlers for the parent Mode

`CardBody` renders the exercise rows and the edit affordances
(Replace, Remove, Add Exercise). It does not own Card data — it receives
exercise IDs and calls parent-provided handlers.

The parent Mode owns the Card's actual data. Card and CardBody render it
and dispatch changes upward.

### FilterPanel

Collects Purpose, Classification, and Equipment selections, then calls
`onBuild(selection)`. It does not filter, curate, or create Cards. Its
only job is to produce a well-formed selection object.

The three option dropdowns are populated from the vocabulary files
directly. No duplicated option lists.

### ExercisePicker

App-level searchable exercise selector. Replaces the placeholder
`<select>` dropdowns that lived in `CardBody`.

The picker knows nothing about Modes. It receives:

- A candidate list (what is allowed right now)
- A max (1 for Replace; remaining slots for Add; card max for Custom Build)
- A commit handler
- A title/context string
- A back/cancel handler

Two modes: single-select (Replace) and multi-select (Add Exercise,
Custom Build).

### FilterPanel vs ExercisePicker

They look similar — both select exercises or criteria — but their jobs
are different:

- FilterPanel is *upstream* of curation. It describes what the user
  wants, and curation decides what that means.
- ExercisePicker is *downstream* of curation, or a manual override of
  it. The user chooses an exact exercise, and it is placed on a Card.

FilterPanel feeds curation. ExercisePicker bypasses it.

---

## The Mode layer

Each Mode is a page with its own persistence shape, curation flow, and
UI affordances. Modes share primitives (Card, FilterPanel,
ExercisePicker, storage helpers, filters.js) but not their own logic.

### Flow Day

Four TimeBlocks (Morning, Midday, Afternoon, Evening). Each TimeBlock
owns its own Card collection.

Morning is heavier than the others. It has its own default purposes
(`jointPreparation`, `rangeDevelopment`, `bodyAwareness`), an 8-exercise
per-Card cap instead of 5, and a Fix Morning affordance that establishes
the current working Morning as the recurring default.

TimeBlocks are persisted separately (`getFlowDayCards(timeBlock)`), so
one TimeBlock being empty does not affect the others.

### Grab & Go

Flat list of Cards. One FilterPanel, one selection retained for
Add/Replace. Simpler than Flow Day — no TimeBlocks.

Grab & Go uses the generic storage helpers
(`getWorkingRoutine("grabAndGo")` / `saveWorkingRoutine(...)`).

Note: Grab & Go performs persistence-triggering inline in the page
rather than through a dedicated helper. Flow Day uses dedicated helpers.
This is a known inconsistency in the roadmap under "Unify Mode
persistence."

### Full Body

Workout-level. A single workout object contains configuration
(plannedDuration, exerciseCount), state (draft / active / completed),
and an array of groups. Each group is a `{id, type, exercises}` where
type is "straightSets" | "superset" | "circuit" and each exercise is
`{id, sets}` with sets already expanded via `scoring.js`.

Full Body's persistence shape is different from the other Modes on
purpose. It has its own pair of functions
(`getFullBodyWorkout` / `persistFullBodyWorkout`) with a
`{plannedDuration, exerciseCount, state, actualDuration, cursor, groups}`
shape.

Full Body completion is workout-level, not card-level. Set logging will
feed future progression and intelligence.

---

## The exclusion principle

**One mechanism, per-Mode scope.**

`filterExercises(exercises, selection, excludedExerciseIds)` is the
mechanism. Every caller passes its own scope:

- **Same Card:** never duplicate. Universal.
- **Same TimeBlock (Flow Day):** automatic curation excludes exercises
  already used elsewhere in the TimeBlock.
- **Same Mode (Grab & Go, Full Body):** automatic curation excludes
  exercises already used elsewhere in the Mode.
- **Across Modes:** never excluded. An exercise can appear in Flow Day
  Morning and in a Full Body workout on the same day.

**Automatic versus manual.** Automatic curation (Build, Add Sequence via
filters) applies exclusion. Manual actions (Replace, Add Exercise,
Custom Build, ExercisePicker) do not. This is a first-class principle,
not an accident: the user chose to override, so the override is honored.

This distinction is documented in the roadmap and reflected in
`CardBody.jsx` and the Modes.

---

## Persistence shapes

Three distinct shapes across the app, one per conceptual layer:

**Working routines** — `state.routines[mode]`. Date-scoped. Start from
the fixed routine on a new day. Flow Day's shape is
`{morning, midday, afternoon, evening}` of Card arrays; Grab & Go's is a
Card array; Full Body's is a workout object.

**Fixed routines** — `state.fixed[mode]`. Persist across days until
explicitly replaced. Same shapes as working routines.

**Saved routines** — `state.saved` array. Named, reusable. Not tied to
a date.

**Completions** — separate localStorage keys,
`movement-map-completions:YYYY-MM-DD`. Not in the main state blob.

The separation is deliberate. A working routine is *today's edit*. A
fixed routine is *the recurring default*. A saved routine is *a thing
the user named*. A completion is *a historical event*. They have
different lifecycles and different read/write patterns.

---

## Things that are deliberately not here yet

- Ranking and scoring in curation. `scoring.js` exists and
  `intelligence.js` produces readiness scores, but nothing currently
  consumes them in curation.
- Warm-up and cool-down segments in Full Body.
- Cross-device sync. localStorage is per-device; a backend would be
  required. The boundary is already drawn — storage.js and completion.js
  are the only files that touch localStorage.
- Movement literacy UI. The data exists on every exercise (unlocks,
  buildsToward, supports, pairsWellWith); the surfaces that would show
  it do not yet exist.
- History visualization beyond the current 7-day list.

---

## Related documents

- `README.md` — project overview
- `VISION.md` — the long-term product vision
- `PURPOSE.md` — why the product exists and what it is trying to do
- `PRINCIPLES.md` — the product and design principles
- `ROADMAP.md` — current build sequence
