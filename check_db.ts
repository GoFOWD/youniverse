
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to DB...');
    const questionCount = await prisma.question.count();
    console.log('Questions:', questionCount);

    const choiceScoreCount = await prisma.choiceScore.count();
    console.log('ChoiceScores:', choiceScoreCount);

    const resultMappingCount = await prisma.resultMapping.count();
    console.log('ResultMappings:', resultMappingCount);

    console.log('DB Connection Successful');
  } catch (e) {
    console.error('DB Connection Failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
