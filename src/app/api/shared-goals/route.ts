import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sharedGoalService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const skip = Number(request.nextUrl.searchParams.get('skip')) || 0;
    const take = Number(request.nextUrl.searchParams.get('take')) || 10;

    const templates = await sharedGoalService.getAllTemplates(skip, take);
    return NextResponse.json({ success: true, data: templates }, { status: 200 });
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
    const template = await sharedGoalService.createTemplate({
      ...body,
      createdBy: session.id,
    });

    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

