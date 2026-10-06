# Movement Map — Roadmap

This roadmap is intentionally lightweight. Movement Map is a solo project being built at a sustainable pace, so the roadmap describes sequence and priority rather than deadlines or formal sprints.

The roadmap reflects the product as it is actually being developed. Individual implementation details may change as the application is used, but the product principles, Mode distinctions, movement-first foundation, and user-centered approach are stronger constraints than any particular implementation.

Movement Map is designed around the idea that people enter movement from different places and should be able to progress from where they actually are.

**Legend**

- `[x]` — done
- `[/]` — partially done / in progress
- `[ ]` — not started

## Current — Product & Technical Foundation

- [x] Create React/Vite application.
- [x] Establish React Router.
- [x] Establish shared Layout.
- [x] Establish shared Navigation.
- [x] Create reusable ModeCard.
- [x] Create Home page with data-driven mode cards.
- [x] Add active navigation state.
- [x] Establish project documentation.
- [x] Establish Mode-first navigation and experience.
- [x] Establish the distinction between Modes, Cards, Sequences, and Exercises.
- [x] Establish shared exercise library architecture.
- [x] Establish centralized storage/persistence layer.
- [x] Establish reusable filtering and curation engine.
- [x] Establish shared exercise metadata as the authoritative source for movement information.
- [x] Define the exercise data model.
- [/] Unify Mode persistence.
      Flow Day uses storage.js helpers exclusively. Grab & Go uses the
      generic working-routine helpers but performs persistence triggering
      and selection/message state inline in the page. Remaining
      inconsistency is between Flow Day and Grab & Go; scheduled cleanup.
- [x] Audit CSS organization.
- [ ] Decide persistence strategy for cross-device use.
      localStorage is per-device. Cross-device requires a backend.
      Architectural boundary is in place: storage.js and completion.js
      are the only files that touch localStorage, so the swap is
      localized. Not scheduled yet, but noted as a future structural
      change.
- [ ] Card titling scheme.
      Titles are currently derived from the first exercise's first
      classification (curated) or placeholder ("Custom"). This is
      misleading for mixed cards in every mode. Needs a deliberate
      scheme. Likely positional (Anchor, Superset, Circuit) rather than
      content-derived. Depends on prescriptions for Full Body.
- [ ] Delete the two empty hook files.
      src/hooks/useLocalStorage.js and src/hooks/useDailyReset.js are
      both empty. Remove.
- [ ] Picker and page visual styling.
      The Exercise Picker is functional but styled structurally only.
      Flow Day, Grab & Go, and Home have page-level classes referenced
      in JSX but not defined anywhere. index.css is the right home for
      page styles per the convention settled this session.

## Product Principles

- [x] Movement that meets you where you are.
- [x] Favor progression over perfection.
- [x] Reduce decision fatigue rather than creating additional pressure.
- [x] Support different energy/capacity levels without treating lower-capacity movement as failure.
- [ ] Support people entering movement from substantially different starting points.
- [x] Preserve user agency and choice.
- [x] Avoid streak-centered motivation.
- [x] Avoid calorie-centered motivation.
- [x] Avoid unnecessary gamification and conventional fitness-app pressure systems.
- [x] Keep accessibility and usability embedded in the product rather than creating a separate "accessible" version of Movement Map.
- [x] Do not add conventional fitness-app features simply because other fitness apps have them.
- [ ] Continue evaluating every major feature against these principles.

## Movement Library & Movement Data

The movement library is the authoritative source for exercise definitions. Workout-specific information such as sets, reps, resistance, completion, and history should remain separate from the underlying exercise definition.

### Exercise Definition

- [x] Define exercise schema.
- [x] Establish centralized exercise library.
- [x] Define movement classifications.
- [x] Define movement families/relationships where appropriate.
- [x] Define body-region and muscle relationships. >>> now anatomy.
- [x] Define purpose metadata.
- [x] Define movement-pattern metadata.
- [x] Define movement-plane metadata.
- [x] Define movement-chain metadata.
- [x] Define anatomy metadata.
- [x] Define joint relationships.
- [x] Define equipment requirements/options.
- [x] Define capability/accessibility metadata.
- [x] Define coaching/instructional information.
- [x] Define progression metadata.
- [x] Define levels: light, easy, intermediate, hard, demigod.
- [/] Define "Builds Toward," "Supports," "Pairs Well With," and "Unlocks" relationships.
- [x] Normalize exercise metadata and vocabulary.
- [x] Preserve meaningful exercise relationships without forcing relationships where they are not supportable.
- [x] Establish exercise IDs as stable references for use throughout the application.
- [ ] Continue expanding and refining the exercise library.
- [ ] Continue adding movement-specific coaching notes, best practices, and common mistakes where useful.
- [ ] Audit and refine exercise metadata against the finalized capability/progression framework.
- [ ] Add/expand exercise demonstrations and instructional media later.
- [x] Add anatomy metadata to exercise objects.
      anatomy.js defines muscles and joints. Anatomy is now part of the
      exercise schema and populated on current library entries.
