import { notFound } from "next/navigation";
import { ActionLink } from "@/src/components/ActionLink";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { PageHeader } from "@/src/components/PageHeader";
import {
  getPreviewCompetition,
  getPreviewCompetitionAthletes,
} from "@/src/data/practiceCompetitionData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function CompetitionPage({
  params,
}: AsyncPageProps<{ competitionId: string }>) {
  const { competitionId } = await params;
  const competition = getPreviewCompetition(competitionId);
  const athletes = getPreviewCompetitionAthletes(competitionId);

  if (!competition) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <div className="flex gap-2">
            <Button disabled variant="ghost">
              Edit competition
            </Button>
            <Button disabled>Add athlete</Button>
          </div>
        }
        backHref="/competitions"
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          { label: competition.name },
        ]}
        description="Assigned athletes for this competition."
        title={competition.name}
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
              <Button disabled size="sm" variant="ghost">
                Remove athlete
              </Button>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
