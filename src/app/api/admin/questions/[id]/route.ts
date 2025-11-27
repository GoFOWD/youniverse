import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const question = await prisma.question.findUnique({
            where: { id: parseInt(id) },
            include: {
                choiceScores: true,
            },
        });

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(question);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { text, choices, category, choiceScores } = body; // choiceScores is optional array

        // Transaction to update Question and optionally ChoiceScores
        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Question
            const updatedQuestion = await tx.question.update({
                where: { id: parseInt(id) },
                data: {
                    text,
                    category,
                    choices,
                },
            });

            // 2. Update ChoiceScores if provided
            if (choiceScores && Array.isArray(choiceScores)) {
                for (const score of choiceScores) {
                    if (score.id) {
                        await tx.choiceScore.update({
                            where: { id: score.id },
                            data: {
                                energy: parseInt(score.energy),
                                positivity: parseInt(score.positivity),
                                curiosity: parseInt(score.curiosity),
                            },
                        });
                    }
                }
            }

            return updatedQuestion;
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }
}
