export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface CreateGoalRequest {
  thrustArea: string;
  title: string;
  description: string;
  uomType: string;
  target: number;
  weightage: number;
  baselineValue?: number;
  minTarget?: number;
  maxTarget?: number;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  id: string;
}

export interface CreateGoalSheetRequest {
  cycleId: string;
  goals: CreateGoalRequest[];
}

export interface SubmitGoalSheetRequest {
  goalSheetId: string;
}

export interface ApproveGoalSheetRequest {
  goalSheetId: string;
  comments?: string;
}

export interface ReturnGoalSheetRequest {
  goalSheetId: string;
  comments: string;
}

export interface UnlockGoalSheetRequest {
  goalSheetId: string;
  comments?: string;
}

export interface CreateCheckinRequest {
  goalId: string;
  quarter: string;
  actualValue: number;
  status: string;
  comments?: string;
}

export interface UpdateCheckinRequest {
  checkinId: string;
  actualValue?: number;
  status?: string;
  comments?: string;
}

export interface AddCheckinCommentRequest {
  checkinId: string;
  comment: string;
}

export interface CreateCycleRequest {
  name: string;
  startDate: string;
  endDate: string;
  q1StartDate?: string;
  q1EndDate?: string;
  q2StartDate?: string;
  q2EndDate?: string;
  q3StartDate?: string;
  q3EndDate?: string;
  q4StartDate?: string;
  q4EndDate?: string;
}

export interface UpdateCycleRequest extends Partial<CreateCycleRequest> {
  cycleId: string;
}

export interface CreateSharedGoalRequest {
  title: string;
  description: string;
  thrustArea: string;
  uomType: string;
  target: number;
  baselineValue?: number;
  minTarget?: number;
  maxTarget?: number;
}

export interface AssignSharedGoalRequest {
  sharedGoalId: string;
  employeeIds: string[];
  weightages: Record<string, number>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface DashboardSummaryResponse {
  role: string;
  totalGoalsThis: number;
  approvedGoals: number;
  pendingReview: number;
  completedCheckins: number;
  overallScore: number;
  recentActivities: Array<{
    id: string;
    action: string;
    timestamp: string;
    details: string;
  }>;
}
