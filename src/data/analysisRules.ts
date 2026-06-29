import type { RagBreakdown, TrickRecommendationLabel } from "@/src/types/domain";

export function deriveRecommendationLabel(input: {
  addedValue: number;
  averageExecution: number;
  landedRate: number;
  ragBreakdown: RagBreakdown;
}): TrickRecommendationLabel {
  const totalRagAttempts =
    input.ragBreakdown.Green + input.ragBreakdown.Amber + input.ragBreakdown.Red;
  const redRate =
    totalRagAttempts === 0 ? 0 : input.ragBreakdown.Red / totalRagAttempts;

  if (
    input.addedValue >= 8 &&
    input.landedRate >= 72 &&
    input.averageExecution >= 6.8 &&
    redRate <= 0.18
  ) {
    return "Reliable scorer";
  }

  if (
    input.addedValue >= 8 &&
    (input.landedRate < 65 || input.averageExecution < 6 || redRate >= 0.28)
  ) {
    return "Development priority";
  }

  if (input.addedValue >= 8) {
    return "High upside, high risk";
  }

  if (input.addedValue <= 4 && (input.landedRate < 65 || input.averageExecution < 6)) {
    return "Low return";
  }

  return "Stable support";
}
