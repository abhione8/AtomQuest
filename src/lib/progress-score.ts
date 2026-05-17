import { UomType } from '@prisma/client';

export interface ProgressScoreInput {
  uomType: UomType;
  target: number;
  actualValue: number;
  baselineValue?: number | null;
  minTarget?: number | null;
  maxTarget?: number | null;
}

export function calculateProgressScore(input: ProgressScoreInput): number {
  const { uomType, target, actualValue, baselineValue, minTarget, maxTarget } = input;
  if (target === 0 || actualValue === null || actualValue === undefined) {
    return 0;
  }

  switch (uomType) {
    case UomType.NUMERIC_MAX:
      return Math.round((actualValue / target) * 100);

    case UomType.NUMERIC_MIN:
      const minProgress = Math.max(0, (1 - actualValue / target) * 100);
      return Math.round(minProgress);

    case UomType.PERCENT_MAX:
      return Math.round((actualValue / target) * 100);

    case UomType.PERCENT_MIN:
      const percentMinProgress = Math.max(0, (1 - actualValue / target) * 100);
      return Math.round(percentMinProgress);

    case UomType.TIMELINE:
      return actualValue >= target ? 100 : 0;

    case UomType.ZERO_BASED:
      if (baselineValue === null || baselineValue === undefined) {
        return Math.round((actualValue / target) * 100);
      }
      const improvement = actualValue - baselineValue;
      const requiredImprovement = target - baselineValue;
      if (requiredImprovement === 0) {
        return actualValue >= target ? 100 : 0;
      }
      return Math.round((improvement / requiredImprovement) * 100);

    default:
      return 0;
  }
}

export function calculateGoalSheetScore(
  goals: Array<{ target: number; actualValue?: number | null; weightage: number; uomType: UomType; baselineValue?: number | null; minTarget?: number | null; maxTarget?: number | null }>
): number {
  if (goals.length === 0) return 0;

  let totalWeightage = 0;
  let weightedScore = 0;

  for (const goal of goals) {
    const score = calculateProgressScore({
      uomType: goal.uomType,
      target: goal.target,
      actualValue: goal.actualValue || 0,
      baselineValue: goal.baselineValue,
      minTarget: goal.minTarget,
      maxTarget: goal.maxTarget,
    });

    weightedScore += score * goal.weightage;
    totalWeightage += goal.weightage;
  }

  if (totalWeightage === 0) return 0;
  return Math.round(weightedScore / totalWeightage);
}

export function getProgressStatus(score: number): 'danger' | 'warning' | 'success' {
  if (score < 50) return 'danger';
  if (score < 80) return 'warning';
  return 'success';
}

export function getProgressLabel(score: number): string {
  if (score < 30) return 'Critical';
  if (score < 50) return 'Below Target';
  if (score < 75) return 'On Track';
  if (score < 100) return 'Near Target';
  return 'Target Achieved';
}
