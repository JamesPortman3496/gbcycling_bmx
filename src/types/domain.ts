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

export type RagBreakdown = {
  Amber: number;
  Green: number;
  Red: number;
};

export type TrickAddedValue = {
  score: number;
};

export type TrickRecommendationLabel =
  | "Reliable scorer"
  | "Development priority"
  | "High upside, high risk"
  | "Low return"
  | "Stable support";

export type AthletePerformanceSnapshot = {
  averageExecution: number;
  attempts: number;
  landedCount: number;
  landedRate: number;
  ragBreakdown: RagBreakdown;
  runs: number;
};

export type TrickAnalysisRow = {
  addedValue: number;
  averageExecution: number;
  averageOrder: number;
  attempts: number;
  landedCount: number;
  landedRate: number;
  mainFailReason: string | null;
  ragBreakdown: RagBreakdown;
  recommendationLabel: TrickRecommendationLabel;
  trickName: string;
};

export type TrickAttemptDetail = {
  coachNotes?: string;
  competitionDate: string;
  competitionName: string;
  executionRating: number;
  failReason?: string;
  id: string;
  landed: boolean;
  previousTrickName: string | null;
  previousTrickQuality: string | null;
  ragRating: RagRating;
  round: string;
  runId: string;
  runNumber: number;
  trickOrder: number;
};

export type RunAnalysisSummary = {
  averageExecution: number;
  coachNotes?: string;
  competitionDate: string;
  competitionName: string;
  completionPercentage: number | null;
  executionPoints: Array<{
    executionRating: number;
    landed: boolean;
    ragRating: RagRating;
    trickName: string;
    trickOrder: number;
  }>;
  failReasons: Array<{ count: number; reason: string }>;
  id: string;
  landedCount: number;
  landedRate: number;
  missedTrickNames: string[];
  ragBreakdown: RagBreakdown;
  redRate: number;
  round: string;
  runNumber: number;
  score: number | null;
  trickCount: number;
};

export type AthleteAnalysis = {
  runSummaries: RunAnalysisSummary[];
  snapshot: AthletePerformanceSnapshot;
  trickAttemptDetailsByName: Record<string, TrickAttemptDetail[]>;
  trickAnalysisRows: TrickAnalysisRow[];
  trickReadiness: TrickReadinessRow[];
};

export type AppData = {
  athletes: Athlete[];
  competitions: Competition[];
  competitionAthletes: CompetitionAthlete[];
  plannedRuns: PlannedRun[];
  runs: Run[];
  trickAttempts: TrickAttempt[];
};
