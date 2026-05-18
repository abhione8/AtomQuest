import db from '@/lib/db';
import { UomType } from '@prisma/client';

export const sharedGoalService = {
  async createTemplate(data: {
    title: string;
    thrustArea: string;
    description: string;
    uomType: UomType;
    target: number;
    baselineValue?: number;
    minTarget?: number;
    maxTarget?: number;
  }) {
    return db.sharedGoalTemplate.create({
      data: {
        title: data.title,
        thrustArea: data.thrustArea,
        description: data.description,
        uomType: data.uomType,
        target: data.target,
        baselineValue: data.baselineValue,
        minTarget: data.minTarget,
        maxTarget: data.maxTarget,
      },
    });
  },

  async getTemplateById(templateId: string) {
    return db.sharedGoalTemplate.findUnique({
      where: { id: templateId },
      include: { assignments: true },
    });
  },

  async getAllTemplates(skip?: number, take?: number) {
    return db.sharedGoalTemplate.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { assignments: true },
    });
  },

  async getTemplatesByThrustArea(thrustArea: string) {
    return db.sharedGoalTemplate.findMany({
      where: { thrustArea },
      include: { assignments: true },
    });
  },

  async updateTemplate(templateId: string, data: { title?: string; description?: string; target?: number }) {
    return db.sharedGoalTemplate.update({
      where: { id: templateId },
      data,
      include: { assignments: true },
    });
  },

  async deleteTemplate(templateId: string) {
    return db.sharedGoalTemplate.delete({
      where: { id: templateId },
    });
  },

  async createAssignment(data: {
    sharedGoalId: string;
    recipientGoalId: string;
    recipientWeightage: number;
  }) {
    return db.sharedGoalAssignment.create({
      data: {
        sharedGoalId: data.sharedGoalId,
        recipientGoalId: data.recipientGoalId,
        recipientWeightage: data.recipientWeightage,
      },
      include: { sharedGoal: true, recipientGoal: true },
    });
  },

  async getAssignmentsByGoal(goalId: string) {
    return db.sharedGoalAssignment.findMany({
      where: { recipientGoalId: goalId },
      include: { sharedGoal: true },
    });
  },

  async getAssignmentsByTemplate(templateId: string) {
    return db.sharedGoalAssignment.findMany({
      where: { sharedGoalId: templateId },
      include: { recipientGoal: { include: { goalSheet: true } } },
    });
  },

  async deleteAssignment(assignmentId: string) {
    return db.sharedGoalAssignment.delete({
      where: { id: assignmentId },
    });
  },

  async getTemplatesStats() {
    const totalTemplates = await db.sharedGoalTemplate.count();
    const totalAssignments = await db.sharedGoalAssignment.count();
    return {
      totalTemplates,
      totalAssignments,
    };
  },
};
