import { Button, Card, PageHeader, StatCard } from "@/src/components";
import {
  previewAthletes,
  previewCompetitions,
  previewFailReasons,
  previewTotals,
  previewTricks,
} from "@/src/data/previewData";
import Link from "next/link";

const dataSections = [
  { label: "Competition athletes", value: previewTotals.competitionAthletes },
  { label: "Runs", value: previewTotals.runs },
  { label: "Trick attempts", value: previewTotals.trickAttempts },
];

export default function Home() {
  return (
    <div className="space-y-4">
      <PageHeader
        actions={<Button>Add competition</Button>}
        description="Operational snapshot for competitions, athlete allocations and run capture."
        title="Overview"
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          detail="Competition records"
          label="Competitions"
          value={previewTotals.competitions}
        />
        <StatCard
          detail="Athlete records"
          label="Athletes"
          value={previewTotals.athletes}
        />
        <StatCard
          detail="Competition links"
          label="Allocations"
          value={previewTotals.competitionAthletes}
        />
        <StatCard
          detail="CSV run records"
          label="Runs"
          value={previewTotals.runs}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-bc-mid-grey px-3 py-2">
            <h2 className="text-sm font-semibold text-bc-navy">
              Upcoming competitions
            </h2>
            <Link
              className="inline-flex h-8 items-center rounded border border-transparent px-2.5 text-xs font-medium text-bc-navy transition-colors hover:border-bc-mid-grey hover:bg-bc-light-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
              href="/competitions"
            >
              View all
            </Link>
          </div>
          <div className="hidden grid-cols-[minmax(0,1.4fr)_120px_120px_90px_70px] gap-3 border-b border-bc-mid-grey bg-bc-light-grey px-3 py-2 text-xs font-medium text-bc-dark-grey md:grid">
            <span>Event</span>
            <span>Date</span>
            <span>Athletes</span>
            <span>Runs</span>
            <span className="text-right">Action</span>
          </div>
          <div className="divide-y divide-bc-mid-grey">
            {previewCompetitions.map((competition) => (
              <div
                className="grid gap-2 px-3 py-3 text-sm md:grid-cols-[minmax(0,1.4fr)_120px_120px_90px_70px] md:items-center md:gap-3"
                key={competition.id}
              >
                <div>
                  <p className="font-medium text-bc-navy">
                    {competition.name}
                  </p>
                  <p className="mt-0.5 text-xs text-bc-dark-grey md:hidden">
                    {competition.date} - {competition.athleteCount} athletes -{" "}
                    {competition.runCount} runs
                  </p>
                </div>
                <span className="hidden text-bc-dark-grey md:block">
                  {competition.date}
                </span>
                <span className="hidden text-bc-dark-grey md:block">
                  {competition.athleteCount}
                </span>
                <span className="hidden text-bc-dark-grey md:block">
                  {competition.runCount}
                </span>
                <div className="flex justify-start md:justify-end">
                  <Button size="sm" variant="secondary">
                    Enter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0">
          <div className="border-b border-bc-mid-grey px-3 py-2">
            <h2 className="text-sm font-semibold text-bc-navy">
              Data sections
            </h2>
          </div>
          <div className="divide-y divide-bc-mid-grey">
            {dataSections.map((item) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 px-3 py-3 text-sm"
                key={item.label}
              >
                <p className="font-medium text-bc-navy">{item.label}</p>
                <span className="text-base font-semibold text-bc-navy">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-0 lg:col-span-2">
          <div className="border-b border-bc-mid-grey px-3 py-2">
            <h2 className="text-sm font-semibold text-bc-navy">
              CSV preview values
            </h2>
          </div>
          <div className="grid gap-0 divide-y divide-bc-mid-grey md:grid-cols-3 md:divide-x md:divide-y-0">
            <PreviewList
              items={previewAthletes.slice(0, 3).map((athlete) => ({
                label: athlete.name,
                value: `${athlete.runCount} runs`,
              }))}
              title="Athletes"
            />
            <PreviewList
              items={previewTricks.slice(0, 3).map((trick) => ({
                label: trick.name,
                value: `${trick.attemptCount} attempts`,
              }))}
              title="Tricks"
            />
            <PreviewList
              items={previewFailReasons.slice(0, 3).map((failReason) => ({
                label: failReason.reason,
                value: String(failReason.count),
              }))}
              title="Fail reasons"
            />
          </div>
        </Card>
      </section>
    </div>
  );
}

type PreviewListProps = {
  items: Array<{ label: string; value: string }>;
  title: string;
};

function PreviewList({ items, title }: PreviewListProps) {
  return (
    <div className="px-3 py-2">
      <h3 className="text-xs font-semibold text-bc-dark-grey">{title}</h3>
      <dl className="mt-2 space-y-2">
        {items.map((item) => (
          <div className="flex justify-between gap-3 text-sm" key={item.label}>
            <dt className="text-bc-navy">{item.label}</dt>
            <dd className="shrink-0 text-bc-dark-grey">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
