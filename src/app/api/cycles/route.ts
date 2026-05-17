import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { goalCycleService } from '@/services';
import { createCycleSchema } from '@/lib/validations/cycle';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const skip = Number(request.nextUrl.searchParams.get('skip')) || 0;
    const take = Number(request.nextUrl.searchParams.get('take')) || 10;

    const cycles = await goalCycleService.getAllCycles(skip, take);
    return NextResponse.json({ success: true, data: cycles }, { status: 200 });
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
    const validation = createCycleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: validation.error.errors },
        { status: 400 },
      );
    }

    const cycle = await goalCycleService.createCycle(validation.data);
    return NextResponse.json({ success: true, data: cycle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

