import type { PlannedRunDraft } from "./athlete-drafts";
import type { RunSeed, RunTrickSeed } from "./seed-data";

export type ActiveRunTrickDraft = {
  id: string;
  order: number;
  plannedTrickId?: string;
  plannedTrickName?: string;
  trickName: string;
  landed?: boolean;
  executionRating?: number;
  failReason?: string;
};

export type ActiveRunDraft = {
  athleteId: string;
  competitionId: string;
  id: string;
  plannedRun: PlannedRunDraft;
  round: string;
  runNumber: number;
  tricks: ActiveRunTrickDraft[];
};

export type CompletedRunSummaryDraft = {
  coachNotes?: string;
  overallPositionAfterRound?: number;
  score?: number;
};

export type StartRunDraftInput = {
  athleteId: string;
  competitionId: string;
  plannedRun: PlannedRunDraft;
  round: string;
  runNumber: number;
};

export type UpdateActiveRunTrickInput = Partial<
  Pick<ActiveRunTrickDraft, "executionRating" | "failReason" | "landed" | "trickName">
>;

export type CompleteRunDraftInput = CompletedRunSummaryDraft & {
  completedTrickCount: number;
};

export type StoredRunDraft = RunSeed;
export type StoredRunTrickDraft = RunTrickSeed;
