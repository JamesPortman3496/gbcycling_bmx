import { notFound } from "next/navigation";
import { RunSummaryView } from "@/src/components/competitions/RunSummaryView";
import {
  getPreviewAthleteRecord,
  getPreviewCompetitionRecord,
} from "@/src/data/practiceCompetitionData";
import type { AsyncPagePropsWithSearch } from "@/src/types/next-page";

const MAX_COMPLETED_TRICK_COUNT = 25;

export default async function RunSummaryPage({
  params,
  searchParams,
}: AsyncPagePropsWithSearch<
  { athleteId: string; competitionId: string; runId: string },
  { completed?: string }
>) {
  const { athleteId, competitionId, runId } = await params;
  const { completed } = await searchParams;
  const athlete = getPreviewAthleteRecord(athleteId);
  const competition = getPreviewCompetitionRecord(competitionId);
  const completedTrickCount = Number(completed ?? "25");

  if (
    !athlete ||
    !competition ||
    !Number.isFinite(completedTrickCount) ||
    completedTrickCount < 1 ||
    completedTrickCount > MAX_COMPLETED_TRICK_COUNT
  ) {
    notFound();
  }

  return (
    <RunSummaryView
      athleteId={athleteId}
      competitionId={competitionId}
      completedTrickCount={completedTrickCount}
      initialAthleteName={athlete.name}
      initialCompetitionName={competition.name}
      runId={runId}
    />
  );
}
