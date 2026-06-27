import { notFound } from "next/navigation";
import { RunSetupView } from "@/src/components/competitions/RunSetupView";
import {
  getPreviewAthleteRecord,
  getPreviewCompetitionRecord,
} from "@/src/data/previewData";

type NewRunPageProps = {
  params: Promise<{ athleteId: string; competitionId: string }>;
};

export default async function NewRunPage({ params }: NewRunPageProps) {
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
