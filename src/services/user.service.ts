import db from '@/lib/db';
import { UserRole } from '@prisma/client';

export const userService = {
  async getUserById(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true, department: true },
    });
  },

  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: { email },
      include: { employeeProfile: true },
    });
  },

  async getEmployeeManager(employeeId: string) {
    const manager = await db.reportingManagerRelation.findFirst({
      where: { employeeId },
      include: { manager: true },
    });
    return manager?.manager || null;
  },

  async getManagerDirectReports(managerId: string) {
    const relations = await db.reportingManagerRelation.findMany({
      where: { managerId },
      include: { employee: { include: { employeeProfile: true, department: true } } },
    });
    return relations.map((r) => r.employee);
  },

  async getAllAdmins() {
    return db.user.findMany({
      where: { role: UserRole.ADMIN },
      include: { department: true },
    });
  },

  async getAllManagers() {
    return db.user.findMany({
      where: { role: UserRole.MANAGER },
      include: { department: true },
    });
  },

  async getUsersByDepartment(departmentId: string) {
    return db.user.findMany({
      where: { departmentId },
      include: { employeeProfile: true },
    });
  },

  async getUsersByRole(role: UserRole) {
    return db.user.findMany({
      where: { role },
      include: { department: true, employeeProfile: true },
    });
  },

  async updateUserProfile(userId: string, data: { name?: string; email?: string }) {
    return db.user.update({
      where: { id: userId },
      data,
      include: { employeeProfile: true },
    });
  },

  async countUsersByRole() {
    const admins = await db.user.count({ where: { role: UserRole.ADMIN } });
    const managers = await db.user.count({ where: { role: UserRole.MANAGER } });
    const employees = await db.user.count({ where: { role: UserRole.EMPLOYEE } });
    return { admins, managers, employees };
  },

  async getUserWithGoalSheets(userId: string) {
    return db.user.findUnique({
      where: { id: userId },
      include: {
        goalSheets: { include: { goals: true } },
        employeeProfile: true,
      },
    });
  },
};
