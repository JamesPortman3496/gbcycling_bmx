import { notFound } from "next/navigation";
import { AthleteEditView } from "@/src/components/athletes/AthleteEditView";
import { getAthleteById } from "@/src/data/seedData";
import type { AsyncPageProps } from "@/src/types/next-page";

export default async function EditAthletePage({
  params,
}: AsyncPageProps<{ athleteId: string }>) {
  const { athleteId } = await params;
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    notFound();
  }

  return <AthleteEditView athleteId={athleteId} initialAthlete={athlete} />;
}
