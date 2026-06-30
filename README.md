# BMX Freestyle Park Performance Tracker

Interview task prototype for reviewing BMX Freestyle Park athlete performance and
capturing competition-day runs.

## Overview

The app supports two high-level workflows:

- Reviewing historical athlete, competition and run performance.
- Capturing a new competition run by selecting an athlete, recording trick
  outcomes and reviewing the summary.

This is a front-end prototype. Seed data is generated from the supplied CSV and
checked into the repo as JSON. Prototype-only edits and newly captured runs live
in React state for the current browser session.

## Setup

```sh
make install
make dev
```

The app runs at http://localhost:3000.

Useful commands:

```sh
make check
make prepare-data
```

The Makefile runs commands with Node.js 22 where available, falling back through
the local Node, `nvm` and Homebrew `node@22` setup.

## File Overview

```text
app/                    Next.js App Router pages, layout and global styles
app/page.tsx            Home page redirect/entry point
app/layout.tsx          Shared page shell and metadata
app/athletes/           Athlete list, profile and edit routes
app/athletes/[id]/      Athlete detail plus planned-run create/edit screens
app/competitions/       Competition list and competition detail routes
app/competitions/[id]/  Athlete workspace, run setup, capture and summary flow
src/components/         Shared UI and feature-level views
src/data/raw/           Source CSV supplied for the task
src/data/generated/     Generated JSON consumed by the app
src/data/*.ts           Data access, practice data and BMX metadata
src/types/              Domain and prototype state types
scripts/                Data preparation scripts
```

Route files in `app/` stay small and hand data to feature views in
`src/components/`. Most of the prototype behaviour sits in the athlete and
competition components, with shared controls kept at the top level of
`src/components/`.

## Data Flow

1. The source data starts in
   `src/data/raw/interview_task_bmx_freestyle_dummy_data.csv`.
2. `make prepare-data` runs `scripts/generateSeedData.ts`.
3. The script normalises the flat CSV into
   `src/data/generated/fullDatasetAnalysis.json`.
4. `src/data/seedData.ts` exposes the generated data to pages and components.
5. `src/data/practiceCompetitionData.ts` adds practice competition context for
   the run-capture flow.
6. `src/components/AthleteDraftProvider.tsx` stores in-session edits and captured
   runs while the prototype is open.

Generated files should be refreshed from the CSV rather than edited by hand.
