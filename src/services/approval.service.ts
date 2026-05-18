import db from '@/lib/db';
import { ApprovalActionType, GoalSheetStatus, AuditEntityType, AuditActionType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const approvalService = {
  async createApprovalAction(data: {
    goalSheetId: string;
    actionBy: string;
    actionType: ApprovalActionType;
    comments?: string;
  }) {
    return db.approvalAction.create({
      data: {
        goalSheetId: data.goalSheetId,
        actionBy: data.actionBy,
        actionType: data.actionType,
        comments: data.comments,
      },
      include: { actionByUser: true, goalSheet: true },
    });
  },

  async getApprovalForSheet(sheetId: string) {
    return db.approvalAction.findFirst({
      where: { goalSheetId: sheetId },
      include: { actionByUser: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async approveGoalSheet(sheetId: string, approverId: string, comments?: string) {
    const sheet = await db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.APPROVED, approvedAt: new Date() },
      include: { employee: true, goals: true },
    });

    await db.approvalAction.create({
      data: {
        goalSheetId: sheetId,
        actionBy: approverId,
        actionType: ApprovalActionType.APPROVED,
        comments,
      },
    });

    await createAuditLog({
      entityType: AuditEntityType.GOAL_SHEET,
      entityId: sheetId,
      actionType: AuditActionType.APPROVE,
      userId: approverId,
      goalSheetId: sheetId,
    });

    return sheet;
  },

  async returnGoalSheet(sheetId: string, approverId: string, reason: string) {
    const sheet = await db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.RETURNED },
      include: { employee: true, goals: true },
    });

    await db.approvalAction.create({
      data: {
        goalSheetId: sheetId,
        actionBy: approverId,
        actionType: ApprovalActionType.RETURNED,
        comments: reason,
      },
    });

    await createAuditLog({
      entityType: AuditEntityType.GOAL_SHEET,
      entityId: sheetId,
      actionType: AuditActionType.RETURN,
      userId: approverId,
      goalSheetId: sheetId,
    });

    return sheet;
  },

  async unlockGoalSheet(sheetId: string, unlockedBy: string) {
    const sheet = await db.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.DRAFT, unlockedAt: new Date() },
      include: { employee: true },
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

  async getApprovalHistory(sheetId: string) {
    return db.approvalAction.findMany({
      where: { goalSheetId: sheetId },
      include: { actionByUser: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getManagerApprovalsCount(managerId: string) {
    const approved = await db.approvalAction.count({
      where: { actionBy: managerId, actionType: ApprovalActionType.APPROVED },
    });
    const returned = await db.approvalAction.count({
      where: { actionBy: managerId, actionType: ApprovalActionType.RETURNED },
    });
    return { approved, returned };
  },

  async getPendingApprovalsForManager(managerId: string) {
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
        cycle: true,
        goals: true,
        approvalActions: { include: { actionByUser: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  },

  async isApproved(sheetId: string): Promise<boolean> {
    const approval = await db.approvalAction.findFirst({
      where: {
        goalSheetId: sheetId,
        actionType: ApprovalActionType.APPROVED,
      },
    });
    return !!approval;
  },
};
