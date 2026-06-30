import { ActionLink } from "@/src/components/ActionLink";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { PageHeader } from "@/src/components/PageHeader";
import { previewCompetitions } from "@/src/data/practiceCompetitionData";

export default function CompetitionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={<Button disabled>Add competition</Button>}
        description="Competition list for athlete allocation and run capture."
        title="Competitions"
      />

      <CompetitionList competitions={previewCompetitions} />
    </div>
  );
}

type CompetitionListProps = {
  competitions: typeof previewCompetitions;
};

function CompetitionList({ competitions }: CompetitionListProps) {
  return (
    <section className="grid gap-2">
      {competitions.map((competition) => (
        <Card
          className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          key={competition.id}
        >
          <div className="grid gap-2 md:grid-cols-[minmax(0,1.5fr)_130px] md:items-center md:gap-3">
            <div>
              <p className="font-medium text-bc-navy">{competition.name}</p>
              <p className="mt-0.5 text-xs text-bc-dark-grey md:hidden">
                {competition.date}
              </p>
            </div>
            <span className="hidden text-bc-dark-grey md:block">
              {competition.date}
            </span>
          </div>
          <div className="flex gap-2 md:justify-end">
            <ActionLink
              href={`/competitions/${competition.id}`}
              size="sm"
              variant="secondary"
            >
              Enter
            </ActionLink>
            <Button disabled size="sm" variant="ghost">
              Edit
            </Button>
          </div>
        </Card>
      ))}
    </section>
  );
}
