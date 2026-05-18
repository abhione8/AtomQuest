import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { checkinService } from '@/services';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const checkin = await checkinService.submitCheckin(params.id, session.id);
    return NextResponse.json({ success: true, data: checkin }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
