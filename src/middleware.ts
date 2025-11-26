
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Only apply to /api/admin/*
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
        const adminToken = request.cookies.get('admin_token')?.value;

        // Simple check - in production this should be a secure verification
        // For now, we assume if the token exists, it's valid, or check against an env var
        if (!adminToken) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/api/admin/:path*',
};
