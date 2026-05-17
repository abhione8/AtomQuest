import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export const userService = {
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true, department: true },
    });
  },

  async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { employeeProfile: true },
    });
  },

  async getEmployeeManager(employeeId: string) {
    const employee = await prisma.user.findUnique({
      where: { id: employeeId },
      include: { employeeProfile: { include: { reportingManager: true } } },
    });
    return employee?.employeeProfile?.reportingManager || null;
  },

  async getManagerDirectReports(managerId: string) {
    return prisma.user.findMany({
      where: { employeeProfile: { reportingManagerId: managerId } },
      include: { employeeProfile: true, department: true },
    });
  },

  async getAllAdmins() {
    return prisma.user.findMany({
      where: { role: UserRole.ADMIN },
      include: { department: true },
    });
  },

  async getAllManagers() {
    return prisma.user.findMany({
      where: { role: UserRole.MANAGER },
      include: { department: true },
    });
  },

  async getUsersByDepartment(departmentId: string) {
    return prisma.user.findMany({
      where: { departmentId },
      include: { employeeProfile: true },
    });
  },

  async getUsersByRole(role: UserRole) {
    return prisma.user.findMany({
      where: { role },
      include: { department: true, employeeProfile: true },
    });
  },

  async updateUserProfile(userId: string, data: { name?: string; email?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data,
      include: { employeeProfile: true },
    });
  },

  async countUsersByRole() {
    const admins = await prisma.user.count({ where: { role: UserRole.ADMIN } });
    const managers = await prisma.user.count({ where: { role: UserRole.MANAGER } });
    const employees = await prisma.user.count({ where: { role: UserRole.EMPLOYEE } });
    return { admins, managers, employees };
  },

  async getUserWithGoalSheets(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        goalSheets: { include: { goals: true } },
        employeeProfile: { include: { reportingManager: true } },
      },
    });
  },
};
