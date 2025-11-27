import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Total Users
        const totalUsers = await prisma.userResponse.count();

        // 2. Recent Answers (Last 10) - Renamed to avoid conflict
        const rawRecentAnswers = await prisma.userResponse.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
        });

        // 3. Daily Traffic (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTraffic = await prisma.$queryRaw`
      SELECT created_at::date as date, COUNT(*) as count
      FROM "UserResponse"
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY created_at::date
      ORDER BY created_at::date ASC
    `;

        // 4. Hourly Traffic (Last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const hourlyTraffic = await prisma.$queryRaw`
      SELECT DATE_TRUNC('hour', created_at) as date, COUNT(*) as count
      FROM "UserResponse"
      WHERE created_at >= ${twentyFourHoursAgo}
      GROUP BY DATE_TRUNC('hour', created_at)
      ORDER BY DATE_TRUNC('hour', created_at) ASC
    `;


        // 5. Result Distribution (Ocean & Season)
        const oceanDistribution = await prisma.userResponse.groupBy({
            by: ['final_ocean'],
            _count: { final_ocean: true },
        });

        const seasonDistribution = await prisma.userResponse.groupBy({
            by: ['final_season'],
            _count: { final_season: true },
        });

        // Serialize BigInt in dailyTraffic (count is BigInt)
        const serializedDailyTraffic = (dailyTraffic as any[]).map((dt: any) => ({
            date: dt.date,
            count: dt.count.toString(),
        }));

        // Serialize BigInt in hourlyTraffic
        const serializedHourlyTraffic = (hourlyTraffic as any[]).map((ht: any) => ({
            date: ht.date,
            count: ht.count.toString(),
        }));

        // Serialize Distributions
        const serializedOceanDistribution = oceanDistribution.map(d => ({
            name: d.final_ocean,
            value: d._count.final_ocean,
        }));

        const serializedSeasonDistribution = seasonDistribution.map(d => ({
            name: d.final_season,
            value: d._count.final_season,
        }));

        // Fetch ResultMappings for these answers
        const mappings = await prisma.resultMapping.findMany();

        const serializedAnswers = rawRecentAnswers.map(ans => {
            const mapping = mappings.find(
                m => m.ocean === ans.final_ocean && m.season === ans.final_season
            );

            return {
                ...ans,
                id: ans.id.toString(),
                user_answers: JSON.parse(JSON.stringify(ans.user_answers)),
                score: JSON.parse(JSON.stringify(ans.score)),
                // Add result content
                resultTitle: mapping?.title || 'Unknown',
                resultDescription: mapping?.description || '',
                resultAdvice: mapping?.advice || '',
                // Feedback
                rating: ans.rating,
                comment: ans.comment,
            };
        });

        // 6. Analytics Metrics (Exclude Dropouts)

        // Total completed users (excluding dropouts)
        const completedUsers = await prisma.userResponse.count({
            where: { isDropout: false }
        });

        // Dropout Rate
        const dropoutCount = await prisma.userResponse.count({
            where: { isDropout: true }
        });
        const dropoutRate = totalUsers > 0 ? (dropoutCount / totalUsers) * 100 : 0;

        // Rating Metrics (treat null as 0, EXCLUDE dropouts)
        const completedResponses = await prisma.userResponse.findMany({
            where: { isDropout: false },
            select: { rating: true }
        });
        const ratings = completedResponses.map(r => r.rating ?? 0);
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        // Comment Response Rate (EXCLUDE dropouts)
        const commentCount = await prisma.userResponse.count({
            where: {
                isDropout: false,
                AND: [
                    { comment: { not: null } },
                    { comment: { not: '' } }
                ]
            }
        });
        const commentResponseRate = completedUsers > 0 ? (commentCount / completedUsers) * 100 : 0;

        // Valid Comment Rate (excluding spam, EXCLUDE dropouts)
        const validCommentCount = await prisma.userResponse.count({
            where: {
                isDropout: false,
                isValidComment: true
            }
        });
        const validCommentRate = commentCount > 0 ? (validCommentCount / commentCount) * 100 : 0;

        // Dropout Analysis by Question
        const dropoutsByQuestion = await prisma.userResponse.groupBy({
            by: ['questionProgress'],
            where: {
                isDropout: true,
                questionProgress: { not: null }
            },
            _count: { questionProgress: true },
            orderBy: { questionProgress: 'asc' }
        });

        const dropoutAnalysis = dropoutsByQuestion.map(d => ({
            questionNumber: d.questionProgress,
            count: d._count.questionProgress,
            percentage: dropoutCount > 0 ? ((d._count.questionProgress / dropoutCount) * 100).toFixed(2) : '0'
        }));

        return NextResponse.json({
            totalUsers: totalUsers.toString(),
            recentAnswers: serializedAnswers,
            dailyTraffic: serializedDailyTraffic,
            hourlyTraffic: serializedHourlyTraffic,
            oceanDistribution: serializedOceanDistribution,
            seasonDistribution: serializedSeasonDistribution,
            // New analytics
            analytics: {
                dropoutRate: dropoutRate.toFixed(2),
                dropoutCount: dropoutCount.toString(),
                completedUsers: completedUsers.toString(),
                averageRating: averageRating.toFixed(2),
                commentResponseRate: commentResponseRate.toFixed(2),
                validCommentRate: validCommentRate.toFixed(2),
                totalComments: commentCount.toString(),
                validComments: validCommentCount.toString(),
            },
            // Dropout analysis by question
            dropoutAnalysis: dropoutAnalysis
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
