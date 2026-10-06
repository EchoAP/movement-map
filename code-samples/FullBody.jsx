/*
 * ============================================================================
 * Excerpt from: src/pages/FullBody.jsx
 * ----------------------------------------------------------------------------
 * Two slices from the Full Body Mode page.
 *
 * PART 1 — Cursor and traversal logic.
 *          Full Body is the one Mode where the workout itself is the unit
 *          and Cards are groupings inside it. Supersets and circuits
 *          interleave sets across exercises, so "the current set" cannot be
 *          derived by finding the first incomplete set in linear order. This
 *          slice shows the traversal model that solves that.
 *
 * PART 2 — State, persistence, curation, and set logging.
 *          Shows how the page loads a persisted workout, calls
 *          curateFullBody(), and logs a set while advancing the cursor.
 *
 * The full file also contains the render, the exercise picker handlers,
 * prescription editing, and finish/discard logic.
 * ============================================================================
 */

/*
 * ============================================================================
 * Module: FullBody
 * ----------------------------------------------------------------------------
 * Purpose:
 * Build, edit, execute, and complete a Full Body workout.
 *
 * States: draft → active → completed
 *
 * Cursor:
 * The cursor (which set is "current") is explicit state, persisted with the
 * workout. It cannot be derived cleanly once supersets are involved, because
 * "first incomplete set in linear order" doesn't describe a superset's
 * interleaved traversal.
 *
 * Completion:
 * Only logged sets are recorded in history. Finishing a workout with
 * partially logged sets records only what was actually done.
 * ============================================================================
 */

import { useEffect, useRef, useState } from "react";

import Layout from "../components/Layout/Layout";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import ExercisePicker from "../components/ExercisePicker/ExercisePicker";

import { exercises } from "../library/exercises";
import { curateFullBody } from "../engine/curateFullBody";
import {
  generatePrescription,
  expandPrescriptionToSets,
  BAND_TENSION_OPTIONS,
  bandTensionLabel,
} from "../engine/scoring";

import {
  recordWorkoutCompletion,
  removeWorkoutCompletion,
} from "../engine/completion";

import {
  getFullBodyWorkout,
  persistFullBodyWorkout,
} from "../engine/storage";

// ---------------------------------------------------------------------------
// PART 1 — Cursor and traversal logic
// ---------------------------------------------------------------------------

const GROUP_TYPE_LABELS = {
  superset: "Superset",
  circuit: "Circuit",
  straightSets: "Straight Sets",
};

const MAX_EXERCISES_PER_GROUP = 5;

function groupTypeForSize(size) {
  if (size <= 1) {
    return "straightSets";
  }

  if (size === 2) {
    return "superset";
  }

  return "circuit";
}

/*
 * buildTraversalOrder
 *
 * Returns the full sequence of { exerciseIndex, setIndex } steps for a
 * group, in the order they are performed.
 *
 * For straight sets: every set of the first exercise, then every set of the
 * second, etc.
 *
 * For supersets and circuits: round by round. Round 0 is set 0 of every
 * exercise that has a set 0. Round 1 is set 1 of every exercise that has a
 * set 1. Exercises with fewer sets simply do not appear in later rounds.
 *
 * This is the source of truth for "what order do the sets happen in." The
 * cursor walks this order, skipping steps that are already logged.
 */

function buildTraversalOrder(group) {
  const order = [];
  const groupSize = group.exercises.length;

  if (groupSize === 0) {
    return order;
  }

  if (group.type === "straightSets") {
    for (let e = 0; e < groupSize; e++) {
      const exercise = group.exercises[e];

      for (let s = 0; s < exercise.sets.length; s++) {
        order.push({ exerciseIndex: e, setIndex: s });
      }
    }

    return order;
  }

  const maxSets = Math.max(
    ...group.exercises.map((exercise) => exercise.sets.length),
    0
  );

  for (let s = 0; s < maxSets; s++) {
    for (let e = 0; e < groupSize; e++) {
      const exercise = group.exercises[e];

      if (s < exercise.sets.length) {
        order.push({ exerciseIndex: e, setIndex: s });
      }
    }
  }

  return order;
}

