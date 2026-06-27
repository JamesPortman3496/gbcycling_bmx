import {
  ActionLink,
  Card,
  PageHeader,
} from "@/src/components";
import { previewAthletes } from "@/src/data/previewData";

export default function AthletesPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={<ActionLink href="/athletes/new">Add athlete</ActionLink>}
        backHref="/competitions"
        backLabel="Back to competitions"
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          { label: "Athletes" },
        ]}
        description="Athlete records used for planned runs, run capture and analysis."
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
          <div className="grid gap-2 md:grid-cols-[minmax(0,1.4fr)_90px_110px_90px] md:items-center md:gap-3">
            <div>
              <p className="font-medium text-bc-navy">{athlete.name}</p>
              <p className="mt-0.5 text-xs text-bc-dark-grey md:hidden">
                {athlete.runCount} runs - {athlete.attemptCount} attempts -{" "}
                {athlete.landedRate}% landed
              </p>
            </div>
            <span className="hidden text-bc-dark-grey md:block">
              {athlete.runCount} runs
            </span>
            <span className="hidden text-bc-dark-grey md:block">
              {athlete.attemptCount} attempts
            </span>
            <span className="hidden text-bc-dark-grey md:block">
              {athlete.landedRate}% landed
            </span>
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
