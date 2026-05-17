import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalCycleService } from '@/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await goalCycleService.getCycleProgressStats(params.id);
    return NextResponse.json({ success: true, data: stats }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
