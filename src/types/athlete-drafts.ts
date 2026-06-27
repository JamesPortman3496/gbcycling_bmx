export type PlannedTrickDraft = {
  id: string;
  name: string;
  order: number;
};

export type PlannedRunDraft = {
  id: string;
  name: string;
  tricks: PlannedTrickDraft[];
};

export type AthleteDraft = {
  id: string;
  name: string;
  plannedRuns: PlannedRunDraft[];
};
