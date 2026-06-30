"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { compareCompetitionStages } from "@/src/data/competitionFlow";
import { getPreviewRunsForCompetitionAthlete } from "@/src/data/practiceCompetitionData";
import { getAthleteById } from "@/src/data/seedData";
import type { AthleteDraft, PlannedRunDraft } from "@/src/types/athlete-drafts";
import type {
  ActiveRunDraft,
  CompleteRunDraftInput,
  StartRunDraftInput,
  StoredRunDraft,
  UpdateActiveRunTrickInput,
} from "@/src/types/run-drafts";
import type { RagRating } from "@/src/types/seed-data";

type AthleteDraftState = Record<string, AthleteDraft>;
type ActiveRunDraftState = Record<string, ActiveRunDraft>;
type StoredRunDraftState = Record<string, StoredRunDraft>;

type AthleteDraftContextValue = {
  completeRunCapture: (runId: string, input: CompleteRunDraftInput) => void;
  createPlannedRun: (athleteId: string, plannedRun: PlannedRunDraft) => void;
  discardRunCapture: (runId: string) => void;
  getActiveRunDraft: (runId: string) => ActiveRunDraft | undefined;
  getAthleteDraft: (athleteId: string) => AthleteDraft | undefined;
  getCompetitionAthleteRuns: (
    competitionId: string,
    athleteId: string,
  ) => StoredRunDraft[];
  saveAthleteName: (athleteId: string, name: string) => void;
  startRunCapture: (input: StartRunDraftInput) => string;
  updatePlannedRun: (
    athleteId: string,
    plannedRunId: string,
    plannedRun: PlannedRunDraft,
  ) => void;
  updateRunCaptureTrick: (
    runId: string,
    trickOrder: number,
    input: UpdateActiveRunTrickInput,
  ) => void;
};

const AthleteDraftContext = createContext<AthleteDraftContextValue | undefined>(
  undefined,
);

export type AthleteDraftProviderProps = {
  children: ReactNode;
};