/*
 * findFirstUnloggedInGroup
 *
 * Walks a group's traversal order and returns the first step whose set has
 * no completedAt. Returns null if every set in the group is logged.
 */

function findFirstUnloggedInGroup(group) {
  const order = buildTraversalOrder(group);

  for (const step of order) {
    const exercise = group.exercises[step.exerciseIndex];

    if (!exercise.sets[step.setIndex]?.completedAt) {
      return step;
    }
  }

  return null;
}

/*
 * firstCursor
 *
 * Where the user starts when they click Start Workout. The first unlogged
 * set of the first group that has one.
 */

function firstCursor(workout) {
  if (!workout?.groups) {
    return null;
  }

  for (let g = 0; g < workout.groups.length; g++) {
    const group = workout.groups[g];

    if (group.exercises.length === 0) {
      continue;
    }

    const first = findFirstUnloggedInGroup(group);

    if (first) {
      return {
        groupIndex: g,
        exerciseIndex: first.exerciseIndex,
        setIndex: first.setIndex,
      };
    }
  }

  return null;
}

/*
 * advanceToNextGroup
 *
 * Given the current group, find the first group after it that has an
 * unlogged set. Returns the cursor for that set, or null if the workout
 * is fully logged.
 */

function advanceToNextGroup(workout, currentGroupIndex) {
  for (
    let g = currentGroupIndex + 1;
    g < workout.groups.length;
    g++
  ) {
    const group = workout.groups[g];

    const first = findFirstUnloggedInGroup(group);

    if (first) {
      return {
        groupIndex: g,
        exerciseIndex: first.exerciseIndex,
        setIndex: first.setIndex,
      };
    }
  }

  return null;
}

/*
 * nextCursor
 *
 * Given the cursor position that was just logged, return the next cursor.
 *
 * Builds the group's traversal order, finds the current position in it,
 * and walks forward for the next unlogged set. If the group has no
 * unlogged sets left, moves to the next group.
 */

function nextCursor(workout, cursor) {
  if (!workout?.groups || !cursor) {
    return null;
  }

  const { groupIndex, exerciseIndex, setIndex } = cursor;
  const group = workout.groups[groupIndex];

  if (!group) {
    return null;
  }

  const order = buildTraversalOrder(group);

  const currentPos = order.findIndex(
    (step) =>
      step.exerciseIndex === exerciseIndex &&
      step.setIndex === setIndex
  );

  if (currentPos === -1) {
    /*
     * Cursor isn't in this group's order. Fall back to the first unlogged
     * step in the group, then to the next group.
     */

    const fallback = findFirstUnloggedInGroup(group);

    if (fallback) {
      return {
        groupIndex,
        exerciseIndex: fallback.exerciseIndex,
        setIndex: fallback.setIndex,
      };
    }

    return advanceToNextGroup(workout, groupIndex);
  }

  for (let i = currentPos + 1; i < order.length; i++) {
    const step = order[i];
    const exercise = group.exercises[step.exerciseIndex];

    if (!exercise.sets[step.setIndex]?.completedAt) {
      return {
        groupIndex,
        exerciseIndex: step.exerciseIndex,
        setIndex: step.setIndex,
      };
    }
  }

  return advanceToNextGroup(workout, groupIndex);
}

// ---------------------------------------------------------------------------
// PART 2 — State, persistence, curation, and set logging
// ---------------------------------------------------------------------------

