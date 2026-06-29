import { notFound } from "next/navigation";
import { RunSetupView } from "@/src/components/competitions/RunSetupView";
import {
  getPreviewAthleteRecord,
  getPreviewCompetitionRecord,
} from "@/src/data/previewData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function NewRunPage({
  params,
}: AsyncPageProps<{ athleteId: string; competitionId: string }>) {
  const { athleteId, competitionId } = await params;
  const athlete = getPreviewAthleteRecord(athleteId);
  const competition = getPreviewCompetitionRecord(competitionId);

  if (!athlete || !competition) {
    notFound();
  }

  return (
    <RunSetupView
      athleteId={athleteId}
      competitionId={competitionId}
      initialAthleteName={athlete.name}
      initialCompetitionName={competition.name}
    />
  );
}