export function AthleteDraftProvider({
  children,
}: AthleteDraftProviderProps) {
  const [athleteDrafts, setAthleteDrafts] = useState<AthleteDraftState>({});
  const [activeRunDrafts, setActiveRunDrafts] = useState<ActiveRunDraftState>({});
  const [storedRunDrafts, setStoredRunDrafts] = useState<StoredRunDraftState>({});

  const getAthleteDraft = useCallback(
    (athleteId: string) =>
      athleteDrafts[athleteId] ?? createSeedAthleteDraft(athleteId),
    [athleteDrafts],
  );

  const getActiveRunDraft = useCallback(
    (runId: string) => activeRunDrafts[runId],
    [activeRunDrafts],
  );

  const getCompetitionAthleteRuns = useCallback(
    (competitionId: string, athleteId: string) =>
      [
        ...getPreviewRunsForCompetitionAthlete(competitionId, athleteId),
        ...Object.values(storedRunDrafts).filter(
          (run) =>
            run.competitionId === competitionId && run.athleteId === athleteId,
        ),
      ].sort(
        (left, right) =>
          compareCompetitionStages(left, right) || left.id.localeCompare(right.id),
      ),
    [storedRunDrafts],
  );

  const saveAthleteName = useCallback((athleteId: string, name: string) => {
    setAthleteDrafts((current) => {
      const athleteDraft = current[athleteId] ?? createSeedAthleteDraft(athleteId);

      if (!athleteDraft) {
        return current;
      }

      return {
        ...current,
        [athleteId]: {
          ...athleteDraft,
          name,
        },
      };
    });
  }, []);

  const createPlannedRun = useCallback(
    (athleteId: string, plannedRun: PlannedRunDraft) => {
      setAthleteDrafts((current) => {
        const athleteDraft =
          current[athleteId] ?? createSeedAthleteDraft(athleteId);

        if (!athleteDraft) {
          return current;
        }

        return {
          ...current,
          [athleteId]: {
            ...athleteDraft,
            plannedRuns: [...athleteDraft.plannedRuns, clonePlannedRun(plannedRun)],
          },
        };
      });
    },
    [],
  );

  const updatePlannedRun = useCallback(
    (athleteId: string, plannedRunId: string, plannedRun: PlannedRunDraft) => {
      setAthleteDrafts((current) => {
        const athleteDraft =
          current[athleteId] ?? createSeedAthleteDraft(athleteId);

        if (!athleteDraft) {
          return current;
        }

        const nextPlannedRuns = athleteDraft.plannedRuns.some(
          (item) => item.id === plannedRunId,
        )
          ? athleteDraft.plannedRuns.map((item) =>
              item.id === plannedRunId ? clonePlannedRun(plannedRun) : item,
            )
          : [...athleteDraft.plannedRuns, clonePlannedRun(plannedRun)];

        return {
          ...current,
          [athleteId]: {
            ...athleteDraft,
            plannedRuns: nextPlannedRuns,
          },
        };
      });
    },
    [],
  );

  const startRunCapture = useCallback((input: StartRunDraftInput) => {
    const runId = `run-capture-${crypto.randomUUID()}`;
    const nextRunDraft: ActiveRunDraft = {
      athleteId: input.athleteId,
      competitionId: input.competitionId,
      id: runId,
      plannedRun: clonePlannedRun(input.plannedRun),
      round: input.round,
      runNumber: input.runNumber,
      tricks: createInitialActiveRunTricks(input.plannedRun, runId),
    };

    setActiveRunDrafts((current) => ({
      ...current,
      [runId]: nextRunDraft,
    }));

    return runId;
  }, []);

  const updateRunCaptureTrick = useCallback(
    (runId: string, trickOrder: number, input: UpdateActiveRunTrickInput) => {
      setActiveRunDrafts((current) => {
        const runDraft = current[runId];

        if (!runDraft) {
          return current;
        }

        return {
          ...current,
          [runId]: {
            ...runDraft,
            tricks: runDraft.tricks.map((trick) =>
              trick.order === trickOrder
                ? {
                    ...trick,
                    ...input,
                  }
                : trick,
            ),
          },
        };
      });
    },
    [],
  );

  const discardRunCapture = useCallback((runId: string) => {
    setActiveRunDrafts((current) => {
      if (!current[runId]) {
        return current;
      }

      const nextDrafts = { ...current };
      delete nextDrafts[runId];
      return nextDrafts;
    });
  }, []);

  const completeRunCapture = useCallback(
    (runId: string, input: CompleteRunDraftInput) => {
      setActiveRunDrafts((currentActiveRunDrafts) => {
        const runDraft = currentActiveRunDrafts[runId];

        if (!runDraft) {
          return currentActiveRunDrafts;
        }

        const completedTricks = runDraft.tricks.slice(0, input.completedTrickCount);

        setStoredRunDrafts((currentStoredRunDrafts) => ({
          ...currentStoredRunDrafts,
          [runId]: {
            athleteId: runDraft.athleteId,
            coachNotes: input.coachNotes,
            competitionId: runDraft.competitionId,
            completionPercentage: Math.round(
              (completedTricks.length / runDraft.tricks.length) * 100,
            ),
            id: runDraft.id,
            overallPositionAfterRound: input.overallPositionAfterRound,
            round: runDraft.round,
            runNumber: runDraft.runNumber,
            score: input.score,
            tricks: completedTricks.map((trick) => ({
              executionRating: trick.landed ? trick.executionRating ?? 0 : 0,
              failReason: trick.landed ? undefined : trick.failReason,
              id: trick.id,
              landed: trick.landed ?? false,
              order: trick.order,
              plannedTrickId: trick.plannedTrickId,
              plannedTrickName: trick.plannedTrickName,
              ragRating: deriveRagRating(trick.executionRating, trick.landed),
              trickName: trick.trickName,
            })),
          },
        }));

        const nextActiveRunDrafts = { ...currentActiveRunDrafts };
        delete nextActiveRunDrafts[runId];
        return nextActiveRunDrafts;
      });
    },
    [],
  );

  const value = useMemo(
    () => ({
      completeRunCapture,
      createPlannedRun,
      discardRunCapture,
      getActiveRunDraft,
      getAthleteDraft,
      getCompetitionAthleteRuns,
      saveAthleteName,
      startRunCapture,
      updatePlannedRun,
      updateRunCaptureTrick,
    }),
    [
      completeRunCapture,
      createPlannedRun,
      discardRunCapture,
      getActiveRunDraft,
      getAthleteDraft,
      getCompetitionAthleteRuns,
      saveAthleteName,
      startRunCapture,
      updatePlannedRun,
      updateRunCaptureTrick,
    ],
  );

  return (
    <AthleteDraftContext.Provider value={value}>
      {children}
    </AthleteDraftContext.Provider>
  );
}

export function useAthleteDrafts() {
  const context = useContext(AthleteDraftContext);

  if (!context) {
    throw new Error("useAthleteDrafts must be used within AthleteDraftProvider");
  }

  return context;
}

function createSeedAthleteDraft(athleteId: string): AthleteDraft | undefined {
  const athlete = getAthleteById(athleteId);

  if (!athlete) {
    return undefined;
  }

  return {
    id: athlete.id,
    name: athlete.name,
    plannedRuns: athlete.plannedRuns.map((plannedRun) => clonePlannedRun(plannedRun)),
  };
}

function clonePlannedRun(plannedRun: PlannedRunDraft): PlannedRunDraft {
  return {
    ...plannedRun,
    tricks: [...plannedRun.tricks]
      .sort((left, right) => left.order - right.order || left.id.localeCompare(right.id))
      .map((trick) => ({ ...trick })),
  };
}

function createInitialActiveRunTricks(plannedRun: PlannedRunDraft, runId: string) {
  return Array.from({ length: 25 }, (_, index) => {
    const trick = [...plannedRun.tricks].sort(
      (left, right) => left.order - right.order || left.id.localeCompare(right.id),
    )[index];

    return {
      id: `${runId}-trick-${index + 1}`,
      order: index + 1,
      plannedTrickId: trick?.id,
      plannedTrickName: trick?.name,
      trickName: trick?.name ?? `Trick ${index + 1}`,
    };
  });
}

function deriveRagRating(executionRating?: number, landed?: boolean): RagRating {
  if (!landed) {
    return "Red";
  }

  if ((executionRating ?? 0) >= 7) {
    return "Green";
  }

  if ((executionRating ?? 0) >= 4) {
    return "Amber";
  }

  return "Red";
}
