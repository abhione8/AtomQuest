import db from '@/lib/db';
import { ApprovalStatus, GoalSheetStatus } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const approvalService = {
  async createApprovalAction(data: {
    goalSheetId: string;
    approvedBy: string;
    status: ApprovalStatus;
    comments?: string;
  }) {
    return prisma.approvalAction.create({
      data: {
        goalSheetId: data.goalSheetId,
        approvedBy: data.approvedBy,
        status: data.status,
        comments: data.comments,
        approvalDate: new Date(),
      },
      include: { approver: true, goalSheet: true },
    });
  },

  async getApprovalForSheet(sheetId: string) {
    return prisma.approvalAction.findFirst({
      where: { goalSheetId: sheetId },
      include: { approver: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async approveGoalSheet(sheetId: string, approverId: string, comments?: string) {
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.APPROVED },
      include: { employee: true, goals: true },
    });

    await prisma.approvalAction.create({
      data: {
        goalSheetId: sheetId,
        approvedBy: approverId,
        status: ApprovalStatus.APPROVED,
        comments,
        approvalDate: new Date(),
      },
    });

    await createAuditLog({
      entityType: 'GoalSheet',
      entityId: sheetId,
      action: 'APPROVE',
      userId: approverId,
      changes: { status: 'APPROVED', approverComments: comments },
    });

    return sheet;
  },

  async returnGoalSheet(sheetId: string, approverId: string, reason: string) {
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.DRAFT },
      include: { employee: true, goals: true },
    });

    await prisma.approvalAction.create({
      data: {
        goalSheetId: sheetId,
        approvedBy: approverId,
        status: ApprovalStatus.RETURNED,
        comments: reason,
        approvalDate: new Date(),
      },
    });

    await createAuditLog({
      entityType: 'GoalSheet',
      entityId: sheetId,
      action: 'RETURN',
      userId: approverId,
      changes: { status: 'DRAFT', returnReason: reason },
    });

    return sheet;
  },

  async rejectGoalSheet(sheetId: string, approverId: string, reason: string) {
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.DRAFT },
      include: { employee: true, goals: true },
    });

    await prisma.approvalAction.create({
      data: {
        goalSheetId: sheetId,
        approvedBy: approverId,
        status: ApprovalStatus.REJECTED,
        comments: reason,
        approvalDate: new Date(),
      },
    });

    await createAuditLog({
      entityType: 'GoalSheet',
      entityId: sheetId,
      action: 'REJECT',
      userId: approverId,
      changes: { status: 'DRAFT', rejectionReason: reason },
    });

    return sheet;
  },

  async unlockGoalSheet(sheetId: string, unlockedBy: string) {
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.APPROVED },
      include: { employee: true },
    });

    await createAuditLog({
      entityType: 'GoalSheet',
      entityId: sheetId,
      action: 'UNLOCK',
      userId: unlockedBy,
      changes: { status: 'APPROVED' },
    });

    return sheet;
  },

  async getApprovalHistory(sheetId: string) {
    return prisma.approvalAction.findMany({
      where: { goalSheetId: sheetId },
      include: { approver: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async getManagerApprovalsCount(managerId: string) {
    const approved = await prisma.approvalAction.count({
      where: { approvedBy: managerId, status: ApprovalStatus.APPROVED },
    });
    const returned = await prisma.approvalAction.count({
      where: { approvedBy: managerId, status: ApprovalStatus.RETURNED },
    });
    const rejected = await prisma.approvalAction.count({
      where: { approvedBy: managerId, status: ApprovalStatus.REJECTED },
    });
    return { approved, returned, rejected };
  },

  async getPendingApprovalsForManager(managerId: string) {
    return prisma.goalSheet.findMany({
      where: {
        status: GoalSheetStatus.SUBMITTED,
        employee: { employeeProfile: { reportingManagerId: managerId } },
      },
      include: {
        employee: true,
        cycle: true,
        goals: true,
        approvalAction: { include: { approver: true } },
      },
      orderBy: { submittedAt: 'asc' },
    });
  },

  async isApproved(sheetId: string): Promise<boolean> {
    const approval = await prisma.approvalAction.findFirst({
      where: {
        goalSheetId: sheetId,
        status: ApprovalStatus.APPROVED,
      },
    });
    return !!approval;
  },
};
