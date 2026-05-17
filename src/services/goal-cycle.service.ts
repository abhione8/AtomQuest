import { prisma } from '@/lib/db';
import { CycleStatus, Quarter } from '@prisma/client';

export const goalCycleService = {
  async createCycle(data: {
    name: string;
    quarter: Quarter;
    year: number;
    startDate: Date;
    endDate: Date;
    submissionDeadline: Date;
  }) {
    return prisma.goalCycle.create({
      data: {
        name: data.name,
        quarter: data.quarter,
        year: data.year,
        startDate: data.startDate,
        endDate: data.endDate,
        submissionDeadline: data.submissionDeadline,
        status: CycleStatus.ACTIVE,
      },
    });
  },

  async getCycleById(cycleId: string) {
    return prisma.goalCycle.findUnique({
      where: { id: cycleId },
      include: { goalSheets: true },
    });
  },

  async getActiveCycle() {
    return prisma.goalCycle.findFirst({
      where: { status: CycleStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getCyclesByYear(year: number) {
    return prisma.goalCycle.findMany({
      where: { year },
      orderBy: { quarter: 'asc' },
    });
  },

  async getAllCycles(skip?: number, take?: number) {
    return prisma.goalCycle.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { goalSheets: true },
    });
  },

  async updateCycleStatus(cycleId: string, status: CycleStatus) {
    return prisma.goalCycle.update({
      where: { id: cycleId },
      data: { status },
    });
  },

  async closeCycle(cycleId: string) {
    return prisma.goalCycle.update({
      where: { id: cycleId },
      data: { status: CycleStatus.CLOSED },
    });
  },

  async getCycleProgressStats(cycleId: string) {
    const totalSheets = await prisma.goalSheet.count({
      where: { cycleId },
    });
    const submittedSheets = await prisma.goalSheet.count({
      where: { cycleId, status: { in: ['SUBMITTED', 'APPROVED', 'LOCKED'] } },
    });
    const approvedSheets = await prisma.goalSheet.count({
      where: { cycleId, status: 'APPROVED' },
    });
    return {
      totalSheets,
      submittedSheets,
      approvedSheets,
      submissionPercentage: totalSheets > 0 ? (submittedSheets / totalSheets) * 100 : 0,
      approvalPercentage: totalSheets > 0 ? (approvedSheets / totalSheets) * 100 : 0,
    };
  },

  async isSubmissionDeadlinePassed(cycleId: string): Promise<boolean> {
    const cycle = await prisma.goalCycle.findUnique({ where: { id: cycleId } });
    return cycle ? new Date() > cycle.submissionDeadline : false;
  },
};
