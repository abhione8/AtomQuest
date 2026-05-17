import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { checkinService } from '@/services';
import { createCheckinSchema } from '@/lib/validations/checkin';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createCheckinSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.errors },
        { status: 400 },
      );
    }

    const checkin = await checkinService.createCheckin({
      ...validation.data,
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: checkin }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

