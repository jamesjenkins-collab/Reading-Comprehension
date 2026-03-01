import { NextResponse } from 'next/server';
import { generatePassage } from '@/lib/gemini';
import prisma from '@/lib/prisma';

const VALID_BANDS = ['LOWER_KS1', 'LOWER_MID_KS2', 'MID_KS2', 'UPPER_KS2'] as const;
type ValidBand = typeof VALID_BANDS[number];

export async function POST(
    request: Request,
    context: { params: Promise<{ passageId: string }> }
) {
    const { passageId } = await context.params;

    try {
        // 1. Fetch existing passage + questions
        const passage = await prisma.passage.findUnique({
            where: { id: passageId },
            include: { questions: true }
        });

        if (!passage) {
            return NextResponse.json({ error: 'Passage not found' }, { status: 404 });
        }

        const rawBand = passage.piraDifficultyBand;
        const bandKey: ValidBand = VALID_BANDS.includes(rawBand as ValidBand) ? rawBand as ValidBand : 'LOWER_MID_KS2';

        // Get the original domains and question count from existing questions
        const domains = [...new Set(passage.questions.map(q => q.readingDomain))];
        const questionCount = Math.max(3, passage.questions.length);

        // 2. Re-generate passage text AND questions together from Gemini
        // Use the original title as topic so theme stays consistent
        const newData = await generatePassage(
            bandKey,
            domains.length > 0 ? domains : ['2b'],
            passage.title,
            questionCount
        );

        if (!newData?.content?.length) {
            return NextResponse.json({ error: 'AI returned no content' }, { status: 502 });
        }

        const newContentStr = JSON.stringify({
            type: newData.passageType || 'prose',
            blocks: newData.content
        });

        // 3. Delete old questions (they won't match the new passage)
        await prisma.question.deleteMany({ where: { passageId } });

        // 4. Save new content and new questions in one transaction
        await prisma.$executeRaw`UPDATE "Passage" SET content = ${newContentStr} WHERE id = ${passageId}`;

        // 5. Create the new matched questions
        const newQuestions = await prisma.question.createMany({
            data: (newData.questions || []).map((q: any) => ({
                passageId,
                readingDomain: q.readingDomain,
                questionType: q.questionType || 'multiple_choice',
                prompt: q.prompt,
                options: JSON.stringify(q.options),
                correctAnswer: JSON.stringify(q.correctAnswer)
            }))
        });

        // 6. Fetch the newly created questions for the response
        const freshQuestions = await prisma.question.findMany({ where: { passageId } });

        return NextResponse.json({
            success: true,
            passage: {
                id: passageId,
                content: newContentStr,
                questions: freshQuestions
            }
        });

    } catch (error: any) {
        console.error('[REGENERATE] Error:', error?.message);
        return NextResponse.json({ error: error?.message || 'Unknown error' }, { status: 500 });
    }
}
