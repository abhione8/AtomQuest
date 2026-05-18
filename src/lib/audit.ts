import db from './db';
import { AuditEntityType, AuditActionType } from '@prisma/client';

export interface AuditLogData {
  entityType: AuditEntityType;
  entityId: string;
  actionType: AuditActionType;
  userId: string;
  goalSheetId?: string;
  goalId?: string;
  checkinId?: string;
  sharedGoalId?: string;
  cycleId?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
}

export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        actionType: data.actionType,
        userId: data.userId,
        goalSheetId: data.goalSheetId,
        goalId: data.goalId,
        checkinId: data.checkinId,
        sharedGoalId: data.sharedGoalId,
        cycleId: data.cycleId,
        changes: data.changes ? JSON.stringify(data.changes) : null,
      },
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
}

export async function logGoalSheetSubmit(goalSheetId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL_SHEET,
    entityId: goalSheetId,
    actionType: AuditActionType.SUBMIT,
    userId,
    goalSheetId,
  });
}

export async function logGoalSheetApprove(goalSheetId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL_SHEET,
    entityId: goalSheetId,
    actionType: AuditActionType.APPROVE,
    userId,
    goalSheetId,
  });
}

export async function logGoalSheetReturn(goalSheetId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL_SHEET,
    entityId: goalSheetId,
    actionType: AuditActionType.RETURN,
    userId,
    goalSheetId,
  });
}

export async function logGoalSheetUnlock(goalSheetId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL_SHEET,
    entityId: goalSheetId,
    actionType: AuditActionType.UNLOCK,
    userId,
    goalSheetId,
  });
}

export async function logGoalCreate(goalSheetId: string, goalId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL,
    entityId: goalId,
    actionType: AuditActionType.CREATE,
    userId,
    goalSheetId,
    goalId,
  });
}

export async function logGoalUpdate(goalSheetId: string, goalId: string, userId: string, changes: Record<string, any>): Promise<void> {
  await createAuditLog({
    entityType: AuditEntityType.GOAL,
    entityId: goalId,
    actionType: AuditActionType.UPDATE,
    userId,
    goalSheetId,
    goalId,
    changes,
  });
}

export async function logCheckinCreate(goalSheetId: string, checkinId: string, userId: string): Promise<void> {
  await createAuditLog({
    entityType: 'CHECKIN',
    entityId: checkinId,
    actionType: 'CREATE',
    userId,
    goalSheetId,
    checkinId,
  });
}

export async function logCheckinUpdate(goalSheetId: string, checkinId: string, userId: string, changes: Record<string, any>): Promise<void> {
  await createAuditLog({
    entityType: 'CHECKIN',
    entityId: checkinId,
    actionType: 'UPDATE',
    userId,
    goalSheetId,
    checkinId,
    changes,
  });
}
