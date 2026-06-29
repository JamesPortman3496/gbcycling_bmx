"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, Card, PageHeader, SelectInput, TextInput } from "@/src/components";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import {
  formatCompetitionStage,
} from "@/src/data/competitionFlow";
import { previewFailReasons, previewTricks } from "@/src/data/previewData";

const FAIL_REASON_LIMIT = 6;
const OTHER_FAIL_REASON = "Other";

export type RunCaptureViewProps = {
  athleteId: string;
  competitionId: string;
  initialAthleteName: string;
  initialCompetitionName: string;
  runId: string;
};

export function RunCaptureView({
  athleteId,
  competitionId,
  initialAthleteName,
  initialCompetitionName,
  runId,
}: RunCaptureViewProps) {
  const router = useRouter();
  const {
    discardRunCapture,
    getActiveRunDraft,
    getAthleteDraft,
    updateRunCaptureTrick,
  } = useAthleteDrafts();
  const athleteName = getAthleteDraft(athleteId)?.name ?? initialAthleteName;
  const runDraft = getActiveRunDraft(runId);
  const initialIndex = useMemo(
    () =>
      runDraft?.tricks.findIndex((trick) => trick.landed === undefined) === -1
        ? 0
        : runDraft?.tricks.findIndex((trick) => trick.landed === undefined) ?? 0,
    [runDraft],
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!runDraft) {
    return (
      <div className="space-y-4">
        <PageHeader
          backHref={`/competitions/${competitionId}/athletes/${athleteId}/runs/new`}
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
            { label: "Run capture" },
          ]}
          description="This prototype run is no longer available."
          title="Run capture"
        />
        <Card className="rounded-lg p-4 sm:p-5">
          <p className="text-sm text-bc-dark-grey">
            Start the run again from the pre-run confirmation screen.
          </p>
        </Card>
      </div>
    );
  }

  const currentTrick = runDraft.tricks[currentIndex];
  const isLastTrick = currentIndex === runDraft.tricks.length - 1;
  const canEndRunEarly = currentTrick.landed === false && !isLastTrick;
  const availableFailReasons = [
    ...previewFailReasons.slice(0, FAIL_REASON_LIMIT).map((item) => item.reason),
    OTHER_FAIL_REASON,
  ];
  const currentFailReasonIsCustom =
    currentTrick.failReason !== undefined &&
    currentTrick.failReason.length > 0 &&
    !availableFailReasons.includes(currentTrick.failReason);
  const isCurrentTrickComplete =
    currentTrick.landed === true
      ? currentTrick.executionRating !== undefined
      : currentTrick.landed === false
        ? Boolean(currentTrick.failReason?.trim())
        : false;

  function handleExitFlow() {
    discardRunCapture(runId);
    router.push(`/competitions/${competitionId}/athletes/${athleteId}/runs/new`);
  }

  function handleMoveToSummary() {
    router.push(
      `/competitions/${competitionId}/athletes/${athleteId}/runs/${runId}/summary?completed=${currentTrick.order}`,
    );
  }

  return (
    <div className="space-y-4 pb-24">
      <PageHeader
        backHref={`/competitions/${competitionId}/athletes/${athleteId}/runs/new`}
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
          {
            href: `/competitions/${competitionId}/athletes/${athleteId}/runs/new`,
            label: "Run setup",
          },
          { label: "Capture" },
        ]}
        description="Record the run trick by trick."
        title="Run capture"
      />

      <Card className="rounded-lg p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="grey">{initialCompetitionName}</Badge>
          <Badge variant="grey">{athleteName}</Badge>
          <Badge variant="grey">
            {formatCompetitionStage(runDraft.round, runDraft.runNumber)}
          </Badge>
        </div>
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-bc-dark-grey">
            Trick {currentTrick.order} of {runDraft.tricks.length}
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-bc-navy">
            {currentTrick.trickName}
          </h2>
          <p className="mt-1 text-sm text-bc-dark-grey">
            Planned: {currentTrick.plannedTrickName ?? currentTrick.trickName}
          </p>
        </div>
      </Card>

      <Card className="rounded-lg p-4 sm:p-5">
        <div className="space-y-5">
          <SelectInput
            label="Recorded trick"
            onChange={(event) =>
              updateRunCaptureTrick(runId, currentTrick.order, {
                trickName: event.target.value,
              })
            }
            value={currentTrick.trickName}
          >
            {previewTricks.map((trick) => (
              <option key={trick.name} value={trick.name}>
                {trick.name}
              </option>
            ))}
          </SelectInput>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-bc-navy">Landed?</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="h-12 text-base"
                onClick={() =>
                  updateRunCaptureTrick(runId, currentTrick.order, {
                    executionRating: currentTrick.executionRating,
                    failReason: undefined,
                    landed: true,
                  })
                }
                variant={currentTrick.landed === true ? "primary" : "secondary"}
              >
                Yes
              </Button>
              <Button
                className="h-12 text-base"
                onClick={() =>
                  updateRunCaptureTrick(runId, currentTrick.order, {
                    executionRating: undefined,
                    failReason: currentTrick.failReason,
                    landed: false,
                  })
                }
                variant={currentTrick.landed === false ? "primary" : "secondary"}
              >
                No
              </Button>
            </div>
          </div>

          {currentTrick.landed === true ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-bc-navy">Coach rating</p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
                  <Button
                    className="h-12 text-base"
                    key={rating}
                    onClick={() =>
                      updateRunCaptureTrick(runId, currentTrick.order, {
                        executionRating: rating,
                        failReason: undefined,
                        landed: true,
                      })
                    }
                    variant={
                      currentTrick.executionRating === rating
                        ? "primary"
                        : "secondary"
                    }
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}

          {currentTrick.landed === false ? (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-bc-navy">Fail reason</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {availableFailReasons.map((reason) => {
                  const isSelected =
                    reason === OTHER_FAIL_REASON
                      ? currentFailReasonIsCustom
                      : currentTrick.failReason === reason;

                  return (
                    <Button
                      className="h-auto min-h-12 px-3 py-3 text-left text-sm"
                      key={reason}
                      onClick={() =>
                        updateRunCaptureTrick(runId, currentTrick.order, {
                          executionRating: undefined,
                          failReason:
                            reason === OTHER_FAIL_REASON
                              ? currentFailReasonIsCustom
                                ? currentTrick.failReason
                                : ""
                              : reason,
                          landed: false,
                        })
                      }
                      variant={isSelected ? "primary" : "secondary"}
                    >
                      {reason}
                    </Button>
                  );
                })}
              </div>
              {currentFailReasonIsCustom || currentTrick.failReason === "" ? (
                <TextInput
                  label="Custom fail reason"
                  onChange={(event) =>
                    updateRunCaptureTrick(runId, currentTrick.order, {
                      executionRating: undefined,
                      failReason: event.target.value,
                      landed: false,
                    })
                  }
                  placeholder="Enter fail reason"
                  value={currentTrick.failReason ?? ""}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </Card>

      <div className="sticky bottom-4 z-30 rounded-lg border border-bc-mid-grey bg-bc-white p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <Button
            className="h-11 w-full"
            onClick={() =>
              currentIndex === 0
                ? handleExitFlow()
                : setCurrentIndex((index) => Math.max(0, index - 1))
            }
            variant="secondary"
          >
            {currentIndex === 0 ? "Exit run flow" : "Previous trick"}
          </Button>

          <Button
            className="h-11 w-full"
            disabled={!isCurrentTrickComplete}
            onClick={() =>
              isLastTrick ? handleMoveToSummary() : setCurrentIndex((index) => index + 1)
            }
          >
            {isLastTrick ? "End run" : "Next trick"}
          </Button>

          {canEndRunEarly ? (
            <Button
              className="col-span-2 h-11 w-full"
              disabled={!isCurrentTrickComplete}
              onClick={handleMoveToSummary}
            >
              End run early
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
