
import { prisma } from './src/lib/prisma';
import { calculateFinalScore } from './src/lib/score';

async function main() {
  try {
    console.log('Starting reproduction...');

    // 1. Mock Data
    const mockAnswers = [
      { questionId: 1, choice: 'A', startTime: 1700000000000, endTime: 1700000005000 },
      { questionId: 2, choice: 'B', startTime: 1700000005000, endTime: 1700000010000 },
      { questionId: 3, choice: 'C', startTime: 1700000010000, endTime: 1700000015000 }
    ];

    // 2. Fetch Choice Scores
    console.log('Fetching choice scores...');
    const choiceScoresData = await prisma.choiceScore.findMany();
    console.log(`Fetched ${choiceScoresData.length} choice scores.`);

    const choiceDB = choiceScoresData.map(cs => ({
        questionId: cs.questionId,
        choice: cs.choice,
        energy: cs.energy,
        positivity: cs.positivity,
        curiosity: cs.curiosity
    }));

    // 3. Calculate Score
    console.log('Calculating score...');
    const result = calculateFinalScore(mockAnswers, choiceDB);
    console.log('Result:', result);

    // 4. Fetch Result Mapping
    console.log('Fetching result mapping...');
    const resultMapping = await prisma.resultMapping.findUnique({
        where: {
            ocean_season: {
                ocean: result.ocean,
                season: result.season,
            },
        },
    });
    console.log('Result Mapping:', resultMapping);

    // 5. Save User Response
    console.log('Saving user response...');
    const savedResponse = await prisma.userResponse.create({
        data: {
            user_answers: mockAnswers,
            final_ocean: result.ocean,
            final_season: result.season,
            final_code: result.code,
            score: result.score,
            rating: null,
            comment: null,
            isDropout: false,
            questionProgress: null,
            isValidComment: null,
        },
    });
    console.log('Saved Response ID:', savedResponse.id);

    console.log('SUCCESS: No error reproduced.');

  } catch (error) {
    console.error('ERROR REPRODUCED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
