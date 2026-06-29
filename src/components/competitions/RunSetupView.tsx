"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ActionLink, Button, Card, PageHeader, SelectInput } from "@/src/components";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import { getNextCompetitionStage } from "@/src/data/competitionFlow";

export type RunSetupViewProps = {
  athleteId: string;
  competitionId: string;
  initialAthleteName: string;
  initialCompetitionName: string;
};

export function RunSetupView({
  athleteId,
  competitionId,
  initialAthleteName,
  initialCompetitionName,
}: RunSetupViewProps) {
  const router = useRouter();
  const { getAthleteDraft, getCompetitionAthleteRuns, startRunCapture } =
    useAthleteDrafts();
  const athlete = getAthleteDraft(athleteId);
  const athleteName = athlete?.name ?? initialAthleteName;
  const runs = getCompetitionAthleteRuns(competitionId, athleteId);
  const nextStage = getNextCompetitionStage(runs);
  const plannedRuns = athlete?.plannedRuns ?? [];
  const [selectedPlannedRunId, setSelectedPlannedRunId] = useState(
    plannedRuns[0]?.id ?? "",
  );

  const selectedPlannedRun = plannedRuns.find(
    (plannedRun) => plannedRun.id === selectedPlannedRunId,
  );

  function handleStartRun() {
    if (!nextStage || !selectedPlannedRun) {
      return;
    }

    const runId = startRunCapture({
      athleteId,
      competitionId,
      plannedRun: selectedPlannedRun,
      round: nextStage.round,
      runNumber: nextStage.runNumber,
    });

    router.push(
      `/competitions/${competitionId}/athletes/${athleteId}/runs/${runId}/capture`,
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <Button
            disabled={!nextStage || !selectedPlannedRun}
            onClick={handleStartRun}
          >
            Start run
          </Button>
        }
        backHref={`/competitions/${competitionId}/athletes/${athleteId}`}
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          {
            href: `/competitions/${competitionId}`,
            label: initialCompetitionName,
          },
          {
            href: `/competitions/${competitionId}/athletes/${athleteId}`,
            label: athleteName,
          },
          { label: "Run setup" },
        ]}
        description="Confirm the next round and planned run before capture."
        title="Run setup"
      />

      <div>
        <Card className="rounded-lg p-4 sm:p-5">
          {nextStage ? (
            <div className="space-y-5">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <Detail label="Competition" value={initialCompetitionName} />
                <Detail label="Athlete" value={athleteName} />
                <Detail
                  label="Round"
                  value={nextStage.round}
                />
                <Detail label="Run" value={`${nextStage.runNumber}`} />
              </dl>

              <SelectInput
                label="Planned run"
                onChange={(event) => setSelectedPlannedRunId(event.target.value)}
                value={selectedPlannedRunId}
              >
                {plannedRuns.map((plannedRun) => (
                  <option key={plannedRun.id} value={plannedRun.id}>
                    {plannedRun.name}
                  </option>
                ))}
              </SelectInput>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-bc-dark-grey">
                This athlete already has all scheduled runs recorded for{" "}
                {initialCompetitionName}.
              </p>
              <ActionLink
                href={`/competitions/${competitionId}/athletes/${athleteId}`}
                variant="secondary"
              >
                Back to athlete
              </ActionLink>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

type DetailProps = {
  label: string;
  value: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <div className="rounded-sm bg-bc-light-grey px-3 py-3">
      <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-bc-dark-grey">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-bc-navy">{value}</dd>
    </div>
  );
}
