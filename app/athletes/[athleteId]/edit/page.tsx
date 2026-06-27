import { notFound } from "next/navigation";
import { AthleteEditView } from "@/src/components/athletes/AthleteEditView";
import { getAthleteById } from "@/src/data/seedData";

type EditAthletePageProps = {
  params: Promise<{ athleteId: string }>;
};

export default async function EditAthletePage({
  params,
}: EditAthletePageProps) {
  const { athleteId } = await params;
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    notFound();
  }

  return <AthleteEditView athleteId={athleteId} initialAthlete={athlete} />;
}
