
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const resultId = parseInt(id);
        const body = await request.json();

        const { title, description, advice, hashtag } = body;

        const updatedResult = await prisma.resultMapping.update({
            where: { id: resultId },
            data: {
                title,
                description,
                advice,
                hashtag,
            },
        });

        return NextResponse.json(updatedResult);
    } catch (error) {
        console.error('Error updating result:', error);
        return NextResponse.json(
            { error: 'Failed to update result' },
            { status: 500 }
        );
    }
}
