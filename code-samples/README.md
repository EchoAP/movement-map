# Code Samples

These files are selected excerpts from Movement Map's private source. They
are included here to illustrate how the application is built. They are not
a runnable project and cannot be built on their own.

The full source is private. This folder is a reference, not a repository.

## What's here

### `engine/filters.js`

Eligibility filtering. Takes the exercise library and a user selection
(purpose, classification, equipment) and returns the subset of exercises
that match. Exclusions are a hard filter that wins before any other check.

This file shows the vocabulary-driven design: filters work by ID against
controlled vocabularies, not by matching strings.

### `engine/curateCard.js`

Curation for one Card. Used by Flow Day and Grab & Go.

Flow: `filterExercises()` → take the first N eligible → `createCard()`.

The selection logic is deliberately not scored or randomized yet — that
belongs to a future ranking layer. The file documents what will replace
"take the first N" when ranking exists.

### `engine/curateFullBody.js`

Curation for a complete workout. Used only by Full Body.

Full Body's structure is different from the other Modes: the Mode itself
is the workout, and Cards are groupings inside it. Curation therefore
happens at the workout level, not the Card level.

This file shows:
- Mode-specific purpose exclusion (warm-up/cool-down purposes are removed)
- Balanced pool selection by movement pattern
- Grouping by movement chain, tiebroken by pattern
- Group type derivation from size (straightSets / superset / circuit)

### `pages/FlowDay.jsx` (excerpt)

Two slices from the Flow Day Mode page.

The first shows how the Mode is structured: four TimeBlocks, each owning
its own Card collection, curation selection, fixed flag, and messages. The
second shows the Morning curation path — from selection through
`curateCard()` to state update and persistence — and the "Fix Morning"
affordance that establishes the current working Morning as a recurring
default.

The full file contains the Add Sequence variants (Keep Filters, New
Curation, Custom Build), exercise editing handlers, completion tracking,
and the render.

### `pages/FullBody.jsx` (excerpt)

Two slices from the Full Body Mode page.

The first shows the traversal model that walks a group's sets in the
order they are performed. This matters because supersets and circuits
interleave sets across exercises, so "the current set" cannot be derived
by finding the first incomplete set in linear order.

The second shows how the page loads a persisted workout, calls
`curateFullBody()`, and logs a set while advancing the cursor.

The full file contains the render, the exercise picker handlers,
prescription editing, and finish/discard logic.

---

## What is not here

- The exercise library. Exercises are the substance of the application,
  and the library is private.
- The vocabulary files (classifications, purposes, equipment, movement,
  anatomy). These define the controlled language the application uses.
- Shared components (`Card`, `CardBody`, `ExercisePicker`, `FilterPanel`).
  These are standard React patterns and are not the interesting part of
  the project.
- Storage, completion, aggregation, and intelligence modules. These are
  active areas of development and are not in a stable state.

The architecture document at the repository root describes how the pieces
fit together, including the modules not shown here.
