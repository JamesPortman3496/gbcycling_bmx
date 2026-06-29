import { notFound } from "next/navigation";
import { AthleteAnalysisView } from "@/src/components/athletes/AthleteAnalysisDashboard";
import {
  getPreviewAthleteAnalysis,
  getPreviewAthlete,
} from "@/src/data/previewData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function AthletePage({
  params,
}: AsyncPageProps<{ athleteId: string }>) {
  const { athleteId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const analysis = getPreviewAthleteAnalysis(athleteId);

  if (!athlete || !analysis) {
    notFound();
  }

  return (
    <AthleteAnalysisView
      analysis={analysis}
      athleteId={athleteId}
      athleteName={athlete.name}
    />
  );
}
