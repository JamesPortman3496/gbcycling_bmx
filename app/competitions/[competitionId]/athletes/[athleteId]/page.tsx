import { ActionLink, Card, PageHeader } from "@/src/components";
import {
  getPreviewAthlete,
  getPreviewCompetition,
} from "@/src/data/previewData";
import { getRunsForCompetitionAthlete } from "@/src/data/seedData";

type CompetitionAthletePageProps = {
  params: Promise<{ athleteId: string; competitionId: string }>;
};

export default async function CompetitionAthletePage({
  params,
}: CompetitionAthletePageProps) {
  const { athleteId, competitionId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const competition = getPreviewCompetition(competitionId);
  const runs = getRunsForCompetitionAthlete(competitionId, athleteId);
  const roundNames = competition?.roundNames ?? [];
  const runsByRound = new Map<string, typeof runs>();

  for (const run of runs) {
    const roundRuns = runsByRound.get(run.round) ?? [];
    roundRuns.push(run);
    runsByRound.set(run.round, roundRuns);
  }

  const orderedRounds = Array.from(
    new Set([...roundNames, ...runs.map((run) => run.round)]),
  );

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <ActionLink
            href={`/competitions/${competitionId}/athletes/${athleteId}/runs/new`}
          >
            Add run
          </ActionLink>
        }
        backHref={`/competitions/${competitionId}`}
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          {
            href: `/competitions/${competitionId}`,
            label: competition?.name ?? competitionId,
          },
          { label: athlete?.name ?? athleteId },
        ]}
        description="Competition athlete workspace for run setup and capture."
        title={athlete?.name ?? athleteId}
      />

      <div className="space-y-5">
          {orderedRounds.map((roundName) => {
            const roundRuns = runsByRound.get(roundName) ?? [];

            return (
              <section className="space-y-2.5" key={roundName}>
                <h2 className="text-sm font-semibold text-bc-navy">{roundName}</h2>
                {roundRuns.map((run) => (
                  <Card
                    className="rounded-sm px-3 py-3 sm:px-4"
                    key={run.id}
                  >
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
                ))}
                {roundRuns.length === 0 ? (
                  <p className="text-sm text-bc-dark-grey">No runs yet.</p>
                ) : null}
              </section>
            );
          })}
          {runs.length === 0 ? (
            <Card className="rounded-sm px-3 py-3 text-sm text-bc-dark-grey">
              No runs recorded for this athlete at this competition yet.
            </Card>
          ) : null}
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

type CompetitionAthleteRun = ReturnType<typeof getRunsForCompetitionAthlete>[number];

function getRunStatus(run: CompetitionAthleteRun) {
  const failedTrick = run.tricks.find((trick) => !trick.landed);

  if (!failedTrick) {
    return "Run complete";
  }

  const failReason = failedTrick.failReason ?? "No fail reason recorded";
  return `Failed on trick ${failedTrick.order}: ${failedTrick.trickName} - ${failReason}`;
}
