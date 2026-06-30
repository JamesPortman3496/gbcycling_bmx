"use client";

import { Fragment, useMemo, useState } from "react";
import { ActionLink, Badge, Card, PageHeader, SelectInput, StatCard } from "@/src/components";
import { deriveRecommendationLabel } from "@/src/data/trickRecommendationRules";
import type {
  AthleteAnalysis,
  RagBreakdown,
  RunAnalysisSummary,
  RunSplitSummary,
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
            description="Recommendation uses added score value, landed rate, coach rating and red RAG frequency."
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
                <th className="px-4 py-3 font-semibold">Added score value</th>
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
                            aria-label={`Added score value for ${row.trickName}`}
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

      <Card className="space-y-4 p-4">
        <SectionHeading
          title="Coach execution rating change through run"
          description="Each panel compares runs from one competition, plotting coach execution rating against the trick sequence."
        />
        <RunExecutionLineChart runs={analysis.runSummaries} />
      </Card>

      <RunAnalysisSection analysis={analysis} />
    </div>
  );
}

type TrickDetailPanelProps = {
  attemptDetails: TrickAttemptDetail[];
};

function RunAnalysisSection({ analysis }: { analysis: AthleteAnalysis }) {
  return (
    <section>
      <Card className="space-y-4 p-4">
        <SectionHeading
          title="Performance changes by stage and run"
        />
        <div className="grid gap-5 lg:grid-cols-2">
          <SplitBarGroup summaries={analysis.roundSummaries} title="By round" />
          <SplitBarGroup summaries={analysis.runNumberSummaries} title="By run number" />
        </div>
      </Card>
    </section>
  );
}

function RunExecutionLineChart({ runs }: { runs: RunAnalysisSummary[] }) {
  const competitionGroups = groupRunsByCompetition(runs);

  if (runs.length === 0) {
    return <EmptyAnalysisState label="No run execution points recorded." />;
  }

  return (
    <div className="space-y-4">
      {competitionGroups.map((group) => (
        <RunExecutionCompetitionPanel
          key={`${group.competitionDate}-${group.competitionName}`}
          competitionDate={group.competitionDate}
          competitionName={group.competitionName}
          runs={group.runs}
        />
      ))}
    </div>
  );
}

