import {
  getAthleteAnalysis,
  getAthleteById,
  getAthleteSummaries,
  getCompetitionAthletes,
  getCompetitionSummaries,
  getCompetitionSummary,
  getGlobalFailReasonSummaries,
  getGlobalTrickSummaries,
  getSeedData,
} from "./seedData";

export const previewAppData = getSeedData();

export const previewCompetitions = getCompetitionSummaries();

export const previewAthletes = getAthleteSummaries();

export const previewTricks = getGlobalTrickSummaries();

export const previewFailReasons = getGlobalFailReasonSummaries();

export const previewTotals = {
  athletes: previewAppData.athletes.length,
  competitions: previewAppData.competitions.length,
  runs: Object.keys(previewAppData.runsById).length,
  trickAttempts: Object.values(previewAppData.runsById).reduce(
    (count, run) => count + run.tricks.length,
    0,
  ),
};

export function getPreviewCompetition(competitionId: string) {
  return getCompetitionSummary(competitionId);
}

export function getPreviewAthlete(athleteId: string) {
  return getAthleteSummaryOrFallback(athleteId);
}

export function getPreviewCompetitionAthletes(competitionId: string) {
  return getCompetitionAthletes(competitionId)
    .map((athlete) => getAthleteSummaryOrFallback(athlete.id))
    .filter((athlete) => athlete !== undefined);
}

export function getPreviewAthleteAnalysis(athleteId: string) {
  return getAthleteAnalysis(athleteId);
}

function getAthleteSummaryOrFallback(athleteId: string) {
  const summary = previewAthletes.find((athlete) => athlete.id === athleteId);

  if (summary) {
    return summary;
  }

  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    return undefined;
  }

  return {
    attemptCount: 0,
    id: athlete.id,
    landedCount: 0,
    landedRate: 0,
    name: athlete.name,
    runCount: 0,
  };
}
