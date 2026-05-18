import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalSheetService } from '@/services';
import db from '@/lib/db';
import { TOTAL_WEIGHTAGE_REQUIRED, MIN_GOALS_PER_SHEET } from '@/lib/constants';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the goal sheet with goals
    const goalSheet = await db.goalSheet.findUnique({
      where: { id: params.id },
      include: { goals: true },
    });

    if (!goalSheet) {
      return NextResponse.json(
        { success: false, error: 'Goal sheet not found' },
        { status: 404 },
      );
    }

    // Check ownership (employees can only submit their own)
    if (session.role === 'EMPLOYEE' && goalSheet.employeeId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    // RULE 3: Check minimum goals
    if (goalSheet.goals.length < MIN_GOALS_PER_SHEET) {
      return NextResponse.json(
        { success: false, error: 'At least one goal is required' },
        { status: 400 },
      );
    }

    // RULE 3: Check total weightage = 100%
    const totalWeightage = goalSheet.goals.reduce((sum, goal) => sum + goal.weightage, 0);
    if (totalWeightage !== TOTAL_WEIGHTAGE_REQUIRED) {
      return NextResponse.json(
        { success: false, error: `Total weightage must equal ${TOTAL_WEIGHTAGE_REQUIRED}%. Current: ${totalWeightage}%` },
        { status: 400 },
      );
    }

    const sheet = await goalSheetService.submitGoalSheet(params.id, session.id);
    return NextResponse.json({ success: true, data: sheet }, { status: 200 });
  } catch (error) {
    console.error('Error submitting goal sheet:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
