import { NextResponse } from 'next/server';
import { generatePassage } from '@/lib/gemini';
import { PiraDifficultyBand } from '@/lib/pira';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { bandKey, targetDomainCodes, topicContext, studentIds, questionCount } = body;

        if (!bandKey || !targetDomainCodes || !Array.isArray(targetDomainCodes) || targetDomainCodes.length === 0) {
            return NextResponse.json(
                { error: 'bandKey and targetDomainCodes (as a non-empty array) are required' },
                { status: 400 }
            );
        }

        // 1. Generate the passage from Gemini
        const passageData = await generatePassage(
            bandKey as PiraDifficultyBand,
            targetDomainCodes,
            topicContext,
            questionCount || 5
        );

        // 2. Extract year group from the band to save in DB
        const yearGroupStr = bandKey.includes('KS1') ? '2' : bandKey.includes('LOWER') ? '3' : bandKey.includes('MID') ? '5' : '6';
        const yearGroup = parseInt(yearGroupStr);

        // 3. Save Passage and Questions to Database
        const savedPassage = await prisma.passage.create({
            data: {
                title: passageData.title,
                content: JSON.stringify({ type: passageData.passageType, blocks: passageData.content }),
                yearGroup: yearGroup,
                piraDifficultyBand: bandKey,
                questions: {
                    create: passageData.questions.map((q: any) => ({
                        readingDomain: q.readingDomain,
                        questionType: q.questionType,
                        prompt: q.prompt,
                        options: JSON.stringify(q.options),
                        correctAnswer: JSON.stringify(q.correctAnswer)
                    }))
                }
            }
        });

        // 4. Ensure a teacher and student exist for the demo
        const teacher = await prisma.teacher.upsert({
            where: { email: 'demo@school.com' },
            update: {},
            create: { email: 'demo@school.com', name: 'Demo Teacher', passwordHash: 'hashed' }
        });

        const student = await prisma.student.upsert({
            where: { teacherId_alias: { teacherId: teacher.id, alias: 'BlueTiger4' } },
            update: {},
            create: { teacherId: teacher.id, alias: 'BlueTiger4', pin: '1234' }
        });

        await prisma.student.upsert({
            where: { teacherId_alias: { teacherId: teacher.id, alias: 'RedFalcon7' } },
            update: {},
            create: { teacherId: teacher.id, alias: 'RedFalcon7', pin: '5678' }
        });

        // 5. Create Assignments
        let idsToAssign = studentIds;
        if (!idsToAssign || !Array.isArray(idsToAssign) || idsToAssign.length === 0) {
            idsToAssign = [student.id]; // Fallback to assigning to the demo student
        }

        if (idsToAssign.length > 0) {
            await Promise.all(idsToAssign.map((sId: string) =>
                (prisma.assignment as any).create({
                    data: {
                        teacherId: teacher.id,
                        studentId: sId,
                        passageId: savedPassage.id,
                        moduleName: savedPassage.title,
                        status: 'assigned'
                    }
                })
            ));
        }

        return NextResponse.json({ success: true, passage: savedPassage });
    } catch (error: any) {
        console.error('API Error generating passage:', error);

        // Check if it's a Gemini API error with a specific status
        const status = error.status === 'PERMISSION_DENIED' || error.code === 403 ? 403 : 500;
        const message = error.message || 'Failed to generate passage';

        return NextResponse.json(
            { error: message, details: error },
            { status }
        );
    }
}
