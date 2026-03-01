import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const teacher = await prisma.teacher.upsert({
            where: { email: 'teacher@school.com' },
            update: {},
            create: {
                email: 'teacher@school.com',
                name: 'Mrs. Smith',
                passwordHash: 'hashed_password_mock',
            },
        });

        const student1 = await prisma.student.upsert({
            where: { teacherId_alias: { teacherId: teacher.id, alias: 'BlueTiger4' } },
            update: {},
            create: {
                teacherId: teacher.id,
                alias: 'BlueTiger4',
                pin: '1234',
                piraBaselineScore: 105,
                currentDifficultyBand: 'UPPER_KS2'
            }
        });

        const student2 = await prisma.student.upsert({
            where: { teacherId_alias: { teacherId: teacher.id, alias: 'RedFalcon7' } },
            update: {},
            create: {
                teacherId: teacher.id,
                alias: 'RedFalcon7',
                pin: '5678',
                piraBaselineScore: 92,
                currentDifficultyBand: 'MID_KS2'
            }
        });

        return NextResponse.json({ success: true, teacher, student1, student2 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
