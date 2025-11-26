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
        const { text, choices, category } = body; // choices is array of strings

        // Update Question
        const updatedQuestion = await prisma.question.update({
            where: { id: parseInt(id) },
            data: {
                text,
                category,
                choices, // Update the choices array in Question model
            },
        });

        // Note: We are NOT updating ChoiceScore here yet, that will be in the Scoring section.
        // However, if the user changes the text of a choice, we might want to ensure consistency.
        // The current schema has 'choices' as String[] in Question, and 'choice' (A/B/C) in ChoiceScore.
        // The 'choices' array likely corresponds to A, B, C in order.

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
    }
}
