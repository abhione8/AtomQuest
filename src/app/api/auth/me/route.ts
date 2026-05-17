import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/session';
import { userService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userService.getUserById(session.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { password, ...safeUser } = user;
    return NextResponse.json(
      { success: true, data: safeUser },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

