import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Total Users
        const totalUsers = await prisma.userResponse.count();

        // 2. Recent Answers (Last 10)
        const recentAnswers = await prisma.userResponse.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
        });

        // 3. Daily Traffic (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const dailyTraffic = await prisma.$queryRaw`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "UserResponse"
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
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

        // Serialize BigInt in recentAnswers (id is BigInt)
        const serializedRecentAnswers = recentAnswers.map(answer => ({
            ...answer,
            id: answer.id.toString(),
            user_answers: answer.user_answers, // Keep as is (Json)
            score: answer.score, // Keep as is (Json)
        }));

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

        return NextResponse.json({
            totalUsers,
            recentAnswers: serializedRecentAnswers,
            dailyTraffic: serializedDailyTraffic,
            hourlyTraffic: serializedHourlyTraffic,
            oceanDistribution: serializedOceanDistribution,
            seasonDistribution: serializedSeasonDistribution,
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}
