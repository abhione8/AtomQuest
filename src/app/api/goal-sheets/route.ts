import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalSheetService } from '@/services';

export async function GET(_request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sheets = await goalSheetService.getEmployeeGoalSheets(session.id);
    return NextResponse.json({ success: true, data: sheets }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const sheet = await goalSheetService.createGoalSheet({
      employeeId: session.id,
      cycleId: body.cycleId,
    });

    return NextResponse.json({ success: true, data: sheet }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

