"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ActionLink } from "@/src/components/ActionLink";
import { Button } from "@/src/components/Button";
import { Card } from "@/src/components/Card";
import { PageHeader } from "@/src/components/PageHeader";
import { TextInput } from "@/src/components/TextInput";
import { cn } from "@/src/components/utils";
import { useAthleteDrafts } from "@/src/components/AthleteDraftProvider";
import type { PlannedRunDraft, PlannedTrickDraft } from "@/src/types/athlete-drafts";

const MAX_TRICKS = 25;

type EditableTrickRow = {
  id: string;
  name: string;
};

export type PlannedRunEditorViewProps = {
  athleteId: string;
  initialAthleteName: string;
  initialPlannedRun?: PlannedRunDraft;
  mode: "edit" | "new";
  plannedRunId?: string;
};

export function PlannedRunEditorView({
  athleteId,
  initialAthleteName,
  initialPlannedRun,
  mode,
  plannedRunId,
}: PlannedRunEditorViewProps) {
  const { getAthleteDraft } = useAthleteDrafts();
  const athlete = getAthleteDraft(athleteId);
  const athleteName = athlete?.name ?? initialAthleteName;
  const draftPlannedRun =
    mode === "edit"
      ? athlete?.plannedRuns.find((plannedRun) => plannedRun.id === plannedRunId) ??
        initialPlannedRun
      : undefined;
  const draftPlannedRunStateKey = draftPlannedRun
    ? `${draftPlannedRun.id}:${draftPlannedRun.name}:${draftPlannedRun.tricks
        .map((trick) => `${trick.id}:${trick.order}:${trick.name}`)
        .join("|")}`
    : mode;

  if (mode === "edit" && !draftPlannedRun) {
    return (
      <div className="space-y-4">
        <PageHeader
          backHref={`/athletes/${athleteId}/edit`}
          breadcrumbs={[
            { href: "/athletes", label: "Athletes" },
            { href: `/athletes/${athleteId}`, label: athleteName },
            { href: `/athletes/${athleteId}/edit`, label: "Edit athlete" },
            { label: "Edit planned run" },
          ]}
          description="The selected planned run is no longer available in this prototype session."
          title="Edit planned run"
        />

        <Card className="rounded-lg p-4 sm:p-5">
          <p className="text-sm text-bc-dark-grey">
            This planned run could not be found. Refreshing the browser resets
            prototype-only drafts back to the seed data.
          </p>
          <ActionLink
            className="mt-4"
            href={`/athletes/${athleteId}/edit`}
            variant="secondary"
          >
            Back to athlete
          </ActionLink>
        </Card>
      </div>
    );
  }

  return (
    <PlannedRunEditorForm
      athleteId={athleteId}
      athleteName={athleteName}
      initialPlannedRun={draftPlannedRun}
      key={draftPlannedRunStateKey}
      mode={mode}
      plannedRunId={plannedRunId}
    />
  );
}

type PlannedRunEditorFormProps = {
  athleteId: string;
  athleteName: string;
  initialPlannedRun?: PlannedRunDraft;
  mode: "edit" | "new";
  plannedRunId?: string;
};

