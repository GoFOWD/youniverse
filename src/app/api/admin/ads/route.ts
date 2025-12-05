import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const ads = await prisma.ad.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(ads);
    } catch (error) {
        console.error('Failed to fetch ads:', error);
        return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { src } = body;

        if (!src) {
            return NextResponse.json({ error: 'Source URL is required' }, { status: 400 });
        }

        const ad = await prisma.ad.create({
            data: {
                src,
                width: '300',
                height: '600',
                isActive: true,
            },
        });

        return NextResponse.json(ad);
    } catch (error) {
        console.error('Failed to create ad:', error);
        return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 });
    }
}
