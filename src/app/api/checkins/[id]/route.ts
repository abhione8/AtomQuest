import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { checkinService } from '@/services';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const checkin = await checkinService.getCheckinById(params.id);
    if (!checkin) {
      return NextResponse.json({ success: false, error: 'Checkin not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: checkin }, { status: 200 });
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

    const body = await request.json();
    const checkin = await checkinService.updateCheckin(params.id, body, session.id);

    return NextResponse.json({ success: true, data: checkin }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