- [ ] Backfill movement metadata on older Exercise Library entries.
      Some exercises were defined before movementFamilies,
      movementChains, movementPlanes, movementPatterns, and progression
      metadata were finalized. Bring them in line so they participate
      consistently.

## Exercise Selection Experience

The exercise picker used for Add Exercise, Replace Exercise, and Custom Build is a core interaction, not a dropdown. It is app level while each Mode passes its own rules. The picker itself does not know about Modes.

- [x] Build a shared Exercise Picker component (app level).
- [x] Support two modes: single-select (Replace), multi-select (Add Exercise, Custom Build).
- [x] Search by exercise name.
- [ ] Display per-row metadata: classification, equipment, level.
- [ ] Respect calling-context rules passed by the Mode:
        - candidate list (what is currently allowed)
        - max (1 for Replace, remaining slots for Add, card max for Custom Build)
- [ ] Enforce calling-context exclusion scope (Reading 1):
        - same Card: never duplicate
        - same TimeBlock (Flow Day): excluded
        - same Mode (Grab & Go, Full Body): excluded
        - across Modes: NOT excluded
- [x] Replace every existing exercise `<select>` with the picker.
- [ ] Replace both Flow Day curation paths' reliance on inline dropdowns with the picker for Custom Build.
- [ ] Keyboard navigation and search focus.

### Deferred from picker v1

- [ ] Filter chips inside the picker.
- [ ] Recently-used section.
- [ ] Suggestions based on history / recency.
- [ ] Expandable per-row movement-literacy detail (purposes, unlocks, builds toward, supports).

## Movement Capability & Progression Framework

Movement Map should not assume that every person begins at the same level. The six levels describe movement capability/readiness, not simply difficulty, and are not intended to function as a single universal ranking for the entire person.

### Capability Levels

- [ ] Establish Light / Novice.
        Very little or no fitness experience.
        Gentle movement, stretching, joint preparation, prehab, and foundational movement.
        Appropriate for people with substantially limited starting capacity.
        Designed to accommodate people whose current physical capacity makes conventional beginner fitness inappropriate.
- [ ] Establish Easy / Beginner.
        Little structured fitness experience.
        Generally capable of ordinary daily movement without assistive tools.
        Building a basic strength, mobility, and movement foundation.
        Physical limitation is primarily lack of training experience rather than substantial functional limitation.
- [ ] Establish Normal / Intermediate.
        Existing baseline of fitness.
        May come from demanding physical work, recreational activity, or exercising multiple times per week.
        Can tolerate meaningful training demand.
- [ ] Establish Hard.
        Fitness is an established part of the person's lifestyle.
        Regular training, approximately several times per week.
        Greater work capacity and ability to tolerate increased challenge.
- [ ] Establish Advanced.
        Elevates the demands of Hard.
        Advanced strength, unilateral strength, difficult compound movements, pull-ups, one-arm push-up progressions, and similar challenges.
- [ ] Establish Ultimate / Demigod.
        Highest tier of movement capability.
        Advanced calisthenic skills and body control.
        Planche, handstands, flags, advanced pulling/pushing skills, and other major skills.
        Deep strength combined with mobility, flexibility, range of motion, positional control, and demanding movement angles.
        Represents the intersection of high-level body composition, strength, mobility, and movement skill.

### Capability Model

- [ ] Define each tier in terms of actual movement capability rather than perceived difficulty alone.
- [ ] Avoid assuming everyone should progress through every tier sequentially.
- [ ] Allow users to begin at different tiers.
- [ ] Treat capability as potentially different across movement domains.
- [ ] Avoid reducing the user to one universal fitness level.
- [ ] Establish capability dimensions such as:
        upper-body pushing
        upper-body pulling
        lower-body strength
        core/body control
        mobility/ROM
        balance/stability
        movement skill
        general work capacity
- [ ] Determine which capability dimensions are meaningful enough to track.
- [ ] Determine how these dimensions influence exercise ranking and recommendations.
- [ ] Allow demonstrated capability to influence future recommendations.
- [ ] Avoid arbitrary gamified "leveling up."

### Progression Relationships

Establish consistent definitions:

**unlocks = NEXT**
The next meaningful progression step that becomes appropriate after developing the preceding movement.

