import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const publicRoutes = ['/login', '/register', '/'];
const protectedRoutes = [
  '/employee',
  '/manager',
  '/admin',
  '/api/goals',
  '/api/checkins',
  '/api/approvals',
  '/api/unlock',
  '/api/shared-goals',
  '/api/reports',
  '/api/audit',
  '/api/dashboard',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Check role-based access
  if (pathname.startsWith('/employee') && payload.role !== 'EMPLOYEE') {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/manager') && payload.role !== 'MANAGER') {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Add user info to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('X-User-Id', payload.userId);
  requestHeaders.set('X-User-Role', payload.role);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