function FullBody() {

  /*
   * --------------------------------------------------------------------------
   * Load persisted workout on mount
   * --------------------------------------------------------------------------
   */

  const [initialWorkout] = useState(() => getFullBodyWorkout());

  const [workout, setWorkout] = useState(
    () => (initialWorkout?.groups?.length ? initialWorkout : null)
  );

  const [plannedDuration, setPlannedDuration] = useState(
    () => initialWorkout?.plannedDuration ?? ""
  );

  const [exerciseCount, setExerciseCount] = useState(
    () => initialWorkout?.exerciseCount ?? ""
  );

  const [curationMessage, setCurationMessage] =
    useState("");

  /*
   * --------------------------------------------------------------------------
   * Exercise view
   * --------------------------------------------------------------------------
   */

  const [activeExercise, setActiveExercise] =
    useState(null);

  /*
   * --------------------------------------------------------------------------
   * Picker
   * --------------------------------------------------------------------------
   *
   * picker = null
   * picker = { kind: "addExercise", groupIndex }
   * picker = { kind: "replaceExercise", groupIndex, exerciseIndex }
   * picker = { kind: "addGroup" }
   */

  const [picker, setPicker] = useState(null);

  /*
   * --------------------------------------------------------------------------
   * Persistence
   * --------------------------------------------------------------------------
   */

  const hasInitializedPersistence = useRef(false);

  useEffect(() => {
    if (!hasInitializedPersistence.current) {
      hasInitializedPersistence.current = true;
      return;
    }

    persistFullBodyWorkout({
      plannedDuration,
      exerciseCount,
      state: workout?.state ?? "draft",
      actualDuration: workout?.actualDuration ?? null,
      cursor: workout?.cursor ?? null,
      groups: workout?.groups ?? [],
    });
  }, [workout, plannedDuration, exerciseCount]);

  /*
   * ==========================================================================
   * Build
   * ==========================================================================
   */

  function handleBuild(selection) {
    setCurationMessage("");

    const requestedCount = Number(exerciseCount);

    if (!requestedCount) {
      setCurationMessage(
        "Choose a number of exercises before building."
      );
      return;
    }

    const result = curateFullBody({
      exercises,
      selection,
      exerciseCount: requestedCount,
    });

    if (!result) {
      setCurationMessage(
        "No matching movements were found for those selections."
      );
      return;
    }

    setWorkout({
      ...result,
      plannedDuration: plannedDuration || null,
    });

    setActiveExercise(null);
  }

  /*
   * ==========================================================================
   * State transitions
   * ==========================================================================
   */

  function handleStartWorkout() {
    if (!workout) {
      return;
    }

    const cursor = firstCursor(workout);

    const nextWorkout = {
      ...workout,
      state: "active",
      cursor,
    };

    setWorkout(nextWorkout);

    if (cursor) {
      setActiveExercise({
        groupIndex: cursor.groupIndex,
        exerciseIndex: cursor.exerciseIndex,
      });
    }
  }

  /*
   * ==========================================================================
   * Log a set
   * ==========================================================================
   */

  function handleLogSet(groupIndex, exerciseIndex, setIndex) {
    if (!workout || workout.state !== "active") {
      return;
    }

    const nextGroups = workout.groups.map((group, g) => {
      if (g !== groupIndex) {
        return group;
      }

      return {
        ...group,
        exercises: group.exercises.map((exercise, e) => {
          if (e !== exerciseIndex) {
            return exercise;
          }

          return {
            ...exercise,
            sets: exercise.sets.map((set, s) => {
              if (s !== setIndex) {
                return set;
              }

              return {
                ...set,
                completedAt: new Date().toISOString(),
              };
            }),
          };
        }),
      };
    });

    const nextWorkout = {
      ...workout,
      groups: nextGroups,
    };

    const next = nextCursor(nextWorkout, {
      groupIndex,
      exerciseIndex,
      setIndex,
    });

    const withCursor = { ...nextWorkout, cursor: next };
    setWorkout(withCursor);

    if (!next) {
      setActiveExercise(null);
      return;
    }

    setActiveExercise({
      groupIndex: next.groupIndex,
      exerciseIndex: next.exerciseIndex,
    });
  }
}

export default FullBody;
