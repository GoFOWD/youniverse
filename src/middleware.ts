
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
    const isApiAdminRoute = request.nextUrl.pathname.startsWith('/api/admin');
    const isLoginRoute = request.nextUrl.pathname === '/admin/login';
    const isApiLoginRoute = request.nextUrl.pathname === '/api/admin/login';

    // Skip middleware for login routes
    if (isLoginRoute || isApiLoginRoute) {
        return NextResponse.next();
    }

    // Protect Admin Routes (Pages & API)
    if (isAdminRoute || isApiAdminRoute) {
        const adminSession = request.cookies.get('admin_session')?.value;

        if (!adminSession) {
            // If it's an API call, return 401
            if (isApiAdminRoute) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            // If it's a page visit, redirect to login
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
