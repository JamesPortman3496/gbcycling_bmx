import { Button, RouteScaffold } from "@/src/components";

export default function NewCompetitionPage() {
  return (
    <RouteScaffold
      actions={<Button>Create competition</Button>}
      backHref="/competitions"
      breadcrumbs={[
        { href: "/competitions", label: "Competitions" },
        { label: "New competition" },
      ]}
      description="Set up a competition record before adding athletes and runs."
      sections={[
        {
          title: "Competition details",
          rows: [
            { label: "Name", value: "Competition name" },
            { label: "Date", value: "Competition date" },
            { label: "Location", value: "Competition location" },
          ],
        },
        {
          title: "Next step",
          rows: [
            { label: "After save", value: "Add competition athletes" },
            { label: "Run setup", value: "Create athlete workspaces" },
          ],
        },
      ]}
      title="New competition"
    />
  );
}
