"use client";

import { Fragment, useMemo, useState } from "react";
import { ActionLink, Badge, Card, PageHeader, SelectInput, StatCard } from "@/src/components";
import { deriveRecommendationLabel } from "@/src/data/analysisRules";
import type {
  AthleteAnalysis,
  RagBreakdown,
  TrickAttemptDetail,
  TrickAnalysisRow,
} from "@/src/types/domain";

const ADDED_VALUE_OPTIONS = Array.from({ length: 10 }, (_, index) => index + 1);

type AthleteAnalysisViewProps = {
  analysis: AthleteAnalysis;
  athleteId: string;
  athleteName: string;
};

export function AthleteAnalysisView({
  analysis,
  athleteId,
  athleteName,
}: AthleteAnalysisViewProps) {
  const [addedValueOverrides, setAddedValueOverrides] = useState<Record<string, number>>({});
  const [expandedTrickName, setExpandedTrickName] = useState<string | null>(null);
  const ragTotal =
    analysis.snapshot.ragBreakdown.Green +
    analysis.snapshot.ragBreakdown.Amber +
    analysis.snapshot.ragBreakdown.Red;
  const trickAnalysisRows = useMemo(
    () =>
      analysis.trickAnalysisRows.map((row) => {
        const overrideValue = addedValueOverrides[row.trickName];

        if (overrideValue === undefined) {
          return row;
        }

        return {
          ...row,
          addedValue: overrideValue,
          recommendationLabel: deriveRecommendationLabel({
            addedValue: overrideValue,
            averageExecution: row.averageExecution,
            landedRate: row.landedRate,
            ragBreakdown: row.ragBreakdown,
          }),
        };
      }),
    [addedValueOverrides, analysis.trickAnalysisRows],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        actions={<ActionLink href={`/athletes/${athleteId}/edit`}>Edit athlete</ActionLink>}
        backHref="/athletes"
        breadcrumbs={[
          { href: "/athletes", label: "Athletes" },
          { label: athleteName },
        ]}
        description="Trick readiness, recommendation and failure pattern summary."
        title={athleteName}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Runs reviewed"
          value={analysis.snapshot.runs}
        />
        <StatCard
          detail={`${analysis.snapshot.landedCount} landed`}
          label="Attempts"
          value={analysis.snapshot.attempts}
        />
        <StatCard
          label="Landed rate"
          value={`${analysis.snapshot.landedRate}%`}
        />
        <StatCard
          label="Avg coach execution rating"
          value={`${analysis.snapshot.averageExecution}/10`}
        />
        <Card className="space-y-3">
          <div>
            <p className="text-xs font-medium text-bc-dark-grey">RAG</p>
            <p className="mt-1 text-xl font-semibold text-bc-navy">
              {formatRagMix(analysis.snapshot.ragBreakdown, ragTotal)}
            </p>
          </div>
          <RagBreakdownBar breakdown={analysis.snapshot.ragBreakdown} showLegend={false} />
        </Card>
      </section>

      <Card className="rounded-lg p-0">
        <div className="border-b border-bc-mid-grey px-4 py-4 sm:px-5">
          <SectionHeading
            title="Trick analysis"
            description="Recommendation uses added value, landed rate, coach rating and red RAG frequency."
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed border-collapse text-left text-sm">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
              <col className="w-[18%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead className="bg-bc-light-grey text-xs uppercase tracking-[0.08em] text-bc-dark-grey">
              <tr>
                <th className="px-4 py-3 font-semibold">Trick</th>
                <th className="px-4 py-3 font-semibold">Added value</th>
                <th className="px-4 py-3 font-semibold">Landed</th>
                <th className="px-4 py-3 font-semibold">Avg coach rating</th>
                <th className="px-4 py-3 font-semibold">RAG</th>
                <th className="px-4 py-3 font-semibold">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {trickAnalysisRows.map((row) => {
                const isExpanded = expandedTrickName === row.trickName;
                const attemptDetails = analysis.trickAttemptDetailsByName[row.trickName] ?? [];

                return (
                  <Fragment key={row.trickName}>
                    <tr
                      className="border-t border-bc-mid-grey align-top hover:bg-bc-light-grey/50"
                    >
                      <td className="px-4 py-3">
                        <button
                          className="w-full text-left"
                          onClick={() =>
                            setExpandedTrickName((current) =>
                              current === row.trickName ? null : row.trickName,
                            )
                          }
                          type="button"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-bc-navy">{row.trickName}</p>
                              {row.mainFailReason ? (
                                <p className="mt-1 text-xs text-bc-dark-grey">
                                  Main fail reason: {row.mainFailReason}
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-24 space-y-1">
                          <SelectInput
                            aria-label={`Added value for ${row.trickName}`}
                            className="h-9 px-2"
                            onChange={(event) =>
                              setAddedValueOverrides((current) => ({
                                ...current,
                                [row.trickName]: Number(event.target.value),
                              }))
                            }
                            value={row.addedValue}
                          >
                            {ADDED_VALUE_OPTIONS.map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </SelectInput>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-bc-dark-grey">
                        {row.landedRate}%
                      </td>
                      <td className="px-4 py-3 text-bc-dark-grey">
                        {row.averageExecution}/10
                      </td>
                      <td className="px-4 py-3">
                        <div className="w-36">
                          <RagBreakdownBar breakdown={row.ragBreakdown} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <RecommendationBadge label={row.recommendationLabel} />
                      </td>
                    </tr>
                    {isExpanded ? (
                      <tr className="border-t border-bc-mid-grey bg-bc-light-grey/40">
                        <td className="px-4 py-4" colSpan={6}>
                          <TrickDetailPanel attemptDetails={attemptDetails} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

type TrickDetailPanelProps = {
  attemptDetails: TrickAttemptDetail[];
};

function TrickDetailPanel({ attemptDetails }: TrickDetailPanelProps) {
  const [showFailuresOnly, setShowFailuresOnly] = useState(false);
  const failReasons = useMemo(() => {
    const counts = new Map<string, number>();

    for (const attempt of attemptDetails) {
      if (!attempt.failReason) {
        continue;
      }

      counts.set(attempt.failReason, (counts.get(attempt.failReason) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([reason, count]) => ({ count, reason }))
      .sort(
        (left, right) =>
          right.count - left.count || left.reason.localeCompare(right.reason),
      )
      .slice(0, 3);
  }, [attemptDetails]);
  const visibleAttempts = useMemo(
    () =>
      showFailuresOnly
        ? attemptDetails.filter((attempt) => !attempt.landed)
        : attemptDetails,
    [attemptDetails, showFailuresOnly],
  );

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="rounded-lg border border-bc-mid-grey bg-bc-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-bc-dark-grey">
            Top fail reasons
          </p>
          {failReasons.length ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {failReasons.map((item) => (
                <Badge key={item.reason} variant="grey">
                  {item.reason} ({item.count})
                </Badge>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-bc-dark-grey">No failed attempts recorded.</p>
          )}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-bc-mid-grey bg-bc-white">
        <div className="border-b border-bc-mid-grey px-4 py-3">
          <label className="inline-flex items-center gap-2 text-sm text-bc-dark-grey">
            <input
              checked={showFailuresOnly}
              className="h-4 w-4 rounded border-bc-mid-grey text-bc-royal-blue"
              onChange={(event) => setShowFailuresOnly(event.target.checked)}
              type="checkbox"
            />
            <span>Show failures only</span>
          </label>
        </div>
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-bc-light-grey text-xs uppercase tracking-[0.08em] text-bc-dark-grey">
            <tr>
              <th className="px-4 py-3 font-semibold">Competition</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Round</th>
              <th className="px-4 py-3 font-semibold">Run</th>
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Landed</th>
              <th className="px-4 py-3 font-semibold">Coach rating</th>
              <th className="px-4 py-3 font-semibold">Previous trick</th>
              <th className="px-4 py-3 font-semibold">Prev quality</th>
              <th className="px-4 py-3 font-semibold">Fail reason</th>
            </tr>
          </thead>
          <tbody>
            {visibleAttempts.map((attempt) => (
              <tr className="border-t border-bc-mid-grey align-top" key={attempt.id}>
                <td className="px-4 py-3 text-bc-dark-grey">{attempt.competitionName}</td>
                <td className="px-4 py-3 text-bc-dark-grey">{attempt.competitionDate}</td>
                <td className="px-4 py-3 text-bc-dark-grey">{attempt.round}</td>
                <td className="px-4 py-3 text-bc-dark-grey">{attempt.runNumber}</td>
                <td className="px-4 py-3 text-bc-dark-grey">{attempt.trickOrder}</td>
                <td className="px-4 py-3 text-bc-dark-grey">
                  {attempt.landed ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs font-medium ${getCoachRatingBadgeClass(attempt.executionRating)}`}
                  >
                    {attempt.executionRating}/10
                  </span>
                </td>
                <td className="px-4 py-3 text-bc-dark-grey">
                  {attempt.previousTrickName ?? "-"}
                </td>
                <td className="px-4 py-3 text-bc-dark-grey">
                  {attempt.previousTrickQuality ?? "-"}
                </td>
                <td className="px-4 py-3 text-bc-dark-grey">
                  {attempt.failReason ?? "-"}
                </td>
              </tr>
            ))}
            {visibleAttempts.length === 0 ? (
              <tr className="border-t border-bc-mid-grey">
                <td className="px-4 py-4 text-sm text-bc-dark-grey" colSpan={10}>
                  No attempts match the current filter.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type SectionHeadingProps = {
  description: string;
  title: string;
};

function SectionHeading({ description, title }: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-bc-navy">{title}</h2>
      <p className="mt-1 text-sm text-bc-dark-grey">{description}</p>
    </div>
  );
}

type RagBreakdownBarProps = {
  breakdown: RagBreakdown;
};

function RagBreakdownBar({
  breakdown,
  showLegend = true,
}: RagBreakdownBarProps & { showLegend?: boolean }) {
  const total = breakdown.Green + breakdown.Amber + breakdown.Red;
  const greenWidth = total === 0 ? 0 : (breakdown.Green / total) * 100;
  const amberWidth = total === 0 ? 0 : (breakdown.Amber / total) * 100;
  const redWidth = total === 0 ? 0 : (breakdown.Red / total) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex h-2.5 overflow-hidden rounded-full bg-bc-light-grey">
        <div className="bg-emerald-500" style={{ width: `${greenWidth}%` }} />
        <div className="bg-amber-400" style={{ width: `${amberWidth}%` }} />
        <div className="bg-bc-red" style={{ width: `${redWidth}%` }} />
      </div>
      {showLegend ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-bc-dark-grey">
          <span>Green {breakdown.Green}</span>
          <span>Amber {breakdown.Amber}</span>
          <span>Red {breakdown.Red}</span>
        </div>
      ) : null}
    </div>
  );
}

function RecommendationBadge({ label }: { label: TrickAnalysisRow["recommendationLabel"] }) {
  const className = {
    "Development priority": "border-bc-red/20 bg-bc-red/8 text-bc-red",
    "High upside, high risk": "border-amber-200 bg-amber-50 text-amber-900",
    "Low return": "border-bc-mid-grey bg-bc-light-grey text-bc-dark-grey",
    "Reliable scorer": "border-emerald-200 bg-emerald-50 text-emerald-800",
    "Stable support": "border-bc-royal-blue/25 bg-bc-royal-blue/10 text-bc-royal-blue",
  }[label];

  return <Badge className={className}>{label}</Badge>;
}

function getCoachRatingBadgeClass(executionRating: number) {
  if (executionRating >= 7) {
    return "border-emerald-500 bg-emerald-500 text-bc-white";
  }

  if (executionRating <= 0) {
    return "border-bc-red bg-bc-red text-bc-white";
  }

  return "border-amber-400 bg-amber-400 text-bc-white";
}

function formatRagMix(breakdown: RagBreakdown, total: number) {
  if (total === 0) {
    return "No attempts";
  }

  return `${Math.round((breakdown.Green / total) * 100)} / ${Math.round(
    (breakdown.Amber / total) * 100,
  )} / ${Math.round((breakdown.Red / total) * 100)}%`;
}
