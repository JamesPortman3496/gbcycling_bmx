export const COMPETITION_ROUNDS = [
  "Qualification",
  "Semi-Final",
  "Final",
] as const;

export type CompetitionRound = (typeof COMPETITION_ROUNDS)[number];

export type CompetitionStage = {
  round: CompetitionRound;
  runNumber: number;
};

export const COMPETITION_STAGE_FLOW: CompetitionStage[] = COMPETITION_ROUNDS.flatMap(
  (round) => [1, 2].map((runNumber) => ({ round, runNumber })),
);

export function compareCompetitionStages(
  left: { round: string; runNumber: number },
  right: { round: string; runNumber: number },
) {
  return (
    getCompetitionStageIndex(left.round, left.runNumber) -
      getCompetitionStageIndex(right.round, right.runNumber) ||
    left.round.localeCompare(right.round) ||
    left.runNumber - right.runNumber
  );
}

export function formatCompetitionStage(
  round: string,
  runNumber: number,
) {
  return `${round} Run ${runNumber}`;
}

export function getCompetitionStageIndex(round: string, runNumber: number) {
  const index = COMPETITION_STAGE_FLOW.findIndex(
    (stage) => stage.round === round && stage.runNumber === runNumber,
  );

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

export function getNextCompetitionStage(
  runs: Array<{ round: string; runNumber: number }>,
) {
  return COMPETITION_STAGE_FLOW.find(
    (stage) =>
      !runs.some(
        (run) => run.round === stage.round && run.runNumber === stage.runNumber,
      ),
  );
}
