import fullDatasetAnalysis from "./generated/fullDatasetAnalysis.json";
import { deriveRecommendationLabel } from "./analysisRules";
import { getTrickAddedValue } from "./trickMetadata";

import type {
  AthleteAnalysis,
  RagBreakdown,
  ReadinessStatus,
  TrickAttemptDetail,
  TrickAnalysisRow,
  TrickReadinessRow,
} from "@/src/types/domain";
import type {
  AthleteSeed,
  CompetitionSeed,
  PlannedRunSeed,
  RunSeed,
  RunTrickSeed,
  SeedData,
} from "@/src/types/seed-data";

export type AthleteSummary = {
  attemptCount: number;
  id: string;
  landedCount: number;
  landedRate: number;
  name: string;
  runCount: number;
};

export type CompetitionSummary = {
  athleteCount: number;
  date: string;
  id: string;
  name: string;
  roundNames: string[];
  runCount: number;
  runNumbers: number[];
  trickAttemptCount: number;
};

export type TrickSummary = {
  attemptCount: number;
  name: string;
};

export type FailReasonSummary = {
  count: number;
  reason: string;
};

const seedData = fullDatasetAnalysis as unknown as SeedData;

const athletes = [...seedData.athletes];
const competitions = [...seedData.competitions];
const runsById = seedData.runsById;

const athleteById = new Map(athletes.map((athlete) => [athlete.id, athlete]));
const competitionById = new Map(
  competitions.map((competition) => [competition.id, competition]),
);

const ROUND_RANKS: Record<string, number> = {
  Qualification: 0,
  "Semi-Final": 1,
  Final: 2,
};

function getRoundRank(round: string): number {
  return ROUND_RANKS[round] ?? Number.MAX_SAFE_INTEGER;
}

function roundToSingleDecimal(value: number): number {
  return Number(value.toFixed(1));
}

function createEmptyRagBreakdown(): RagBreakdown {
  return {
    Amber: 0,
    Green: 0,
    Red: 0,
  };
}

function getCompetitionDate(competitionId: string): string {
  return competitionById.get(competitionId)?.date ?? "";
}

function getAthleteName(athleteId: string): string {
  return athleteById.get(athleteId)?.name ?? athleteId;
}

function sortRuns(left: RunSeed, right: RunSeed): number {
  return (
    getCompetitionDate(left.competitionId).localeCompare(
      getCompetitionDate(right.competitionId),
    ) ||
    getAthleteName(left.athleteId).localeCompare(getAthleteName(right.athleteId)) ||
    getRoundRank(left.round) - getRoundRank(right.round) ||
    left.runNumber - right.runNumber ||
    left.id.localeCompare(right.id)
  );
}

const sortedRuns = Object.values(runsById).sort(sortRuns);

const runsByCompetitionId = new Map<string, RunSeed[]>();

for (const run of sortedRuns) {
  const competitionRuns = runsByCompetitionId.get(run.competitionId) ?? [];
  competitionRuns.push(run);
  runsByCompetitionId.set(run.competitionId, competitionRuns);
}

function flattenRunTricks(runs: RunSeed[]): RunTrickSeed[] {
  return runs.flatMap((run) => run.tricks);
}

function countRags(tricks: RunTrickSeed[]): RagBreakdown {
  return tricks.reduce((counts, trick) => {
    counts[trick.ragRating] += 1;
    return counts;
  }, createEmptyRagBreakdown());
}

function getMostCommonValue(counts: Map<string, number>): string | null {
  const sortedEntries = Array.from(counts.entries()).sort(
    (left, right) => right[1] - left[1] || left[0].localeCompare(right[0]),
  );

  return sortedEntries[0]?.[0] ?? null;
}

function deriveReadiness(
  attempts: number,
  landedRate: number,
  averageScore: number,
): ReadinessStatus {
  if (attempts < 3) {
    return "Not enough data";
  }

  if (landedRate >= 85 && averageScore >= 7) {
    return "Competition-ready";
  }

  if (landedRate >= 60) {
    return "Developing";
  }

  return "Needs practice";
}

export function getSeedData(): SeedData {
  return seedData;
}

export function getAthletes(): AthleteSeed[] {
  return athletes;
}

export function getAthleteById(athleteId: string): AthleteSeed | undefined {
  return athleteById.get(athleteId);
}

export function getCompetitions(): CompetitionSeed[] {
  return competitions;
}

export function getCompetitionById(
  competitionId: string,
): CompetitionSeed | undefined {
  return competitionById.get(competitionId);
}

export function getRunById(runId: string): RunSeed | undefined {
  return runsById[runId];
}

export function getRunsForAthlete(athleteId: string): RunSeed[] {
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    return [];
  }

  return athlete.runIds
    .map((runId) => runsById[runId])
    .filter((run): run is RunSeed => run !== undefined);
}

export function getRunsForCompetitionAthlete(
  competitionId: string,
  athleteId: string,
): RunSeed[] {
  return getRunsForAthlete(athleteId).filter(
    (run) => run.competitionId === competitionId,
  );
}

