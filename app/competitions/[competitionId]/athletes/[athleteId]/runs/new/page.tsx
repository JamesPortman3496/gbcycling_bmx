import { ActionLink, Button, RouteScaffold } from "@/src/components";
import { getPreviewAthlete, getPreviewCompetition, previewTricks } from "@/src/data/previewData";

type NewRunPageProps = {
  params: Promise<{ athleteId: string; competitionId: string }>;
};

export default async function NewRunPage({ params }: NewRunPageProps) {
  const { athleteId, competitionId } = await params;
  const athlete = getPreviewAthlete(athleteId);
  const competition = getPreviewCompetition(competitionId);

  return (
    <RouteScaffold
      actions={
        <div className="flex gap-2">
          <Button variant="secondary">Save run setup</Button>
          <ActionLink
            href={`/competitions/${competitionId}/athletes/${athleteId}/runs/run-1/capture`}
          >
            Start capture
          </ActionLink>
        </div>
      }
      backHref={`/competitions/${competitionId}/athletes/${athleteId}`}
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
        { label: "New run" },
      ]}
      description="Confirm round and run number before live capture."
      sections={[
        {
          title: "Run setup",
          rows: [
            { label: "Competition", value: competition?.name ?? competitionId },
            { label: "Athlete", value: athlete?.name ?? athleteId },
            { label: "Round", value: competition?.roundNames[0] ?? "Round" },
            { label: "Run number", value: "1" },
          ],
        },
        {
          title: "Planned trick preview",
          rows: previewTricks.slice(0, 5).map((trick, index) => ({
            label: `Trick ${index + 1}`,
            value: trick.name,
          })),
        },
      ]}
      title="New run"
    />
  );
}
