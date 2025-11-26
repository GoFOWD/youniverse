import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const questions = await prisma.question.findMany({
            include: {
                choiceScores: true,
            },
            orderBy: {
                id: 'asc',
            },
        });
        return NextResponse.json(questions);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch scoring data' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { updates } = body; // Array of { id, energy, positivity, curiosity }

        // Transaction to update multiple scores
        await prisma.$transaction(
            updates.map((update: any) =>
                prisma.choiceScore.update({
                    where: { id: update.id },
                    data: {
                        energy: parseInt(update.energy),
                        positivity: parseInt(update.positivity),
                        curiosity: parseInt(update.curiosity),
                    },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating scores:', error);
        return NextResponse.json({ error: 'Failed to update scores' }, { status: 500 });
    }
}
