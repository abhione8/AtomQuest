import db from '@/lib/db';
import { GoalSheetStatus } from '@prisma/client';

export const reportService = {
  async getGoalSheetReport(sheetId: string) {
    const sheet = await prisma.goalSheet.findUnique({
      where: { id: sheetId },
      include: {
        employee: true,
        cycle: true,
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
            recipientAssignments: true,
          },
        },
        approvalAction: true,
      },
    });

    if (!sheet) throw new Error('Goal sheet not found');

    const totalGoals = sheet.goals.length;
    const achievedGoals = sheet.goals.filter((g) => g.isAchieved).length;
    const avgProgress =
      sheet.goals.length > 0
        ? sheet.goals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          sheet.goals.length
        : 0;

    return {
      sheet,
      totalGoals,
      achievedGoals,
      achievementPercentage: (achievedGoals / totalGoals) * 100,
      averageProgress: avgProgress,
    };
  },

  async getCycleReport(cycleId: string) {
    const sheets = await prisma.goalSheet.findMany({
      where: { cycleId },
      include: {
        employee: true,
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        approvalAction: true,
      },
    });

    const totalSheets = sheets.length;
    const approvedSheets = sheets.filter((s) => s.status === GoalSheetStatus.APPROVED).length;
    const lockedSheets = sheets.filter((s) => s.status === GoalSheetStatus.LOCKED).length;

    const allGoals = sheets.flatMap((s) => s.goals);
    const achievedGoals = allGoals.filter((g) => g.isAchieved).length;
    const avgProgress =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allGoals.length
        : 0;

    return {
      cycle: await prisma.goalCycle.findUnique({ where: { id: cycleId } }),
      totalSheets,
      approvedSheets,
      lockedSheets,
      totalGoals: allGoals.length,
      achievedGoals,
      achievementPercentage: (achievedGoals / allGoals.length) * 100,
      averageProgress: avgProgress,
      submissions: sheets,
    };
  },

  async getDepartmentReport(departmentId: string, cycleId: string) {
    const sheets = await prisma.goalSheet.findMany({
      where: {
        cycleId,
        employee: { departmentId },
      },
      include: {
        employee: true,
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    const employees = await prisma.user.findMany({
      where: { departmentId },
    });

    const sheetsByEmployee = new Map();
    sheets.forEach((s) => {
      sheetsByEmployee.set(s.employeeId, s);
    });

    const employeeReports = employees.map((emp) => {
      const sheet = sheetsByEmployee.get(emp.id);
      if (!sheet) return { employee: emp, sheetCount: 0, goalCount: 0, achievementPercentage: 0 };

      const achievedGoals = sheet.goals.filter((g) => g.isAchieved).length;
      return {
        employee: emp,
        sheetCount: 1,
        goalCount: sheet.goals.length,
        achievedGoals,
        achievementPercentage: (achievedGoals / sheet.goals.length) * 100,
      };
    });

    return {
      department: await prisma.department.findUnique({ where: { id: departmentId } }),
      totalEmployees: employees.length,
      employeesWithSheets: sheets.length,
      totalGoals: sheets.flatMap((s) => s.goals).length,
      employeeReports,
    };
  },

  async getEmployeeHistoryReport(employeeId: string) {
    const sheets = await prisma.goalSheet.findMany({
      where: { employeeId },
      include: {
        cycle: true,
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
        approvalAction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sheets.map((sheet) => {
      const goals = sheet.goals;
      const achievedGoals = goals.filter((g) => g.isAchieved).length;
      const avgProgress =
        goals.length > 0
          ? goals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) / goals.length
          : 0;

      return {
        cycle: sheet.cycle,
        status: sheet.status,
        totalGoals: goals.length,
        achievedGoals,
        achievementPercentage: (achievedGoals / goals.length) * 100,
        averageProgress: avgProgress,
        submittedAt: sheet.submittedAt,
        approvedAt: sheet.approvalAction?.approvalDate,
      };
    });
  },

  async getGoalProgressTrend(goalId: string) {
    const checkins = await prisma.quarterlyCheckin.findMany({
      where: { goalId },
      orderBy: { createdAt: 'asc' },
      include: { goal: true },
    });

    return checkins.map((c) => ({
      quarter: c.quarter,
      currentValue: c.currentValue,
      progressScore: c.progressScore,
      date: c.createdAt,
    }));
  },

  async getTopPerformers(cycleId: string, limit: number = 10) {
    const sheets = await prisma.goalSheet.findMany({
      where: { cycleId },
      include: {
        employee: true,
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    const performers = sheets
      .map((sheet) => {
        const goals = sheet.goals;
        const achievedGoals = goals.filter((g) => g.isAchieved).length;
        const avgProgress =
          goals.length > 0
            ? goals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) / goals.length
            : 0;

        return {
          employee: sheet.employee,
          totalGoals: goals.length,
          achievedGoals,
          achievementPercentage: (achievedGoals / goals.length) * 100,
          averageProgress: avgProgress,
        };
      })
      .sort((a, b) => b.averageProgress - a.averageProgress)
      .slice(0, limit);

    return performers;
  },

  async generateSummaryStats(cycleId: string) {
    const cycle = await prisma.goalCycle.findUnique({ where: { id: cycleId } });
    const sheets = await prisma.goalSheet.findMany({
      where: { cycleId },
      include: {
        goals: {
          include: {
            checkins: { orderBy: { createdAt: 'desc' }, take: 1 },
          },
        },
      },
    });

    const allGoals = sheets.flatMap((s) => s.goals);
    const achievedGoals = allGoals.filter((g) => g.isAchieved).length;
    const avgProgress =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allGoals.length
        : 0;

    return {
      cycle,
      submittedSheets: sheets.length,
      totalGoals: allGoals.length,
      achievedGoals,
      achievementPercentage: (achievedGoals / allGoals.length) * 100,
      averageProgress: avgProgress,
    };
  },
};
