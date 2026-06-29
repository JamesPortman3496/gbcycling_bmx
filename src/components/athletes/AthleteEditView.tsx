"use client";

import Link from "next/link";
import { useRef, type FormEvent } from "react";
import { ChevronRight } from "lucide-react";
import { ActionLink } from "@/src/components/ActionLink";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { PageHeader } from "@/src/components/PageHeader";
import { TextInput } from "@/src/components/TextInput";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import type { AthleteDraft } from "@/src/types/athlete-drafts";

export type AthleteEditViewProps = {
  athleteId: string;
  initialAthlete: AthleteDraft;
};

export function AthleteEditView({
  athleteId,
  initialAthlete,
}: AthleteEditViewProps) {
  const { getAthleteDraft, saveAthleteName } = useAthleteDrafts();
  const athlete = getAthleteDraft(athleteId) ?? initialAthlete;
  const athleteNameRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextName = athleteNameRef.current?.value.trim() || athlete.name;
    saveAthleteName(athleteId, nextName);

    if (athleteNameRef.current) {
      athleteNameRef.current.value = nextName;
    }
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <Button form="edit-athlete-form" type="submit">
            Save athlete
          </Button>
        }
        backHref={`/athletes/${athleteId}`}
        breadcrumbs={[
          { href: "/athletes", label: "Athletes" },
          { href: `/athletes/${athleteId}`, label: athlete.name },
          { label: "Edit athlete" },
        ]}
        description="Update the athlete name and planned runs for this session."
        title="Edit athlete"
      />

      <Card className="rounded-lg p-4 sm:p-5">
        <form className="space-y-6" id="edit-athlete-form" onSubmit={handleSubmit}>
          <TextInput
            defaultValue={athlete.name}
            label="Athlete name"
            placeholder="Enter athlete name"
            ref={athleteNameRef}
          />

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-bc-navy">
                  Planned runs
                </h2>
                <p className="mt-1 text-sm text-bc-dark-grey">
                  Open a run to rename it and adjust trick order.
                </p>
              </div>
              <ActionLink href={`/athletes/${athleteId}/planned-runs/new`} variant="secondary">
                Add planned run
              </ActionLink>
            </div>

            <div className="space-y-3">
              {athlete.plannedRuns.length ? (
                athlete.plannedRuns.map((plannedRun) => (
                  <Link
                    className="flex items-center justify-between gap-3 rounded-lg border border-bc-mid-grey bg-bc-white px-4 py-3 transition-colors hover:border-bc-royal-blue hover:bg-bc-light-grey focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
                    href={`/athletes/${athleteId}/planned-runs/${plannedRun.id}/edit`}
                    key={plannedRun.id}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-bc-navy">
                        {plannedRun.name}
                      </p>
                      <p className="mt-1 text-xs text-bc-dark-grey">
                        {plannedRun.tricks.length} planned{" "}
                        {plannedRun.tricks.length === 1 ? "trick" : "tricks"}
                      </p>
                    </div>
                    <ChevronRight
                      aria-hidden="true"
                      className="shrink-0 text-bc-dark-grey"
                      size={18}
                      strokeWidth={2.2}
                    />
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-bc-mid-grey bg-bc-light-grey px-4 py-5 text-sm text-bc-dark-grey">
                  No planned runs yet. Add one to start mapping tricks.
                </div>
              )}
            </div>
          </section>
        </form>
      </Card>
    </div>
  );
}
