import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import CryptoJS from 'crypto-js';

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

            // Hash the secret to exactly 32 bytes (256 bits) using SHA256
            const hash = CryptoJS.SHA256(jwtSecret);
            const hashArray = CryptoJS.enc.Hex.parse(hash.toString());
            const finalSecret = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
                // Get the 32-bit word, then extract the 8-bit block
                const wordIndex = Math.floor(i / 4);
                const byteIndex = i % 4;
                const shift = 24 - (byteIndex * 8);
                finalSecret[i] = (hashArray.words[wordIndex] >>> shift) & 0xff;
            }

            await jwtVerify(token, finalSecret);
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