Example: Knee Push-Up → Standard Push-Up

- [ ] Define unlocks as a near-term progression relationship.
- [ ] Keep unlocks focused on meaningful next-step relationships.

**buildsTowards = DESTINATION**
A longer-term movement or skill that the exercise helps develop toward, potentially several progression steps away.

Example: Knee Push-Up → One-Arm Push-Up

- [ ] Define buildsTowards as a longer-term developmental relationship.
- [ ] Allow multiple intermediate steps between the exercise and destination.
- [ ] Use the relationship where the developmental connection is meaningful and supportable.

**supports = HELPER**
A movement that develops a quality, capacity, mobility component, or prerequisite that helps another movement, without being a direct progression into it.

Examples:
- Hollow Body Hold → supports → Handstand
- Wrist Preparation → supports → Handstand

- [ ] Define supports as a complementary/prerequisite relationship.
- [ ] Keep supports distinct from progression.
- [ ] Avoid forcing relationships merely to make the exercise graph more interconnected.

## User Starting Profile & Adaptive Onboarding

Movement Map should determine where a person is starting rather than simply asking them to choose a generic fitness level. The onboarding questionnaire should exist because its answers change what Movement Map recommends.

- [ ] Design a meaningful onboarding questionnaire.
- [ ] Identify questions that materially affect movement recommendations.
- [ ] Determine useful starting-capability dimensions.
- [ ] Determine movement experience/familiarity.
- [ ] Determine relevant goals and priorities.
- [ ] Determine available equipment/environmental constraints.
- [ ] Determine relevant movement preferences.
- [ ] Determine movement confidence/familiarity where useful.
- [ ] Establish useful baseline functional-capacity questions.
- [ ] Translate questionnaire responses into a starting movement profile.
- [ ] Establish initial exercise-readiness rankings from that profile.
- [ ] Establish an appropriate starting exercise pool.
- [ ] Avoid assuming a single starting level for all movement domains.
- [ ] Allow different areas of the body/capability to start at different levels.
- [ ] Allow actual exercise history to eventually refine the initial profile.
- [ ] Ensure questionnaire answers have observable consequences within the application.
- [ ] Avoid collecting information simply because conventional fitness apps collect it.

### Anatomy Foundation

Anatomy is not a Full Body feature. It is an application-wide foundation that can eventually inform curation, history, recommendations, and movement balance across every Mode.

- [x] Establish anatomy as part of exercise metadata.
- [x] Establish muscles and joints as exercise-level relationships.
- [x] Establish/complete shared anatomy vocabulary.
- [x] Refine muscle-group and regional terminology.
- [x] Backfill anatomy metadata across the existing Exercise Library.
- [ ] Connect anatomy metadata to stored workout/routine information.
      Completions snapshot anatomy per exercise. Working routines and
      fixed routines still reference exercises by ID and rely on library
      lookup.
- [ ] Track anatomical coverage across completed movement.
- [ ] Aggregate anatomical coverage over weekly activity.
      aggregate.js computes muscle counts over a window. Needs to be
      consumed as a user-facing or curation-facing signal, not just
      debug output.
- [ ] Use anatomy to identify repeated muscular emphasis.
- [ ] Use anatomy to identify neglected regions/muscle groups.
      intelligence.js produces a neglected-muscles list. Not yet used.
- [ ] Use anatomy as one input into future recommendations.
- [ ] Consider whole-body coverage rather than merely counting exercises or workouts.

#### Joint Preparation Distinction

- [ ] Keep joint preparation conceptually separate from muscular fatigue/recovery.
- [ ] Do not treat joints as simply needing "rest" because an associated muscle was recently trained.
- [ ] Preserve the principle that joint preparation may remain useful regardless of recent muscular activity.

The long-term goal is:

    Exercise anatomy → stored workout/completion metadata
    → weekly aggregation → informed suggestions

rather than treating anatomy as a special feature belonging to one Mode.

## Cards and Sequences

Cards are exercise containers/groupings, not routines. A Mode is the routine/workout. Cards organize the exercises within that Mode.

- [x] Define card structure.
- [x] Define sequence structure.
- [x] Make exercises reusable across cards and modes.
- [x] Preserve the distinction between exercises, card, and mode.
- [x] Establish card completion behavior.
- [x] Establish card-specific curation metadata.
- [x] Establish card-specific filters.
- [x] Establish manual exercise Add behavior.
- [x] Establish manual exercise Replace behavior.
- [x] Prevent duplicate exercises within a card.
- [x] Establish card exercise maximum for applicable cards.
- [ ] Add save/favorite capability for cards.
- [ ] Add notes/customization metadata to saved cards.
- [ ] Expand card grouping behavior where useful.
- [x] Manual Add/Replace retains the Card's original filters.
- [x] Manual Add/Replace can intentionally override Mode-level automatic exclusion.

