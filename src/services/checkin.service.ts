import db from '@/lib/db';
import { CheckinStatus } from '@prisma/client';
import { calculateProgressScore } from '@/lib/progress-score';
import { createAuditLog } from '@/lib/audit';

export const checkinService = {
  async createCheckin(data: {
    goalId: string;
    quarter: string;
    currentValue: number;
    comments?: string;
    createdBy: string;
  }) {
    const goal = await prisma.goal.findUnique({
      where: { id: data.goalId },
      include: { goalSheet: true },
    });

    if (!goal) throw new Error('Goal not found');

    const progressScore = calculateProgressScore({
      uomType: goal.uomType,
      currentValue: data.currentValue,
      targetValue: goal.targetValue,
      baseline: goal.baseline || 0,
    });

    const checkin = await prisma.quarterlyCheckin.create({
      data: {
        goalId: data.goalId,
        quarter: data.quarter,
        currentValue: data.currentValue,
        progressScore,
        status: CheckinStatus.DRAFT,
        comments: data.comments,
        createdBy: data.createdBy,
      },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: 'QuarterlyCheckin',
      entityId: checkin.id,
      action: 'CREATE',
      userId: data.createdBy,
      changes: {
        quarter: data.quarter,
        currentValue: data.currentValue,
        progressScore,
      },
    });

    return checkin;
  },

  async getCheckinById(checkinId: string) {
    return prisma.quarterlyCheckin.findUnique({
      where: { id: checkinId },
      include: {
        goal: { include: { goalSheet: true } },
        comments: { orderBy: { createdAt: 'desc' } },
        auditLogs: true,
      },
    });
  },

  async getGoalCheckins(goalId: string) {
    return prisma.quarterlyCheckin.findMany({
      where: { goalId },
      include: { comments: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getGoalSheetCheckins(sheetId: string) {
    return prisma.quarterlyCheckin.findMany({
      where: { goal: { goalSheetId: sheetId } },
      include: { goal: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getLatestCheckin(goalId: string) {
    return prisma.quarterlyCheckin.findFirst({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
      include: { goal: true },
    });
  },

  async updateCheckin(
    checkinId: string,
    data: { currentValue?: number; comments?: string; status?: CheckinStatus },
    updatedBy: string,
  ) {
    const oldCheckin = await prisma.quarterlyCheckin.findUnique({
      where: { id: checkinId },
      include: { goal: true },
    });

    let progressScore = oldCheckin?.progressScore;
    if (data.currentValue !== undefined && oldCheckin?.goal) {
      progressScore = calculateProgressScore({
        uomType: oldCheckin.goal.uomType,
        currentValue: data.currentValue,
        targetValue: oldCheckin.goal.targetValue,
        baseline: oldCheckin.goal.baseline || 0,
      });
    }

    const checkin = await prisma.quarterlyCheckin.update({
      where: { id: checkinId },
      data: {
        ...data,
        progressScore: progressScore ?? undefined,
      },
      include: { goal: true, comments: true },
    });

    await createAuditLog({
      entityType: 'QuarterlyCheckin',
      entityId: checkinId,
      action: 'UPDATE',
      userId: updatedBy,
      changes: { ...data, progressScore },
    });

    return checkin;
  },

  async submitCheckin(checkinId: string, submittedBy: string) {
    const checkin = await prisma.quarterlyCheckin.update({
      where: { id: checkinId },
      data: { status: CheckinStatus.SUBMITTED, submittedAt: new Date() },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: 'QuarterlyCheckin',
      entityId: checkinId,
      action: 'SUBMIT',
      userId: submittedBy,
      changes: { status: 'SUBMITTED' },
    });

    return checkin;
  },

  async approveCheckin(checkinId: string, approvedBy: string) {
    const checkin = await prisma.quarterlyCheckin.update({
      where: { id: checkinId },
      data: { status: CheckinStatus.APPROVED, approvedAt: new Date() },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: 'QuarterlyCheckin',
      entityId: checkinId,
      action: 'APPROVE',
      userId: approvedBy,
      changes: { status: 'APPROVED' },
    });

    return checkin;
  },

  async deleteCheckin(checkinId: string, deletedBy: string) {
    await createAuditLog({
      entityType: 'QuarterlyCheckin',
      entityId: checkinId,
      action: 'DELETE',
      userId: deletedBy,
    });

    return prisma.quarterlyCheckin.delete({
      where: { id: checkinId },
    });
  },

  async addCheckinComment(data: { checkinId: string; comment: string; userId: string }) {
    return prisma.checkinComment.create({
      data: {
        checkinId: data.checkinId,
        comment: data.comment,
        userId: data.userId,
      },
      include: { user: true },
    });
  },

  async getCheckinComments(checkinId: string) {
    return prisma.checkinComment.findMany({
      where: { checkinId },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async calculateGoalProgress(goalId: string) {
    const checkins = await prisma.quarterlyCheckin.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (checkins.length === 0) return null;

    const avgProgress = checkins.reduce((sum, c) => sum + c.progressScore, 0) / checkins.length;
    return {
      latestScore: checkins[0].progressScore,
      averageScore: avgProgress,
      trend: checkins.length > 1 ? checkins[0].progressScore - checkins[1].progressScore : 0,
      totalCheckins: checkins.length,
    };
  },

  async getGoalSheetProgress(sheetId: string) {
    const goals = await prisma.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const checkins = goals.flatMap((g) => g.checkins);
    if (checkins.length === 0) return { averageProgress: 0, totalGoals: goals.length };

    const avgProgress = checkins.reduce((sum, c) => sum + c.progressScore, 0) / checkins.length;
    return {
      averageProgress: avgProgress,
      totalGoals: goals.length,
      checkedIn: checkins.length,
    };
  },
};
