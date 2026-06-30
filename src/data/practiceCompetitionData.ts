import {
  compareCompetitionStages,
  getCompetitionStageIndex,
} from "./competitionFlow";
import {
  getAthleteAnalysis,
  getAthleteById,
  getGlobalFailReasonSummaries,
  getGlobalTrickSummaries,
  getSeedData,
} from "./seedData";
import type { AthleteSummary } from "./seedData";

import type { CompetitionSeed, RunSeed, SeedData } from "@/src/types/seed-data";

export const PREVIEW_COMPETITION_ID = "competition-preview-practice";

const PREVIEW_COMPETITION_NAME = "Practice Competition";
const REFERENCE_COMPETITION_ID = "competition-montpellier-world-cup";
const PREVIEW_STAGE_CUTOFF_INDEX = getCompetitionStageIndex("Semi-Final", 2);

const baseAppData = getSeedData();

export const previewAppData = createPreviewAppData(baseAppData);

const previewAthleteById = new Map(
  previewAppData.athletes.map((athlete) => [athlete.id, athlete]),
);
const previewCompetitionById = new Map(
  previewAppData.competitions.map((competition) => [competition.id, competition]),
);
const previewRuns = Object.values(previewAppData.runsById).sort(sortRuns);
const previewRunsByCompetitionId = new Map<string, RunSeed[]>();
const previewRunsByCompetitionAthleteKey = new Map<string, RunSeed[]>();

for (const run of previewRuns) {
  const competitionRuns = previewRunsByCompetitionId.get(run.competitionId) ?? [];
  competitionRuns.push(run);
  previewRunsByCompetitionId.set(run.competitionId, competitionRuns);

  const competitionAthleteKey = getCompetitionAthleteKey(
    run.competitionId,
    run.athleteId,
  );
  const competitionAthleteRuns =
    previewRunsByCompetitionAthleteKey.get(competitionAthleteKey) ?? [];
  competitionAthleteRuns.push(run);
  previewRunsByCompetitionAthleteKey.set(
    competitionAthleteKey,
    competitionAthleteRuns,
  );
}

export const previewAthletes = getPreviewAthleteSummaries();
const previewAthleteSummaryById = new Map(
  previewAthletes.map((athlete) => [athlete.id, athlete]),
);

export const previewCompetitions = getPreviewCompetitionSummaries();

export const previewTricks = getGlobalTrickSummaries();

export const previewFailReasons = getGlobalFailReasonSummaries();

export const previewTotals = {
  athletes: previewAppData.athletes.length,
  competitions: previewAppData.competitions.length,
  runs: previewRuns.length,
  trickAttempts: previewRuns.reduce((count, run) => count + run.tricks.length, 0),
};

export function getPreviewCompetition(competitionId: string) {
  const competition = previewCompetitionById.get(competitionId);

  if (!competition) {
    return undefined;
  }

  const competitionRuns = getPreviewRunsForCompetition(competitionId);
  const roundNames = Array.from(
    new Set(
      competitionRuns
        .map((run) => run.round)
        .sort(
          (left, right) =>
            getCompetitionStageIndex(left, 1) - getCompetitionStageIndex(right, 1) ||
            left.localeCompare(right),
        ),
    ),
  );
  const runNumbers = Array.from(
    new Set(competitionRuns.map((run) => run.runNumber)),
  ).sort((left, right) => left - right);

  return {
    athleteCount: competition.assignedAthleteIds.length,
    date: competition.date,
    id: competition.id,
    name: competition.name,
    roundNames,
    runCount: competitionRuns.length,
    runNumbers,
    trickAttemptCount: competitionRuns.reduce(
      (count, run) => count + run.tricks.length,
      0,
    ),
  };
}

export function getPreviewCompetitionRecord(competitionId: string) {
  return previewCompetitionById.get(competitionId);
}

export function getPreviewCompetitionAthletes(competitionId: string) {
  const competition = previewCompetitionById.get(competitionId);

  if (!competition) {
    return [];
  }

  return competition.assignedAthleteIds
    .map((athleteId) => getPreviewAthlete(athleteId))
    .filter((athlete) => athlete !== undefined);
}

export function getPreviewCompetitionRunSummaries() {
  return previewCompetitions;
}

export function getPreviewAthlete(athleteId: string) {
  const athlete = previewAthleteSummaryById.get(athleteId);

  if (athlete) {
    return athlete;
  }

  const fallbackAthlete = previewAthleteById.get(athleteId) ?? getAthleteById(athleteId);

  if (!fallbackAthlete) {
    return undefined;
  }

  return {
    attemptCount: 0,
    id: fallbackAthlete.id,
    landedCount: 0,
    landedRate: 0,
    name: fallbackAthlete.name,
    runCount: 0,
  };
}