### Curation Rules

- [x] Purpose filtering uses OR logic.
- [x] Classification filtering uses OR logic.
- [x] Equipment filtering uses OR logic.
- [x] Explicit exercise exclusions are respected by the filter layer.
- [x] Automatic curation can exclude exercises already used within the current Mode.
- [x] Manual Add/Replace can intentionally override Mode-level automatic exclusion.
- [x] Manual Add/Replace retains the Card's original filters.
- [x] Automatic and manual curation are treated as different behaviors.
- [x] Add Sequence creates a fresh selection rather than silently reusing another Card's filters.
- [ ] Add ranking above basic filtering.
- [ ] Expand curation to incorporate historical/weekly context.
- [ ] Incorporate novelty and recent-use information without making recommendations rigid.

Notes: purpose, classification, targets/anatomy, what has already been done during the week, what remains open, novelty/rotation, accessibility, keeping the workload small.

## Flow Day

Flow Day is the distributed movement Mode, organized around the day rather than a single conventional workout.

### Structure

- [x] Establish Morning.
- [x] Establish Midday.
- [x] Establish Afternoon.
- [x] Establish Evening.
- [x] Establish TimeBlock-specific Card limits.
- [x] Establish Morning as the primary/heaviest TimeBlock.
- [x] Establish Morning's default purposes: jointPreparation, rangeDevelopment, bodyAwareness.

### Curation & Customization

- [x] Curate TimeBlock Cards.
- [x] Support purpose/category filtering.
- [x] Support equipment filtering.
- [x] Preserve Card-specific filters.
- [x] Hide the initial FilterPanel once Cards exist.
- [x] Allow exercise replacement.
- [x] Allow manual exercise addition.
- [x] Allow additional Sequences.
- [x] Exclude already-used exercises during automatic Mode curation.
- [x] Allow intentional manual overrides.
- [x] Preserve Flow Day state across navigation.
- [x] Persist Flow Day Cards.
- [x] Support fixed Flow Day state.
- [x] Support updating fixed Flow Day content.
- [/] Continue refining Morning Anchor behavior.
- [ ] Allow users to build and save named custom Morning/Evening routines.
- [ ] Allow saved routines to be retrieved and reused.
- [ ] Incorporate recent activity into future recommendations.
- [ ] Incorporate weekly movement coverage.
- [ ] Incorporate anatomy into future Flow Day recommendations.
- [ ] Incorporate adaptive capability/readiness into future curation.
- [ ] Add Custom Build path to Flow Day Morning.
      Currently Morning offers:
        - Build Morning (default purposes)
        - Add Sequence → Keep Current Filters
        - Add Sequence → Start New Curation
      Missing: a Custom Build option that opens the Exercise Picker
      against the full library with no filter panel required.

      Entry points:
        - initial Morning (no cards yet): Build Morning OR Custom Build
        - Add Sequence: Keep Current Filters OR Start New Curation OR Custom Build

      Custom Build respects the same exclusion scope as automatic
      curation (same Card, same TimeBlock), but lifts the filter
      constraint.
- [ ] Add "start over" options for Flow Day TimeBlocks.
      Currently a fixed routine can be overwritten but not removed and
      today's working cards cannot be wiped entirely.

      Two distinct actions:
        - Reset Today — clear current working cards for the TimeBlock.
          Leave the fixed routine intact.
        - Unfix and Reset — clear both current working cards AND the
          fixed routine. Return to a blank TimeBlock.

### Design Direction

- [x] Keep movement distributed rather than forcing everything into one workout.
- [x] Keep sequences meaningful and manageable.
- [x] Avoid oversized routines.
- [x] Preserve user control over customization.
- [ ] Develop richer saved-routine/reuse behavior.

## Grab & Go

Grab & Go is the low-friction Mode for situations where the user wants movement without constructing a larger workout.

- [x] Build low-energy movement cards.
- [x] Reuse exercises from the shared library.
- [x] Filter by need/purpose.
- [x] Filter by equipment.
- [x] Curate Cards automatically.
- [x] Preserve Card-specific filters.
- [x] Support manual Add.
- [x] Support manual Replace.
- [x] Prevent duplicate exercises within a Card.
- [x] Exclude exercises already used elsewhere in the current Mode during automatic curation.
- [x] Allow manual overrides of Mode-level exclusion.
- [x] Persist Cards.
- [x] Restore Cards after navigation.
- [x] Restore Card-specific curation selections.
- [x] Support Add Sequence after navigation.
- [x] Hide the initial FilterPanel once Cards exist.
- [x] Enforce 5-exercise Card maximum.
- [ ] Refine category/movement balance.
- [ ] Incorporate recent activity and weekly coverage.
- [ ] Incorporate adaptive exercise ranking.
- [ ] Explore optional Surprise Me behavior without making it the primary selection mechanism.
- [ ] Explore saved/favorite Grab & Go Cards.

