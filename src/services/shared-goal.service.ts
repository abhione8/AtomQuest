import { prisma } from '@/lib/db';

export const sharedGoalService = {
  async createTemplate(data: {
    name: string;
    thrustArea: string;
    description: string;
    uomType: string;
    targetValue: number;
    createdBy: string;
  }) {
    return prisma.sharedGoalTemplate.create({
      data: {
        name: data.name,
        thrustArea: data.thrustArea,
        description: data.description,
        uomType: data.uomType,
        targetValue: data.targetValue,
        createdBy: data.createdBy,
      },
    });
  },

  async getTemplateById(templateId: string) {
    return prisma.sharedGoalTemplate.findUnique({
      where: { id: templateId },
      include: { assignments: { include: { assignee: true } } },
    });
  },

  async getAllTemplates(skip?: number, take?: number) {
    return prisma.sharedGoalTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { assignments: true },
    });
  },

  async getTemplatesByThrustArea(thrustArea: string) {
    return prisma.sharedGoalTemplate.findMany({
      where: { thrustArea },
      include: { assignments: true },
    });
  },

  async updateTemplate(templateId: string, data: { name?: string; description?: string }) {
    return prisma.sharedGoalTemplate.update({
      where: { id: templateId },
      data,
      include: { assignments: true },
    });
  },

  async deleteTemplate(templateId: string) {
    return prisma.sharedGoalTemplate.delete({
      where: { id: templateId },
    });
  },

  async createAssignment(data: {
    templateId: string;
    goalId: string;
    assigneeId: string;
    weightage: number;
  }) {
    return prisma.sharedGoalAssignment.create({
      data: {
        templateId: data.templateId,
        recipientGoalId: data.goalId,
        assigneeId: data.assigneeId,
        weightage: data.weightage,
      },
      include: { template: true, assignee: true, recipientGoal: true },
    });
  },

  async getAssignmentsByGoal(goalId: string) {
    return prisma.sharedGoalAssignment.findMany({
      where: { recipientGoalId: goalId },
      include: { template: true, assignee: true },
    });
  },

  async getAssignmentsByAssignee(assigneeId: string) {
    return prisma.sharedGoalAssignment.findMany({
      where: { assigneeId },
      include: { template: true, recipientGoal: { include: { goalSheet: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAssignmentsByTemplate(templateId: string) {
    return prisma.sharedGoalAssignment.findMany({
      where: { templateId },
      include: { assignee: true, recipientGoal: true },
    });
  },

  async updateAssignmentStatus(assignmentId: string, isAchieved: boolean) {
    return prisma.sharedGoalAssignment.update({
      where: { id: assignmentId },
      data: { isAchieved, achievedAt: isAchieved ? new Date() : null },
      include: { template: true, assignee: true },
    });
  },

  async getAchievedAssignments(assigneeId: string) {
    return prisma.sharedGoalAssignment.findMany({
      where: { assigneeId, isAchieved: true },
      include: { template: true, recipientGoal: true },
    });
  },

  async countAssignmentsByStatus(templateId: string) {
    const total = await prisma.sharedGoalAssignment.count({
      where: { templateId },
    });
    const achieved = await prisma.sharedGoalAssignment.count({
      where: { templateId, isAchieved: true },
    });
    return {
      total,
      achieved,
      pending: total - achieved,
      achievementPercentage: total > 0 ? (achieved / total) * 100 : 0,
    };
  },

  async deleteAssignment(assignmentId: string) {
    return prisma.sharedGoalAssignment.delete({
      where: { id: assignmentId },
    });
  },

  async syncAchievementToGoal(goalId: string) {
    const assignments = await prisma.sharedGoalAssignment.findMany({
      where: { recipientGoalId: goalId },
    });
    const allAchieved = assignments.length > 0 && assignments.every((a) => a.isAchieved);
    return prisma.goal.update({
      where: { id: goalId },
      data: { isAchieved: allAchieved },
    });
  },

  async getTemplatesStats() {
    const totalTemplates = await prisma.sharedGoalTemplate.count();
    const totalAssignments = await prisma.sharedGoalAssignment.count();
    const achievedAssignments = await prisma.sharedGoalAssignment.count({
      where: { isAchieved: true },
    });
    return {
      totalTemplates,
      totalAssignments,
      achievedAssignments,
      achievementRate: totalAssignments > 0 ? (achievedAssignments / totalAssignments) * 100 : 0,
    };
  },
};
