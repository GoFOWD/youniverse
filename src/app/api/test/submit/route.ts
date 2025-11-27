
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateFinalScore, UserAnswerDetail, ChoiceScore } from '@/lib/score';
import { validateComment } from '@/lib/commentValidator';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const answers: UserAnswerDetail[] = body.answers;
        const rating: number | null = body.rating ?? null;
        const comment: string | null = body.comment ?? null;
        const questionProgress: number | null = body.questionProgress ?? null;
        const isDropout: boolean = body.isDropout ?? false;

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json(
                { error: 'Invalid answers format' },
                { status: 400 }
            );
        }

        // 1. Fetch all choice scores
        const choiceScoresData = await prisma.choiceScore.findMany();

        // Map Prisma result to the interface expected by calculateFinalScore
        const choiceDB: ChoiceScore[] = choiceScoresData.map(cs => ({
            id: cs.id,
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

        // 4. Validate Comment (if provided)
        const commentValidation = validateComment(comment);
        const isValidComment = comment ? commentValidation.isValid : null;

        // 5. Save User Response
        const savedResponse = await prisma.userResponse.create({
            data: {
                user_answers: answers as any,
                final_ocean: result.ocean,
                final_season: result.season,
                final_code: result.code,
                score: result.score as any,
                rating: rating,
                comment: comment,
                isDropout: isDropout,
                questionProgress: questionProgress,
                isValidComment: isValidComment,
            },
        });

        // 6. Return Result
        return NextResponse.json({
            id: savedResponse.id.toString(), // Return ID for feedback update
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
