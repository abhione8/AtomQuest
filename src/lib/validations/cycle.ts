import { z } from 'zod';

export const cycleStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'CLOSED']);

const cycleObjectSchema = z.object({
  name: z.string().min(3, 'Cycle name must be at least 3 characters').max(200),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date'),
  q1StartDate: z.string().datetime().optional(),
  q1EndDate: z.string().datetime().optional(),
  q2StartDate: z.string().datetime().optional(),
  q2EndDate: z.string().datetime().optional(),
  q3StartDate: z.string().datetime().optional(),
  q3EndDate: z.string().datetime().optional(),
  q4StartDate: z.string().datetime().optional(),
  q4EndDate: z.string().datetime().optional(),
});

export const createCycleSchema = cycleObjectSchema.refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  { message: 'End date must be after start date', path: ['endDate'] }
);

export type CreateCycleInput = z.infer<typeof createCycleSchema>;

export const updateCycleSchema = cycleObjectSchema.partial().extend({
  cycleId: z.string().cuid('Invalid cycle ID'),
});

export type UpdateCycleInput = z.infer<typeof updateCycleSchema>;

export const activateCycleSchema = z.object({
  cycleId: z.string().cuid('Invalid cycle ID'),
});

export type ActivateCycleInput = z.infer<typeof activateCycleSchema>;

export const closeCycleSchema = z.object({
  cycleId: z.string().cuid('Invalid cycle ID'),
});

export type CloseCycleInput = z.infer<typeof closeCycleSchema>;
