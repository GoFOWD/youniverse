
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const questionId = parseInt(id);
        const body = await request.json();

        // body should contain text, choices, and choiceScores
        const { text, choices, choiceScores, category } = body;

        // Transaction to update question and replace scores
        const updatedQuestion = await prisma.$transaction(async (tx) => {
            // 1. Update Question
            const q = await tx.question.update({
                where: { id: questionId },
                data: {
                    text,
                    choices,
                    category,
                },
            });

            // 2. Delete existing scores
            await tx.choiceScore.deleteMany({
                where: { questionId },
            });

            // 3. Create new scores
            if (choiceScores && Array.isArray(choiceScores)) {
                await tx.choiceScore.createMany({
                    data: choiceScores.map((score: any) => ({
                        questionId,
                        choice: score.choice,
                        energy: score.energy,
                        positivity: score.positivity,
                        curiosity: score.curiosity,
                    })),
                });
            }

            return q;
        });

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json(
            { error: 'Failed to update question' },
            { status: 500 }
        );
    }
}
