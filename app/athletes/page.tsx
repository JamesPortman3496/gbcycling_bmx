import { ActionLink } from "@/src/components/ActionLink";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { PageHeader } from "@/src/components/PageHeader";
import { previewAthletes } from "@/src/data/previewData";

export default function AthletesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={<Button disabled>Add athlete</Button>}
        description="Athletes with planned runs, captured runs and analysis."
        title="Athletes"
      />

      <AthleteList athletes={previewAthletes} />
    </div>
  );
}

type AthleteListProps = {
  athletes: typeof previewAthletes;
};

function AthleteList({ athletes }: AthleteListProps) {
  return (
    <section className="grid gap-2">
      {athletes.map((athlete) => (
        <Card
          className="grid gap-3 text-sm md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          key={athlete.id}
        >
          <div>
            <div>
              <p className="font-medium text-bc-navy">{athlete.name}</p>
            </div>
          </div>
          <div className="flex gap-2 md:justify-end">
            <ActionLink
              href={`/athletes/${athlete.id}`}
              size="sm"
              variant="secondary"
            >
              Enter
            </ActionLink>
            <ActionLink
              href={`/athletes/${athlete.id}/edit`}
              size="sm"
              variant="ghost"
            >
              Edit
            </ActionLink>
          </div>
        </Card>
      ))}
    </section>
  );
}
