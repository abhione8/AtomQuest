import { z } from 'zod';
import { MAX_GOALS_PER_SHEET, MIN_WEIGHTAGE_PER_GOAL, TOTAL_WEIGHTAGE_REQUIRED } from '../constants';

export const uomTypeEnum = z.enum([
  'NUMERIC_MIN',
  'NUMERIC_MAX',
  'PERCENT_MIN',
  'PERCENT_MAX',
  'TIMELINE',
  'ZERO_BASED',
]);

export const goalSchema = z.object({
  thrustArea: z.string().min(2, 'Thrust area is required').max(100),
  title: z.string().min(3, 'Goal title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
  uomType: uomTypeEnum,
  target: z.number().positive('Target must be positive'),
  weightage: z.number().min(MIN_WEIGHTAGE_PER_GOAL, `Weightage must be at least ${MIN_WEIGHTAGE_PER_GOAL}`).max(100),
  baselineValue: z.number().optional(),
  minTarget: z.number().optional(),
  maxTarget: z.number().optional(),
});

export type GoalInput = z.infer<typeof goalSchema>;

export const createGoalSheetSchema = z.object({
  cycleId: z.string().cuid('Invalid cycle ID'),
  goals: z.array(goalSchema).min(1, 'At least one goal is required').max(MAX_GOALS_PER_SHEET, `Maximum ${MAX_GOALS_PER_SHEET} goals allowed`),
});

export type CreateGoalSheetInput = z.infer<typeof createGoalSheetSchema>;

export const updateGoalSchema = goalSchema.partial().extend({
  id: z.string().cuid('Invalid goal ID'),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const submitGoalSheetSchema = z.object({
  goalSheetId: z.string().cuid('Invalid goal sheet ID'),
});

export type SubmitGoalSheetInput = z.infer<typeof submitGoalSheetSchema>;

// Validation helper functions
export function validateTotalWeightage(goals: GoalInput[]): boolean {
  const total = goals.reduce((sum, goal) => sum + goal.weightage, 0);
  return total === TOTAL_WEIGHTAGE_REQUIRED;
}

export function validateGoalCount(goals: GoalInput[]): boolean {
  return goals.length >= 1 && goals.length <= MAX_GOALS_PER_SHEET;
}

export function validateMinWeightage(goals: GoalInput[]): boolean {
  return goals.every((goal) => goal.weightage >= MIN_WEIGHTAGE_PER_GOAL);
}

export const goalSheetWeightageValidation = z.object({
  goals: z.array(goalSchema),
}).refine(
  (data) => validateTotalWeightage(data.goals),
  { message: `Total weightage must equal ${TOTAL_WEIGHTAGE_REQUIRED}%`, path: ['goals'] }
).refine(
  (data) => validateGoalCount(data.goals),
  { message: `Must have between 1 and ${MAX_GOALS_PER_SHEET} goals`, path: ['goals'] }
).refine(
  (data) => validateMinWeightage(data.goals),
  { message: `Each goal must have minimum ${MIN_WEIGHTAGE_PER_GOAL}% weightage`, path: ['goals'] }
);
