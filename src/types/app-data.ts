export type Athlete = {
  id: string;
  name: string;
};

export type Competition = {
  id: string;
  date: string;
  // The supplied CSV has competition/date but no separate location field.
  location?: string;
  name: string;
};

export type CompetitionAthlete = {
  id: string;
  athleteId: string;
  competitionId: string;
};

export type PlannedRun = {
  id: string;
  competitionAthleteId: string;
  runNumber: number;
};

export type Run = {
  id: string;
  competitionAthleteId: string;
  runNumber: number;
};

export type TrickAttempt = {
  id: string;
  order: number;
  runId: string;
  trickName: string;
};

export type AppData = {
  athletes: Athlete[];
  competitions: Competition[];
  competitionAthletes: CompetitionAthlete[];
  plannedRuns: PlannedRun[];
  runs: Run[];
  trickAttempts: TrickAttempt[];
};
