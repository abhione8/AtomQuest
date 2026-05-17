import { UserRole, GoalSheetStatus } from '@prisma/client';
import { SessionUser } from './session';

export interface Permission {
  canViewGoalSheet: boolean;
  canEditGoalSheet: boolean;
  canSubmitGoalSheet: boolean;
  canReviewGoalSheet: boolean;
  canApproveGoalSheet: boolean;
  canReturnGoalSheet: boolean;
  canUnlockGoalSheet: boolean;
  canCreateCheckin: boolean;
  canCommentCheckin: boolean;
  canManageCycles: boolean;
  canViewReports: boolean;
  canViewAuditLogs: boolean;
  canCreateSharedGoals: boolean;
  canAssignSharedGoals: boolean;
}

export function getPermissions(user: SessionUser, goalSheetStatus?: GoalSheetStatus): Permission {
  const basePermissions: Permission = {
    canViewGoalSheet: false,
    canEditGoalSheet: false,
    canSubmitGoalSheet: false,
    canReviewGoalSheet: false,
    canApproveGoalSheet: false,
    canReturnGoalSheet: false,
    canUnlockGoalSheet: false,
    canCreateCheckin: false,
    canCommentCheckin: false,
    canManageCycles: false,
    canViewReports: false,
    canViewAuditLogs: false,
    canCreateSharedGoals: false,
    canAssignSharedGoals: false,
  };

  if (user.role === UserRole.ADMIN) {
    return {
      ...basePermissions,
      canViewGoalSheet: true,
      canReviewGoalSheet: true,
      canApproveGoalSheet: true,
      canReturnGoalSheet: true,
      canUnlockGoalSheet: true,
      canManageCycles: true,
      canViewReports: true,
      canViewAuditLogs: true,
      canCreateSharedGoals: true,
      canAssignSharedGoals: true,
    };
  }

  if (user.role === UserRole.MANAGER) {
    return {
      ...basePermissions,
      canViewGoalSheet: true,
      canReviewGoalSheet: true,
      canApproveGoalSheet: true,
      canReturnGoalSheet: true,
      canCommentCheckin: true,
      canCreateCheckin: true,
      canViewReports: true,
      canViewAuditLogs: true,
      canCreateSharedGoals: true,
      canAssignSharedGoals: true,
    };
  }

  if (user.role === UserRole.EMPLOYEE) {
    return {
      ...basePermissions,
      canViewGoalSheet: true,
      canEditGoalSheet: goalSheetStatus === GoalSheetStatus.DRAFT || goalSheetStatus === GoalSheetStatus.RETURNED,
      canSubmitGoalSheet: goalSheetStatus === GoalSheetStatus.DRAFT || goalSheetStatus === GoalSheetStatus.RETURNED,
      canCreateCheckin: true,
    };
  }

  return basePermissions;
}

export function canAccessGoalSheet(user: SessionUser, goalSheetEmployeeId: string): boolean {
  if (user.role === UserRole.ADMIN) return true;
  if (user.role === UserRole.MANAGER) return true; // Manager can see team members
  if (user.role === UserRole.EMPLOYEE && user.id === goalSheetEmployeeId) return true;
  return false;
}

export function canEditGoal(user: SessionUser, goalSheetStatus: GoalSheetStatus, isShared: boolean, isOwner: boolean): boolean {
  // Own goals in DRAFT/RETURNED sheets can be edited by employee
  if (user.role === UserRole.EMPLOYEE && (goalSheetStatus === GoalSheetStatus.DRAFT || goalSheetStatus === GoalSheetStatus.RETURNED)) {
    return !isShared || isOwner;
  }

  // Manager can edit during review
  if (user.role === UserRole.MANAGER && goalSheetStatus === GoalSheetStatus.SUBMITTED) {
    return true;
  }

  // Shared goal recipients can only edit weightage
  if (isShared && !isOwner && user.role === UserRole.EMPLOYEE) {
    return true; // Can edit weightage only
  }

  return false;
}
