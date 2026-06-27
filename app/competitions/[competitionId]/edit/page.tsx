import { Button, RouteScaffold } from "@/src/components";
import { getPreviewCompetition } from "@/src/data/previewData";

type EditCompetitionPageProps = {
  params: Promise<{ competitionId: string }>;
};

export default async function EditCompetitionPage({
  params,
}: EditCompetitionPageProps) {
  const { competitionId } = await params;
  const competition = getPreviewCompetition(competitionId);

  return (
    <RouteScaffold
      actions={<Button>Save changes</Button>}
      backHref={`/competitions/${competitionId}`}
      breadcrumbs={[
        { href: "/competitions", label: "Competitions" },
        {
          href: `/competitions/${competitionId}`,
          label: competition?.name ?? competitionId,
        },
        { label: "Edit competition" },
      ]}
      description="Edit competition details."
      sections={[
        {
          title: "Current values",
          rows: [
            { label: "Name", value: competition?.name ?? competitionId },
            { label: "Date", value: competition?.date ?? "Competition date" },
            {
              label: "Rounds",
              value: competition?.roundNames.join(", ") ?? "Round list",
            },
          ],
        },
        {
          title: "Update fields",
          rows: [
            { label: "Name", value: "Competition name" },
            { label: "Date", value: "Competition date" },
            { label: "Location", value: "Location if needed" },
          ],
        },
      ]}
      title="Edit competition"
    />
  );
}
