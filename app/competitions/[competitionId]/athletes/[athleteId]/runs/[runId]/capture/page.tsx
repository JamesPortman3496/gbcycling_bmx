import { notFound } from "next/navigation";
import { RunCaptureView } from "@/src/components/competitions/RunCaptureView";
import {
  getPreviewAthleteRecord,
  getPreviewCompetitionRecord,
} from "@/src/data/practiceCompetitionData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function RunCapturePage({
  params,
}: AsyncPageProps<{ athleteId: string; competitionId: string; runId: string }>) {
  const { athleteId, competitionId, runId } = await params;
  const athlete = getPreviewAthleteRecord(athleteId);
  const competition = getPreviewCompetitionRecord(competitionId);

  if (!athlete || !competition) {
    notFound();
  }

  return (
    <RunCaptureView
      athleteId={athleteId}
      competitionId={competitionId}
      initialAthleteName={athlete.name}
      initialCompetitionName={competition.name}
      runId={runId}
    />
  );
}
