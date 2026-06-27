import { ActionLink, Card, PageHeader, StatCard } from "@/src/components";
import {
  getPreviewAthleteAnalysis,
  getPreviewAthlete,
} from "@/src/data/previewData";

type AthletePageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function AthletePage({ params }: AthletePageProps) {
  const { athleteId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const analysis = getPreviewAthleteAnalysis(athleteId);

  return (
    <div className="space-y-4">
      <PageHeader
        actions={<ActionLink href={`/athletes/${athleteId}/edit`}>Edit athlete</ActionLink>}
        backHref="/athletes"
        breadcrumbs={[
          { href: "/athletes", label: "Athletes" },
          { label: athlete?.name ?? athleteId },
        ]}
        description="Athlete analysis placeholder using CSV preview values."
        title={athlete?.name ?? athleteId}
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          detail="CSV preview"
          label="Runs"
          value={athlete?.runCount ?? 0}
        />
        <StatCard
          detail="CSV preview"
          label="Attempts"
          value={athlete?.attemptCount ?? 0}
        />
        <StatCard
          detail="CSV preview"
          label="Landed"
          value={athlete?.landedCount ?? 0}
        />
        <StatCard
          detail="CSV preview"
          label="Landed rate"
          value={`${athlete?.landedRate ?? 0}%`}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-bc-navy">Trick readiness</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {(analysis?.trickReadiness.slice(0, 4) ?? []).map((trick) => (
              <div className="flex justify-between gap-3" key={trick.trickName}>
                <dt className="text-bc-dark-grey">{trick.trickName}</dt>
                <dd className="text-bc-navy">{trick.attempts} attempts</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-bc-navy">Failure reasons</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {(analysis?.failReasons.slice(0, 4) ?? []).map((reason) => (
              <div className="flex justify-between gap-3" key={reason.reason}>
                <dt className="text-bc-dark-grey">{reason.reason}</dt>
                <dd className="text-bc-navy">{reason.count}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </section>
    </div>
  );
}
