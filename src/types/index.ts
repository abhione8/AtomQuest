import { 
  User,
  Goal,
  GoalSheet,
  GoalCycle,
  QuarterlyCheckin,
  AuditLog,
  SharedGoalTemplate,
  ApprovalAction,
  UserRole,
  GoalSheetStatus,
  UomType,
  Quarter,
  CheckinStatus,
  CycleStatus,
  AuditEntityType,
  AuditActionType,
  ApprovalActionType,
} from '@prisma/client';

// Re-export Prisma types
export type {
  User,
  Goal,
  GoalSheet,
  GoalCycle,
  QuarterlyCheckin,
  AuditLog,
  SharedGoalTemplate,
  ApprovalAction,
  UserRole,
  GoalSheetStatus,
  UomType,
  Quarter,
  CheckinStatus,
  CycleStatus,
  AuditEntityType,
  AuditActionType,
  ApprovalActionType,
};

// Extended types
export interface GoalWithCheckins extends Goal {
  checkins: QuarterlyCheckin[];
}

export interface GoalSheetWithGoals extends GoalSheet {
  goals: Goal[];
  employee: User;
  cycle: GoalCycle;
}

export interface GoalSheetWithDetails extends GoalSheetWithGoals {
  approvalActions: ApprovalAction[];
  checkins: QuarterlyCheckin[];
}

export interface UserWithProfile extends User {
  employeeProfile?: any;
  directReports?: any[];
}

export interface DashboardStats {
  totalGoals: number;
  approvedGoals: number;
  pendingReview: number;
  completedCheckins: number;
  overallScore: number;
}
