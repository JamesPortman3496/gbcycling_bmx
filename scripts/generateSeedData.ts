import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { parse } from "csv-parse/sync";

import type {
  PlannedTrickSeed as PlannedTrick,
  PlannedRunSeed as PlannedRun,
  AthleteSeed as Athlete,
  CompetitionSeed as Competition,
  RagRating,
  RunSeed as Run,
  SeedData,
} from "../src/types/seed-data";

const REQUIRED_COLUMNS = [
  "competition",
  "date",
  "athlete",
  "round",
  "run",
  "trick_order",
  "trick_name",
  "planned_trick",
  "landed",
  "coach_execution_rating",
  "rag_rating",
  "fail_reason",
  "prev_trick_quality",
  "run_completion_pct",
  "run_score",
  "coach_notes",
  "overall_position_after_round",
] as const;

const RAW_CSV_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "raw",
  "interview_task_bmx_freestyle_dummy_data.csv",
);

const OUTPUT_JSON_PATH = path.join(
  process.cwd(),
  "src",
  "data",
  "generated",
  "fullDatasetAnalysis.json",
);

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
type RawCsvRow = Record<RequiredColumn, string>;

type NormalizedRow = {
  athlete: string;
  coachExecutionRating: number;
  coachNotes: string | null;
  competition: string;
  date: string;
  failReason: string | null;
  landed: boolean;
  overallPositionAfterRound: number | null;
  plannedTrick: string | null;
  prevTrickQuality: string | null;
  ragRating: RagRating;
  round: string;
  run: number;
  runCompletionPct: number | null;
  runScore: number | null;
  trickName: string;
  trickOrder: number;
};

type PlannedRunSeed = {
  athlete: string;
  runKey: string;
};

type CompetitionBuilder = Omit<Competition, "assignedAthleteIds"> & {
  assignedAthleteIds: Set<string>;
};

const ROUND_RANKS: Record<string, number> = {
  Qualification: 0,
  "Semi-Final": 1,
  Final: 2,
};

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createId(prefix: string, ...parts: Array<string | number>): string {
  return [prefix, ...parts.map((part) => slugify(String(part)))]
    .filter(Boolean)
    .join("-");
}

function toNullableString(value: string | undefined): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

