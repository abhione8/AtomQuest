import { prisma } from '@/lib/db';
import { GoalSheetStatus } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const goalSheetService = {
  async createGoalSheet(data: {
    employeeId: string;
    cycleId: string;
    title: string;
    objectives?: string;
  }) {
    return prisma.goalSheet.create({
      data: {
        employeeId: data.employeeId,
        cycleId: data.cycleId,
        title: data.title,
        objectives: data.objectives,
        status: GoalSheetStatus.DRAFT,
      },
      include: { goals: true, cycle: true },
    });
  },

  async getGoalSheetById(sheetId: string) {
    return prisma.goalSheet.findUnique({
      where: { id: sheetId },
      include: {
        employee: true,
        cycle: true,
        goals: { include: { checkins: true } },
        approvalAction: true,
      },
    });
  },

  async getEmployeeGoalSheets(employeeId: string) {
    return prisma.goalSheet.findMany({
      where: { employeeId },
      include: { cycle: true, goals: true, approvalAction: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getGoalSheetsByCycle(cycleId: string) {
    return prisma.goalSheet.findMany({
      where: { cycleId },
      include: { employee: true, goals: true, approvalAction: true },
    });
  },

  async getGoalSheetsByStatus(status: GoalSheetStatus) {
    return prisma.goalSheet.findMany({
      where: { status },
      include: { employee: true, cycle: true },
    });
  },

  async submitGoalSheet(sheetId: string, submittedBy: string) {
    const sheet = await prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.SUBMITTED, submittedAt: new Date() },
      include: { employee: true, goals: true },
    });
    await createAuditLog({
      entityType: 'GoalSheet',
      entityId: sheetId,
      action: 'SUBMIT',
      userId: submittedBy,
      changes: { status: 'SUBMITTED' },
    });
    return sheet;
  },

  async updateGoalSheet(sheetId: string, data: { title?: string; objectives?: string }) {
    return prisma.goalSheet.update({
      where: { id: sheetId },
      data,
      include: { goals: true },
    });
  },

  async lockGoalSheet(sheetId: string) {
    return prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.LOCKED },
    });
  },

  async unlockGoalSheet(sheetId: string) {
    return prisma.goalSheet.update({
      where: { id: sheetId },
      data: { status: GoalSheetStatus.APPROVED },
    });
  },

  async deleteGoalSheet(sheetId: string) {
    return prisma.goalSheet.delete({
      where: { id: sheetId },
    });
  },

  async getManagerPendingApprovals(managerId: string) {
    return prisma.goalSheet.findMany({
      where: {
        status: GoalSheetStatus.SUBMITTED,
        employee: { employeeProfile: { reportingManagerId: managerId } },
      },
      include: {
        employee: true,
        goals: true,
        cycle: true,
      },
    });
  },

  async getGoalSheetWithCheckins(sheetId: string) {
    return prisma.goalSheet.findUnique({
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
    return prisma.goalSheet.count({
      where: { status },
    });
  },
};
