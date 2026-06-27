import { Button, RouteScaffold } from "@/src/components";
import { previewTricks } from "@/src/data/previewData";

export default function NewAthletePage() {
  return (
    <RouteScaffold
      actions={<Button>Create athlete</Button>}
      backHref="/athletes"
      breadcrumbs={[
        { href: "/athletes", label: "Athletes" },
        { label: "New athlete" },
      ]}
      description="Create an athlete record and add planned runs."
      sections={[
        {
          title: "Athlete details",
          rows: [
            { label: "Name", value: "Athlete name" },
            { label: "Planned runs", value: "Add run plans after save" },
          ],
        },
        {
          title: "Planned trick example",
          rows: previewTricks.slice(0, 4).map((trick, index) => ({
            label: `Trick ${index + 1}`,
            value: trick.name,
          })),
        },
      ]}
      title="New athlete"
    />
  );
}
