import db from '@/lib/db';
import { CheckinStatus, Quarter, AuditEntityType, AuditActionType } from '@prisma/client';
import { calculateProgressScore } from '@/lib/progress-score';
import { createAuditLog } from '@/lib/audit';

export const checkinService = {
  async createCheckin(data: {
    goalId: string;
    quarter: Quarter;
    actualValue: number;
    comments?: string;
    createdBy: string;
  }) {
    const goal = await db.goal.findUnique({
      where: { id: data.goalId },
      include: { goalSheet: true },
    });

    if (!goal) throw new Error('Goal not found');

    const progressScore = calculateProgressScore({
      uomType: goal.uomType,
      target: goal.target,
      actualValue: data.actualValue,
      baselineValue: goal.baselineValue || 0,
    });

    const checkin = await db.quarterlyCheckin.create({
      data: {
        goalId: data.goalId,
        goalSheetId: goal.goalSheetId,
        quarter: data.quarter,
        actualValue: data.actualValue,
        progressScore,
        status: CheckinStatus.NOT_STARTED,
        comments: data.comments,
      },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.CHECKIN,
      entityId: checkin.id,
      actionType: AuditActionType.CREATE,
      userId: data.createdBy,
      checkinId: checkin.id,
      goalId: data.goalId,
      goalSheetId: goal.goalSheetId,
    });

    return checkin;
  },

  async getCheckinById(checkinId: string) {
    return db.quarterlyCheckin.findUnique({
      where: { id: checkinId },
      include: {
        goal: { include: { goalSheet: true } },
        comments_rel: { orderBy: { createdAt: 'desc' } },
      },
    });
  },

  async getGoalCheckins(goalId: string) {
    return db.quarterlyCheckin.findMany({
      where: { goalId },
      include: { comments_rel: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getGoalSheetCheckins(sheetId: string) {
    return db.quarterlyCheckin.findMany({
      where: { goalSheetId: sheetId },
      include: { goal: true, comments_rel: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getLatestCheckin(goalId: string) {
    return db.quarterlyCheckin.findFirst({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
      include: { goal: true },
    });
  },

  async updateCheckin(
    checkinId: string,
    data: { actualValue?: number; comments?: string; status?: CheckinStatus },
    updatedBy: string,
  ) {
    const oldCheckin = await db.quarterlyCheckin.findUnique({
      where: { id: checkinId },
      include: { goal: true },
    });

    let progressScore = oldCheckin?.progressScore;
    if (data.actualValue !== undefined && oldCheckin?.goal) {
      progressScore = calculateProgressScore({
        uomType: oldCheckin.goal.uomType,
        target: oldCheckin.goal.target,
        actualValue: data.actualValue,
        baselineValue: oldCheckin.goal.baselineValue || 0,
      });
    }

    const checkin = await db.quarterlyCheckin.update({
      where: { id: checkinId },
      data: {
        ...data,
        progressScore: progressScore ?? undefined,
      },
      include: { goal: true, comments_rel: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.CHECKIN,
      entityId: checkinId,
      actionType: AuditActionType.UPDATE,
      userId: updatedBy,
      checkinId: checkinId,
      goalId: oldCheckin?.goalId,
    });

    return checkin;
  },

  async submitCheckin(checkinId: string, submittedBy: string) {
    const checkin = await db.quarterlyCheckin.update({
      where: { id: checkinId },
      data: { status: CheckinStatus.ON_TRACK },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.CHECKIN,
      entityId: checkinId,
      actionType: AuditActionType.UPDATE,
      userId: submittedBy,
      checkinId: checkinId,
    });

    return checkin;
  },

  async approveCheckin(checkinId: string, approvedBy: string) {
    const checkin = await db.quarterlyCheckin.update({
      where: { id: checkinId },
      data: { status: CheckinStatus.COMPLETED },
      include: { goal: true },
    });

    await createAuditLog({
      entityType: AuditEntityType.CHECKIN,
      entityId: checkinId,
      actionType: AuditActionType.UPDATE,
      userId: approvedBy,
      checkinId: checkinId,
    });

    return checkin;
  },

  async deleteCheckin(checkinId: string, deletedBy: string) {
    await createAuditLog({
      entityType: AuditEntityType.CHECKIN,
      entityId: checkinId,
      actionType: AuditActionType.DELETE,
      userId: deletedBy,
      checkinId: checkinId,
    });

    return db.quarterlyCheckin.delete({
      where: { id: checkinId },
    });
  },

  async addCheckinComment(data: { checkinId: string; comment: string; userId: string }) {
    return db.checkinComment.create({
      data: {
        checkinId: data.checkinId,
        comment: data.comment,
        commentBy: data.userId,
      },
      include: { commentByUser: true },
    });
  },

  async getCheckinComments(checkinId: string) {
    return db.checkinComment.findMany({
      where: { checkinId },
      include: { commentByUser: true },
      orderBy: { createdAt: 'asc' },
    });
  },

  async calculateGoalProgress(goalId: string) {
    const checkins = await db.quarterlyCheckin.findMany({
      where: { goalId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });

    if (checkins.length === 0) return null;

    const avgProgress = (checkins.reduce((sum, c) => sum + (c.progressScore || 0), 0) / checkins.length);
    return {
      latestScore: checkins[0].progressScore || 0,
      averageScore: Math.round(avgProgress),
      trend: checkins.length > 1 ? (checkins[0].progressScore || 0) - (checkins[1].progressScore || 0) : 0,
      totalCheckins: checkins.length,
    };
  },

  async getGoalSheetProgress(sheetId: string) {
    const goals = await db.goal.findMany({
      where: { goalSheetId: sheetId },
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const checkins = goals.flatMap((g) => g.checkins);
    if (checkins.length === 0) return { averageProgress: 0, totalGoals: goals.length };

    const avgProgress = (checkins.reduce((sum, c) => sum + (c.progressScore || 0), 0) / checkins.length);
    return {
      averageProgress: Math.round(avgProgress),
      totalGoals: goals.length,
      checkedIn: checkins.length,
    };
  },
};
