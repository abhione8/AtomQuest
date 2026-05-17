import { z } from 'zod';
import { uomTypeEnum } from './goal';

export const createSharedGoalSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
  thrustArea: z.string().min(2, 'Thrust area is required').max(100),
  uomType: uomTypeEnum,
  target: z.number().positive('Target must be positive'),
  baselineValue: z.number().optional(),
  minTarget: z.number().optional(),
  maxTarget: z.number().optional(),
});

export type CreateSharedGoalInput = z.infer<typeof createSharedGoalSchema>;

export const assignSharedGoalSchema = z.object({
  sharedGoalId: z.string().cuid('Invalid shared goal ID'),
  employeeIds: z.array(z.string().cuid()).min(1, 'At least one employee must be selected'),
  weightages: z.record(z.number().min(10).max(100)).optional(),
});

export type AssignSharedGoalInput = z.infer<typeof assignSharedGoalSchema>;

export const updateSharedGoalWeightageSchema = z.object({
  assignmentId: z.string().cuid('Invalid assignment ID'),
  weightage: z.number().min(10, 'Weightage must be at least 10').max(100, 'Weightage must not exceed 100'),
});

export type UpdateSharedGoalWeightageInput = z.infer<typeof updateSharedGoalWeightageSchema>;
