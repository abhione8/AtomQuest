import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { reportService } from '@/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cycleId = request.nextUrl.searchParams.get('cycleId');
    if (!cycleId) {
      return NextResponse.json(
        { success: false, error: 'cycleId parameter required' },
        { status: 400 },
      );
    }

    const report = await reportService.getDepartmentReport(params.id, cycleId);
    return NextResponse.json({ success: true, data: report }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