## Full Body

Full Body is the Mode that most closely resembles a conventional fitness-app workout while retaining Movement Map's movement-first philosophy. The Full Body Mode itself is the routine. Cards are groupings within that routine. Full Body should curate a complete workout, rather than simply generating one Card.

### Workout Configuration

- [/] Build Full Body configuration experience.
      UI exists. Semantics of duration and exercise count not yet enforced.
- [/] Allow the user to choose workout duration.
- [/] Allow the user to choose approximate exercise count.
- [ ] Determine the appropriate curation strategy from those preferences.
- [/] Allow existing exercise filters to influence workout curation.
- [ ] Allow the user to include or exclude a preset warm-up.
- [ ] Allow the user to include or exclude a preset cool-down.
- [ ] Ensure warm-up/cool-down additions do not count against the requested curated workout exercise count.
- [ ] Ensure supplemental warm-up/cool-down additions do not disrupt the curated workout.
- [ ] Preserve the user's manually built workout when supplemental warm-up/cool-down options are changed.

### Workout Curation

- [x] Build Full Body-specific workout curation.
- [x] Reuse the shared exercise filtering engine.
- [x] Select a complete exercise pool/workout rather than a single Card.
- [x] Avoid duplicate exercises.
- [/] Consider movement balance when selecting exercises.
      v1 groups by movement chain, tiebroken by pattern.
- [ ] Consider equipment compatibility.
- [ ] Consider user starting capability/readiness.
- [ ] Consider exercise-level progression metadata.
- [x] Organize selected exercises into Cards.
- [x] Respect the 5-exercise Card maximum.
- [x] Allow multiple Cards within the Full Body routine.
- [/] Establish sensible grouping behavior such as supersets, circuits, straight sets.
      v1 groups by chain. Superset/Circuit semantics depend on prescriptions.
- [x] Preserve the distinction between the curated workout and its Card groupings.
- [ ] Consider movement relationships, fatigue, equipment, and eventually anatomy when determining groupings.
- [ ] Incorporate user history and preferences into future ranking.
- [ ] Allow the user to manually modify the generated workout without fighting the curation system.
- [ ] Add Sequence support for Full Body.
      Flow Day and Grab & Go both support adding a sequence after
      initial curation. Full Body does not. Depends on prescriptions
      existing, since a new Full Body card without sets/reps/load in a
      mode where everything else has them would be a half-feature.

### Workout Prescriptions

Each Full Body exercise occurrence should have workout-specific prescription data without changing the authoritative exercise-library definition.

- [/] Add mutable sets.
      Sets exist on each exercise occurrence. Mutable through state, but
      no UI to edit them yet.
- [/] Add mutable reps.
- [ ] Add mutable weight/load where appropriate.
- [ ] Add mutable band type/resistance where appropriate.
- [x] Respect exercise-specific equipment requirements.
      scoring.js generatePrescription() receives the exercise and its
      equipment.
- [x] Generate sensible starting prescriptions.
      scoring.js generates a prescription per exercise during curation.
      expandPrescriptionToSets() expands it into the set array the
      workout shape uses.
- [/] Allow users to modify generated prescriptions.
      Data model supports it. No UI yet.
- [x] Keep prescriptions separate from library exercise definitions.
- [/] Persist customized prescriptions with the workout.
      Prescriptions are stored inside the workout groups. Customization
      UI does not exist, so nothing custom is persisted yet.
- [ ] Preserve compatibility with future execution/timer functionality.

### Full Body Completion Model

Full Body completion is workout-level, not card-level. Full Body cards are not marked complete individually. Sets are logged as they are performed. The workout is marked finished at the end. Completion records at the workout level, once, including every exercise's prescription.

- [x] Record workout-level completion.
      completion.js recordWorkoutCompletion() writes planned duration,
      actual duration (currently null), exercise count, and per-exercise
      prescriptions to the completion record for the date.
- [ ] Trigger workout-level completion from the UI.
      The write path exists. The page does not yet call it.
