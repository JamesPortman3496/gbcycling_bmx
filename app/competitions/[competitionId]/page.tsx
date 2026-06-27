import { ActionLink, Button, Card, PageHeader } from "@/src/components";
import {
  getPreviewCompetition,
  getPreviewCompetitionAthletes,
} from "@/src/data/previewData";

type CompetitionPageProps = {
  params: Promise<{ competitionId: string }>;
};

export default async function CompetitionPage({
  params,
}: CompetitionPageProps) {
  const { competitionId } = await params;
  const competition = getPreviewCompetition(competitionId);
  const athletes = getPreviewCompetitionAthletes(competitionId);

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <div className="flex gap-2">
            <ActionLink href={`/competitions/${competitionId}/edit`} variant="ghost">
              Edit competition
            </ActionLink>
            <Button>Add athlete</Button>
          </div>
        }
        backHref="/competitions"
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          { label: competition?.name ?? competitionId },
        ]}
        description="Competition athlete list."
        title={competition?.name ?? competitionId}
      />

      <section className="grid gap-2">
        {athletes.map((athlete) => (
          <Card
            className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            key={athlete.id}
          >
            <div>
              <p className="font-medium text-bc-navy">{athlete.name}</p>
            </div>
            <div className="flex gap-2 md:justify-end">
              <ActionLink
                href={`/competitions/${competitionId}/athletes/${athlete.id}`}
                size="sm"
                variant="secondary"
              >
                Enter
              </ActionLink>
              <Button size="sm" variant="ghost">
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
