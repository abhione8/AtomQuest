import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { reportService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sheetId = request.nextUrl.searchParams.get('sheetId');
    if (!sheetId) {
      return NextResponse.json(
        { success: false, error: 'sheetId parameter required' },
        { status: 400 },
      );
    }

    const report = await reportService.getGoalSheetReport(sheetId);
    return NextResponse.json({ success: true, data: report }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

