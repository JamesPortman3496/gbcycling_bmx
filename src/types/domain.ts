type TimestampFields = {
  createdAt?: string;
  updatedAt?: string;
};

export type RagRating = "Green" | "Amber" | "Red";

export type ReadinessStatus =
  | "Competition-ready"
  | "Developing"
  | "Needs practice"
  | "Not enough data";

export type Athlete = TimestampFields & {
  id: string;
  name: string;
  notes?: string;
};

export type Competition = TimestampFields & {
  id: string;
  name: string;
  date: string;
  location?: string;
  notes?: string;
};

export type CompetitionAthlete = TimestampFields & {
  id: string;
  athleteId: string;
  competitionId: string;
};

export type PlannedTrick = TimestampFields & {
  id: string;
  order: number;
  name: string;
};

export type PlannedRun = TimestampFields & {
  id: string;
  athleteId: string;
  name: string;
  tricks: PlannedTrick[];
  notes?: string;
};

export type Run = TimestampFields & {
  id: string;
  athleteId: string;
  competitionId: string;
  plannedRunId?: string;
  round: string;
  runNumber: number;
  completionPercentage?: number;
  score?: number;
  coachNotes?: string;
  overallPositionAfterRound?: number;
};

export type TrickAttempt = TimestampFields & {
  id: string;
  runId: string;
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

export type TrickReadinessRow = {
  athleteId: string;
  trickName: string;
  attempts: number;
  landedCount: number;
  landedRate: number;
  averageScore: number;
  averageNextTrickScore: number | null;
  followingImpact: number | null;
  mainFailReason: string | null;
  readiness: ReadinessStatus;
};

export type AppData = {
  athletes: Athlete[];
  competitions: Competition[];
  competitionAthletes: CompetitionAthlete[];
  plannedRuns: PlannedRun[];
  runs: Run[];
  trickAttempts: TrickAttempt[];
};
