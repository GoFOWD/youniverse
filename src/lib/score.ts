
export interface ChoiceScore {
    id: number;
    questionId: number;
    choice: string;
    energy: number;
    positivity: number;
    curiosity: number;
}

export interface UserAnswerDetail {
    questionId: number;
    choice: string;
    startTime: number; // Timestamp
    endTime: number;   // Timestamp
}

export interface FinalResult {
    ocean: string;
    season: string;
    code: string;
    score: {
        energy: number;
        positivity: number;
        curiosity: number;
    };
}

// 매핑 상수
const OceanMap: Record<number, string> = {
    "-2": "남극해", "-1": "북극해", "0": "대서양", "1": "인도양", "2": "태평양"
};
const SeasonMap: Record<number, string> = {
    "-2": "겨울", "-1": "가을", "0": "봄", "1": "여름", "2": "여름"
};

// 정규화 함수
const normalize = (value: number): number => {
    if (value >= 8) return 2;
    if (value >= 3) return 1;
    if (value > -3) return 0;
    if (value > -8) return -1;
    return -2;
};

// 점수 계산 메인 함수
export function calculateFinalScore(
    answers: UserAnswerDetail[],
    choiceDB: ChoiceScore[]
): FinalResult {
    let E = 0, P = 0, C = 0;

    for (const ans of answers) {
        const scoreRow = choiceDB.find(
            (c) => c.questionId === ans.questionId && c.choice === ans.choice
        );
        if (!scoreRow) continue;
        E += scoreRow.energy;
        P += scoreRow.positivity;
        C += scoreRow.curiosity;
    }

    const nE = normalize(E);
    const nP = normalize(P);
    const nC = normalize(C);

    const ocean = OceanMap[nE];

    // Season Calculation (P + C) for balanced distribution
    // Thresholds: Winter <= -5, Autumn <= -1, Spring <= 4, Summer >= 5
    const seasonScore = P + C;
    let season = "";

    if (seasonScore <= -5) {
        season = "겨울";
    } else if (seasonScore <= -1) {
        season = "가을";
    } else if (seasonScore <= 4) {
        season = "봄";
    } else {
        season = "여름";
    }

    const code = `${ocean}-${season}`;

    return {
        ocean,
        season,
        code,
        score: { energy: nE, positivity: nP, curiosity: nC }
    };
}
