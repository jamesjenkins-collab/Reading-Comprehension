import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/session';
import { SESSION_SECRET, COOKIE_NAME } from '@/lib/config';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /teacher routes; allow /teacher/login through
    if (pathname.startsWith('/teacher') && !pathname.startsWith('/teacher/login')) {
        const token = request.cookies.get(COOKIE_NAME)?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/teacher/login', request.url));
        }

        try {
            // Verify using simple HMAC session cookie logic
            await verifySessionCookie(token, SESSION_SECRET);
            return NextResponse.next();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'UnknownError';
            console.error('Middleware JWT Error:', errorMsg);

            // Token invalid or expired
            const redirectUrl = new URL('/teacher/login', request.url);
            redirectUrl.searchParams.set('error', 'session_invalid');
            redirectUrl.searchParams.set('reason', errorMsg.substring(0, 50));

            const response = NextResponse.redirect(redirectUrl);
            response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/teacher/:path*'],
};
