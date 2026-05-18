import db from '@/lib/db';
import { UomType, AuditEntityType, AuditActionType } from '@prisma/client';
import { createAuditLog } from '@/lib/audit';

export const goalService = {
  async createGoal(data: {
    goalSheetId: string;
    thrustArea: string;
    title: string;
    description: string;
    uomType: UomType;
    target: number;
    baselineValue?: number;
    weightage: number;
    createdBy: string;
  }) {
    const goal = await db.goal.create({
      data: {
        goalSheetId: data.goalSheetId,
        thrustArea: data.thrustArea,
        title: data.title,
        description: data.description,
        uomType: data.uomType,
        target: data.target,
        baselineValue: data.baselineValue,
        weightage: data.weightage,
      },
      include: { checkins: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.GOAL,
      entityId: goal.id,
      actionType: AuditActionType.CREATE,
      userId: data.createdBy,
      goalId: goal.id,
      goalSheetId: data.goalSheetId,
    });

    return goal;
  },

  async getGoalById(goalId: string) {
    return db.goal.findUnique({
      where: { id: goalId },
      include: {
        goalSheet: { include: { employee: true } },
        checkins: { orderBy: { createdAt: 'desc' } },
        recipientAssignments: true,
      },
    });
  },

  async getGoalSheetGoals(sheetId: string) {
    return db.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: true, recipientAssignments: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async updateGoal(
    goalId: string,
    data: {
      thrustArea?: string;
      title?: string;
      description?: string;
      target?: number;
      baselineValue?: number;
      weightage?: number;
    },
    updatedBy: string,
  ) {
    const oldGoal = await db.goal.findUnique({ where: { id: goalId } });
    const goal = await db.goal.update({
      where: { id: goalId },
      data,
      include: { checkins: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.GOAL,
      entityId: goalId,
      actionType: AuditActionType.UPDATE,
      userId: updatedBy,
      goalId: goalId,
    });

    return goal;
  },

  async deleteGoal(goalId: string, deletedBy: string) {
    const goal = await db.goal.delete({
      where: { id: goalId },
    });

    await createAuditLog({
      entityType: AuditEntityType.GOAL,
      entityId: goalId,
      actionType: AuditActionType.DELETE,
      userId: deletedBy,
    });

    return goal;
  },

  async getGoalsByUomType(uomType: UomType) {
    return db.goal.findMany({
      where: { uomType },
      include: { goalSheet: true, checkins: true },
    });
  },

  async calculateGoalSheetTotalWeightage(sheetId: string): Promise<number> {
    const goals = await db.goal.findMany({
      where: { goalSheetId: sheetId },
      select: { weightage: true },
    });
    return goals.reduce((sum, goal) => sum + goal.weightage, 0);
  },

  async getGoalsWithoutCheckins(sheetId: string) {
    const goals = await db.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: true },
    });
    return goals.filter((g) => g.checkins.length === 0);
  },

  async getHighestWeightageGoals(sheetId: string, limit: number = 3) {
    return db.goal.findMany({
      where: { goalSheetId: sheetId },
      orderBy: { weightage: 'desc' },
      take: limit,
    });
  },

  async countGoalsBySheet(sheetId: string): Promise<number> {
    return db.goal.count({
      where: { goalSheetId: sheetId },
    });
  },

  async getGoalCountByThrustArea(sheetId: string) {
    const goals = await db.goal.findMany({
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