function PlannedRunEditorForm({
  athleteId,
  athleteName,
  initialPlannedRun,
  mode,
  plannedRunId,
}: PlannedRunEditorFormProps) {
  const router = useRouter();
  const { createPlannedRun, updatePlannedRun } = useAthleteDrafts();
  const [runName, setRunName] = useState(initialPlannedRun?.name ?? "");
  const [trickRows, setTrickRows] = useState<EditableTrickRow[]>(() =>
    createInitialTrickRows(initialPlannedRun?.tricks),
  );
  const populatedRows = useMemo(
    () => trickRows.filter((row) => hasTrickName(row.name)),
    [trickRows],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 120,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleTrickNameChange(rowId: string, value: string) {
    setTrickRows((current) =>
      normalizeTrickRows(
        current.map((row) => (row.id === rowId ? { ...row, name: value } : row)),
      ),
    );
  }

  function handleDeleteTrick(rowId: string) {
    setTrickRows((current) =>
      normalizeTrickRows(current.filter((row) => row.id !== rowId)),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = populatedRows.findIndex((row) => row.id === active.id);
    const newIndex = populatedRows.findIndex((row) => row.id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    setTrickRows(normalizeTrickRows(arrayMove(populatedRows, oldIndex, newIndex)));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextRunId = plannedRunId ?? `planned-run-${crypto.randomUUID()}`;
    const nextRun: PlannedRunDraft = {
      id: nextRunId,
      name: runName.trim() || "Untitled planned run",
      tricks: populatedRows.map((row, index) => ({
        id: row.id,
        name: row.name.trim(),
        order: index + 1,
      })),
    };

    if (mode === "new") {
      createPlannedRun(athleteId, nextRun);
    } else {
      updatePlannedRun(athleteId, nextRunId, nextRun);
    }

    router.push(`/athletes/${athleteId}/edit`);
  }

  return (
    <div className="space-y-4">
      <PageHeader
        actions={
          <Button form="planned-run-form" type="submit">
            Save planned run
          </Button>
        }
        backHref={`/athletes/${athleteId}/edit`}
        breadcrumbs={[
          { href: "/athletes", label: "Athletes" },
          { href: `/athletes/${athleteId}`, label: athleteName },
          { href: `/athletes/${athleteId}/edit`, label: "Edit athlete" },
          { label: mode === "new" ? "New planned run" : "Edit planned run" },
        ]}
        description="Name the run and order up to 25 tricks."
        title={mode === "new" ? "Add planned run" : "Edit planned run"}
      />

      <Card className="p-4 sm:p-5">
        <form className="space-y-5" id="planned-run-form" onSubmit={handleSubmit}>
          <div className="max-w-md">
            <TextInput
              label="Run name"
              onChange={(event) => setRunName(event.target.value)}
              placeholder="Enter run name"
              value={runName}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-bc-navy">
                  Planned tricks
                </h2>
                <p className="mt-1 text-xs text-bc-dark-grey">
                  Reorder populated rows and add up to {MAX_TRICKS} tricks.
                </p>
              </div>
              <span className="text-xs font-medium text-bc-dark-grey">
                {populatedRows.length}/{MAX_TRICKS}
              </span>
            </div>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <SortableContext
                items={trickRows.map((row) => row.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {trickRows.map((row, index) => (
                    <EditableTrickRowItem
                      deleteTrick={handleDeleteTrick}
                      index={index}
                      key={row.id}
                      onNameChange={handleTrickNameChange}
                      populatedCount={populatedRows.length}
                      row={row}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </form>
      </Card>
    </div>
  );
}

type EditableTrickRowItemProps = {
  deleteTrick: (rowId: string) => void;
  index: number;
  onNameChange: (rowId: string, value: string) => void;
  populatedCount: number;
  row: EditableTrickRow;
};

function EditableTrickRowItem({
  deleteTrick,
  index,
  onNameChange,
  populatedCount,
  row,
}: EditableTrickRowItemProps) {
  const isEmpty = !hasTrickName(row.name);
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    disabled: isEmpty,
    id: row.id,
  });

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-sm px-3 py-3 transition-shadow",
        isEmpty
          ? "border border-dashed border-bc-mid-grey bg-bc-light-grey"
          : "border border-bc-mid-grey bg-bc-white",
        isDragging && "border-bc-royal-blue",
      )}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        aria-label={
          isEmpty
            ? "Add a trick before reordering"
            : `Reorder trick ${index + 1}`
        }
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border text-bc-dark-grey transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2",
          isEmpty
            ? "cursor-default border-bc-mid-grey bg-bc-white"
            : "border-bc-mid-grey bg-bc-light-grey hover:border-bc-royal-blue hover:text-bc-navy",
        )}
        disabled={isEmpty}
        type="button"
        {...(!isEmpty ? attributes : {})}
        {...(!isEmpty ? listeners : {})}
      >
        <GripVertical aria-hidden="true" size={20} strokeWidth={2.2} />
      </button>

      <div className="min-w-0 flex-1">
        <TextInput
          aria-label={isEmpty ? "New trick" : `Trick ${index + 1}`}
          className="h-12 border-0 bg-transparent px-0 focus:ring-0"
          onChange={(event) => onNameChange(row.id, event.target.value)}
          placeholder={isEmpty ? "Add a trick" : `Trick ${index + 1}`}
          value={row.name}
        />
      </div>

      {!isEmpty ? (
        <button
          aria-label={`Delete trick ${index + 1}`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-bc-mid-grey bg-bc-white text-bc-dark-grey transition-colors hover:border-bc-red hover:text-bc-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bc-royal-blue focus-visible:ring-offset-2"
          onClick={() => deleteTrick(row.id)}
          type="button"
        >
          <Trash2 aria-hidden="true" size={18} strokeWidth={2.2} />
        </button>
      ) : populatedCount < MAX_TRICKS ? (
        <div className="h-11 w-11 shrink-0" aria-hidden="true" />
      ) : null}
    </div>
  );
}

function createInitialTrickRows(
  tricks: PlannedTrickDraft[] | undefined,
): EditableTrickRow[] {
  const sortedTricks = [...(tricks ?? [])].sort(
    (left, right) => left.order - right.order || left.id.localeCompare(right.id),
  );

  return normalizeTrickRows(
    sortedTricks.map((trick) => ({
      id: trick.id,
      name: trick.name,
    })),
  );
}

function normalizeTrickRows(rows: EditableTrickRow[]): EditableTrickRow[] {
  const populatedRows = rows
    .filter((row) => hasTrickName(row.name))
    .slice(0, MAX_TRICKS)
    .map((row) => ({
      ...row,
      name: row.name,
    }));

  if (populatedRows.length >= MAX_TRICKS) {
    return populatedRows;
  }

  return [...populatedRows, createEmptyTrickRow()];
}

function createEmptyTrickRow(): EditableTrickRow {
  return {
    id: `planned-trick-${crypto.randomUUID()}`,
    name: "",
  };
}

function hasTrickName(value: string): boolean {
  return value.trim().length > 0;
}
