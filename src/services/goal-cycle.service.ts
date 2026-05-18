import db from '@/lib/db';
import { CycleStatus, GoalSheetStatus } from '@prisma/client';

export const goalCycleService = {
  async createCycle(data: {
    name: string;
    startDate: Date;
    endDate: Date;
    q1StartDate?: Date;
    q1EndDate?: Date;
    q2StartDate?: Date;
    q2EndDate?: Date;
    q3StartDate?: Date;
    q3EndDate?: Date;
    q4StartDate?: Date;
    q4EndDate?: Date;
  }) {
    return db.goalCycle.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        q1StartDate: data.q1StartDate,
        q1EndDate: data.q1EndDate,
        q2StartDate: data.q2StartDate,
        q2EndDate: data.q2EndDate,
        q3StartDate: data.q3StartDate,
        q3EndDate: data.q3EndDate,
        q4StartDate: data.q4StartDate,
        q4EndDate: data.q4EndDate,
        status: CycleStatus.DRAFT,
      },
    });
  },

  async getCycleById(cycleId: string) {
    return db.goalCycle.findUnique({
      where: { id: cycleId },
      include: { goalSheets: true },
    });
  },

  async getActiveCycle() {
    return db.goalCycle.findFirst({
      where: { status: CycleStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getAllCycles(skip?: number, take?: number) {
    return db.goalCycle.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { goalSheets: true },
    });
  },

  async updateCycleStatus(cycleId: string, status: CycleStatus) {
    return db.goalCycle.update({
      where: { id: cycleId },
      data: { status },
    });
  },

  async activateCycle(cycleId: string) {
    return db.goalCycle.update({
      where: { id: cycleId },
      data: { status: CycleStatus.ACTIVE },
    });
  },

  async closeCycle(cycleId: string) {
    return db.goalCycle.update({
      where: { id: cycleId },
      data: { status: CycleStatus.CLOSED },
    });
  },

  async getCycleProgressStats(cycleId: string) {
    const totalSheets = await db.goalSheet.count({
      where: { cycleId },
    });
    const submittedSheets = await db.goalSheet.count({
      where: { cycleId, status: { in: [GoalSheetStatus.SUBMITTED, GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] } },
    });
    const approvedSheets = await db.goalSheet.count({
      where: { cycleId, status: { in: [GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] } },
    });
    return {
      totalSheets,
      submittedSheets,
      approvedSheets,
      submissionPercentage: totalSheets > 0 ? (submittedSheets / totalSheets) * 100 : 0,
      approvalPercentage: totalSheets > 0 ? (approvedSheets / totalSheets) * 100 : 0,
    };
  },

  async isWithinCycleDates(cycleId: string, checkDate: Date = new Date()): Promise<boolean> {
    const cycle = await db.goalCycle.findUnique({ where: { id: cycleId } });
    return cycle ? checkDate >= cycle.startDate && checkDate <= cycle.endDate : false;
  },
};