function parseNumberField(
  value: string,
  fieldName: RequiredColumn,
  rowNumber: number,
): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Row ${rowNumber}: "${fieldName}" must be a number. Received "${value}".`,
    );
  }

  return parsed;
}

function parseOptionalNumberField(
  value: string,
  fieldName: RequiredColumn,
  rowNumber: number,
): number | null {
  const normalized = toNullableString(value);

  if (normalized === null) {
    return null;
  }

  return parseNumberField(normalized, fieldName, rowNumber);
}

function parseLanded(value: string, rowNumber: number): boolean {
  const normalized = value.trim().toLowerCase();

  if (normalized === "yes") {
    return true;
  }

  if (normalized === "no") {
    return false;
  }

  throw new Error(
    `Row ${rowNumber}: "landed" must be Yes or No. Received "${value}".`,
  );
}

function deriveRagRating(landed: boolean, executionRating: number): RagRating {
  if (!landed || executionRating === 0) {
    return "Red";
  }

  if (executionRating >= 7) {
    return "Green";
  }

  return "Amber";
}

function parseRagRating(value: string, rowNumber: number): RagRating | null {
  const normalized = toNullableString(value);

  if (normalized === null) {
    return null;
  }

  if (normalized === "Green" || normalized === "Amber" || normalized === "Red") {
    return normalized;
  }

  throw new Error(
    `Row ${rowNumber}: "rag_rating" must be Green, Amber, or Red. Received "${value}".`,
  );
}

function assertRequiredColumns(
  rows: Record<string, string>[],
): asserts rows is RawCsvRow[] {
  const headers = new Set(Object.keys(rows[0] ?? {}));
  const missing = REQUIRED_COLUMNS.filter((column) => !headers.has(column));

  if (missing.length > 0) {
    throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
  }
}

function getRunKey(row: Pick<NormalizedRow, "competition" | "athlete" | "round" | "run">) {
  return `${row.competition}::${row.athlete}::${row.round}::${row.run}`;
}

function getRoundRank(round: string): number {
  return ROUND_RANKS[round] ?? Number.MAX_SAFE_INTEGER;
}

function sortRuns(
  left: Pick<Run, "competitionId" | "athleteId" | "round" | "runNumber" | "id">,
  right: Pick<Run, "competitionId" | "athleteId" | "round" | "runNumber" | "id">,
  competitionDateById: Map<string, string>,
  athleteNameById: Map<string, string>,
) {
  return (
    (competitionDateById.get(left.competitionId) ?? "").localeCompare(
      competitionDateById.get(right.competitionId) ?? "",
    ) ||
    (athleteNameById.get(left.athleteId) ?? left.athleteId).localeCompare(
      athleteNameById.get(right.athleteId) ?? right.athleteId,
    ) ||
    getRoundRank(left.round) - getRoundRank(right.round) ||
    left.runNumber - right.runNumber ||
    left.id.localeCompare(right.id)
  );
}

function normalizeRow(row: RawCsvRow, rowNumber: number): NormalizedRow {
  const landed = parseLanded(row.landed, rowNumber);
  const coachExecutionRating = parseNumberField(
    row.coach_execution_rating,
    "coach_execution_rating",
    rowNumber,
  );
  const derivedRagRating = deriveRagRating(landed, coachExecutionRating);
  const rawRagRating = parseRagRating(row.rag_rating, rowNumber);

  if (rawRagRating !== null && rawRagRating !== derivedRagRating) {
    throw new Error(
      `Row ${rowNumber}: raw rag_rating "${rawRagRating}" does not match derived value "${derivedRagRating}".`,
    );
  }

  return {
    athlete: row.athlete.trim(),
    coachExecutionRating,
    coachNotes: toNullableString(row.coach_notes),
    competition: row.competition.trim(),
    date: row.date.trim(),
    failReason: toNullableString(row.fail_reason),
    landed,
    overallPositionAfterRound: parseOptionalNumberField(
      row.overall_position_after_round,
      "overall_position_after_round",
      rowNumber,
    ),
    plannedTrick: toNullableString(row.planned_trick),
    prevTrickQuality: toNullableString(row.prev_trick_quality),
    ragRating: derivedRagRating,
    round: row.round.trim(),
    run: parseNumberField(row.run, "run", rowNumber),
    runCompletionPct: parseOptionalNumberField(
      row.run_completion_pct,
      "run_completion_pct",
      rowNumber,
    ),
    runScore: parseOptionalNumberField(row.run_score, "run_score", rowNumber),
    trickName: row.trick_name.trim(),
    trickOrder: parseNumberField(row.trick_order, "trick_order", rowNumber),
  };
}

function buildPlannedRuns(
  normalizedRows: NormalizedRow[],
): Map<string, PlannedRun> {
  const firstRunByAthlete = new Map<string, PlannedRunSeed>();

  for (const row of normalizedRows) {
    if (!firstRunByAthlete.has(row.athlete)) {
      firstRunByAthlete.set(row.athlete, {
        athlete: row.athlete,
        runKey: getRunKey(row),
      });
    }
  }

  return new Map(
    Array.from(firstRunByAthlete.values())
      .sort((left, right) => left.athlete.localeCompare(right.athlete))
      .map((seed) => {
        const tricks: PlannedTrick[] = normalizedRows
          .filter((row) => getRunKey(row) === seed.runKey)
          .sort((left, right) => left.trickOrder - right.trickOrder)
          .map((row) => ({
            id: createId("planned-trick", seed.athlete, row.trickOrder),
            name: row.plannedTrick ?? row.trickName,
            order: row.trickOrder,
          }));

        return [
          createId("athlete", seed.athlete),
          {
            id: createId("planned-run", seed.athlete, "default"),
            name: "Default imported planned run",
            tricks,
          },
        ] as const;
      }),
  );
}

async function generateSeedData() {
  const csvContent = await readFile(RAW_CSV_PATH, "utf8");
  const parsedRows = parse(csvContent, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  if (parsedRows.length === 0) {
    throw new Error("CSV did not contain any data rows.");
  }

  assertRequiredColumns(parsedRows);

  const normalizedRows = parsedRows.map((row, index) => normalizeRow(row, index + 2));

  const plannedRunsByAthleteId = buildPlannedRuns(normalizedRows);
  const athleteNameById = new Map<string, string>();
  const competitionDateById = new Map<string, string>();
  const athletes = new Map<string, Athlete>();
  const competitions = new Map<string, CompetitionBuilder>();

  for (const row of normalizedRows) {
    const athleteId = createId("athlete", row.athlete);
    const competitionId = createId("competition", row.competition);
    const plannedRun = plannedRunsByAthleteId.get(athleteId);

    athletes.set(athleteId, {
      id: athleteId,
      name: row.athlete,
      plannedRuns: plannedRun ? [plannedRun] : [],
      runIds: [],
    });
    athleteNameById.set(athleteId, row.athlete);

    const competition = competitions.get(competitionId);

    if (competition) {
      competition.assignedAthleteIds.add(athleteId);
    } else {
      competitions.set(competitionId, {
        assignedAthleteIds: new Set([athleteId]),
        date: row.date,
        id: competitionId,
        name: row.competition,
      });
    }

    competitionDateById.set(competitionId, row.date);
  }

  const runsById = new Map<string, Run>();

  for (const row of normalizedRows) {
    const athleteId = createId("athlete", row.athlete);
    const competitionId = createId("competition", row.competition);
    const runId = createId(
      "run",
      row.competition,
      row.athlete,
      row.round,
      row.run,
    );
    const trickAttemptId = createId(
      "trick-attempt",
      row.competition,
      row.athlete,
      row.round,
      row.run,
      row.trickOrder,
    );

    const plannedRun = plannedRunsByAthleteId.get(athleteId);
    const plannedTrick = plannedRun?.tricks.find(
      (candidate) => candidate.order === row.trickOrder,
    );

    if (!runsById.has(runId)) {
      runsById.set(runId, {
        athleteId,
        coachNotes: row.coachNotes ?? undefined,
        competitionId,
        completionPercentage: row.runCompletionPct ?? undefined,
        id: runId,
        overallPositionAfterRound: row.overallPositionAfterRound ?? undefined,
        round: row.round,
        runNumber: row.run,
        score: row.runScore ?? undefined,
        tricks: [],
      });

      const athlete = athletes.get(athleteId);

      if (!athlete) {
        throw new Error(`Missing athlete for run "${runId}".`);
      }

      if (!athlete.runIds.includes(runId)) {
        athlete.runIds.push(runId);
      }
    }

    const run = runsById.get(runId);

    if (!run) {
      throw new Error(`Missing run for trick attempt "${trickAttemptId}".`);
    }

    run.tricks.push({
      executionRating: row.coachExecutionRating,
      failReason: row.failReason ?? undefined,
      id: trickAttemptId,
      landed: row.landed,
      order: row.trickOrder,
      plannedTrickId:
        plannedTrick?.name === (row.plannedTrick ?? row.trickName)
          ? plannedTrick.id
          : undefined,
      plannedTrickName: row.plannedTrick ?? undefined,
      previousTrickQuality: row.prevTrickQuality ?? undefined,
      ragRating: row.ragRating,
      trickName: row.trickName,
    });
  }

  const sortedRuns = Array.from(runsById.values()).sort((left, right) =>
    sortRuns(left, right, competitionDateById, athleteNameById),
  );

  for (const athlete of athletes.values()) {
    athlete.runIds.sort((left, right) => {
      const leftRun = runsById.get(left);
      const rightRun = runsById.get(right);

      if (!leftRun || !rightRun) {
        return left.localeCompare(right);
      }

      return sortRuns(leftRun, rightRun, competitionDateById, athleteNameById);
    });
  }

  const appData: SeedData = {
    athletes: Array.from(athletes.values()).sort((left, right) =>
      left.name.localeCompare(right.name),
    ),
    competitions: Array.from(competitions.values())
      .sort(
        (left, right) =>
          left.date.localeCompare(right.date) || left.name.localeCompare(right.name),
      )
      .map((competition) => ({
        date: competition.date,
        id: competition.id,
        name: competition.name,
        assignedAthleteIds: Array.from(competition.assignedAthleteIds).sort(
          (left, right) =>
            (athleteNameById.get(left) ?? left).localeCompare(
              athleteNameById.get(right) ?? right,
            ),
        ),
      })),
    runsById: Object.fromEntries(
      sortedRuns.map((run) => [
        run.id,
        {
          ...run,
          tricks: [...run.tricks].sort((left, right) => left.order - right.order),
        },
      ]),
    ),
  };

  await mkdir(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
  await writeFile(OUTPUT_JSON_PATH, `${JSON.stringify(appData, null, 2)}\n`, "utf8");

  console.log(
    [
      `Generated ${OUTPUT_JSON_PATH}`,
      `athletes=${appData.athletes.length}`,
      `competitions=${appData.competitions.length}`,
      `runs=${Object.keys(appData.runsById).length}`,
      `trickAttempts=${Object.values(appData.runsById).reduce(
        (count, run) => count + run.tricks.length,
        0,
      )}`,
    ].join("\n"),
  );
}

generateSeedData().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(message);
  process.exitCode = 1;
});
