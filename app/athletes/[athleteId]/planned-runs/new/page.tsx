import { notFound } from "next/navigation";
import { PlannedRunEditorView } from "@/src/components/athletes/PlannedRunEditorView";
import { getAthleteById } from "@/src/data/seedData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function NewPlannedRunPage({
  params,
}: AsyncPageProps<{ athleteId: string }>) {
  const { athleteId } = await params;
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    notFound();
  }

  return (
    <PlannedRunEditorView
      athleteId={athleteId}
      initialAthleteName={athlete.name}
      mode="new"
    />
  );
}
