import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalService } from '@/services';
import db from '@/lib/db';
import { GoalSheetStatus } from '@prisma/client';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const goal = await goalService.getGoalById(params.id);
    if (!goal) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: goal }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch goal with its goal sheet
    const goal = await db.goal.findUnique({
      where: { id: params.id },
      include: { goalSheet: true },
    });

    if (!goal) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
    }

    // RULE 4: Check if goal sheet is locked
    if (goal.goalSheet.status === GoalSheetStatus.LOCKED || goal.goalSheet.status === GoalSheetStatus.APPROVED) {
      return NextResponse.json(
        { success: false, error: 'Cannot edit goals in approved or locked sheets' },
        { status: 400 },
      );
    }

    // Check ownership (employees can only edit their own sheet goals)
    if (session.role === 'EMPLOYEE' && goal.goalSheet.employeeId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const updatedGoal = await goalService.updateGoal(params.id, body, session.id);

    return NextResponse.json({ success: true, data: updatedGoal }, { status: 200 });
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch goal with its goal sheet
    const goal = await db.goal.findUnique({
      where: { id: params.id },
      include: { goalSheet: true },
    });

    if (!goal) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
    }

    // RULE 4: Check if goal sheet is locked
    if (goal.goalSheet.status === GoalSheetStatus.LOCKED || goal.goalSheet.status === GoalSheetStatus.APPROVED) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete goals in approved or locked sheets' },
        { status: 400 },
      );
    }

    // Check ownership (employees can only delete their own sheet goals)
    if (session.role === 'EMPLOYEE' && goal.goalSheet.employeeId !== session.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    await goalService.deleteGoal(params.id, session.id);
    return NextResponse.json({ success: true, message: 'Goal deleted' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
