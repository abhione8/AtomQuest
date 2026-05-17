import { UserRole, GoalSheetStatus, UomType, Quarter, CheckinStatus } from '@prisma/client';

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.MANAGER]: 'Manager',
  [UserRole.EMPLOYEE]: 'Employee',
};

export const STATUS_LABELS: Record<GoalSheetStatus, string> = {
  [GoalSheetStatus.DRAFT]: 'Draft',
  [GoalSheetStatus.SUBMITTED]: 'Submitted',
  [GoalSheetStatus.RETURNED]: 'Returned',
  [GoalSheetStatus.APPROVED]: 'Approved',
  [GoalSheetStatus.LOCKED]: 'Locked',
};

export const UOM_LABELS: Record<UomType, string> = {
  [UomType.NUMERIC_MIN]: 'Numeric (Minimize)',
  [UomType.NUMERIC_MAX]: 'Numeric (Maximize)',
  [UomType.PERCENT_MIN]: 'Percentage (Minimize)',
  [UomType.PERCENT_MAX]: 'Percentage (Maximize)',
  [UomType.TIMELINE]: 'Timeline/Date',
  [UomType.ZERO_BASED]: 'Zero-based',
};

export const QUARTER_LABELS: Record<Quarter, string> = {
  [Quarter.Q1]: 'Q1',
  [Quarter.Q2]: 'Q2',
  [Quarter.Q3]: 'Q3',
  [Quarter.Q4]: 'Q4',
  [Quarter.ANNUAL]: 'Annual',
};

export const CHECKIN_STATUS_LABELS: Record<CheckinStatus, string> = {
  [CheckinStatus.NOT_STARTED]: 'Not Started',
  [CheckinStatus.ON_TRACK]: 'On Track',
  [CheckinStatus.COMPLETED]: 'Completed',
};

export const MIN_GOALS_PER_SHEET = 1;
export const MAX_GOALS_PER_SHEET = 8;
export const MIN_WEIGHTAGE_PER_GOAL = 10;
export const TOTAL_WEIGHTAGE_REQUIRED = 100;

export const DEMO_ACCOUNTS = {
  ADMIN: { email: 'admin@demo.com', password: 'Admin@123' },
  MANAGER1: { email: 'manager1@demo.com', password: 'Manager@123' },
  MANAGER2: { email: 'manager2@demo.com', password: 'Manager@123' },
  EMPLOYEE1: { email: 'employee1@demo.com', password: 'Employee@123' },
  EMPLOYEE2: { email: 'employee2@demo.com', password: 'Employee@123' },
};
