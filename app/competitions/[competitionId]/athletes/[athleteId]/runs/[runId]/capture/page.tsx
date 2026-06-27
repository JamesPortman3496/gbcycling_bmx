import { Badge, Button, Card, PageHeader } from "@/src/components";
import {
  getPreviewAthlete,
  getPreviewCompetition,
} from "@/src/data/previewData";
import { getGlobalFailReasonSummaries, getRunById } from "@/src/data/seedData";

type CapturePageProps = {
  params: Promise<{ athleteId: string; competitionId: string; runId: string }>;
};

export default async function RunCapturePage({ params }: CapturePageProps) {
  const { athleteId, competitionId, runId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const competition = getPreviewCompetition(competitionId);
  const run = getRunById(runId);
  const failReasons = getGlobalFailReasonSummaries();
  const firstTrick = run?.tricks[0];

  return (
    <div className="space-y-4">
      <PageHeader
        actions={<Button>Save run</Button>}
        backHref={`/competitions/${competitionId}/athletes/${athleteId}/runs/new`}
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          {
            href: `/competitions/${competitionId}`,
            label: competition?.name ?? competitionId,
          },
          {
            href: `/competitions/${competitionId}/athletes/${athleteId}`,
            label: athlete?.name ?? athleteId,
          },
          { href: `/competitions/${competitionId}/athletes/${athleteId}/runs/new`, label: "New run" },
          { label: "Capture" },
        ]}
        description="Mobile-first run capture placeholder."
        title="Run capture"
      />

      <Card>
        <div className="flex flex-wrap gap-2">
          <Badge variant="grey">{competition?.name ?? competitionId}</Badge>
          <Badge variant="grey">{athlete?.name ?? athleteId}</Badge>
          <Badge variant="grey">{run?.round ?? competition?.roundNames[0] ?? "Round"}</Badge>
          <Badge variant="grey">{runId}</Badge>
        </div>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-bc-dark-grey">Progress</dt>
            <dd className="text-bc-navy">
              Trick 1 of {run?.tricks.length ?? 0}
            </dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-bc-dark-grey">Planned trick</dt>
            <dd className="text-bc-navy">
              {firstTrick?.plannedTrickName ?? firstTrick?.trickName ?? "Planned trick"}
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-bc-navy">Did they land it?</h2>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button>Yes</Button>
          <Button variant="secondary">No</Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-bc-navy">Fail reasons</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {failReasons.slice(0, 4).map((reason) => (
            <Badge key={reason.reason} variant="grey">
              {reason.reason}
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
