import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    try {
        const query: any = {};
        if (studentId) {
            query.studentId = studentId;
        }

        const assignments = await (prisma.assignment as any).findMany({
            where: query,
            include: {
                student: true,
                teacher: true
            },
            orderBy: { createdAt: 'desc' }
        });

        // Manually fetch passages for each assignment to bypass stale Prisma client includes
        const assignmentsWithPassages = await Promise.all(assignments.map(async (assignment: any) => {
            if (assignment.passageId) {
                const passage = await prisma.passage.findUnique({
                    where: { id: assignment.passageId },
                    include: { questions: true }
                });
                return { ...assignment, passage };
            }
            return assignment;
        }));

        return NextResponse.json(assignmentsWithPassages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
