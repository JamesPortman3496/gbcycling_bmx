"use client";

import { ActionLink, Button, Card, PageHeader } from "@/src/components";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import {
  COMPETITION_ROUNDS,
  formatCompetitionStage,
  getNextCompetitionStage,
} from "@/src/data/competitionFlow";
import type { StoredRunDraft } from "@/src/types/run-drafts";

export type CompetitionAthleteWorkspaceViewProps = {
  athleteId: string;
  competitionId: string;
  initialAthleteName: string;
  initialCompetitionName: string;
};

export function CompetitionAthleteWorkspaceView({
  athleteId,
  competitionId,
  initialAthleteName,
  initialCompetitionName,
}: CompetitionAthleteWorkspaceViewProps) {
  const { getAthleteDraft, getCompetitionAthleteRuns } = useAthleteDrafts();
  const athleteName = getAthleteDraft(athleteId)?.name ?? initialAthleteName;
  const runs = getCompetitionAthleteRuns(competitionId, athleteId);
  const nextStage = getNextCompetitionStage(runs);
  const runsByRound = new Map<string, typeof runs>();

  for (const run of runs) {
    const roundRuns = runsByRound.get(run.round) ?? [];
    roundRuns.push(run);
    runsByRound.set(run.round, roundRuns);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          nextStage ? (
            <ActionLink
              href={`/competitions/${competitionId}/athletes/${athleteId}/runs/new`}
            >
              Add run
            </ActionLink>
          ) : (
            <Button disabled>Competition complete</Button>
          )
        }
        backHref={`/competitions/${competitionId}`}
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          {
            href: `/competitions/${competitionId}`,
            label: initialCompetitionName,
          },
          { label: athleteName },
        ]}
        description={
          nextStage
            ? `Next run to record: ${formatCompetitionStage(
                nextStage.round,
                nextStage.runNumber,
              )}.`
            : "All scheduled runs have been recorded for this competition."
        }
        title={athleteName}
      />

      <div className="space-y-5">
        {COMPETITION_ROUNDS.map((roundName) => {
          const roundRuns = runsByRound.get(roundName) ?? [];

          return (
            <section className="space-y-2.5" key={roundName}>
              <h2 className="text-sm font-semibold text-bc-navy">{roundName}</h2>
              {roundRuns.length ? (
                roundRuns.map((run) => (
                  <Card className="rounded-sm px-3 py-3 sm:px-4" key={run.id}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-bc-navy">
                          Run {run.runNumber}
                        </p>
                        <p className="mt-0.5 text-xs text-bc-dark-grey">
                          {getRunStatus(run)}
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2">
                        <RunStat
                          label="Complete"
                          value={
                            run.completionPercentage !== undefined
                              ? `${run.completionPercentage}%`
                              : "-"
                          }
                        />
                        <RunStat
                          label="Position"
                          value={
                            run.overallPositionAfterRound !== undefined
                              ? `P${run.overallPositionAfterRound}`
                              : "-"
                          }
                        />
                        <RunStat
                          label="Score"
                          value={run.score !== undefined ? `${run.score}` : "-"}
                        />
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-bc-dark-grey">No runs yet.</p>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

type RunStatProps = {
  label: string;
  value: string;
};

function RunStat({ label, value }: RunStatProps) {
  return (
    <div className="min-w-14 rounded-sm bg-bc-light-grey px-2 py-1.5 text-center">
      <p className="text-[10px] uppercase tracking-[0.06em] text-bc-dark-grey">
        {label}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-bc-navy">{value}</p>
    </div>
  );
}

function getRunStatus(run: StoredRunDraft) {
  const failedTrick = run.tricks.find((trick) => !trick.landed);

  if (!failedTrick) {
    return "Run complete";
  }

  const failReason = failedTrick.failReason ?? "No fail reason recorded";
  return `Failed on trick ${failedTrick.order}: ${failedTrick.trickName} - ${failReason}`;
}
