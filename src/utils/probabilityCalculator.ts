import { ChoiceScore } from '@/lib/score';

interface ProbabilityResult {
    oceanDistribution: { name: string; value: number; percentage: number }[];
    seasonDistribution: { name: string; value: number; percentage: number }[];
}

/**
 * Calculate Ocean and Season probability distribution based on current scoring configuration
 * Uses Monte Carlo simulation with 10,000 random answer combinations
 */
export function calculateProbabilities(choiceScores: ChoiceScore[]): ProbabilityResult {
    const SIMULATIONS = 10000;
    const NUM_QUESTIONS = 18;

    // Group scores by question
    const scoresByQuestion: { [key: number]: ChoiceScore[] } = {};
    choiceScores.forEach(score => {
        if (!scoresByQuestion[score.questionId]) {
            scoresByQuestion[score.questionId] = [];
        }
        scoresByQuestion[score.questionId].push(score);
    });

    // Ocean and Season counters
    const oceanCounts: { [key: string]: number } = {};
    const seasonCounts: { [key: string]: number } = {};

    // Run simulations
    for (let i = 0; i < SIMULATIONS; i++) {
        let totalE = 0, totalP = 0, totalC = 0;

        // Randomly select one choice per question
        for (let qId = 1; qId <= NUM_QUESTIONS; qId++) {
            const choices = scoresByQuestion[qId];
            if (!choices || choices.length === 0) continue;

            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            totalE += randomChoice.energy;
            totalP += randomChoice.positivity;
            totalC += randomChoice.curiosity;
        }

        // Calculate Ocean (C×3 + P×2 + E×1)
        const oceanScore = totalC * 3 + totalP * 2 + totalE * 1;
        let ocean = "";
        if (oceanScore <= 17) {
            ocean = "남극해";
        } else if (oceanScore <= 23) {
            ocean = "북극해";
        } else if (oceanScore <= 28) {
            ocean = "대서양";
        } else if (oceanScore <= 34) {
            ocean = "인도양";
        } else {
            ocean = "태평양";
        }

        // Calculate Season (E×3 + P×2 + C×1)
        const seasonScore = totalE * 3 + totalP * 2 + totalC * 1;
        let season = "";
        if (seasonScore <= 16) {
            season = "겨울";
        } else if (seasonScore <= 25) {
            season = "가을";
        } else if (seasonScore <= 34) {
            season = "봄";
        } else {
            season = "여름";
        }

        // Increment counters
        oceanCounts[ocean] = (oceanCounts[ocean] || 0) + 1;
        seasonCounts[season] = (seasonCounts[season] || 0) + 1;
    }

    // Convert to distribution arrays with percentages
    const oceanDistribution = Object.entries(oceanCounts).map(([name, value]) => ({
        name,
        value,
        percentage: (value / SIMULATIONS) * 100
    }));

    const seasonDistribution = Object.entries(seasonCounts).map(([name, value]) => ({
        name,
        value,
        percentage: (value / SIMULATIONS) * 100
    }));

    // Sort by predefined order
    const oceanOrder = ["남극해", "북극해", "대서양", "인도양", "태평양"];
    const seasonOrder = ["겨울", "가을", "봄", "여름"];

    oceanDistribution.sort((a, b) => oceanOrder.indexOf(a.name) - oceanOrder.indexOf(b.name));
    seasonDistribution.sort((a, b) => seasonOrder.indexOf(a.name) - seasonOrder.indexOf(b.name));

    return {
        oceanDistribution,
        seasonDistribution
    };
}
