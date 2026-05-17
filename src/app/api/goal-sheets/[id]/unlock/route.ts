import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { approvalService } from '@/services';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const sheet = await approvalService.unlockGoalSheet(params.id, session.id);
    return NextResponse.json({ success: true, data: sheet }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
