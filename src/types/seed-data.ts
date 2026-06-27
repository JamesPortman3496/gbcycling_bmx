export type { RagRating } from "./domain";

import type { RagRating } from "./domain";

export type PlannedTrickSeed = {
  id: string;
  name: string;
  order: number;
};

export type PlannedRunSeed = {
  id: string;
  name: string;
  tricks: PlannedTrickSeed[];
};

export type AthleteSeed = {
  id: string;
  name: string;
  plannedRuns: PlannedRunSeed[];
  runIds: string[];
  notes?: string;
};

export type CompetitionSeed = {
  id: string;
  name: string;
  date: string;
  assignedAthleteIds: string[];
};

export type RunTrickSeed = {
  id: string;
  order: number;
  trickName: string;
  plannedTrickId?: string;
  plannedTrickName?: string;
  landed: boolean;
  executionRating: number;
  ragRating: RagRating;
  failReason?: string;
  previousTrickQuality?: string;
};

export type RunSeed = {
  id: string;
  athleteId: string;
  competitionId: string;
  round: string;
  runNumber: number;
  completionPercentage?: number;
  score?: number;
  coachNotes?: string;
  overallPositionAfterRound?: number;
  tricks: RunTrickSeed[];
};

export type SeedData = {
  athletes: AthleteSeed[];
  competitions: CompetitionSeed[];
  runsById: Record<string, RunSeed>;
};
