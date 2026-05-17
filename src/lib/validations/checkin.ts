import { z } from 'zod';

export const quarterEnum = z.enum(['Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL']);

export const checkinStatusEnum = z.enum(['NOT_STARTED', 'ON_TRACK', 'COMPLETED']);

export const createCheckinSchema = z.object({
  goalId: z.string().cuid('Invalid goal ID'),
  quarter: quarterEnum,
  actualValue: z.number().nonnegative('Actual value must be non-negative'),
  status: checkinStatusEnum,
  comments: z.string().max(1000).optional(),
});

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;

export const updateCheckinSchema = z.object({
  checkinId: z.string().cuid('Invalid checkin ID'),
  actualValue: z.number().nonnegative().optional(),
  status: checkinStatusEnum.optional(),
  comments: z.string().max(1000).optional(),
});

export type UpdateCheckinInput = z.infer<typeof updateCheckinSchema>;

export const checkinCommentSchema = z.object({
  checkinId: z.string().cuid('Invalid checkin ID'),
  comment: z.string().min(5, 'Comment must be at least 5 characters').max(1000),
});

export type CheckinCommentInput = z.infer<typeof checkinCommentSchema>;

// Validation helper functions
export function isValidQuarter(quarter: string): boolean {
  return ['Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL'].includes(quarter);
}

export function isValidCheckinStatus(status: string): boolean {
  return ['NOT_STARTED', 'ON_TRACK', 'COMPLETED'].includes(status);
}
