import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const students = await prisma.student.findMany({
            include: {
                assignments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });
        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