export function getCompetitionAthletes(competitionId: string): AthleteSeed[] {
  const competition = getCompetitionById(competitionId);

  if (!competition) {
    return [];
  }

  return competition.assignedAthleteIds
    .map((athleteId) => athleteById.get(athleteId))
    .filter((athlete): athlete is AthleteSeed => athlete !== undefined);
}

export function getPrimaryPlannedRunForAthlete(
  athleteId: string,
): PlannedRunSeed | undefined {
  return getAthleteById(athleteId)?.plannedRuns[0];
}

export function getAthleteSummary(
  athleteId: string,
): AthleteSummary | undefined {
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    return undefined;
  }

  const runs = getRunsForAthlete(athleteId);
  const tricks = flattenRunTricks(runs);
  const landedCount = tricks.filter((trick) => trick.landed).length;
  const attemptCount = tricks.length;

  return {
    attemptCount,
    id: athlete.id,
    landedCount,
    landedRate:
      attemptCount === 0 ? 0 : Math.round((landedCount / attemptCount) * 100),
    name: athlete.name,
    runCount: runs.length,
  };
}

export function getAthleteSummaries(): AthleteSummary[] {
  return athletes
    .map((athlete) => getAthleteSummary(athlete.id))
    .filter((summary): summary is AthleteSummary => summary !== undefined);
}

