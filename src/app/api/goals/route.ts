import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalService } from '@/services';
import { goalSchema } from '@/lib/validations/goal';
import { MAX_GOALS_PER_SHEET, MIN_WEIGHTAGE_PER_GOAL } from '@/lib/constants';
import db from '@/lib/db';
import { GoalSheetStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = goalSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.errors },
        { status: 400 },
      );
    }

    const goalSheetId = body.goalSheetId;
    
    // Fetch the goal sheet
    const goalSheet = await db.goalSheet.findUnique({
      where: { id: goalSheetId },
      include: { goals: true, employee: true },
    });

    if (!goalSheet) {
      return NextResponse.json(
        { success: false, error: 'Goal sheet not found' },
        { status: 404 },
      );
    }

    // Check if user owns the goal sheet (employees can only edit their own)
    if (session.role === 'EMPLOYEE' && goalSheet.employeeId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    // Check if goal sheet is in editable state
    if (goalSheet.status !== GoalSheetStatus.DRAFT && goalSheet.status !== GoalSheetStatus.RETURNED) {
      return NextResponse.json(
        { success: false, error: 'Goal sheet is locked. Only DRAFT or RETURNED sheets can be edited.' },
        { status: 400 },
      );
    }

    // RULE 1: Check max 8 goals
    if (goalSheet.goals.length >= MAX_GOALS_PER_SHEET) {
      return NextResponse.json(
        { success: false, error: `Maximum ${MAX_GOALS_PER_SHEET} goals per sheet allowed` },
        { status: 400 },
      );
    }

    // RULE 2: Check min 10% weightage
    if (validation.data.weightage < MIN_WEIGHTAGE_PER_GOAL) {
      return NextResponse.json(
        { success: false, error: `Minimum weightage per goal is ${MIN_WEIGHTAGE_PER_GOAL}%` },
        { status: 400 },
      );
    }

    const goal = await goalService.createGoal({
      ...validation.data,
      goalSheetId: goalSheetId,
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

