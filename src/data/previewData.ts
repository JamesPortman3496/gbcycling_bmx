import type { AppData } from "@/src/types/app-data";

// This is temporary preview data derived from the supplied CSV. It will be replaced by generated AppData JSON in the data import stage.
export const previewAppData: AppData = {
  athletes: [
    { id: "athlete-luca-mercer", name: "Luca Mercer" },
    { id: "athlete-tia-rowan", name: "Tia Rowan" },
    { id: "athlete-noah-quinn", name: "Noah Quinn" },
    { id: "athlete-mason-hart", name: "Mason Hart" },
    { id: "athlete-eli-bennett", name: "Eli Bennett" },
  ],
  competitions: [
    {
      id: "competition-montpellier-world-cup",
      date: "12/05/2026",
      name: "Montpellier World Cup",
    },
    {
      id: "competition-shanghai-world-cup",
      date: "18/09/2026",
      name: "Shanghai World Cup",
    },
    {
      id: "competition-european-championships",
      date: "24/10/2026",
      name: "European Championships",
    },
  ],
  competitionAthletes: [
    {
      id: "competition-athlete-montpellier-luca-mercer",
      athleteId: "athlete-luca-mercer",
      competitionId: "competition-montpellier-world-cup",
    },
    {
      id: "competition-athlete-montpellier-tia-rowan",
      athleteId: "athlete-tia-rowan",
      competitionId: "competition-montpellier-world-cup",
    },
    {
      id: "competition-athlete-montpellier-noah-quinn",
      athleteId: "athlete-noah-quinn",
      competitionId: "competition-montpellier-world-cup",
    },
    {
      id: "competition-athlete-montpellier-mason-hart",
      athleteId: "athlete-mason-hart",
      competitionId: "competition-montpellier-world-cup",
    },
    {
      id: "competition-athlete-montpellier-eli-bennett",
      athleteId: "athlete-eli-bennett",
      competitionId: "competition-montpellier-world-cup",
    },
    {
      id: "competition-athlete-shanghai-luca-mercer",
      athleteId: "athlete-luca-mercer",
      competitionId: "competition-shanghai-world-cup",
    },
    {
      id: "competition-athlete-shanghai-tia-rowan",
      athleteId: "athlete-tia-rowan",
      competitionId: "competition-shanghai-world-cup",
    },
    {
      id: "competition-athlete-shanghai-noah-quinn",
      athleteId: "athlete-noah-quinn",
      competitionId: "competition-shanghai-world-cup",
    },
    {
      id: "competition-athlete-shanghai-mason-hart",
      athleteId: "athlete-mason-hart",
      competitionId: "competition-shanghai-world-cup",
    },
    {
      id: "competition-athlete-shanghai-eli-bennett",
      athleteId: "athlete-eli-bennett",
      competitionId: "competition-shanghai-world-cup",
    },
    {
      id: "competition-athlete-european-luca-mercer",
      athleteId: "athlete-luca-mercer",
      competitionId: "competition-european-championships",
    },
    {
      id: "competition-athlete-european-tia-rowan",
      athleteId: "athlete-tia-rowan",
      competitionId: "competition-european-championships",
    },
    {
      id: "competition-athlete-european-noah-quinn",
      athleteId: "athlete-noah-quinn",
      competitionId: "competition-european-championships",
    },
    {
      id: "competition-athlete-european-mason-hart",
      athleteId: "athlete-mason-hart",
      competitionId: "competition-european-championships",
    },
    {
      id: "competition-athlete-european-eli-bennett",
      athleteId: "athlete-eli-bennett",
      competitionId: "competition-european-championships",
    },
  ],
  plannedRuns: [],
  runs: [],
  trickAttempts: [],
};

export const previewCompetitions = [
  {
    id: "competition-montpellier-world-cup",
    athleteCount: 5,
    date: "12/05/2026",
    name: "Montpellier World Cup",
    roundNames: ["Qualification", "Semi-Final", "Final"],
    runCount: 30,
    runNumbers: [1, 2],
    trickAttemptCount: 750,
  },
  {
    id: "competition-shanghai-world-cup",
    athleteCount: 5,
    date: "18/09/2026",
    name: "Shanghai World Cup",
    roundNames: ["Qualification", "Semi-Final", "Final"],
    runCount: 30,
    runNumbers: [1, 2],
    trickAttemptCount: 750,
  },
  {
    id: "competition-european-championships",
    athleteCount: 5,
    date: "24/10/2026",
    name: "European Championships",
    roundNames: ["Qualification", "Semi-Final", "Final"],
    runCount: 30,
    runNumbers: [1, 2],
    trickAttemptCount: 750,
  },
];

export const previewAthletes = [
  {
    id: "athlete-luca-mercer",
    attemptCount: 450,
    landedCount: 420,
    landedRate: 93,
    name: "Luca Mercer",
    runCount: 18,
  },
  {
    id: "athlete-tia-rowan",
    attemptCount: 450,
    landedCount: 385,
    landedRate: 86,
    name: "Tia Rowan",
    runCount: 18,
  },
  {
    id: "athlete-noah-quinn",
    attemptCount: 450,
    landedCount: 393,
    landedRate: 87,
    name: "Noah Quinn",
    runCount: 18,
  },
  {
    id: "athlete-mason-hart",
    attemptCount: 450,
    landedCount: 381,
    landedRate: 85,
    name: "Mason Hart",
    runCount: 18,
  },
  {
    id: "athlete-eli-bennett",
    attemptCount: 450,
    landedCount: 408,
    landedRate: 91,
    name: "Eli Bennett",
    runCount: 18,
  },
];

export const previewTricks = [
  { name: "Truck Driver", attemptCount: 90 },
  { name: "Barspin Transfer", attemptCount: 90 },
  { name: "Turn Down", attemptCount: 90 },
  { name: "Invert", attemptCount: 90 },
  { name: "No Hander", attemptCount: 90 },
];

export const previewFailReasons = [
  { reason: "Run ended after crash", count: 119 },
  { reason: "Cased landing", count: 26 },
  { reason: "Could not reset after previous trick", count: 16 },
  { reason: "Heavy landing reduced speed", count: 13 },
  { reason: "Speed loss after previous trick", count: 12 },
];

export const previewTotals = {
  athletes: 5,
  competitions: 3,
  competitionAthletes: 15,
  runs: 90,
  trickAttempts: 2250,
};

export function getPreviewCompetition(competitionId: string) {
  return previewCompetitions.find((competition) => competition.id === competitionId);
}

export function getPreviewAthlete(athleteId: string) {
  return previewAthletes.find((athlete) => athlete.id === athleteId);
}

export function getPreviewCompetitionAthletes(competitionId: string) {
  const athleteIds = previewAppData.competitionAthletes
    .filter((entry) => entry.competitionId === competitionId)
    .map((entry) => entry.athleteId);

  return previewAthletes.filter((athlete) => athleteIds.includes(athlete.id));
}
