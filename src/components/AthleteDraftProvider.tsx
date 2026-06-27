"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getAthleteById } from "@/src/data/seedData";
import type { AthleteDraft, PlannedRunDraft } from "@/src/types/athlete-drafts";

type AthleteDraftState = Record<string, AthleteDraft>;

type AthleteDraftContextValue = {
  createPlannedRun: (athleteId: string, plannedRun: PlannedRunDraft) => void;
  getAthleteDraft: (athleteId: string) => AthleteDraft | undefined;
  saveAthleteName: (athleteId: string, name: string) => void;
  updatePlannedRun: (
    athleteId: string,
    plannedRunId: string,
    plannedRun: PlannedRunDraft,
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

  const getAthleteDraft = useCallback(
    (athleteId: string) =>
      athleteDrafts[athleteId] ?? createSeedAthleteDraft(athleteId),
    [athleteDrafts],
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

  const value = useMemo(
    () => ({
      createPlannedRun,
      getAthleteDraft,
      saveAthleteName,
      updatePlannedRun,
    }),
    [createPlannedRun, getAthleteDraft, saveAthleteName, updatePlannedRun],
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
