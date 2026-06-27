"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, PageHeader, TextArea, TextInput } from "@/src/components";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import { formatCompetitionStage } from "@/src/data/competitionFlow";

export type RunSummaryViewProps = {
  athleteId: string;
  competitionId: string;
  completedTrickCount: number;
  initialAthleteName: string;
  initialCompetitionName: string;
  runId: string;
};

export function RunSummaryView({
  athleteId,
  competitionId,
  completedTrickCount,
  initialAthleteName,
  initialCompetitionName,
  runId,
}: RunSummaryViewProps) {
  const router = useRouter();
  const { completeRunCapture, getActiveRunDraft, getAthleteDraft } = useAthleteDrafts();
  const athleteName = getAthleteDraft(athleteId)?.name ?? initialAthleteName;
  const runDraft = getActiveRunDraft(runId);
  const [score, setScore] = useState("");
  const [coachNotes, setCoachNotes] = useState("");
  const [overallPosition, setOverallPosition] = useState("");

  const landedCount = useMemo(
    () =>
      runDraft?.tricks
        .slice(0, completedTrickCount)
        .filter((trick) => trick.landed).length ?? 0,
    [completedTrickCount, runDraft],
  );

  if (!runDraft) {
    return (
      <div className="space-y-4">
        <PageHeader
          backHref={`/competitions/${competitionId}/athletes/${athleteId}`}
          breadcrumbs={[
            { href: "/competitions", label: "Competitions" },
            {
              href: `/competitions/${competitionId}`,
              label: initialCompetitionName,
            },
            {
              href: `/competitions/${competitionId}/athletes/${athleteId}`,
              label: athleteName,
            },
            { label: "Run summary" },
          ]}
          description="This prototype run is no longer available."
          title="Run summary"
        />
        <Card className="rounded-lg p-4 sm:p-5">
          <p className="text-sm text-bc-dark-grey">
            Reopen the run from the athlete workspace if you need to capture it again.
          </p>
        </Card>
      </div>
    );
  }

  function handleSave() {
    completeRunCapture(runId, {
      coachNotes: coachNotes.trim() || undefined,
      completedTrickCount,
      overallPositionAfterRound: parseOptionalNumber(overallPosition),
      score: parseOptionalNumber(score),
    });
    router.push(`/competitions/${competitionId}/athletes/${athleteId}`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={<Button onClick={handleSave}>Save and exit</Button>}
        backHref={`/competitions/${competitionId}/athletes/${athleteId}/runs/${runId}/capture`}
        breadcrumbs={[
          { href: "/competitions", label: "Competitions" },
          {
            href: `/competitions/${competitionId}`,
            label: initialCompetitionName,
          },
          {
            href: `/competitions/${competitionId}/athletes/${athleteId}`,
            label: athleteName,
          },
          { label: "Run summary" },
        ]}
        description="Add the post-run summary before returning to the athlete workspace."
        title="Run summary"
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.8fr)]">
        <Card className="rounded-lg p-4 sm:p-5">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <SummaryStat label="Competition" value={initialCompetitionName} />
            <SummaryStat label="Athlete" value={athleteName} />
            <SummaryStat
              label="Round and run"
              value={formatCompetitionStage(runDraft.round, runDraft.runNumber)}
            />
            <SummaryStat
              label="Tricks recorded"
              value={`${completedTrickCount} / ${runDraft.tricks.length}`}
            />
            <SummaryStat label="Landed tricks" value={`${landedCount}`} />
            <SummaryStat
              label="Completion"
              value={`${Math.round(
                (completedTrickCount / runDraft.tricks.length) * 100,
              )}%`}
            />
          </div>
        </Card>

        <Card className="rounded-lg p-4 sm:p-5">
          <div className="space-y-4">
            <TextInput
              inputMode="decimal"
              label="Run score"
              onChange={(event) => setScore(event.target.value)}
              placeholder="Enter run score"
              value={score}
            />
            <TextInput
              inputMode="numeric"
              label="Overall position post run"
              onChange={(event) => setOverallPosition(event.target.value)}
              placeholder="Enter overall position"
              value={overallPosition}
            />
            <TextArea
              label="Coach notes"
              onChange={(event) => setCoachNotes(event.target.value)}
              placeholder="Add any post-run notes"
              value={coachNotes}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}

type SummaryStatProps = {
  label: string;
  value: string;
};

function SummaryStat({ label, value }: SummaryStatProps) {
  return (
    <div className="rounded-sm bg-bc-light-grey px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-bc-dark-grey">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-bc-navy">{value}</p>
    </div>
  );
}

function parseOptionalNumber(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}
