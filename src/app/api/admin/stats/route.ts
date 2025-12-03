import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Total Users Count
        const totalUsers = await prisma.userResponse.count();

        // 2. Average Rating (simple calculation)
        const allRatings = await prisma.userResponse.findMany({
            where: {
                rating: {
                    not: null
                }
            },
            select: {
                rating: true
            }
        });

        const averageRating = allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length
            : 0;

        // 3. Recent Comments (Last 20 with comments)
        const recentComments = await prisma.userResponse.findMany({
            where: {
                comment: {
                    not: null,
                    not: ''
                }
            },
            take: 20,
            orderBy: {
                created_at: 'desc',
            },
            select: {
                id: true,
                created_at: true,
                rating: true,
                comment: true,
            }
        });

        // 4. Daily Stats (Last 7 days) - Simple version
        const dailyData: { [key: string]: number } = {};

        // Initialize last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const dateKey = date.toISOString().split('T')[0];
            dailyData[dateKey] = 0;
        }

        // Get all records from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);

        const recentRecords = await prisma.userResponse.findMany({
            where: {
                created_at: {
                    gte: sevenDaysAgo
                }
            },
            select: {
                created_at: true
            }
        });

        // Count by date
        recentRecords.forEach(record => {
            const dateKey = new Date(record.created_at).toISOString().split('T')[0];
            if (dailyData[dateKey] !== undefined) {
                dailyData[dateKey]++;
            }
        });

        return NextResponse.json({
            totalUsers,
            averageRating: Number(averageRating.toFixed(2)),
            recentComments,
            dailyData,
        });

    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch statistics',
                totalUsers: 0,
                averageRating: 0,
                recentComments: [],
                dailyData: {}
            },
            { status: 200 } // Return 200 with empty data instead of 500
        );
    }
}