function RunExecutionCompetitionPanel({
  competitionDate,
  competitionName,
  runs,
}: {
  competitionDate: string;
  competitionName: string;
  runs: RunAnalysisSummary[];
}) {
  const [visibleRunIds, setVisibleRunIds] = useState(
    () => new Set(runs.map((run) => run.id)),
  );
  const [tooltip, setTooltip] = useState<{
    line1: string;
    line2: string;
    line3: string;
    x: number;
    y: number;
  } | null>(null);
  const chart = createExecutionChartModel(runs);

  if (chart.maxTrickOrder === 0) {
    return <EmptyAnalysisState label={`No execution points recorded for ${competitionName}.`} />;
  }

  return (
    <div className="rounded-sm border border-bc-mid-grey p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-bc-navy">{competitionName}</h3>
          <p className="mt-0.5 text-xs text-bc-dark-grey">
            {competitionDate} · {runs.length} runs
          </p>
        </div>
        <span className="text-xs font-medium text-bc-dark-grey">
          Avg run score {formatNullableNumber(averageNullableNumber(runs.map((run) => run.score)))}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[680px]">
          <svg
            aria-label={`${competitionName} coach execution rating by trick order`}
            className="h-64 w-full"
            role="img"
            viewBox="0 0 720 245"
          >
            {[0, 2, 4, 6, 8, 10].map((tick) => (
              <g key={tick}>
                <line
                  className="stroke-bc-mid-grey"
                  opacity="0.65"
                  x1={chart.left}
                  x2={chart.right}
                  y1={chart.getY(tick)}
                  y2={chart.getY(tick)}
                />
                <text
                  className="fill-bc-dark-grey text-[10px]"
                  x={chart.left - 10}
                  y={chart.getY(tick) + 4}
                  textAnchor="end"
                >
                  {tick}
                </text>
              </g>
            ))}

            {chart.orderTicks.map((tick) => (
              <g key={tick}>
                <line
                  className="stroke-bc-mid-grey"
                  opacity="0.35"
                  x1={chart.getX(tick)}
                  x2={chart.getX(tick)}
                  y1={chart.top}
                  y2={chart.bottom}
                />
                <text
                  className="fill-bc-dark-grey text-[10px]"
                  textAnchor="middle"
                  x={chart.getX(tick)}
                  y={chart.bottom + 18}
                >
                  {tick}
                </text>
              </g>
            ))}

            {runs.map((run, index) => {
              if (!visibleRunIds.has(run.id)) {
                return null;
              }

              const color = getRunSeriesColor(index);
              const points = run.executionPoints
                .map(
                  (point) =>
                    `${chart.getX(point.trickOrder)},${chart.getY(point.executionRating)}`,
                )
                .join(" ");

              return (
                <g key={run.id}>
                  <polyline
                    aria-label={formatRunLabel(run)}
                    fill="none"
                    points={points}
                    stroke={color}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.4"
                  />
                  {run.executionPoints.map((point) => {
                    const x = chart.getX(point.trickOrder);
                    const y = chart.getY(point.executionRating);

                    return (
                      <Fragment key={`${run.id}-${point.trickOrder}`}>
                        <circle
                          cx={x}
                          cy={y}
                          fill={color}
                          opacity="0.75"
                          r="2.2"
                        />
                        <circle
                          aria-label={`${formatRunLabel(run)}: trick ${point.trickOrder}, ${point.trickName}, ${point.executionRating}/10`}
                          className="cursor-crosshair"
                          cx={x}
                          cy={y}
                          fill="transparent"
                          onMouseEnter={() =>
                            setTooltip({
                              line1: formatCompactRunLabel(run),
                              line2: `Trick ${point.trickOrder}: ${point.trickName}`,
                              line3: `Coach rating ${point.executionRating}/10 · ${
                                point.landed ? "Landed" : "Not landed"
                              }`,
                              ...getExecutionTooltipPosition(chart, x, y),
                            })
                          }
                          onMouseLeave={() => setTooltip(null)}
                          r="7"
                        />
                      </Fragment>
                    );
                  })}
                </g>
              );
            })}

            {tooltip ? (
              <g pointerEvents="none" transform={`translate(${tooltip.x} ${tooltip.y})`}>
                <rect
                  fill="#FFFFFF"
                  height="58"
                  rx="3"
                  stroke="#D1D5DB"
                  width="250"
                />
                <text className="fill-bc-navy text-[11px] font-semibold" x="10" y="17">
                  {tooltip.line1}
                </text>
                <text className="fill-bc-dark-grey text-[11px]" x="10" y="34">
                  {tooltip.line2}
                </text>
                <text className="fill-bc-dark-grey text-[11px]" x="10" y="50">
                  {tooltip.line3}
                </text>
              </g>
            ) : null}

            <text
              className="fill-bc-dark-grey text-[11px]"
              textAnchor="middle"
              x={(chart.left + chart.right) / 2}
              y={chart.bottom + 38}
            >
              Trick order
            </text>
            <text
              className="fill-bc-dark-grey text-[11px]"
              textAnchor="middle"
              transform={`translate(14 ${(chart.top + chart.bottom) / 2}) rotate(-90)`}
            >
              Coach execution rating
            </text>
          </svg>

          <div className="mt-2 flex flex-wrap gap-2 text-xs text-bc-dark-grey">
            <button
              className="inline-flex items-center rounded-sm border border-bc-royal-blue bg-bc-royal-blue px-2 py-1 font-medium text-bc-white transition-colors hover:border-bc-navy hover:bg-bc-navy"
              onClick={() =>
                setVisibleRunIds((current) =>
                  current.size === runs.length
                    ? new Set<string>()
                    : new Set(runs.map((run) => run.id)),
                )
              }
              type="button"
            >
              {visibleRunIds.size === runs.length ? "Hide all" : "Show all"}
            </button>
            {runs.map((run, index) => (
              <button
                aria-pressed={visibleRunIds.has(run.id)}
                className={`inline-flex items-center gap-2 rounded-sm border px-2 py-1 transition-colors ${
                  visibleRunIds.has(run.id)
                    ? "border-bc-mid-grey bg-bc-white text-bc-navy"
                    : "border-bc-mid-grey bg-bc-light-grey text-bc-dark-grey/60"
                }`}
                key={run.id}
                onClick={() =>
                  setVisibleRunIds((current) => {
                    const next = new Set(current);

                    if (next.has(run.id)) {
                      next.delete(run.id);
                    } else {
                      next.add(run.id);
                    }

                    return next;
                  })
                }
                type="button"
              >
                <span
                  className="h-0.5 w-6"
                  style={{
                    backgroundColor: visibleRunIds.has(run.id)
                      ? getRunSeriesColor(index)
                      : "#9CA3AF",
                  }}
                />
                {formatCompactRunLabel(run)}: {formatNullableNumber(run.score)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitBarGroup({
  summaries,
  title,
}: {
  summaries: RunSplitSummary[];
  title: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-bc-dark-grey">
        {title}
      </h3>
      {summaries.length ? (
        <div className="space-y-3">
          {summaries.map((summary) => (
            <div
              className="grid gap-3 border-t border-bc-mid-grey pt-3 first:border-t-0 first:pt-0 sm:grid-cols-[8rem_minmax(0,1fr)]"
              key={summary.label}
            >
              <div>
                <p className="font-medium text-bc-navy">{summary.label}</p>
                <p className="mt-0.5 text-xs text-bc-dark-grey">{summary.runCount} runs</p>
              </div>
              <div className="space-y-2">
                <MetricBar
                  label="Run score"
                  value={summary.averageScore}
                  variant="blue"
                />
                <MetricBar
                  label="Landed rate"
                  suffix="%"
                  value={summary.landedRate}
                  variant="green"
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyAnalysisState label="No split data available." />
      )}
    </div>
  );
}

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
  description?: string;
  title: string;
};

function SectionHeading({ description, title }: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-bc-navy">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-bc-dark-grey">{description}</p>
      ) : null}
    </div>
  );
}

function MetricBar({
  label,
  suffix = "",
  value,
  variant,
}: {
  label: string;
  suffix?: string;
  value: number;
  variant: "blue" | "green" | "red";
}) {
  const barClassName = {
    blue: "bg-bc-royal-blue",
    green: "bg-emerald-500",
    red: "bg-bc-red",
  }[variant];

  return (
    <div className="grid w-full max-w-md grid-cols-[4.5rem_minmax(7rem,1fr)_3rem] items-center gap-2 text-xs text-bc-dark-grey">
      <span>{label}</span>
      <div className="h-2 overflow-hidden rounded-full bg-bc-light-grey">
        <div
          className={`h-full rounded-full ${barClassName}`}
          style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        />
      </div>
      <span className="text-right font-medium text-bc-navy">
        {value}
        {suffix}
      </span>
    </div>
  );
}

function EmptyAnalysisState({ label }: { label: string }) {
  return (
    <div className="rounded-sm border border-dashed border-bc-mid-grey px-4 py-6 text-sm text-bc-dark-grey">
      {label}
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

const RUN_SERIES_COLORS = [
  "#003A8C",
  "#E30613",
  "#047857",
  "#B45309",
  "#6D28D9",
  "#0F766E",
  "#BE123C",
  "#4338CA",
];

function createExecutionChartModel(runs: RunAnalysisSummary[]) {
  const left = 48;
  const right = 700;
  const top = 14;
  const bottom = 180;
  const maxTrickOrder = Math.max(
    0,
    ...runs.flatMap((run) =>
      run.executionPoints.map((point) => point.trickOrder),
    ),
  );
  const orderTickStep = Math.max(1, Math.ceil(maxTrickOrder / 8));
  const getX = (trickOrder: number) =>
    maxTrickOrder <= 1
      ? left
      : left + ((right - left) * (trickOrder - 1)) / (maxTrickOrder - 1);
  const getY = (executionRating: number) =>
    bottom - ((bottom - top) * executionRating) / 10;
  const orderTicks = Array.from(
    { length: Math.floor((maxTrickOrder - 1) / orderTickStep) + 1 },
    (_, index) => 1 + index * orderTickStep,
  );

  if (orderTicks.at(-1) !== maxTrickOrder) {
    orderTicks.push(maxTrickOrder);
  }

  return {
    bottom,
    getX,
    getY,
    left,
    maxTrickOrder,
    orderTicks,
    right,
    top,
  };
}

function getRunSeriesColor(index: number) {
  return RUN_SERIES_COLORS[index % RUN_SERIES_COLORS.length];
}

function getExecutionTooltipPosition(
  chart: ReturnType<typeof createExecutionChartModel>,
  pointX: number,
  pointY: number,
) {
  const width = 250;
  const height = 58;
  const x = Math.min(pointX + 12, chart.right - width);
  const y = Math.max(chart.top, pointY - height - 10);

  return {
    x,
    y,
  };
}

function formatRunLabel(run: RunAnalysisSummary) {
  return `${run.competitionName}, ${run.round} Run ${run.runNumber}`;
}

function formatCompactRunLabel(run: RunAnalysisSummary) {
  return `${run.round.replace("Qualification", "Qual")} R${run.runNumber}`;
}

function groupRunsByCompetition(runs: RunAnalysisSummary[]) {
  const groups = new Map<
    string,
    {
      competitionDate: string;
      competitionName: string;
      runs: RunAnalysisSummary[];
    }
  >();

  for (const run of runs) {
    const key = `${run.competitionDate}:${run.competitionName}`;
    const group = groups.get(key) ?? {
      competitionDate: run.competitionDate,
      competitionName: run.competitionName,
      runs: [],
    };

    group.runs.push(run);
    groups.set(key, group);
  }

  return Array.from(groups.values()).sort(
    (left, right) =>
      left.competitionDate.localeCompare(right.competitionDate) ||
      left.competitionName.localeCompare(right.competitionName),
  );
}

function averageNullableNumber(values: Array<number | null>) {
  const availableValues = values.filter((value): value is number => value !== null);

  if (availableValues.length === 0) {
    return null;
  }

  return Number(
    (
      availableValues.reduce((total, value) => total + value, 0) /
      availableValues.length
    ).toFixed(1),
  );
}

function formatNullableNumber(value: number | null | undefined) {
  return value === null || value === undefined ? "-" : value;
}
