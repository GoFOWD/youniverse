
import { ChoiceScore } from '@/lib/score';

interface MinMax {
    min: number;
    max: number;
}

interface ReachabilityResult {
    oceanReachability: Record<string, boolean>;
    seasonReachability: Record<string, boolean>;
    totalCombinations: number;
    reachableCombinations: number;
    unreachable: string[];
}

// Ocean Map (from score.ts)
// "-2": "남극해", "-1": "북극해", "0": "대서양", "1": "인도양", "2": "태평양"
// Normalization: >=8 (2), >=3 (1), >-3 (0), >-8 (-1), else (-2)
const OCEAN_THRESHOLDS = {
    '태평양': { min: 8, max: Infinity },
    '인도양': { min: 3, max: 7 },
    '대서양': { min: -2, max: 2 },
    '북극해': { min: -7, max: -3 },
    '남극해': { min: -Infinity, max: -8 },
};

// Season Map (from score.ts)
// "-2": "겨울", "-1": "가을", "0": "봄", "1": "여름", "2": "여름"
// Normalization: >=8 (2), >=3 (1), >-3 (0), >-8 (-1), else (-2)
const SEASON_THRESHOLDS = {
    '여름': { min: 3, max: Infinity }, // Covers both 1 and 2
    '봄': { min: -2, max: 2 },
    '가을': { min: -7, max: -3 },
    '겨울': { min: -Infinity, max: -8 },
};

export function calculateMinMaxScores(choiceScores: ChoiceScore[]): { energy: MinMax; positivity: MinMax } {
    // Group by questionId
    const questions: Record<number, ChoiceScore[]> = {};
    choiceScores.forEach(cs => {
        if (!questions[cs.questionId]) questions[cs.questionId] = [];
        questions[cs.questionId].push(cs);
    });

    let minE = 0, maxE = 0;
    let minP = 0, maxP = 0;

    Object.values(questions).forEach(choices => {
        // For each question, user picks ONE choice.
        // So we find the min and max contribution of this question to the total score.

        const energies = choices.map(c => c.energy);
        const positivities = choices.map(c => c.positivity);

        minE += Math.min(...energies);
        maxE += Math.max(...energies);

        minP += Math.min(...positivities);
        maxP += Math.max(...positivities);
    });

    return {
        energy: { min: minE, max: maxE },
        positivity: { min: minP, max: maxP },
    };
}

export function checkReachability(choiceScores: ChoiceScore[]): ReachabilityResult {
    const { energy, positivity } = calculateMinMaxScores(choiceScores);

    const oceanReachability: Record<string, boolean> = {};
    const seasonReachability: Record<string, boolean> = {};
    const unreachable: string[] = [];
    let reachableCount = 0;

    // Check Oceans
    Object.entries(OCEAN_THRESHOLDS).forEach(([ocean, range]) => {
        // To be reachable, the global Max must be >= range.min AND global Min must be <= range.max
        // Actually, strictly speaking, the range [minE, maxE] must OVERLAP with [range.min, range.max]
        const isReachable = Math.max(energy.min, range.min) <= Math.min(energy.max, range.max);
        oceanReachability[ocean] = isReachable;
    });

    // Check Seasons
    Object.entries(SEASON_THRESHOLDS).forEach(([season, range]) => {
        const isReachable = Math.max(positivity.min, range.min) <= Math.min(positivity.max, range.max);
        seasonReachability[season] = isReachable;
    });

    // Calculate Combinations (5 Oceans * 4 Seasons = 20)
    // Note: This simple check assumes independence between Energy and Positivity.
    // In reality, if Choice A gives (+E, +P) and Choice B gives (-E, -P), you might not be able to get (+E, -P).
    // But for a "Basic Reachability" check, this is a good first step. 
    // A full exhaustive search of 3^12 combinations is possible (531,441), but might be heavy for client-side.
    // Let's stick to independent range overlap for now as a "Necessary Condition".

    let oceanCount = 0;
    let seasonCount = 0;

    for (const [ocean, reachable] of Object.entries(oceanReachability)) {
        if (reachable) oceanCount++;
        else unreachable.push(`Ocean: ${ocean}`);
    }

    for (const [season, reachable] of Object.entries(seasonReachability)) {
        if (reachable) seasonCount++;
        else unreachable.push(`Season: ${season}`);
    }

    // Total "Independent" Combinations
    // If we want to be strict about 20 specific outcomes, we need to verify the cross product.
    // But usually, if you can reach all Oceans and all Seasons, you can likely reach most combinations unless questions are highly correlated.

    return {
        oceanReachability,
        seasonReachability,
        totalCombinations: 20,
        reachableCombinations: oceanCount * seasonCount, // Approximation
        unreachable,
    };
}
