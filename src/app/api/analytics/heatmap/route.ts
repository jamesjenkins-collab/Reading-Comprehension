import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const responses = await (prisma.studentResponse as any).findMany({
            include: {
                student: true,
                question: true
            }
        });

        // Group by student and domain
        const heatmapData: any = {};
        const domains = new Set<string>();
        const students = new Map<string, string>();

        responses.forEach((resp: any) => {
            const studentId = resp.studentId;
            const domain = resp.question.readingDomain;
            const studentAlias = resp.student.alias;

            domains.add(domain);
            students.set(studentId, studentAlias);

            if (!heatmapData[studentId]) heatmapData[studentId] = {};
            if (!heatmapData[studentId][domain]) {
                heatmapData[studentId][domain] = { correct: 0, total: 0 };
            }

            heatmapData[studentId][domain].total += 1;
            if (resp.isCorrect) heatmapData[studentId][domain].correct += 1;
        });

        return NextResponse.json({
            heatmap: heatmapData,
            domains: Array.from(domains).sort(),
            students: Array.from(students.entries()).map(([id, alias]) => ({ id, alias }))
        });
    } catch (error: any) {
        console.error('Heatmap API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
