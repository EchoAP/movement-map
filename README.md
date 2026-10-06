# Movement Map

> **Movement that meets you where you are, while helping you understand where you can go next.**

Movement Map is a fitness and movement-education application designed around accessibility, movement literacy, curation, and reduced decision fatigue.

It is being built first as a personal beta project and will evolve through actual use.

## The Core Idea

Movement Map is not intended to be another exercise catalog that asks the user to figure everything out themselves.

It organizes movement into meaningful cards, sequences, categories, relationships, and progression paths so that the application can help answer:

- What do I need right now?
- What can I do right now?
- What equipment do I have?
- What kind of movement do I want?
- What have I already covered this week?
- Why does this movement matter?
- What does it support?
- What could it help me work toward next?

## Primary Modes

### Flow Day

A structured day divided into four TimeBlocks:

- Morning
- Midday
- Afternoon
- Evening

Morning is the heaviest TimeBlock and provides the foundational starting point for the day. Its default curation draws on joint preparation, range development, and body awareness. Morning can be curated with the default selection, extended with additional sequences, or built manually from the full exercise library.

The rest of the day stays curated: each TimeBlock can be filtered and built independently, and cards can be edited or replaced as the user chooses.

### Grab & Go

Short, accessible movement for days when energy, motivation, or available time is limited.

The user filters within the mode rather than having to search a giant exercise catalog.

### Full Body

A complete workout experience that still uses Movement Map's curation philosophy.

Full Body is the one Mode where the workout itself is the unit — the Mode is the workout, and Cards are groupings *within* it. Exercises are curated at the workout level, then organized into small blocks. A guided/timed experience can live inside this Mode rather than becoming a separate Mode.

## Project Philosophy

Movement Map prioritizes:

- Movement literacy.
- Accessibility.
- Functional strength and mobility.
- Foundational movement.
- Calisthenics-informed progression.
- Meaningful relationships between movements.
- Reduced decision fatigue.
- User agency.
- Curation without rigidity.
- Progress without pressure.

Read `VISION.md`, `PURPOSE.md`, and `PRINCIPLES.md` for the fuller product philosophy.

## Development Status

Movement Map is a working prototype with three Modes in place.

Current foundation includes:

- React
- Vite
- React Router
- Shared application Layout
- Shared Navigation
- Data-driven Home page with reusable ModeCard
- Active navigation state
- Centralized exercise library with stable IDs
- Controlled vocabularies for classifications, purposes, equipment, movement, and anatomy
- Shared filtering engine and curation engine
- Centralized persistence layer
- Flow Day with four TimeBlocks, per-TimeBlock Card ownership, and TimeBlock-specific curation
- Grab & Go with multi-Card curation and manual editing
- Full Body v1 with workout-level curation, grouping into Cards, and day-scoped persistence
- Full Body warm-up and cool-down as planned separate segments

Current development is focused on the Exercise Picker — an app-level searchable, multi-select exercise selector that replaces the current placeholder dropdown. This is a prerequisite for meaningful customization across all three Modes.

See `ROADMAP.md` for the current build sequence.

## What Movement Map Is Not

Movement Map is a fitness and movement-education application. It is not:

- A medical or rehabilitation platform.
- A calorie tracker or weight-loss tool.
- A streak-based habit system.
- A social or competitive fitness app.

Any accessibility-oriented feature remains within Movement Map's fitness and movement-education scope rather than presenting the application as medical rehabilitation.

## Repository Contents

This repository documents Movement Map. It contains:

- `README.md` — this file
- `VISION.md`, `PURPOSE.md`, `PRINCIPLES.md` — product philosophy
- `ROADMAP.md` — build sequence and current state
- `ARCHITECTURE.md` — how the code is organized
- `code-samples/` — selected source files from the private application

The full application source is private. The `code-samples/` folder
contains a small set of files chosen to show how the project is built:
eligibility filtering, Mode-specific curation, and two Mode pages (shown
as excerpts) that demonstrate different structures.

See `code-samples/README.md` for details on what each file shows and why
it was selected.

## Running the Project

From the project directory:

```bash
npm run dev

```

## Copyright

© 2026 Idariji Collective. All rights reserved. 

You may view this repository, but you may not copy, modify, or distribute the code without written permission.
