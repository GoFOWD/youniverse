
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const choiceScoreCount = await prisma.choiceScore.count();
    const resultMappingCount = await prisma.resultMapping.count();
    const questionCount = await prisma.question.count();

    console.log(`Questions: ${questionCount}`);
    console.log(`ChoiceScores: ${choiceScoreCount}`);
    console.log(`ResultMappings: ${resultMappingCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
