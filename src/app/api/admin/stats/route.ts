import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Cache for ResultMapping (rarely changes)
let resultMappingCache: any[] | null = null;
let resultMappingCacheTime = 0;
const RESULT_MAPPING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Enable Next.js response caching with revalidation
export const dynamic = 'force-dynamic';
export const revalidate = 30; // Revalidate every 30 seconds

async function getResultMappings() {
    const now = Date.now();
    if (resultMappingCache && (now - resultMappingCacheTime) < RESULT_MAPPING_CACHE_TTL) {
        return resultMappingCache;
    }

    resultMappingCache = await prisma.resultMapping.findMany();
    resultMappingCacheTime = now;
    return resultMappingCache;
}

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

        // OPTIMIZATION 1: Combine all count queries into a single aggregation
        const [
            totalUsersCount,
            filteredCount,
            completedCount,
            dropoutCount,
            commentCount,
            validCommentCount
        ] = await Promise.all([
            prisma.userResponse.count(),
            prisma.userResponse.count({ where }),
            prisma.userResponse.count({ where: { isDropout: false } }),
            prisma.userResponse.count({ where: { isDropout: true } }),
            prisma.userResponse.count({
                where: {
                    isDropout: false,
                    AND: [
                        { comment: { not: null } },
                        { comment: { not: '' } }
                    ]
                }
            }),
            prisma.userResponse.count({
                where: {
                    isDropout: false,
                    isValidComment: true
                }
            })
        ]);

        // OPTIMIZATION 2: Fetch paginated data and traffic data in parallel
        const [
            rawRecentAnswers,
            dailyTraffic,
            hourlyTraffic,
            oceanDistribution,
            seasonDistribution,
            dropoutsByQuestion,
            completedResponses
        ] = await Promise.all([
            // Recent Answers with pagination and filters
            prisma.userResponse.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),

            // Daily Traffic (Last 7 days)
            (async () => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return prisma.$queryRaw`
                    SELECT created_at::date as date, COUNT(*) as count
                    FROM "UserResponse"
                    WHERE created_at >= ${sevenDaysAgo}
                    GROUP BY created_at::date
                    ORDER BY created_at::date ASC
                `;
            })(),

            // Hourly Traffic (Last 24 hours)
            (async () => {
                const twentyFourHoursAgo = new Date();
                twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
                return prisma.$queryRaw`
                    SELECT DATE_TRUNC('hour', created_at) as date, COUNT(*) as count
                    FROM "UserResponse"
                    WHERE created_at >= ${twentyFourHoursAgo}
                    GROUP BY DATE_TRUNC('hour', created_at)
                    ORDER BY DATE_TRUNC('hour', created_at) ASC
                `;
            })(),

            // Ocean Distribution
            prisma.userResponse.groupBy({
                by: ['final_ocean'],
                _count: { final_ocean: true },
            }),

            // Season Distribution
            prisma.userResponse.groupBy({
                by: ['final_season'],
                _count: { final_season: true },
            }),

            // Dropout Analysis by Question
            prisma.userResponse.groupBy({
                by: ['questionProgress'],
                where: {
                    isDropout: true,
                    questionProgress: { not: null }
                },
                _count: { questionProgress: true },
                orderBy: { questionProgress: 'asc' }
            }),

            // Rating data for average calculation
            prisma.userResponse.findMany({
                where: { isDropout: false },
                select: { rating: true }
            })
        ]);

        // Calculate analytics
        const dropoutRate = totalUsersCount > 0 ? (dropoutCount / totalUsersCount) * 100 : 0;

        const ratings = completedResponses.map(r => r.rating ?? 0);
        const averageRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;

        const commentResponseRate = completedCount > 0 ? (commentCount / completedCount) * 100 : 0;
        const validCommentRate = commentCount > 0 ? (validCommentCount / commentCount) * 100 : 0;

        // Serialize BigInt in traffic data
        const serializedDailyTraffic = (dailyTraffic as any[]).map((dt: any) => ({
            date: dt.date,
            count: dt.count.toString(),
        }));

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

        // OPTIMIZATION 3: Use cached ResultMapping
        const mappings = await getResultMappings();

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

        const dropoutAnalysis = dropoutsByQuestion.map(d => ({
            questionNumber: d.questionProgress,
            count: d._count.questionProgress,
            percentage: dropoutCount > 0 ? ((d._count.questionProgress / dropoutCount) * 100).toFixed(2) : '0'
        }));

        // Normalize Season Distribution (merge summer variants)
        const normalizedSeasonDistribution = serializedSeasonDistribution.reduce((acc: any[], curr) => {
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
            totalUsers: totalUsersCount.toString(),
            recentAnswers: serializedAnswers,
            totalRecords: filteredCount,
            dailyTraffic: serializedDailyTraffic,
            hourlyTraffic: serializedHourlyTraffic,
            oceanDistribution: serializedOceanDistribution,
            seasonDistribution: normalizedSeasonDistribution,
            // OPTIMIZATION 4: Removed expensive averageResponseTimes calculation
            // This was fetching ALL responses and processing them - very expensive
            // Can be re-added later with proper optimization if needed
            analytics: {
                dropoutRate: dropoutRate.toFixed(2),
                dropoutCount: dropoutCount.toString(),
                completedUsers: completedCount.toString(),
                averageRating: averageRating.toFixed(2),
                commentResponseRate: commentResponseRate.toFixed(2),
                validCommentRate: validCommentRate.toFixed(2),
                totalComments: commentCount.toString(),
                validComments: validCommentCount.toString(),
            },
            dropoutAnalysis: dropoutAnalysis
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
