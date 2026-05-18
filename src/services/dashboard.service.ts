import db from '@/lib/db';
import { UserRole, GoalSheetStatus, CheckinStatus } from '@prisma/client';

export const dashboardService = {
  async getEmployeeDashboard(employeeId: string) {
    const user = await db.user.findUnique({
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
    const manager = await db.user.findUnique({
      where: { id: managerId },
    });

    if (!manager) throw new Error('User not found');

    // Get direct reports through ReportingManagerRelation
    const reportingRelations = await db.reportingManagerRelation.findMany({
      where: { managerId },
      include: { employee: true },
    });

    const directReportIds = reportingRelations.map((r) => r.employeeId);

    const submittedSheets = await db.goalSheet.findMany({
      where: {
        employeeId: { in: directReportIds },
        status: GoalSheetStatus.SUBMITTED,
      },
      include: { employee: true, goals: true },
    });

    const approvedSheets = await db.goalSheet.findMany({
      where: {
        employeeId: { in: directReportIds },
        status: { in: [GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] },
      },
    });

    const allEmployeeGoals = await db.goal.findMany({
      where: { goalSheet: { employeeId: { in: directReportIds } } },
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    const avgProgress =
      allEmployeeGoals.length > 0
        ? Math.round(allEmployeeGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allEmployeeGoals.length)
        : 0;

    return {
      manager,
      directReportsCount: directReportIds.length,
      pendingApprovalsCount: submittedSheets.length,
      approvedSheets: approvedSheets.length,
      totalGoalsManaged: allEmployeeGoals.length,
      teamAverageProgress: avgProgress,
      pendingApprovals: submittedSheets,
    };
  },

  async getAdminDashboard() {
    const users = await db.user.findMany({
      include: { department: true },
    });
    const admins = users.filter((u) => u.role === UserRole.ADMIN);
    const managers = users.filter((u) => u.role === UserRole.MANAGER);
    const employees = users.filter((u) => u.role === UserRole.EMPLOYEE);

    const totalGoalSheets = await db.goalSheet.count();
    const draftSheets = await db.goalSheet.count({ where: { status: GoalSheetStatus.DRAFT } });
    const submittedSheets = await db.goalSheet.count({
      where: { status: GoalSheetStatus.SUBMITTED },
    });
    const approvedSheets = await db.goalSheet.count({
      where: { status: { in: [GoalSheetStatus.APPROVED, GoalSheetStatus.LOCKED] } },
    });

    const allGoals = await db.goal.findMany({
      include: { checkins: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    const achievedGoals = allGoals.filter((g) => (g.checkins[0]?.progressScore ?? 0) === 100).length;
    const avgProgress =
      allGoals.length > 0
        ? allGoals.reduce((sum, g) => sum + (g.checkins[0]?.progressScore || 0), 0) /
          allGoals.length
        : 0;

    const departments = await db.department.findMany();

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
      recentCycles: await db.goalCycle.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    };
  },

  async getDepartmentStats(departmentId: string) {
    const department = await db.department.findUnique({
      where: { id: departmentId },
      include: { users: true },
    });

    if (!department) throw new Error('Department not found');

    const deptUserIds = department.users.map((u) => u.id);
    const sheets = await db.goalSheet.findMany({
      where: { employeeId: { in: deptUserIds } },
      include: { employee: true, goals: { include: { checkins: { take: 1, orderBy: { createdAt: 'desc' } } } } },
    });

    const goals = sheets.flatMap((s) => s.goals);
    const achievedGoals = goals.filter((g) => (g.checkins[0]?.progressScore ?? 0) === 100).length;

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
    const cycle = await db.goalCycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) throw new Error('Cycle not found');

    const sheets = await db.goalSheet.findMany({
      where: { cycleId },
      include: { goals: { include: { checkins: { take: 1, orderBy: { createdAt: 'desc' } } } } },
    });

    const goals = sheets.flatMap((s) => s.goals);
    const achievedGoals = goals.filter((g) => (g.checkins[0]?.progressScore ?? 0) === 100).length;

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
    const activeCycle = await db.goalCycle.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    const pendingApprovals = await db.goalSheet.count({
      where: { status: GoalSheetStatus.SUBMITTED },
    });

    const pendingCheckins = await db.quarterlyCheckin.count({
      where: { status: CheckinStatus.NOT_STARTED },
    });

    const totalUsers = await db.user.count();
    const totalDepartments = await db.department.count();

    return {
      activeCycle,
      pendingApprovalsCount: pendingApprovals,
      pendingCheckinsCount: pendingCheckins,
      totalUsers,
      totalDepartments,
    };
  },

  async getUserActivityFeed(userId: string, limit: number = 20) {
    const auditLogs = await db.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return auditLogs.map((log) => ({
      action: log.actionType,
      entity: log.entityType,
      timestamp: log.createdAt,
      changes: log.changes,
    }));
  },
};
