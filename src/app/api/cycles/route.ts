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

    const cycle = await goalCycleService.createCycle({
      ...validation.data,
      startDate: new Date(validation.data.startDate),
      endDate: new Date(validation.data.endDate),
      q1StartDate: validation.data.q1StartDate ? new Date(validation.data.q1StartDate) : undefined,
      q1EndDate: validation.data.q1EndDate ? new Date(validation.data.q1EndDate) : undefined,
      q2StartDate: validation.data.q2StartDate ? new Date(validation.data.q2StartDate) : undefined,
      q2EndDate: validation.data.q2EndDate ? new Date(validation.data.q2EndDate) : undefined,
      q3StartDate: validation.data.q3StartDate ? new Date(validation.data.q3StartDate) : undefined,
      q3EndDate: validation.data.q3EndDate ? new Date(validation.data.q3EndDate) : undefined,
      q4StartDate: validation.data.q4StartDate ? new Date(validation.data.q4StartDate) : undefined,
      q4EndDate: validation.data.q4EndDate ? new Date(validation.data.q4EndDate) : undefined,
    });
    return NextResponse.json({ success: true, data: cycle }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

