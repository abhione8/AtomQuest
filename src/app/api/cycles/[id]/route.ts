import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalCycleService } from '@/services';
import { CycleStatus } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const cycle = await goalCycleService.getCycleById(params.id);
    if (!cycle) {
      return NextResponse.json({ success: false, error: 'Cycle not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: cycle }, { status: 200 });
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
    const { status } = body;

    if (!Object.values(CycleStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 },
      );
    }

    const cycle = await goalCycleService.updateCycleStatus(params.id, status);
    return NextResponse.json({ success: true, data: cycle }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await goalCycleService.closeCycle(params.id);
    return NextResponse.json({ success: true, message: 'Cycle closed' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
