import { Button, RouteScaffold } from "@/src/components";
import { getPreviewAthlete, previewTricks } from "@/src/data/previewData";

type EditAthletePageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function EditAthletePage({
  params,
}: EditAthletePageProps) {
  const { athleteId } = await params;
  const athlete = getPreviewAthlete(athleteId);

  return (
    <RouteScaffold
      actions={<Button>Save athlete</Button>}
      backHref={`/athletes/${athleteId}`}
      breadcrumbs={[
        { href: "/athletes", label: "Athletes" },
        {
          href: `/athletes/${athleteId}`,
          label: athlete?.name ?? athleteId,
        },
        { label: "Edit athlete" },
      ]}
      description="Edit athlete details and planned run placeholders."
      sections={[
        {
          title: "Athlete record",
          rows: [
            { label: "Name", value: athlete?.name ?? athleteId },
            { label: "Planned runs", value: "Add or edit planned runs" },
          ],
        },
        {
          title: "Planned run preview",
          rows: previewTricks.slice(0, 4).map((trick, index) => ({
            label: `Trick ${index + 1}`,
            value: trick.name,
          })),
        },
      ]}
      title="Edit athlete"
    />
  );
}
