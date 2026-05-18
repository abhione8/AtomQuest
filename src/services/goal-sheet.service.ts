import db from '@/lib/db';
import { GoalSheetStatus, AuditEntityType, AuditActionType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const goalSheetService = {
  async createGoalSheet(data: {
    employeeId: string;
    cycleId: string;
  }) {
    return db.goalSheet.create({
      data: {
        employeeId: data.employeeId,
        cycleId: data.cycleId,
        status: GoalSheetStatus.DRAFT,
      },
      include: { goals: true, cycle: true },
    });
  },

  async getGoalSheetById(sheetId: string) {
    return db.goalSheet.findUnique({
      where: { id: sheetId },
      include: {
        employee: true,
        cycle: true,
        goals: { include: { checkins: true } },
        approvalActions: true,
      },
    });
  },

  async getEmployeeGoalSheets(employeeId: string) {
    return db.goalSheet.findMany({
      where: { employeeId },
      include: { cycle: true, goals: true, approvalActions: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getGoalSheetsByCycle(cycleId: string) {
    return db.goalSheet.findMany({
      where: { cycleId },
      include: { employee: true, goals: true, approvalActions: true },
    });
  },

  async getGoalSheetsByStatus(status: GoalSheetStatus) {
    return db.goalSheet.findMany({
      where: { status },
      include: { employee: true, cycle: true },
    });
  },

  async submitGoalSheet(sheetId: string, submittedBy: string) {
    const sheet = await db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.SUBMITTED, submittedAt: new Date() },
      include: { employee: true, goals: true },
    });
    await createAuditLog({
      entityType: AuditEntityType.GOAL_SHEET,
      entityId: sheetId,
      actionType: AuditActionType.SUBMIT,
      userId: submittedBy,
      goalSheetId: sheetId,
    });
    return sheet;
  },

  async lockGoalSheet(sheetId: string) {
    return db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.LOCKED, lockedAt: new Date(), isLocked: true },
    });
  },

  async unlockGoalSheet(sheetId: string, unlockedBy: string) {
    const sheet = await db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.DRAFT, unlockedAt: new Date(), isLocked: false },
    });
    
    await createAuditLog({
      entityType: AuditEntityType.GOAL_SHEET,
      entityId: sheetId,
      actionType: AuditActionType.UNLOCK,
      userId: unlockedBy,
      goalSheetId: sheetId,
    });
    
    return sheet;
  },

  async deleteGoalSheet(sheetId: string) {
    return db.goalSheet.delete({
      where: { id: sheetId },
    });
  },

  async getManagerPendingApprovals(managerId: string) {
    const directReportIds = (
      await db.reportingManagerRelation.findMany({
        where: { managerId },
        select: { employeeId: true },
      })
    ).map((r) => r.employeeId);

    return db.goalSheet.findMany({
      where: {
        status: GoalSheetStatus.SUBMITTED,
        employeeId: { in: directReportIds },
      },
      include: {
        employee: true,
        goals: true,
        cycle: true,
      },
    });
  },

  async getGoalSheetWithCheckins(sheetId: string) {
    return db.goalSheet.findUnique({
      where: { id: sheetId },
      include: {
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' } },
            recipientAssignments: true,
          },
        },
        cycle: true,
        employee: true,
      },
    });
  },

  async countGoalSheetsByStatus(status: GoalSheetStatus): Promise<number> {
    return db.goalSheet.count({
      where: { status },
    });
  },
};
