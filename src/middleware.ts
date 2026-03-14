import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

const ROLE_ROUTES: Record<string, string[]> = {
  '/admin': ['super_admin'],
  '/venue-owner': ['venue_owner', 'super_admin'],
  '/staff': ['staff', 'venue_owner', 'super_admin'],
  '/my-bookings': ['customer', 'super_admin'],
  '/booking': ['customer'],
};

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin: '/admin-dashboard',
  venue_owner: '/dashboard',
  staff: '/staff-dashboard',
  customer: '/',
};

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(path)}`, req.url)
      );
    }

    const role = token.role as string;

    for (const [routePrefix, allowedRoles] of Object.entries(ROLE_ROUTES)) {
      if (path.startsWith(routePrefix) && !allowedRoles.includes(role)) {
        const dashboard = ROLE_DASHBOARDS[role] || '/';
        return NextResponse.redirect(new URL(dashboard, req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courts/new',
    '/courts/:courtId/edit',
    '/bookings',
    '/schedule/:path*',
    '/settings/:path*',
    '/staff-dashboard/:path*',
    '/staff-bookings/:path*',
    '/check-in/:path*',
    '/admin-dashboard/:path*',
    '/admin-venues/:path*',
    '/admin-users/:path*',
    '/admin-bookings/:path*',
    '/admin-sports/:path*',
    '/my-bookings/:path*',
    '/booking/:path*',
  ],
};
