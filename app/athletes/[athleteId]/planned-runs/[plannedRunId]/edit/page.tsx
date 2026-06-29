import { notFound } from "next/navigation";
import { PlannedRunEditorView } from "@/src/components/athletes/PlannedRunEditorView";
import { getAthleteById } from "@/src/data/seedData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function EditPlannedRunPage({
  params,
}: AsyncPageProps<{ athleteId: string; plannedRunId: string }>) {
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