- [ ] Define set-level completion behavior.
- [ ] Allow individual sets to be marked complete.
- [ ] Support variable numbers of sets.
- [ ] Preserve set completion whether workout is timed or untimed.
- [ ] Distinguish set completion from Card completion.
- [ ] Support logging actual performance against prescribed sets/reps/load.
- [ ] Preserve incomplete workouts without falsely marking the entire workout complete.
- [ ] Determine appropriate UI/interaction model for set-level logging.
- [ ] Consider whether existing Card UI requires a dedicated Full Body presentation.
- [ ] Feed completed set data into workout history.
- [ ] Preserve data required for future progression and curation.
- [ ] Record plannedDuration and actualDuration separately.
      Planned duration is what the user selected during configuration.
      Actual duration is populated by the future timer. Different
      numbers, both meaningful.
- [ ] Store exerciseCount on the Full Body record, not derived.
      Kept in sync with the current workout as exercises are added or
      removed. When a user looks at a past date, "12 exercises in 30
      minutes" is immediate information.

### Execution — Later Phase

The data model should support a future guided experience without requiring the workout architecture to be rebuilt.

- [ ] Add rest-period metadata.
- [ ] Add circuit/round metadata where appropriate.
- [ ] Support Card-to-Card transitions.
- [ ] Support exercise sequencing.
- [ ] Build Full Body timer/execution experience.
- [ ] Support guided workout progression without requiring a separate "guided mode."
- [ ] Allow timed and untimed execution.
- [ ] Preserve manual control and the ability to modify the workout.

### Full Body Saved Routines — Later

- [ ] Save customized Full Body workouts.
- [ ] Allow user-defined routine names.
- [ ] Store routine metadata.
- [ ] Retrieve previously saved Full Body routines.
- [ ] Allow saved routines to be modified without overwriting the original unintentionally.

## Movement History, Recovery, Completion & Weekly Intelligence

Movement history should eventually become an active source of intelligence rather than merely a record of what the user did.

- [x] Establish persistent workout/Card state.
- [x] Establish structured completion metadata.
- [x] Record completed exercises with stable exercise references.
      Completion records now store exercise snapshots keyed by date,
      mode, and (Flow Day) timeBlock. Snapshot fields: id,
      classifications, purposes, anatomy (primaryMuscles,
      secondaryMuscles, joints), movementChains, movementPlanes,
      movementPatterns, level. Cards are not stored; the exercises are.
- [x] Record workout/Mode context.
- [x] Record Card/Sequence context where meaningful.
- [/] Record relevant prescription information.
      Full Body workout completion carries per-exercise prescriptions.
      Flow Day and Grab & Go do not have prescriptions.
- [ ] Record set-level Full Body performance.
      Data model supports it. UI does not exist yet.
- [x] Build the aggregation layer.
      engine/aggregate.js reads completion records and produces pure
      counts over a time window: patterns, classifications, chains,
      planes, muscles (weighted), joints, purposes, exercises, and a
      raw session list. Aggregation counts; it does not interpret.
- [x] Build the intelligence layer (v1).
      engine/intelligence.js reads aggregation output and produces
      interpretation: muscle recovery (0-100, tier-based windows),
      neglected muscles (absolute and relative), pattern balance
      (under / balanced / over), and per-exercise readiness scores.
      Currently surfaced via History debug output only.
- [ ] Build weekly movement aggregation.
      Aggregate exists. What remains is a defined weekly window and
      consumption by curation or the user.
- [ ] Track recent exercise usage.
- [ ] Track muscle-group emphasis.
      aggregate.js computes muscle counts. Not yet consumed.
- [ ] Track movement-pattern distribution.
      aggregate.js computes pattern counts. Intelligence classifies
      balance. Not yet consumed.
- [ ] Track upper/lower/core distribution.
- [ ] Track whole-body anatomical coverage.
- [x] Estimate muscular fatigue/recovery from recent activity.
      intelligence.js walks sessions chronologically, applies per-muscle
      work cost, advances recovery by tier window, and clamps to 0-100.
      Currently an internal model, not surfaced to the user.
- [ ] Establish appropriate recovery heuristics without presenting them as medical determinations.
- [ ] Identify repeated emphasis.
- [x] Identify neglected movement regions.
      intelligence.js produces neglectedMuscles (absolute and relative).
      Not yet consumed.
- [ ] Identify exercises that may benefit from variation.
- [ ] Use history to inform future curation ranking.
- [ ] Feed historical information into exercise suggestions.
- [ ] Feed historical information into progressive exercise introduction.
- [ ] Use history to improve novelty without creating rigid "you can't do this again" rules.
- [ ] Use weekly coverage as one factor in recommendations across Modes.

## Adaptive Exercise Curation & Movement Intelligence

