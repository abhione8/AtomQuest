import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { approvalService } from '@/services';
import db from '@/lib/db';
import { GoalSheetStatus, UserRole } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers and admins can return
    if (session.role !== UserRole.MANAGER && session.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Only managers and admins can return goal sheets' },
        { status: 403 },
      );
    }

    // Fetch goal sheet
    const goalSheet = await db.goalSheet.findUnique({
      where: { id: params.id },
      include: { employee: true },
    });

    if (!goalSheet) {
      return NextResponse.json(
        { success: false, error: 'Goal sheet not found' },
        { status: 404 },
      );
    }

    // Check if manager is reviewing their direct reports (MANAGER role)
    if (session.role === UserRole.MANAGER) {
      const isDirectReport = await db.reportingManagerRelation.findFirst({
        where: { managerId: session.id, employeeId: goalSheet.employeeId },
      });

      if (!isDirectReport) {
        return NextResponse.json(
          { success: false, error: 'Can only return goal sheets for your direct reports' },
          { status: 403 },
        );
      }
    }

    // Check if goal sheet is in SUBMITTED status
    if (goalSheet.status !== GoalSheetStatus.SUBMITTED) {
      return NextResponse.json(
        { success: false, error: 'Only SUBMITTED goal sheets can be returned' },
        { status: 400 },
      );
    }

    const body = await request.json();
    const sheet = await approvalService.returnGoalSheet(params.id, session.id, body.reason);

    return NextResponse.json({ success: true, data: sheet }, { status: 200 });
  } catch (error) {
    console.error('Error returning goal sheet:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
