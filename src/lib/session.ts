import { getCurrentUser } from './auth';
import { UserRole } from '@prisma/client';
import { db } from './db';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  departmentId: string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      departmentId: user.departmentId,
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden');
  }
  return session;
}

export async function getEmployeeManager(employeeId: string): Promise<any | null> {
  const relation = await db.reportingManagerRelation.findFirst({
    where: { employeeId },
    include: { manager: true },
  });
  return relation?.manager || null;
}

export async function getManagerDirectReports(managerId: string): Promise<any[]> {
  const relations = await db.reportingManagerRelation.findMany({
    where: { managerId },
    include: { employee: true },
  });
  return relations.map((r) => r.employee);
}
