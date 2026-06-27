import { notFound } from "next/navigation";
import { PlannedRunEditorView } from "@/src/components/athletes/PlannedRunEditorView";
import { getAthleteById } from "@/src/data/seedData";

type NewPlannedRunPageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function NewPlannedRunPage({
  params,
}: NewPlannedRunPageProps) {
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
