
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateComment } from '@/lib/commentValidator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, rating, comment } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Missing UserResponse ID' },
                { status: 400 }
            );
        }

        // Validate Comment
        const commentValidation = validateComment(comment);
        const isValidComment = comment ? commentValidation.isValid : null;

        // Update User Response
        const updatedResponse = await prisma.userResponse.update({
            where: { id: BigInt(id) },
            data: {
                rating: rating,
                comment: comment,
                isValidComment: isValidComment,
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Feedback submitted successfully',
        });

    } catch (error) {
        console.error('Error submitting feedback:', error);
        return NextResponse.json(
            { error: 'Failed to submit feedback' },
            { status: 500 }
        );
    }
}
