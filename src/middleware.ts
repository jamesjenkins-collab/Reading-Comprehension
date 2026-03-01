import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /teacher routes; allow /teacher/login through
    if (pathname.startsWith('/teacher') && !pathname.startsWith('/teacher/login')) {
        const token = request.cookies.get('teacher_session')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/teacher/login', request.url));
        }

        try {
            const jwtSecret = process.env.JWT_SECRET || 'reading_intervention_fallback_secret_2026';

            // Verify using custom Web Crypto JWT implemention to prevent Edge decoding errors
            await verifyJWT(token, jwtSecret);
            return NextResponse.next();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'UnknownError';
            console.error('Middleware JWT Error:', errorMsg);

            // Token invalid or expired
            const redirectUrl = new URL('/teacher/login', request.url);
            redirectUrl.searchParams.set('error', 'session_invalid');
            redirectUrl.searchParams.set('reason', errorMsg.substring(0, 50));

            const response = NextResponse.redirect(redirectUrl);
            response.cookies.set('teacher_session', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/teacher/:path*'],
};
