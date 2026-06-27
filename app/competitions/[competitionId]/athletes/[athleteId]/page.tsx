import { notFound } from "next/navigation";
import { CompetitionAthleteWorkspaceView } from "@/src/components/competitions/CompetitionAthleteWorkspaceView";
import {
  getPreviewAthleteRecord,
  getPreviewCompetitionRecord,
} from "@/src/data/previewData";

type CompetitionAthletePageProps = {
  params: Promise<{ athleteId: string; competitionId: string }>;
};

export default async function CompetitionAthletePage({
  params,
}: CompetitionAthletePageProps) {
  const { athleteId, competitionId } = await params;
  const athlete = getPreviewAthleteRecord(athleteId);
  const competition = getPreviewCompetitionRecord(competitionId);

  if (!athlete || !competition) {
    notFound();
  }

  return (
    <CompetitionAthleteWorkspaceView
      athleteId={athleteId}
      competitionId={competitionId}
      initialAthleteName={athlete.name}
      initialCompetitionName={competition.name}
    />
  );
}
