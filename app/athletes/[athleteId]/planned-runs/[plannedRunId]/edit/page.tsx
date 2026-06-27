import { notFound } from "next/navigation";
import { PlannedRunEditorView } from "@/src/components/athletes/PlannedRunEditorView";
import { getAthleteById } from "@/src/data/seedData";

type EditPlannedRunPageProps = {
  params: Promise<{ athleteId: string; plannedRunId: string }>;
};

export default async function EditPlannedRunPage({
  params,
}: EditPlannedRunPageProps) {
  const { athleteId, plannedRunId } = await params;
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    notFound();
  }

  return (
    <PlannedRunEditorView
      athleteId={athleteId}
      initialAthleteName={athlete.name}
      initialPlannedRun={athlete.plannedRuns.find(
        (plannedRun) => plannedRun.id === plannedRunId,
      )}
      mode="edit"
      plannedRunId={plannedRunId}
    />
  );
}
