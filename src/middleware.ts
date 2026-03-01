import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only protect /teacher routes; allow /teacher/login through
    if (pathname.startsWith('/teacher') && !pathname.startsWith('/teacher/login')) {
        const token = request.cookies.get('teacher_session')?.value;

        if (!token) {
            return NextResponse.redirect(new URL('/teacher/login', request.url));
        }

        try {
            const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
            await jwtVerify(token, secret);
            return NextResponse.next();
        } catch {
            // Token invalid or expired
            const response = NextResponse.redirect(new URL('/teacher/login', request.url));
            response.cookies.set('teacher_session', '', { maxAge: 0, path: '/' });
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/teacher/:path*'],
};
