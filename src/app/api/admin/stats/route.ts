
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const rating = searchParams.get('rating');

        const skip = (page - 1) * limit;

        // Build where clause for filters
        const where: any = {};
        if (rating) where.rating = parseInt(rating);

        // 1. Total Users Count (All time)
        const totalUsers = await prisma.userResponse.count();

        // 2. Recent Answers (Paginated)
        const recentAnswers = await prisma.userResponse.findMany({
            where,
            take: limit,
            skip: skip,
            orderBy: {
                created_at: 'desc',
            },
            select: {
                id: true,
                created_at: true,
                rating: true,
                comment: true,
                // Keep these for now if needed for inspection, but UI focuses on rating/comment
                final_code: true,
                score: true,
                user_answers: true,
            }
        });

        // 3. Total Records (for pagination of filtered results)
        const totalRecords = await prisma.userResponse.count({ where });

        return NextResponse.json({
            totalUsers,
            recentAnswers,
            totalRecords,
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
