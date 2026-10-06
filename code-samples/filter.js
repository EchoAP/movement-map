/**
 * ============================================================================
 * Module: filters
 * ----------------------------------------------------------------------------
 * Purpose:
 * Filter Exercise Library entries according to the user's selections.
 *
 * Architecture:
 * filters.js determines which exercises are eligible.
 *
 * It does NOT:
 * - score exercises
 * - choose the final exercises for a Card
 * - create Cards
 * - manage history or weekly rotation
 *
 * Selection Flow:
 * FilterPanel
 *      ↓
 * selection
 *      ↓
 * filterExercises()
 *      ↓
 * eligible exercises
 *
 * Matching Rules:
 * - Multiple purposes use OR logic.
 * - Multiple classifications use OR logic.
 * - Multiple equipment selections use OR logic.
 * - Empty selections are unrestricted.
 * - Explicitly excluded exercises are never eligible.
 *
 * Data Source:
 * - Exercise Library
 * ============================================================================ 
 */

/**
 * Check whether an exercise matches at least one selected value.
 *
 * Used for Purpose, Classification, and Equipment selections.
 */

function matchesAny(
  exerciseValues = [],
  selectedValues = []
) {
  if (selectedValues.length === 0) {
    return true;
  }

  return selectedValues.some((value) =>
    exerciseValues.includes(value)
  );
}

/**
 * Filter exercises according to the user's selections.
 *
 * @param {Object[]} exercises
 * @param {Object} selection
 * @param {string[]} excludedExerciseIds
 *
 * @returns {Object[]}
 */
export function filterExercises(
  exercises,
  selection = {},
  excludedExerciseIds = []
) {
  const {
    purposes: selectedPurposes = [],
    classifications: selectedClassifications = [],
    equipment: selectedEquipment = [],
  } = selection;

  return exercises.filter((exercise) => {

    /*
     * Explicit exclusions always win.
     *
     * This is used by automatic Flow Day curation to prevent an Exercise
     * already used elsewhere in Flow Day from being selected again.
     */
    if (excludedExerciseIds.includes(exercise.id)) {
      return false;
    }

    const matchesPurpose =
      matchesAny(
        exercise.purposes,
        selectedPurposes
      );

    const matchesClassification =
      matchesAny(
        exercise.classifications,
        selectedClassifications
      );

    const matchesEquipment =
      matchesAny(
        exercise.equipment,
        selectedEquipment
      );

    return (
      matchesPurpose &&
      matchesClassification &&
      matchesEquipment
    );
  });
}
