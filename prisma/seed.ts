import { PrismaClient, UserRole, GoalSheetStatus, UomType, Quarter, CheckinStatus, CycleStatus } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.checkinComment.deleteMany();
  await prisma.quarterlyCheckin.deleteMany();
  await prisma.approvalAction.deleteMany();
  await prisma.sharedGoalAssignment.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.goalSheet.deleteMany();
  await prisma.reportingManagerRelation.deleteMany();
  await prisma.employeeProfile.deleteMany();
  await prisma.goalCycle.deleteMany();
  await prisma.sharedGoalTemplate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  const deptEngineering = await prisma.department.create({
    data: {
      name: 'Engineering',
      description: 'Product Engineering Team',
    },
  });

  const deptSales = await prisma.department.create({
    data: {
      name: 'Sales & Marketing',
      description: 'Sales and Marketing Team',
    },
  });

  console.log('✅ Departments created');
  const hashedAdminPassword = await bcryptjs.hash('Admin@123', 10);
  const hashedManagerPassword = await bcryptjs.hash('Manager@123', 10);
  const hashedEmployeePassword = await bcryptjs.hash('Employee@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
      departmentId: deptEngineering.id,
    },
  });

  const manager1 = await prisma.user.create({
    data: {
      email: 'manager1@demo.com',
      password: hashedManagerPassword,
      name: 'Manager One',
      role: UserRole.MANAGER,
      departmentId: deptEngineering.id,
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      email: 'manager2@demo.com',
      password: hashedManagerPassword,
      name: 'Manager Two',
      role: UserRole.MANAGER,
      departmentId: deptSales.id,
    },
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'employee1@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee One',
      role: UserRole.EMPLOYEE,
      departmentId: deptEngineering.id,
    },
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'employee2@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee Two',
      role: UserRole.EMPLOYEE,
      departmentId: deptEngineering.id,
    },
  });

  const employee3 = await prisma.user.create({
    data: {
      email: 'employee3@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee Three',
      role: UserRole.EMPLOYEE,
      departmentId: deptSales.id,
    },
  });

  const employee4 = await prisma.user.create({
    data: {
      email: 'employee4@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee Four',
      role: UserRole.EMPLOYEE,
      departmentId: deptSales.id,
    },
  });

  const employee5 = await prisma.user.create({
    data: {
      email: 'employee5@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee Five',
      role: UserRole.EMPLOYEE,
      departmentId: deptEngineering.id,
    },
  });

  const employee6 = await prisma.user.create({
    data: {
      email: 'employee6@demo.com',
      password: hashedEmployeePassword,
      name: 'Employee Six',
      role: UserRole.EMPLOYEE,
      departmentId: deptSales.id,
    },
  });

  console.log('✅ Users created');
  await prisma.employeeProfile.createMany({
    data: [
      { userId: employee1.id, employeeId: 'EMP001' },
      { userId: employee2.id, employeeId: 'EMP002' },
      { userId: employee3.id, employeeId: 'EMP003' },
      { userId: employee4.id, employeeId: 'EMP004' },
      { userId: employee5.id, employeeId: 'EMP005' },
      { userId: employee6.id, employeeId: 'EMP006' },
    ],
  });

  console.log('✅ Employee profiles created');
  const now = new Date();
  const cycle = await prisma.goalCycle.create({
    data: {
      name: 'FY 2024-25 Q1',
      status: CycleStatus.ACTIVE,
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: new Date(now.getFullYear(), 2, 31),
      q1StartDate: new Date(now.getFullYear(), 0, 1),
      q1EndDate: new Date(now.getFullYear(), 2, 31),
      q2StartDate: new Date(now.getFullYear(), 3, 1),
      q2EndDate: new Date(now.getFullYear(), 5, 30),
      q3StartDate: new Date(now.getFullYear(), 6, 1),
      q3EndDate: new Date(now.getFullYear(), 8, 30),
      q4StartDate: new Date(now.getFullYear(), 9, 1),
      q4EndDate: new Date(now.getFullYear(), 11, 31),
    },
  });

  console.log('✅ Goal cycle created');
  await prisma.reportingManagerRelation.createMany({
    data: [
      { employeeId: employee1.id, managerId: manager1.id, cycleId: cycle.id },
      { employeeId: employee2.id, managerId: manager1.id, cycleId: cycle.id },
      { employeeId: employee5.id, managerId: manager1.id, cycleId: cycle.id },
      { employeeId: employee3.id, managerId: manager2.id, cycleId: cycle.id },
      { employeeId: employee4.id, managerId: manager2.id, cycleId: cycle.id },
      { employeeId: employee6.id, managerId: manager2.id, cycleId: cycle.id },
    ],
  });

  console.log('✅ Reporting relations created');
  const goalSheet1 = await prisma.goalSheet.create({
    data: {
      employeeId: employee1.id,
      cycleId: cycle.id,
      status: GoalSheetStatus.DRAFT,
      totalWeightage: 0,
    },
  });
  const goalSheet2 = await prisma.goalSheet.create({
    data: {
      employeeId: employee2.id,
      cycleId: cycle.id,
      status: GoalSheetStatus.SUBMITTED,
      totalWeightage: 100,
      submittedAt: new Date(),
    },
  });
  const goalSheet3 = await prisma.goalSheet.create({
    data: {
      employeeId: employee3.id,
      cycleId: cycle.id,
      status: GoalSheetStatus.APPROVED,
      totalWeightage: 100,
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      isLocked: true,
      lockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Goal sheets created');
  const goal1 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: 'Customer Satisfaction',
      title: 'Improve API Response Time',
      description: 'Reduce API response time to below 200ms for 95% of requests',
      uomType: UomType.NUMERIC_MAX,
      target: 200,
      weightage: 25,
    },
  });
  const goal2 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet1.id,
      thrustArea: 'Operational Efficiency',
      title: 'Reduce Bug Count',
      description: 'Reduce critical bugs in production by 50%',
      uomType: UomType.NUMERIC_MIN,
      target: 10,
      weightage: 30,
    },
  });
  const goal3 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet2.id,
      thrustArea: 'Revenue Growth',
      title: 'Increase Monthly Sales',
      description: 'Achieve $500k in monthly sales',
      uomType: UomType.NUMERIC_MAX,
      target: 500000,
      weightage: 50,
    },
  });
  const goal4 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet2.id,
      thrustArea: 'Customer Satisfaction',
      title: 'Improve NPS Score',
      description: 'Achieve NPS score of 70+',
      uomType: UomType.NUMERIC_MAX,
      target: 70,
      weightage: 50,
    },
  });
  const goal5 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet3.id,
      thrustArea: 'Team Development',
      title: 'Onboard New Team Members',
      description: 'Successfully onboard 3 new team members',
      uomType: UomType.NUMERIC_MAX,
      target: 3,
      weightage: 40,
    },
  });
  const goal6 = await prisma.goal.create({
    data: {
      goalSheetId: goalSheet3.id,
      thrustArea: 'Process Improvement',
      title: 'Document Processes',
      description: 'Document all key business processes',
      uomType: UomType.PERCENT_MAX,
      target: 100,
      weightage: 60,
    },
  });

  console.log('✅ Goals created');
  await prisma.approvalAction.create({
    data: {
      goalSheetId: goalSheet2.id,
      actionType: 'SUBMITTED',
      actionBy: employee2.id,
      comments: 'Submitting goals for Q1 2024-25',
    },
  });
  await prisma.approvalAction.create({
    data: {
      goalSheetId: goalSheet3.id,
      actionType: 'SUBMITTED',
      actionBy: employee3.id,
    },
  });

  await prisma.approvalAction.create({
    data: {
      goalSheetId: goalSheet3.id,
      actionType: 'APPROVED',
      actionBy: manager2.id,
      comments: 'All goals approved. Good targets set.',
    },
  });

  console.log('✅ Approval actions created');
  const checkin1 = await prisma.quarterlyCheckin.create({
    data: {
      goalId: goal5.id,
      goalSheetId: goalSheet3.id,
      quarter: Quarter.Q1,
      status: CheckinStatus.ON_TRACK,
      actualValue: 2,
      progressScore: 66.67,
      comments: 'Currently on track, 2 team members onboarded so far',
    },
  });
  const checkin2 = await prisma.quarterlyCheckin.create({
    data: {
      goalId: goal6.id,
      goalSheetId: goalSheet3.id,
      quarter: Quarter.Q1,
      status: CheckinStatus.ON_TRACK,
      actualValue: 75,
      progressScore: 75,
      comments: '75% of processes documented',
    },
  });

  console.log('✅ Quarterly checkins created');
  await prisma.checkinComment.create({
    data: {
      checkinId: checkin1.id,
      commentBy: manager2.id,
      comment: 'Good progress. Ensure quality during onboarding.',
    },
  });
  await prisma.checkinComment.create({
    data: {
      checkinId: checkin2.id,
      commentBy: manager2.id,
      comment: 'Great work on documentation. Keep it up!',
    },
  });

  console.log('✅ Checkin comments created');
  await prisma.auditLog.create({
    data: {
      entityType: 'GOAL_SHEET',
      entityId: goalSheet2.id,
      actionType: 'SUBMIT',
      userId: employee2.id,
      goalSheetId: goalSheet2.id,
    },
  });
  await prisma.auditLog.create({
    data: {
      entityType: 'GOAL_SHEET',
      entityId: goalSheet3.id,
      actionType: 'APPROVE',
      userId: manager2.id,
      goalSheetId: goalSheet3.id,
    },
  });

  console.log('✅ Audit logs created');

  console.log('🌱 Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
