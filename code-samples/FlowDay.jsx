/*
 * ============================================================================
 * Excerpt from: src/pages/FlowDay.jsx
 * ----------------------------------------------------------------------------
 * Two slices from the Flow Day Mode page.
 *
 * PART 1 — Configuration and state.
 *          Shows how Flow Day is structured as four independent TimeBlocks,
 *          each owning its own cards, curation selection, fixed flag, and
 *          messages.
 *
 * PART 2 — The Morning curation path.
 *          Shows selection → curateCard() → state update → persistence, and
 *          the Fix Morning affordance that establishes the current working
 *          Morning as a recurring default.
 *
 * The full file also contains the Add Sequence variants (Keep Filters, New
 * Curation, Custom Build), exercise editing handlers, completion tracking,
 * and the render.
 * ============================================================================
 */

/*
 * ============================================================================
 * Module: FlowDay
 * ----------------------------------------------------------------------------
 * Purpose:
 * Provides a movement experience organized by TimeBlock.
 *
 * Flow Day differs from Grab & Go because curation occurs WITHIN each
 * TimeBlock rather than producing one undifferentiated Card collection.
 *
 * Current TimeBlocks:
 * - Morning
 * - Midday
 * - Afternoon
 * - Evening
 *
 * Architecture:
 *
 * Flow Day
 *      ↓
 * TimeBlock
 *      ↓
 * FilterPanel
 *      ↓
 * curateCard()
 *      ↓
 * Card(s)
 *
 * Each TimeBlock owns its own Card collection.
 *
 * Flow Day owns:
 * - Card collections by TimeBlock
 * - Multiple Cards per TimeBlock
 * - TimeBlock-specific curation rules
 * - Adding/Removing cards
 * - Holding original curation selections
 * - Completion state per TimeBlock
 *
 * Completion is recorded in engine/completion.js, keyed by exercise set.
 * Cards are containers; the exercises are what get recorded.
 * ============================================================================
 */

import { useEffect, useState } from "react";

import Layout from "../components/Layout/Layout";
import FilterPanel from "../components/FilterPanel/FilterPanel";
import Card from "../components/Card/Card";
import ExercisePicker from "../components/ExercisePicker/ExercisePicker";

import { exercises } from "../library/exercises/";
import { curateCard } from "../engine/curateCard";
import { filterExercises } from "../engine/filters";

import {
  recordCardCompletion,
  removeCardCompletion,
  getCompletedSignatures,
  exerciseSignature,
} from "../engine/completion";

import {
  getFlowDayCards,
  saveFlowDayCards,
  isFlowDayFixed,
  setFlowDayFixed,
} from "../engine/storage";

// ---------------------------------------------------------------------------
// PART 1 — Configuration and state
// ---------------------------------------------------------------------------

const TIME_BLOCKS = [
  {
    id: "morning",
    name: "Morning",
    description:
      "Start the day by waking up the body and establishing movement readiness.",
  },

  {
    id: "midday",
    name: "Midday",
    description:
      "A movement opportunity to break up the middle of the day.",
  },

  {
    id: "afternoon",
    name: "Afternoon",
    description:
      "Support movement, strength, and mobility as the day continues.",
  },

  {
    id: "evening",
    name: "Evening",
    description:
      "Transition toward recovery, mobility, and decompression.",
  },
];

/*
 * --------------------------------------------------------------------------
 * Card Exercise Limits
 * --------------------------------------------------------------------------
 *
 * Flow Day Morning is intentionally allowed to contain a larger curated
 * grouping because Morning is the heaviest Flow Day TimeBlock.
 *
 * All other Flow Day TimeBlocks use the standard five-exercise maximum.
 */

const MAX_EXERCISES_BY_TIME_BLOCK = {
  morning: 8,
  midday: 5,
  afternoon: 5,
  evening: 5,
};

/*
 * ============================================================================
 * Morning Default Curation
 * ============================================================================
 *
 * Morning is the heaviest TimeBlock in Flow Day.
 *
 * These are the PURPOSES used to generate the initial Morning experience.
 *
 * These are curation criteria only. The resulting Cards are ordinary Cards
 * and can be edited normally.
 *
 * The exact purpose values must match the values used by purposes.js.
 */

const MORNING_DEFAULT_PURPOSES = [
  "jointPreparation",
  "rangeDevelopment",
  "bodyAwareness",
];

