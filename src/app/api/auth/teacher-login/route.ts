import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const teacher = await prisma.teacher.findUnique({ where: { email } });

        if (!teacher) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, teacher.passwordHash);
        if (!passwordMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create JWT
        // Create a consistent 32-byte key for HS256 regardless of runtime environment
        const jwtSecret = process.env.JWT_SECRET || 'reading_intervention_fallback_secret_2026';
        const encoder = new TextEncoder();
        const secretKey = encoder.encode(jwtSecret).slice(0, 32);
        const finalSecret = new Uint8Array(32);
        finalSecret.set(secretKey);
        const token = await new SignJWT({ teacherId: teacher.id, email: teacher.email, name: teacher.name })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(finalSecret);

        const response = NextResponse.json({ success: true, name: teacher.name });
        response.cookies.set('teacher_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
