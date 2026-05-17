import db from '@/lib/db';
import { UserRole, GoalSheetStatus } from '@prisma/client';

export const dashboardService = {
  async getEmployeeDashboard(employeeId: string) {
    const user = await prisma.user.findUnique({
      where: { id: employeeId },
      include: { goalSheets: { include: { goals: true, cycle: true } } },
    });

    if (!user) throw new Error('User not found');

    const currentSheet = user.goalSheets.find(
      (s) => s.status === GoalSheetStatus.DRAFT || s.status === GoalSheetStatus.SUBMITTED,
    );
    const completedSheets = user.goalSheets.filter(
      (s) => s.status === GoalSheetStatus.APPROVED || s.status === GoalSheetStatus.LOCKED,
    );

    const currentGoals = currentSheet?.goals || [];
    const totalWeightage = currentGoals.reduce((sum, g) => sum + g.weightage, 0);

    return {
      user,
      currentSheetStatus: currentSheet?.status,
      currentGoalsCount: currentGoals.length,
      totalWeightage,
      completedSheets: completedSheets.length,
      pendingSheets: user.goalSheets.filter((s) => s.status === GoalSheetStatus.SUBMITTED).length,
    };
  },

  async getManagerDashboard(managerId: string) {
    const manager = await prisma.user.findUnique({
      where: { id: managerId },
      include: { employeeProfile: { include: { directReports: true } } },
    });

    if (!manager) throw new Error('User not found');

    const directReports = manager.employeeProfile?.directReports || [];
    const directReportIds = directReports.map((r) => r.id);

    const submittedSheets = await prisma.goalSheet.findMany({
      where: {
        employeeId: { in: directReportIds },
        status: GoalSheetStatus.SUBMITTED,
      },
      include: { employee: true, goals: true },
    });

    const approvedSheets = await prisma.goalSheet.findMany({
      where: {
        employeeId: { in: directReportIds },
        status: { in: [GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] },
      },
    });

    const allEmployeeGoals = await prisma.goal.findMany({
      where: { goalSheet: { employeeId: { in: directReportIds } } },
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const achievedGoals = allEmployeeGoals.filter((g) => g.isAchieved).length;
    const avgProgress =
      allEmployeeGoals.length > 0
        ? allEmployeeGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allEmployeeGoals.length
        : 0;

    return {
      manager,
      directReportsCount: directReports.length,
      pendingApprovalsCount: submittedSheets.length,
      approvedSheets: approvedSheets.length,
      totalGoalsManaged: allEmployeeGoals.length,
      achievedGoals,
      teamAverageProgress: avgProgress,
      pendingApprovals: submittedSheets,
    };
  },

  async getAdminDashboard() {
    const users = await prisma.user.findMany({
      include: { department: true },
    });
    const admins = users.filter((u) => u.role === UserRole.ADMIN);
    const managers = users.filter((u) => u.role === UserRole.MANAGER);
    const employees = users.filter((u) => u.role === UserRole.EMPLOYEE);

    const totalGoalSheets = await prisma.goalSheet.count();
    const draftSheets = await prisma.goalSheet.count({ where: { status: GoalSheetStatus.DRAFT } });
    const submittedSheets = await prisma.goalSheet.count({
      where: { status: GoalSheetStatus.SUBMITTED },
    });
    const approvedSheets = await prisma.goalSheet.count({
      where: { status: { in: [GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] } },
    });

    const allGoals = await prisma.goal.findMany({
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    const achievedGoals = allGoals.filter((g) => g.isAchieved).length;
    const avgProgress =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allGoals.length
        : 0;

    const departments = await prisma.department.findMany();

    return {
      usersStats: {
        totalUsers: users.length,
        admins: admins.length,
        managers: managers.length,
        employees: employees.length,
      },
      goalsStats: {
        totalGoalSheets,
        draftSheets,
        submittedSheets,
        approvedSheets,
        totalGoals: allGoals.length,
        achievedGoals,
        achievementPercentage: (achievedGoals / allGoals.length) * 100,
        averageProgress: avgProgress,
      },
      departmentsCount: departments.length,
      recentCycles: await prisma.goalCycle.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    };
  },

  async getDepartmentStats(departmentId: string) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { users: true },
    });

    if (!department) throw new Error('Department not found');

    const deptUserIds = department.users.map((u) => u.id);
    const sheets = await prisma.goalSheet.findMany({
      where: { employeeId: { in: deptUserIds } },
      include: { employee: true, goals: true },
    });

    const goals = sheets.flatMap((s) => s.goals);
    const achievedGoals = goals.filter((g) => g.isAchieved).length;

    return {
      department,
      totalEmployees: department.users.length,
      submittedSheets: sheets.length,
      totalGoals: goals.length,
      achievedGoals,
      achievementPercentage: (achievedGoals / goals.length) * 100,
    };
  },

  async getCycleStats(cycleId: string) {
    const cycle = await prisma.goalCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) throw new Error('Cycle not found');

    const sheets = await prisma.goalSheet.findMany({
      where: { cycleId },
      include: { goals: true },
    });

    const goals = sheets.flatMap((s) => s.goals);
    const achievedGoals = goals.filter((g) => g.isAchieved).length;

    return {
      cycle,
      totalSheets: sheets.length,
      totalGoals: goals.length,
      achievedGoals,
      achievementPercentage: (achievedGoals / goals.length) * 100,
      statusBreakdown: {
        draft: sheets.filter((s) => s.status === GoalSheetStatus.DRAFT).length,
        submitted: sheets.filter((s) => s.status === GoalSheetStatus.SUBMITTED).length,
        approved: sheets.filter(
          (s) => s.status === GoalSheetStatus.APPROVED || s.status === GoalSheetStatus.LOCKED,
        ).length,
      },
    };
  },

  async getQuickStats() {
    const activeCycle = await prisma.goalCycle.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const pendingApprovals = await prisma.goalSheet.count({
      where: { status: GoalSheetStatus.SUBMITTED },
    });

    const pendingCheckins = await prisma.quarterlyCheckin.count({
      where: { status: 'DRAFT' },
    });

    const totalUsers = await prisma.user.count();
    const totalDepartments = await prisma.department.count();

    return {
      activeCycle,
      pendingApprovalsCount: pendingApprovals,
      pendingCheckinsCount: pendingCheckins,
      totalUsers,
      totalDepartments,
    };
  },

  async getUserActivityFeed(userId: string, limit: number = 20) {
    const auditLogs = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs.map((log) => ({
      action: log.action,
      entity: log.entityType,
      timestamp: log.createdAt,
      changes: log.changes,
    }));
  },
};
