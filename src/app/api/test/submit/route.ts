
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFinalScore, UserAnswerDetail, ChoiceScore } from '@/lib/score';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const answers: UserAnswerDetail[] = body.answers;

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            );
        }

        // 1. Fetch all choice scores
        const choiceScoresData = await prisma.choiceScore.findMany();

        // Map Prisma result to the interface expected by calculateFinalScore
        // Prisma result has id, questionId, choice, energy, etc.
        // The interface expects questionId, choice, energy, etc.
        // They match, but we need to ensure types are correct.
        const choiceDB: ChoiceScore[] = choiceScoresData.map(cs => ({
            questionId: cs.questionId,
            choice: cs.choice,
            energy: cs.energy,
            positivity: cs.positivity,
            curiosity: cs.curiosity
        }));

        // 2. Calculate Score
        const result = calculateFinalScore(answers, choiceDB);

        // 3. Fetch Result Content
        const resultMapping = await prisma.resultMapping.findUnique({
            where: {
                ocean_season: {
                    ocean: result.ocean,
                    season: result.season,
                },
            },
        });

        // 4. Save User Response
        // We need to cast the score object to any or Json because Prisma expects Json
        const savedResponse = await prisma.userResponse.create({
            data: {
                user_answers: answers as any, // Cast to any for Json compatibility
                final_ocean: result.ocean,
                final_season: result.season,
                final_code: result.code,
                score: result.score as any,
            },
        });

        // 5. Return Result
        return NextResponse.json({
            resultCode: result.code,
            ocean: result.ocean,
            season: result.season,
            score: result.score,
            title: resultMapping?.title || '결과를 찾을 수 없습니다',
            description: resultMapping?.description || '결과 설명이 없습니다.',
            advice: resultMapping?.advice,
            hashtag: resultMapping?.hashtag,
        });

    } catch (error) {
        console.error('Error submitting test:', error);
        return NextResponse.json(
            { error: 'Failed to submit test' },
            { status: 500 }
        );
    }
}
