import { prisma } from '@/lib/db';
import { UomType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const goalService = {
  async createGoal(data: {
    goalSheetId: string;
    thrustArea: string;
    description: string;
    uomType: UomType;
    targetValue: number;
    baseline?: number;
    weightage: number;
    createdBy: string;
  }) {
    const goal = await prisma.goal.create({
      data: {
        goalSheetId: data.goalSheetId,
        thrustArea: data.thrustArea,
        description: data.description,
        uomType: data.uomType,
        targetValue: data.targetValue,
        baseline: data.baseline,
        weightage: data.weightage,
      },
      include: { checkins: true },
    });

    await createAuditLog({
      entityType: 'Goal',
      entityId: goal.id,
      action: 'CREATE',
      userId: data.createdBy,
      changes: { thrustArea: data.thrustArea, uomType: data.uomType },
    });

    return goal;
  },

  async getGoalById(goalId: string) {
    return prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        goalSheet: { include: { employee: true } },
        checkins: { orderBy: { createdAt: 'desc' } },
        recipientAssignments: { include: { assignee: true } },
      },
    });
  },

  async getGoalSheetGoals(sheetId: string) {
    return prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: true, recipientAssignments: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async updateGoal(
    goalId: string,
    data: {
      thrustArea?: string;
      description?: string;
      targetValue?: number;
      baseline?: number;
      weightage?: number;
    },
    updatedBy: string,
  ) {
    const oldGoal = await prisma.goal.findUnique({ where: { id: goalId } });
    const goal = await prisma.goal.update({
      where: { id: goalId },
      data,
      include: { checkins: true },
    });

    await createAuditLog({
      entityType: 'Goal',
      entityId: goalId,
      action: 'UPDATE',
      userId: updatedBy,
      changes: data,
    });

    return goal;
  },

  async deleteGoal(goalId: string, deletedBy: string) {
    const goal = await prisma.goal.delete({
      where: { id: goalId },
    });

    await createAuditLog({
      entityType: 'Goal',
      entityId: goalId,
      action: 'DELETE',
      userId: deletedBy,
    });

    return goal;
  },

  async getGoalsByUomType(uomType: UomType) {
    return prisma.goal.findMany({
      where: { uomType },
      include: { goalSheet: true, checkins: true },
    });
  },

  async calculateGoalSheetTotalWeightage(sheetId: string): Promise<number> {
    const goals = await prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      select: { weightage: true },
    });
    return goals.reduce((sum, goal) => sum + goal.weightage, 0);
  },

  async getGoalsWithoutCheckins(sheetId: string) {
    const goals = await prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: true },
    });
    return goals.filter((g) => g.checkins.length === 0);
  },

  async getHighestWeightageGoals(sheetId: string, limit: number = 3) {
    return prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      orderBy: { weightage: 'desc' },
      take: limit,
    });
  },

  async countGoalsBySheet(sheetId: string): Promise<number> {
    return prisma.goal.count({
      where: { goalSheetId: sheetId },
    });
  },

  async getGoalCountByThrustArea(sheetId: string) {
    const goals = await prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      select: { thrustArea: true },
    });
    const counts: Record<string, number> = {};
    goals.forEach((g) => {
      counts[g.thrustArea] = (counts[g.thrustArea] || 0) + 1;
    });
    return counts;
  },
};
