import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { approvalService } from '@/services';
import db from '@/lib/db';
import { GoalSheetStatus, UserRole } from '@prisma/client';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can unlock
    if (session.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Only admins can unlock goal sheets' },
        { status: 403 },
      );
    }

    // Fetch goal sheet
    const goalSheet = await db.goalSheet.findUnique({
      where: { id: params.id },
    });

    if (!goalSheet) {
      return NextResponse.json(
        { success: false, error: 'Goal sheet not found' },
        { status: 404 },
      );
    }

    // Check if goal sheet is actually locked
    if (goalSheet.status !== GoalSheetStatus.LOCKED && goalSheet.status !== GoalSheetStatus.APPROVED) {
      return NextResponse.json(
        { success: false, error: 'Only LOCKED or APPROVED goal sheets can be unlocked' },
        { status: 400 },
      );
    }

    const sheet = await approvalService.unlockGoalSheet(params.id, session.id);
    return NextResponse.json({ success: true, data: sheet }, { status: 200 });
  } catch (error) {
    console.error('Error unlocking goal sheet:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