Movement Map should eventually make recommendations using more than the filters explicitly selected by the user. The goal is not to create a black-box algorithm that dictates workouts. The goal is to use movement metadata and user history to make better options easier to discover.

- [ ] Establish curation-ranking layer above basic filtering.
- [ ] Consider starting capability.
- [ ] Consider demonstrated capability.
- [ ] Consider recent exercise frequency.
- [ ] Consider repeated movement-pattern exposure.
- [ ] Consider muscle-group emphasis.
- [ ] Consider upper/lower/core distribution.
- [ ] Consider whole-body coverage.
- [ ] Consider recent activity.
- [ ] Consider estimated muscular fatigue/recovery.
- [ ] Consider exercise difficulty/readiness.
- [ ] Consider equipment compatibility.
- [ ] Consider user favorites.
- [ ] Respect exercises the user has chosen not to see.
- [ ] Consider novelty without making novelty mandatory.
- [ ] Consider progression relationships.
- [ ] Consider readiness when introducing less-familiar exercises.
- [ ] Use anatomy metadata to inform muscular coverage.
- [ ] Keep joint preparation separate from muscle fatigue/recovery.
- [ ] Develop rules for balancing useful repetition with variation.
- [ ] Avoid recommendations becoming so restrictive that users lose control.
- [ ] Allow different Modes to use the intelligence differently according to their purpose.
- [ ] Consume readiness scores in curation.
      intelligence.js produces a readiness score per exercise
      (scoreExerciseReadiness). Nothing currently uses it. Curation
      (curateCard, curateFullBody) still takes the first N eligible
      exercises. This is the next step in adaptive curation.
- [ ] Define muscle tier vocabulary.
      small (48h), large (72h), core (48h) tiers currently live inside
      intelligence.js. Evaluate whether they should live in a vocabulary
      file like anatomy.js does. Not urgent — recovery is an intelligence
      concern — but the tier values themselves are arguably shared
      vocabulary.
- [ ] Variation in curation output.
      curateCard currently takes the first N eligible exercises in
      library order. Selecting the same filters produces the same
      result every time. The real fix is scoring, which this section
      already covers.
- [ ] Treat manual override of mode-level exclusion as a first-class
      principle, not an accident.
      Automatic curation (Build, Add Sequence via filters) applies
      getUsedExerciseIds. Manual actions (Replace, Add Exercise, Custom
      Build) do not. This is intentional and documented in code.

## Intelligent Exercise Suggestions

Suggestions are distinct from automatic curation. The user should be able to manually choose an exercise while Movement Map still offers an optional alternative.

Example:

> You've done this one several times lately.
> Want to try something similar?

- [ ] Detect frequently repeated exercises.
- [ ] Identify suitable alternatives.
- [ ] Identify exercises with similar purposes.
- [ ] Identify related movement patterns.
- [ ] Identify alternatives appropriate to the user's current capability.
- [ ] Present optional substitution suggestions.
- [ ] Allow the user to accept or dismiss a suggestion.
- [ ] Never automatically replace a deliberately selected exercise without user action.
- [ ] Frame suggestions as possibilities rather than corrections.
- [ ] Learn from accepted/dismissed suggestions over time.
- [ ] Support contextual suggestions based on history, variety, recovery, and movement coverage.

## Exercise Preferences

Exercise preference needs to distinguish between "I like this", "I don't want this recommended", and "this exercise exists in the library."

### Favorite Exercises

- [ ] Preferentially surface favorite exercises where appropriate.
- [ ] Allow user to mark an exercise as "Do not show."
- [ ] Exclude hidden exercises from automatic curation.
- [ ] Keep hidden exercises in the authoritative exercise library.
- [ ] Allow hidden exercises to remain searchable.
- [ ] Allow user to review hidden exercises.
- [ ] Allow user to restore an exercise to normal curation.
- [ ] Preserve distinction between: available, favorited, hidden from curation.
- [ ] Ensure hiding an exercise does not delete its history or metadata.
- [ ] Ensure manually selecting/searching for a hidden exercise remains possible.

## Movement Literacy

Movement Map should eventually help users understand why movements exist and how they relate, rather than functioning only as an exercise picker.

- [ ] Build exercise information cards.
- [ ] Explain movement purpose.
- [ ] Show relevant movement relationships.
- [ ] Show meaningful progression relationships.
- [ ] Add progression labels where useful.
- [ ] Build progression trees/maps.
- [ ] Add/show Unlock relationships.
- [ ] Show Builds Toward relationships.
- [ ] Show Supports relationships.
- [ ] Connect exercises to future skills where the relationship is meaningful and supportable.
- [ ] Connect movement literacy to anatomy where useful.
- [ ] Avoid inventing relationships merely to make the library appear more interconnected.

