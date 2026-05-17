import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireRole } from '@/lib/session';
import { dashboardService } from '@/services';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    let dashboardData;

    if (session.role === UserRole.ADMIN) {
      dashboardData = await dashboardService.getAdminDashboard();
    } else if (session.role === UserRole.MANAGER) {
      dashboardData = await dashboardService.getManagerDashboard(session.id);
    } else {
      dashboardData = await dashboardService.getEmployeeDashboard(session.id);
    }

    return NextResponse.json({ success: true, data: dashboardData }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

