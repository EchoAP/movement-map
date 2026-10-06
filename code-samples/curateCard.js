/**
 * ============================================================================
 * Module: curateCard
 * ----------------------------------------------------------------------------
 * Purpose:
 * Curate a Card from the Exercise Library based on the user's selections.
 *
 * Architecture:
 * curateCard.js is the bridge between the filtering process and the Card
 * factory.
 *
 * Flow:
 *
 * User Selection
 *      ↓
 * filterExercises()
 *      ↓
 * Eligible Exercises
 *      ↓
 * curateCard()
 *      ↓
 * Selected Exercise IDs
 *      ↓
 * createCard()
 *      ↓
 * Card
 *
 * This module does NOT:
 * - define vocabulary
 * - modify Exercise Library entries
 * - own filtering rules
 * - score exercises
 * - manage weekly history
 * - persist Cards
 *
 * Future Enhancements:
 * Scoring, weekly rotation, relational suitability, and progression can be
 * added here when those engine capabilities are implemented.
 * ============================================================================
 */

import { filterExercises } from "./filters";
import { createCard } from "../library/cards";

/*
 * --------------------------------------------------------------------------
 * Default Card Size
 * --------------------------------------------------------------------------
 *
 * The 3–5 movement guideline applies to the overall movement experience,
 * not to an individual Card.
 *
 * Four is currently used as the prototype selection size only.
 * It is NOT stored as a Card target.
 */

const DEFAULT_EXERCISE_COUNT = 4;

/**
 * Curate a Card from the Exercise Library.
 *
 * @param {Object[]} exercises
 *   Exercise Library entries.
 *
 * @param {Object} selection
 *   User selections from FilterPanel.
 *
 * @param {string} selection.classification
 *   Classification that determines the identity of the Card.
 *
 * @param {string[]} selection.purposes
 *   Selected purposes used to determine exercise eligibility.
 *
 * @param {string[]} selection.equipment
 *   Selected equipment used to determine exercise eligibility.
 *
 * @param {string} timeBlock
 *   Optional Flow Day time-block context.
 *
 * @param {number} exerciseCount
 *   Number of exercises to select for this Card.
 *
 * @returns {Object|null}
 *   A Card object, or null when no eligible exercises exist.
 */

export function curateCard({
  exercises,
  selection,
  timeBlock = null,
  exerciseCount = DEFAULT_EXERCISE_COUNT,
  excludedExerciseIds = [],
}) {
  /*
   * --------------------------------------------------------------------------
   * Validate Required Selection
   * --------------------------------------------------------------------------
   *
   * The selected classification determines the Card's identity.
   * At least one filter is required to begin curation.
   *
   * A Classification is preferred because it directly determines Card
   * identity when the user selects one.
   *
   * Purpose and Equipment may also be used independently.
   */

  const selectedPurposes = selection?.purposes ?? [];
  const selectedClassifications = selection?.classifications ?? [];
  const selectedEquipment = selection?.equipment ?? [];

  const hasSelection =
    selectedPurposes.length > 0 ||
    selectedClassifications.length > 0 ||
    selectedEquipment.length > 0;

  if (!hasSelection) {
    return null;
  }

  /*
   * --------------------------------------------------------------------------
   * Filter Exercise Library
   * --------------------------------------------------------------------------
   *
   * filters.js determines which exercises are eligible based on the user's
   * selected Purpose, Classification, and Equipment.
   */

  const eligibleExercises = filterExercises(exercises, selection, excludedExerciseIds);

  if (eligibleExercises.length === 0) {
    return null;
  }

  /*
   * --------------------------------------------------------------------------
   * Select Exercises
   * --------------------------------------------------------------------------
   *
   * For the first working version, take the first eligible exercises.
   *
   * This is intentionally NOT randomized or scored.
   *
   * Later:
   * - scoring.js can rank candidates
   * - weeklyMemory.js can provide usage history
   * - relational suitability can influence ordering
   * - progression can influence selection
   */

  const selectedExercises = eligibleExercises.slice(0, exerciseCount);

  /*
   * --------------------------------------------------------------------------
   * Determine Card Classification
   * --------------------------------------------------------------------------
   *
   * When the user selects a Classification, that selection determines the
   * Card's identity.
   *
   * If the user begins curation using only Purpose or Equipment, temporarily
   * derive the Card classification from the eligible Exercise Library entries.
   *
   * This allows all three filters to function independently while preserving
   * the Card's classification requirement.
   *
   * Later, scoring can determine the most appropriate classification rather
   * than simply using the first available one.
   */

  let classification = selectedClassifications[0];

  if (!classification) {
    classification =
      selectedExercises[0]?.classifications?.[0] ?? null;
  }

  if (!classification) {
    return null;
  }

  /*
   * --------------------------------------------------------------------------
   * Create Card
   * --------------------------------------------------------------------------
   *
   * The Card stores references to Exercise Library entries by ID.
   *
   * The Card's classification comes from the user's selected classification,
   * not from every classification represented by its exercises.
   */

  return createCard({
    id: createCardId(classification, timeBlock),
    classification,
    timeBlock,
    selection,
    exercises: selectedExercises.map((exercise) => exercise.id),
  });
}

/**
 * Create a unique Card instance ID.
 *
 * The Card ID identifies this generated Card instance.
 * It is not the classification ID itself.
 *
 * @param {string} classification
 * @param {string|null} timeBlock
 * @returns {string}
 */

function createCardId(classification, timeBlock) {
  const context = timeBlock ? `-${timeBlock}` : "";

  return `card-${classification}${context}-${Date.now()}`;
}