export function getPreviewAthleteRecord(athleteId: string) {
  return previewAthleteById.get(athleteId);
}

export function getPreviewAthleteAnalysis(athleteId: string) {
  return getAthleteAnalysis(athleteId);
}

export function getPreviewRunsForCompetitionAthlete(
  competitionId: string,
  athleteId: string,
) {
  return (
    previewRunsByCompetitionAthleteKey.get(
      getCompetitionAthleteKey(competitionId, athleteId),
    ) ?? []
  );
}

export function getPreviewRunsForCompetition(competitionId: string) {
  return previewRunsByCompetitionId.get(competitionId) ?? [];
}

export function getPreviewRunById(runId: string) {
  return previewAppData.runsById[runId];
}

function createPreviewAppData(seedData: SeedData): SeedData {
  const sourceCompetition = seedData.competitions.find(
    (competition) => competition.id === REFERENCE_COMPETITION_ID,
  );

  if (!sourceCompetition) {
    return seedData;
  }

  const previewCompetition: CompetitionSeed = {
    ...sourceCompetition,
    id: PREVIEW_COMPETITION_ID,
    name: PREVIEW_COMPETITION_NAME,
  };

  const clonedRunIdsByAthleteId = new Map<string, string[]>();
  const clonedRuns = Object.values(seedData.runsById)
    .filter((run) => run.competitionId === REFERENCE_COMPETITION_ID)
    .filter(
      (run) =>
        getCompetitionStageIndex(run.round, run.runNumber) <
        PREVIEW_STAGE_CUTOFF_INDEX,
    )
    .map((run) => {
      const clonedRunId = run.id.replace(
        REFERENCE_COMPETITION_ID,
        PREVIEW_COMPETITION_ID,
      );
      const clonedRun: RunSeed = {
        ...run,
        competitionId: PREVIEW_COMPETITION_ID,
        id: clonedRunId,
        tricks: run.tricks.map((trick) => ({
          ...trick,
          id: trick.id.replace(
            REFERENCE_COMPETITION_ID,
            PREVIEW_COMPETITION_ID,
          ),
        })),
      };
      const athleteRunIds = clonedRunIdsByAthleteId.get(clonedRun.athleteId) ?? [];
      athleteRunIds.push(clonedRunId);
      clonedRunIdsByAthleteId.set(clonedRun.athleteId, athleteRunIds);

      return clonedRun;
    });

  const athletes = seedData.athletes.map((athlete) => ({
    ...athlete,
    runIds: [...athlete.runIds, ...(clonedRunIdsByAthleteId.get(athlete.id) ?? [])],
  }));

  return {
    athletes,
    competitions: [previewCompetition, ...seedData.competitions],
    runsById: {
      ...seedData.runsById,
      ...Object.fromEntries(clonedRuns.map((run) => [run.id, run])),
    },
  };
}

function getPreviewAthleteSummaries() {
  return previewAppData.athletes
    .map((athlete) => buildPreviewAthleteSummary(athlete.id, athlete.name))
    .sort((left, right) => left.name.localeCompare(right.name));
}

function getPreviewCompetitionSummaries() {
  return previewAppData.competitions.map((competition) => {
    const summary = getPreviewCompetition(competition.id);

    if (!summary) {
      throw new Error(`Missing preview competition summary for "${competition.id}".`);
    }

    return summary;
  });
}

function sortRuns(left: RunSeed, right: RunSeed) {
  return (
    getCompetitionDate(left.competitionId).localeCompare(
      getCompetitionDate(right.competitionId),
    ) ||
    getAthleteName(left.athleteId).localeCompare(getAthleteName(right.athleteId)) ||
    compareCompetitionStages(left, right) ||
    left.id.localeCompare(right.id)
  );
}

function getCompetitionDate(competitionId: string) {
  return previewCompetitionById.get(competitionId)?.date ?? "";
}

function getAthleteName(athleteId: string) {
  return previewAthleteById.get(athleteId)?.name ?? athleteId;
}

function buildPreviewAthleteSummary(
  athleteId: string,
  athleteName: string,
): AthleteSummary {
  const runs = previewRuns.filter((run) => run.athleteId === athleteId);
  const tricks = runs.flatMap((run) => run.tricks);
  const landedCount = tricks.filter((trick) => trick.landed).length;
  const attemptCount = tricks.length;

  return {
    attemptCount,
    id: athleteId,
    landedCount,
    landedRate:
      attemptCount === 0 ? 0 : Math.round((landedCount / attemptCount) * 100),
    name: athleteName,
    runCount: runs.length,
  };
}

function getCompetitionAthleteKey(competitionId: string, athleteId: string) {
  return `${competitionId}:${athleteId}`;
}