export function getCompetitionSummary(
  competitionId: string,
): CompetitionSummary | undefined {
  const competition = getCompetitionById(competitionId);

  if (!competition) {
    return undefined;
  }

  const competitionRuns = runsByCompetitionId.get(competitionId) ?? [];
  const roundNames = Array.from(
    new Set(
      competitionRuns
        .map((run) => run.round)
        .sort(
          (left, right) =>
            getRoundRank(left) - getRoundRank(right) ||
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
    trickAttemptCount: flattenRunTricks(competitionRuns).length,
  };
}

export function getCompetitionSummaries(): CompetitionSummary[] {
  return competitions
    .map((competition) => getCompetitionSummary(competition.id))
    .filter((summary): summary is CompetitionSummary => summary !== undefined);
}

export function getAthleteAnalysis(
  athleteId: string,
): AthleteAnalysis | undefined {
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    return undefined;
  }

  const runs = getRunsForAthlete(athlete.id);
  const tricks = flattenRunTricks(runs);
  const failReasonCounts = new Map<string, number>();
  const trickAttemptDetailsByName = new Map<string, TrickAttemptDetail[]>();
  const trickStats = new Map<
    string,
    {
      addedValue: number;
      attempts: number;
      averageOrderTotal: number;
      failReasonCounts: Map<string, number>;
      landedCount: number;
      nextScoreCount: number;
      nextScoreTotal: number;
      ragBreakdown: RagBreakdown;
      scoreTotal: number;
      trickName: string;
    }
  >();

  for (const run of runs) {
    const competition = getCompetitionById(run.competitionId);

    run.tricks.forEach((trick, index) => {
      const stats = trickStats.get(trick.trickName) ?? {
        addedValue: getTrickAddedValue(trick.trickName).score,
        attempts: 0,
        averageOrderTotal: 0,
        failReasonCounts: new Map<string, number>(),
        landedCount: 0,
        nextScoreCount: 0,
        nextScoreTotal: 0,
        ragBreakdown: createEmptyRagBreakdown(),
        scoreTotal: 0,
        trickName: trick.trickName,
      };

      stats.attempts += 1;
      stats.averageOrderTotal += trick.order;
      stats.scoreTotal += trick.executionRating;
      stats.ragBreakdown[trick.ragRating] += 1;

      if (trick.landed) {
        stats.landedCount += 1;
      }

      if (trick.failReason) {
        stats.failReasonCounts.set(
          trick.failReason,
          (stats.failReasonCounts.get(trick.failReason) ?? 0) + 1,
        );
        failReasonCounts.set(
          trick.failReason,
          (failReasonCounts.get(trick.failReason) ?? 0) + 1,
        );
      }

      const nextTrick = run.tricks[index + 1];
      const previousTrick = run.tricks[index - 1];

      const attemptDetails = trickAttemptDetailsByName.get(trick.trickName) ?? [];
      attemptDetails.push({
        coachNotes: run.coachNotes,
        competitionDate: competition?.date ?? "",
        competitionName: competition?.name ?? run.competitionId,
        executionRating: trick.executionRating,
        failReason: trick.failReason,
        id: trick.id,
        landed: trick.landed,
        previousTrickName: previousTrick?.trickName ?? null,
        previousTrickQuality:
          trick.previousTrickQuality && trick.previousTrickQuality !== "N/A"
            ? trick.previousTrickQuality
            : null,
        ragRating: trick.ragRating,
        round: run.round,
        runId: run.id,
        runNumber: run.runNumber,
        trickOrder: trick.order,
      });
      trickAttemptDetailsByName.set(trick.trickName, attemptDetails);

      if (nextTrick) {
        stats.nextScoreTotal += nextTrick.executionRating;
        stats.nextScoreCount += 1;
      }

      trickStats.set(trick.trickName, stats);
    });
  }

  const trickReadiness = Array.from(trickStats.values())
    .map((stats): TrickReadinessRow => {
      const landedRate =
        stats.attempts === 0 ? 0 : Math.round((stats.landedCount / stats.attempts) * 100);
      const averageScore =
        stats.attempts === 0 ? 0 : roundToSingleDecimal(stats.scoreTotal / stats.attempts);
      const averageNextTrickScore =
        stats.nextScoreCount === 0
          ? null
          : roundToSingleDecimal(stats.nextScoreTotal / stats.nextScoreCount);

      return {
        athleteId,
        attempts: stats.attempts,
        averageNextTrickScore,
        averageScore,
        followingImpact:
          averageNextTrickScore === null
            ? null
            : roundToSingleDecimal(averageNextTrickScore - averageScore),
        landedCount: stats.landedCount,
        landedRate,
        mainFailReason: getMostCommonValue(stats.failReasonCounts),
        readiness: deriveReadiness(stats.attempts, landedRate, averageScore),
        trickName: stats.trickName,
      };
    })
    .sort(
      (left, right) =>
        right.attempts - left.attempts ||
        right.landedRate - left.landedRate ||
        left.trickName.localeCompare(right.trickName),
    );

  const trickAnalysisRows = Array.from(trickStats.values())
    .map((stats): TrickAnalysisRow => {
      const landedRate =
        stats.attempts === 0 ? 0 : Math.round((stats.landedCount / stats.attempts) * 100);
      const averageExecution =
        stats.attempts === 0 ? 0 : roundToSingleDecimal(stats.scoreTotal / stats.attempts);

      return {
        addedValue: stats.addedValue,
        averageExecution,
        averageOrder:
          stats.attempts === 0
            ? 0
            : roundToSingleDecimal(stats.averageOrderTotal / stats.attempts),
        attempts: stats.attempts,
        landedCount: stats.landedCount,
        landedRate,
        mainFailReason: getMostCommonValue(stats.failReasonCounts),
        ragBreakdown: stats.ragBreakdown,
        recommendationLabel: deriveRecommendationLabel({
          addedValue: stats.addedValue,
          averageExecution,
          landedRate,
          ragBreakdown: stats.ragBreakdown,
        }),
        trickName: stats.trickName,
      };
    })
    .sort(
      (left, right) =>
        right.addedValue - left.addedValue ||
        right.landedRate - left.landedRate ||
        right.averageExecution - left.averageExecution ||
        left.trickName.localeCompare(right.trickName),
    );

  const snapshot = createSnapshot(runs, tricks);

  return {
    snapshot,
    trickAttemptDetailsByName: Object.fromEntries(
      Array.from(trickAttemptDetailsByName.entries()).map(([trickName, attempts]) => [
        trickName,
        attempts.sort(
          (left, right) =>
            left.competitionDate.localeCompare(right.competitionDate) ||
            getRoundRank(left.round) - getRoundRank(right.round) ||
            left.runNumber - right.runNumber ||
            left.trickOrder - right.trickOrder ||
            left.id.localeCompare(right.id),
        ),
      ]),
    ),
    trickAnalysisRows,
    trickReadiness,
  };
}

function createSnapshot(runs: RunSeed[], tricks: RunTrickSeed[]) {
  const landedCount = tricks.filter((trick) => trick.landed).length;
  const attempts = tricks.length;

  return {
    averageExecution:
      attempts === 0
        ? 0
        : roundToSingleDecimal(
            tricks.reduce((total, trick) => total + trick.executionRating, 0) / attempts,
          ),
    attempts,
    landedCount,
    landedRate: attempts === 0 ? 0 : Math.round((landedCount / attempts) * 100),
    ragBreakdown: countRags(tricks),
    runs: runs.length,
  };
}

export function getGlobalTrickSummaries(): TrickSummary[] {
  const trickCounts = new Map<string, number>();

  for (const run of sortedRuns) {
    for (const trick of run.tricks) {
      trickCounts.set(trick.trickName, (trickCounts.get(trick.trickName) ?? 0) + 1);
    }
  }

  return Array.from(trickCounts.entries())
    .map(([name, attemptCount]) => ({ attemptCount, name }))
    .sort(
      (left, right) =>
        right.attemptCount - left.attemptCount || left.name.localeCompare(right.name),
    );
}

export function getGlobalFailReasonSummaries(): FailReasonSummary[] {
  const failReasonCounts = new Map<string, number>();

  for (const run of sortedRuns) {
    for (const trick of run.tricks) {
      if (!trick.failReason) {
        continue;
      }

      failReasonCounts.set(
        trick.failReason,
        (failReasonCounts.get(trick.failReason) ?? 0) + 1,
      );
    }
  }

  return Array.from(failReasonCounts.entries())
    .map(([reason, count]) => ({ count, reason }))
    .sort(
      (left, right) =>
        right.count - left.count || left.reason.localeCompare(right.reason),
    );
}
