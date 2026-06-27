import { ActionLink, Button, Card, PageHeader } from "@/src/components";
import {
  getPreviewAthlete,
  getPreviewCompetition,
  previewTricks,
} from "@/src/data/previewData";

type CompetitionAthletePageProps = {
  params: Promise<{ athleteId: string; competitionId: string }>;
};

export default async function CompetitionAthletePage({
  params,
}: CompetitionAthletePageProps) {
  const { athleteId, competitionId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const competition = getPreviewCompetition(competitionId);

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

      <Card>
        <dl className="grid gap-2 text-sm md:grid-cols-3">
          <div>
            <dt className="text-bc-dark-grey">Competition</dt>
            <dd className="mt-1 text-bc-navy">
              {competition?.name ?? competitionId}
            </dd>
          </div>
          <div>
            <dt className="text-bc-dark-grey">Round set</dt>
            <dd className="mt-1 text-bc-navy">
              {competition?.roundNames.join(", ") ?? "Round list"}
            </dd>
          </div>
          <div>
            <dt className="text-bc-dark-grey">Runs available</dt>
            <dd className="mt-1 text-bc-navy">1, 2</dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-bc-navy">Current run list</h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-bc-navy">Run 1</p>
              <p className="mt-0.5 text-xs text-bc-dark-grey">
                Planned tricks ready for capture
              </p>
            </div>
            <Button size="sm" variant="ghost">
              Enter
            </Button>
          </div>
          <div className="border-t border-bc-mid-grey pt-2">
            <p className="text-xs text-bc-dark-grey">Preview tricks</p>
            <p className="mt-1 text-sm text-bc-navy">
              {previewTricks.slice(0, 4).map((trick) => trick.name).join(", ")}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