## Saved, Favorites & Personalization

Personalization should make Movement Map easier to use, not create another source of pressure.

- [ ] Save/favorite exercises. (Fav should be ⭐'d)
- [ ] Save/favorite Cards.
- [ ] Save custom Sequences where appropriate.
- [ ] Save custom Mode routines.
- [ ] Allow user-defined routine names.
- [ ] Preserve routine metadata.
- [ ] Retrieve and reuse saved routines.
- [ ] Support notes.
- [ ] Preserve user customization independently from authoritative exercise definitions.
- [ ] Explore lightweight personalization based on actual usage.
- [ ] Learn from user choices without becoming intrusive.
- [ ] Avoid streaks, punishment, or "missed workout" mechanics.
- [ ] Add completion notes.
      Notes attach to completions, especially Full Body, where a user
      may want to record that an exercise was difficult or a modified
      version was done. May eventually apply to Flow Day and Grab & Go,
      but the attachment point is not designed yet.

## Later — Experience Enhancements

- [ ] Improve visual design and responsive/mobile behavior.
- [ ] Add PWA capabilities.
- [ ] Add visual exercise demonstrations.
- [ ] Explore video-based guidance.
- [ ] Explore AI-assisted visual or instructional features.
- [ ] Improve saved/favorite experiences.
- [ ] Continue improving accessibility and reduced-decision-fatigue interactions based on actual use.
- [/] Build History page.
      A UI page exists and shows a 7-day window of completion records
      with day summaries and expandable exercise detail. Still under
      development. Currently also serves as the aggregate/intelligence
      debug view.
- [ ] History view must be accessible on any device size.
      Noted because a mobile-first overlay/modal was considered for the
      picker and rejected. Whatever History becomes, it must work on
      phone, tablet, desktop, and smart TV.

## Known Cosmetic Issues

These are not blockers. They are tracked so they are not forgotten.

- [ ] Card titles in Full Body are derived from the first exercise's classification and do not accurately describe mixed Card contents.
- [ ] full-body-message may not have styling. Confirm whether it needs styling to match other Mode messages.
- [ ] CSS organization across files is inconsistent. See Current — Product & Technical Foundation.
- [ ] storage.js header comment is stale.
      It still lists completions as part of movement-map-state.
      Completions moved to their own key space
      (movement-map-completions:YYYY-MM-DD). Update during the current
      scoring/intelligence/completion reorganization.
- [ ] scoring.js currently carries two responsibilities.
      Prescription generation and work cost calculation live in the same
      file. The split is under review during the current reorganization.

## Maybe — Longer-Term Exploration

These are intentionally not commitments to the current build.

- [ ] Broader accessibility-oriented movement pathways for people with substantially limited mobility.
- [ ] More explicit capability-based starting points such as seated, supported, or very-low-mobility pathways.
- [ ] Additional progression maps for movement skills.
- [ ] Expanded movement literacy and educational relationships.
- [ ] Additional Modes if actual use demonstrates a meaningful need.
- [ ] More sophisticated movement-balancing recommendations.
- [ ] Deeper personalization based on movement history and preferences.
- [ ] Additional forms of movement skill development.
- [ ] New ways of representing advanced movement capability.
- [ ] Randomized or seeded curation as a stopgap.
      Considered and deferred in favor of doing scoring properly. Noted
      as a possibility if scoring takes longer than expected and the
      repeated-output problem becomes disruptive.

Any accessibility-oriented feature must remain within Movement Map's fitness and movement-education scope rather than presenting Movement Map as medical rehabilitation.

## Explicitly Not the Current Priority

- [ ] Streak-centered motivation.
- [ ] Calorie-centered motivation.
- [ ] Weight-loss-centered motivation.
- [ ] Building a social network/community layer.
- [ ] Adding features simply because conventional fitness apps have them.
- [ ] Competitive leaderboards.
- [ ] Gamification for its own sake.
- [ ] Turning Movement Map into a medical rehabilitation platform.
- [ ] Building the timer before the underlying Full Body workout model is sound.
- [ ] Prematurely optimizing or abstracting architecture before actual product requirements justify it.

The roadmap can change as actual use of the application reveals what is useful. The principles and product purpose, movement-first philosophy, accessibility principles, and distinction between Modes are the stronger constraints.

Movement Map should become more capable without becoming more complicated merely for the sake of capability.

People should not have to become "fitness people" before the app becomes useful to them. The system should meet people where they actually are, understand that where they are can differ from body area to body area, and help them discover where they can go next.

Movement that meets you where you are.
