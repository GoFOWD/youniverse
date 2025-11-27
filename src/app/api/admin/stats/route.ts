import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Get pagination parameters from query string
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const skip = (page - 1) * limit;

        // Get filter parameters
        const ocean = searchParams.get('ocean');
        const season = searchParams.get('season');
        const rating = searchParams.get('rating');
        const timeRange = searchParams.get('timeRange');

        // Helper function to get date based on time range
        const getTimeRangeDate = (range: string | null) => {
            if (!range) return null;
            const now = new Date();
            switch (range) {
                case '24h':
                    return new Date(now.getTime() - 24 * 60 * 60 * 1000);
                case '7d':
                    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                case '30d':
                    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                default:
                    return null;
            }
        };

        // Build where clause for filters
        const where: any = {};
        if (ocean) where.final_ocean = ocean;
        if (season) where.final_season = season;
        if (rating) where.rating = parseInt(rating);
        const timeRangeDate = getTimeRangeDate(timeRange);
        if (timeRangeDate) where.created_at = { gte: timeRangeDate };

        // 1. Total Users (unfiltered)
        const totalUsers = await prisma.userResponse.count();

        // 2. Total count for pagination (with filters)
        const totalRecords = await prisma.userResponse.count({ where });

        // 3. Recent Answers with pagination and filters
        const rawRecentAnswers = await prisma.userResponse.findMany({
            where,
            skip,
            take: limit,
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

        // 7. Calculate Average Response Time per Question
        const allResponses = await prisma.userResponse.findMany({
            where: { isDropout: false },
            select: { user_answers: true }
        });

        const questionResponseTimes: { [key: number]: number[] } = {};

        allResponses.forEach(response => {
            const answers = response.user_answers as any;
            if (Array.isArray(answers)) {
                answers.forEach((ans: any) => {
                    if (ans.questionId && ans.startTime && ans.endTime) {
                        const responseTime = ans.endTime - ans.startTime;
                        if (!questionResponseTimes[ans.questionId]) {
                            questionResponseTimes[ans.questionId] = [];
                        }
                        questionResponseTimes[ans.questionId].push(responseTime);
                    }
                });
            }
        });

        const averageResponseTimes: { [key: number]: number } = {};
        Object.keys(questionResponseTimes).forEach(qId => {
            const times = questionResponseTimes[parseInt(qId)];
            const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
            averageResponseTimes[parseInt(qId)] = Math.round(avg);
        });

        // 8. Normalize Season Distribution (merge summer variants)
        const normalizedSeasonDistribution = serializedSeasonDistribution.reduce((acc: any[], curr) => {
            // Normalize season names - treat all summer variants as "여름"
            let seasonName = curr.name;
            if (seasonName.includes('여름')) {
                seasonName = '여름';
            }

            const existing = acc.find(item => item.name === seasonName);
            if (existing) {
                existing.value += curr.value;
            } else {
                acc.push({ name: seasonName, value: curr.value });
            }
            return acc;
        }, []);

        return NextResponse.json({
            totalUsers: totalUsers.toString(),
            recentAnswers: serializedAnswers,
            totalRecords,
            dailyTraffic: serializedDailyTraffic,
            hourlyTraffic: serializedHourlyTraffic,
            oceanDistribution: serializedOceanDistribution,
            seasonDistribution: normalizedSeasonDistribution,
            averageResponseTimes: averageResponseTimes,
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