function FlowDay() {

  /*
   * --------------------------------------------------------------------------
   * Cards by TimeBlock
   * --------------------------------------------------------------------------
   *
   * This is the CURRENT working routine.
   *
   * It is intentionally separate from fixed routines.
   */

  const [
    cardsByTimeBlock,
    setCardsByTimeBlock,
  ] = useState({
    morning: [],
    midday: [],
    afternoon: [],
    evening: [],
  });

  /*
   * --------------------------------------------------------------------------
   * Fixed State by TimeBlock
   * --------------------------------------------------------------------------
   *
   * This answers:
   *
   * "Has the user intentionally established this TimeBlock as fixed?"
   *
   * It does NOT contain the routine itself.
   *
   * The actual fixed Cards live in storage.
   */

  const [
    fixedByTimeBlock,
    setFixedByTimeBlock,
  ] = useState({
    morning: false,
    midday: false,
    afternoon: false,
    evening: false,
  });

  /*
   * --------------------------------------------------------------------------
   * Curation Selections by TimeBlock
   * --------------------------------------------------------------------------
   *
   * These remain available because Replace Exercise and Add Exercise need
   * the original curation criteria.
   */

  const [
    selectionsByTimeBlock,
    setSelectionsByTimeBlock,
  ] = useState({
    morning: null,
    midday: null,
    afternoon: null,
    evening: null,
  });

  /*
   * --------------------------------------------------------------------------
   * Messages by TimeBlock
   * --------------------------------------------------------------------------
   */

  const [messagesByTimeBlock, setMessagesByTimeBlock] =
    useState({
      morning: "",
      midday: "",
      afternoon: "",
      evening: "",
    });

// ---------------------------------------------------------------------------
// PART 2 — The Morning curation path
// ---------------------------------------------------------------------------

  /*
   * ==========================================================================
   * Persist Current Working Routine
   * ==========================================================================
   *
   * This persists what the user is CURRENTLY working with.
   *
   * It does not make the routine fixed.
   */

  function persistTimeBlockCards(timeBlock, cards) {
    saveFlowDayCards(timeBlock, cards);
  }

  /*
   * ==========================================================================
   * Get Every Exercise Already Used by a Flow Day Card
   * ==========================================================================
   *
   * This is intentionally GLOBAL across all TimeBlocks.
   *
   * Automatic curation must never reuse an exercise that has already been
   * selected by another Flow Day Card.
   *
   * Manual Add Exercise, Replace, and Custom Build remain separate
   * intentional overrides. The user has direct library access by design.
   */

  function getUsedExerciseIds() {
    return TIME_BLOCKS.flatMap(
      (timeBlock) =>
        cardsByTimeBlock[timeBlock.id] ?? []
    ).flatMap(
      (card) =>
        Array.isArray(card?.exercises)
          ? card.exercises
          : []
    );
  }

  /*
   * ==========================================================================
   * Build Default Morning
   * ==========================================================================
   *
   * Morning gets ONE Card from the combined default purpose selection.
   *
   * We intentionally do not create artificial Cards for each purpose.
   */

  function buildDefaultMorning() {

    const selection = {
      purposes: MORNING_DEFAULT_PURPOSES,
      classifications: [],
      equipment: [],
    };

    setMessagesByTimeBlock((current) => ({
      ...current,
      morning: "",
    }));

    const card = curateCard({
      exercises,
      selection,
      timeBlock: "morning",
      excludedExerciseIds: getUsedExerciseIds(),
    });

    if (!card) {
      setMessagesByTimeBlock((current) => ({
        ...current,
        morning:
          "No matching movements were found for the default Morning curation.",
      }));

      return;
    }

    const morningCards = [card];

    setSelectionsByTimeBlock((current) => ({
      ...current,
      morning: selection,
    }));

    setCardsByTimeBlock((current) => ({
      ...current,
      morning: morningCards,
    }));

    /*
     * Persist the newly curated working routine immediately.
     *
     * It is NOT fixed yet.
     */

    persistTimeBlockCards(
      "morning",
      morningCards
    );
  }

  /*
   * ==========================================================================
   * Fix Morning
   * ==========================================================================
   *
   * The current working Morning routine becomes the established fixed routine.
   *
   * This does not create a second copy in cardsByTimeBlock.
   */

  function handleFixMorning() {

    const morningCards =
      cardsByTimeBlock.morning;

    if (morningCards.length === 0) {
      return;
    }

    setFlowDayFixed(
      "morning",
      morningCards
    );

    setFixedByTimeBlock((current) => ({
      ...current,
      morning: true,
    }));
  }

  /*
   * ==========================================================================
   * Build Card
   * ==========================================================================
   *
   * A fresh Build replaces the current Cards for THIS TimeBlock.
   *
   * Automatic curation excludes exercises already used anywhere else in
   * Flow Day.
   */

  function handleBuild(
    timeBlock,
    selection
  ) {

    setMessagesByTimeBlock((current) => ({
      ...current,
      [timeBlock]: "",
    }));

    const card = curateCard({
      exercises,
      selection,
      timeBlock,
      excludedExerciseIds: getUsedExerciseIds(),
    });

    if (!card) {

      setSelectionsByTimeBlock((current) => ({
        ...current,
        [timeBlock]: selection,
      }));

      setMessagesByTimeBlock((current) => ({
        ...current,
        [timeBlock]:
          "No matching movements were found for those selections.",
      }));

      return;
    }

    const nextCards = [card];

    setSelectionsByTimeBlock((current) => ({
      ...current,
      [timeBlock]: selection,
    }));

    setCardsByTimeBlock((current) => ({
      ...current,
      [timeBlock]: nextCards,
    }));

    persistTimeBlockCards(
      timeBlock,
      nextCards
    );
  }
}

export default FlowDay;
