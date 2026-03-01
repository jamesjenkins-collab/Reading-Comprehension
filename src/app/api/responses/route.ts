import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { studentId, questionId, assignmentId, studentAnswer, isCorrect } = body;

        if (!studentId || !questionId || !assignmentId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const response = await (prisma.studentResponse as any).create({
            data: {
                studentId,
                questionId,
                assignmentId,
                studentAnswer,
                isCorrect
            }
        });

        // If it's the last question or we want to mark assignment as completed
        // we can update assignment status here or via a separate call.

        return NextResponse.json({ success: true, response });
    } catch (error: any) {
        console.error('API Error saving response:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
