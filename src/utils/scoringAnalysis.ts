// 선택지 점수 데이터 분석 스크립트
const choiceScores = [
    { "questionId": 1, "choice": "A", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 1, "choice": "B", "energy": -1, "positivity": -1, "curiosity": 0 },
    { "questionId": 1, "choice": "C", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 2, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 2, "choice": "B", "energy": 0, "positivity": 1, "curiosity": 1 },
    { "questionId": 2, "choice": "C", "energy": -1, "positivity": 0, "curiosity": 1 },
    { "questionId": 3, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 3, "choice": "B", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 3, "choice": "C", "energy": -1, "positivity": 0, "curiosity": 0 },
    { "questionId": 4, "choice": "A", "energy": 0, "positivity": -1, "curiosity": 0 },
    { "questionId": 4, "choice": "B", "energy": -1, "positivity": -1, "curiosity": 0 },
    { "questionId": 4, "choice": "C", "energy": 1, "positivity": -1, "curiosity": 1 },
    { "questionId": 5, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 5, "choice": "B", "energy": 0, "positivity": 0, "curiosity": 0 },
    { "questionId": 5, "choice": "C", "energy": -1, "positivity": 0, "curiosity": -1 },
    { "questionId": 6, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 1 },
    { "questionId": 6, "choice": "B", "energy": -1, "positivity": 0, "curiosity": -1 },
    { "questionId": 6, "choice": "C", "energy": 0, "positivity": 1, "curiosity": 1 },
    { "questionId": 7, "choice": "A", "energy": -1, "positivity": 1, "curiosity": -1 },
    { "questionId": 7, "choice": "B", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 7, "choice": "C", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 8, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 1 },
    { "questionId": 8, "choice": "B", "energy": 0, "positivity": 0, "curiosity": 1 },
    { "questionId": 8, "choice": "C", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 9, "choice": "A", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 9, "choice": "B", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 9, "choice": "C", "energy": -1, "positivity": 1, "curiosity": 1 },
    { "questionId": 10, "choice": "A", "energy": 0, "positivity": 0, "curiosity": 1 },
    { "questionId": 10, "choice": "B", "energy": -1, "positivity": 1, "curiosity": 0 },
    { "questionId": 10, "choice": "C", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 11, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 11, "choice": "B", "energy": -1, "positivity": 0, "curiosity": -1 },
    { "questionId": 11, "choice": "C", "energy": -1, "positivity": 1, "curiosity": -1 },
    { "questionId": 12, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 12, "choice": "B", "energy": -1, "positivity": 0, "curiosity": -1 },
    { "questionId": 12, "choice": "C", "energy": -1, "positivity": 0, "curiosity": 1 },
    { "questionId": 13, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 1 },
    { "questionId": 13, "choice": "B", "energy": 0, "positivity": 1, "curiosity": -1 },
    { "questionId": 13, "choice": "C", "energy": 1, "positivity": 0, "curiosity": 0 },
    { "questionId": 14, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 14, "choice": "B", "energy": 1, "positivity": 0, "curiosity": 1 },
    { "questionId": 14, "choice": "C", "energy": 0, "positivity": 0, "curiosity": 0 },
    { "questionId": 15, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 0 },
    { "questionId": 15, "choice": "B", "energy": 0, "positivity": 0, "curiosity": 0 },
    { "questionId": 15, "choice": "C", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 16, "choice": "A", "energy": -1, "positivity": 1, "curiosity": 0 },
    { "questionId": 16, "choice": "B", "energy": -1, "positivity": -1, "curiosity": 0 },
    { "questionId": 16, "choice": "C", "energy": 0, "positivity": 0, "curiosity": 0 },
    { "questionId": 17, "choice": "A", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 17, "choice": "B", "energy": 1, "positivity": 1, "curiosity": 1 },
    { "questionId": 17, "choice": "C", "energy": -1, "positivity": 1, "curiosity": -1 },
    { "questionId": 18, "choice": "A", "energy": 1, "positivity": 1, "curiosity": 1 },
    { "questionId": 18, "choice": "B", "energy": 0, "positivity": 1, "curiosity": 0 },
    { "questionId": 18, "choice": "C", "energy": 0, "positivity": 1, "curiosity": -1 }
];

// 가중치 기반 분포 분석
function analyzeWeightedDistribution() {
    // Ocean: C > P > E (3:2:1 가중치)
    // Season: E > P > C (3:2:1 가중치)

    console.log('=== 가중치 기반 점수 분석 ===\n');

    // Ocean 점수 분석 (C*3 + P*2 + E*1)
    console.log('--- Ocean 계산 (C*3 + P*2 + E*1) ---');
    const oceanScores: number[] = [];
    choiceScores.forEach(score => {
        oceanScores.push(score.curiosity * 3 + score.positivity * 2 + score.energy * 1);
    });

    const simulations = 10000;
    const oceanResults: number[] = [];

    for (let i = 0; i < simulations; i++) {
        let totalOcean = 0;
        for (let q = 1; q <= 18; q++) {
            const questionChoices = choiceScores.filter(s => s.questionId === q);
            const randomChoice = questionChoices[Math.floor(Math.random() * questionChoices.length)];
            totalOcean += randomChoice.curiosity * 3 + randomChoice.positivity * 2 + randomChoice.energy * 1;
        }
        oceanResults.push(totalOcean);
    }

    oceanResults.sort((a, b) => a - b);
    const oQ1 = oceanResults[Math.floor(simulations * 0.20)];
    const oQ2 = oceanResults[Math.floor(simulations * 0.40)];
    const oQ3 = oceanResults[Math.floor(simulations * 0.60)];
    const oQ4 = oceanResults[Math.floor(simulations * 0.80)];

    console.log(`20% 분위: ${oQ1}`);
    console.log(`40% 분위: ${oQ2}`);
    console.log(`60% 분위: ${oQ3}`);
    console.log(`80% 분위: ${oQ4}`);
    console.log(`\n권장 Ocean 임계값 (5개 대양, 각 20%):`);
    console.log(`남극해: <= ${oQ1}`);
    console.log(`북극해: ${oQ1 + 1} ~ ${oQ2}`);
    console.log(`대서양: ${oQ2 + 1} ~ ${oQ3}`);
    console.log(`인도양: ${oQ3 + 1} ~ ${oQ4}`);
    console.log(`태평양: >= ${oQ4 + 1}`);

    // Season 점수 분석 (E*3 + P*2 + C*1)
    console.log('\n--- Season 계산 (E*3 + P*2 + C*1) ---');
    const seasonScores: number[] = [];
    choiceScores.forEach(score => {
        seasonScores.push(score.energy * 3 + score.positivity * 2 + score.curiosity * 1);
    });

    const seasonResults: number[] = [];

    for (let i = 0; i < simulations; i++) {
        let totalSeason = 0;
        for (let q = 1; q <= 18; q++) {
            const questionChoices = choiceScores.filter(s => s.questionId === q);
            const randomChoice = questionChoices[Math.floor(Math.random() * questionChoices.length)];
            totalSeason += randomChoice.energy * 3 + randomChoice.positivity * 2 + randomChoice.curiosity * 1;
        }
        seasonResults.push(totalSeason);
    }

    seasonResults.sort((a, b) => a - b);
    const sQ1 = seasonResults[Math.floor(simulations * 0.25)];
    const sQ2 = seasonResults[Math.floor(simulations * 0.50)];
    const sQ3 = seasonResults[Math.floor(simulations * 0.75)];

    console.log(`25% 분위: ${sQ1}`);
    console.log(`50% 분위: ${sQ2}`);
    console.log(`75% 분위: ${sQ3}`);
    console.log(`\n권장 Season 임계값 (4개 계절, 각 25%):`);
    console.log(`겨울: <= ${sQ1}`);
    console.log(`가을: ${sQ1 + 1} ~ ${sQ2}`);
    console.log(`봄: ${sQ2 + 1} ~ ${sQ3}`);
    console.log(`여름: >= ${sQ3 + 1}`);
}

// E+P+C 분포 분석 (종합 점수)
function analyzeSeasonDistribution() {
    const epcScores: number[] = [];

    // 각 선택지의 E+P+C 계산
    choiceScores.forEach(score => {
        epcScores.push(score.energy + score.positivity + score.curiosity);
    });

    // 통계 계산
    const sum = epcScores.reduce((a, b) => a + b, 0);
    const mean = sum / epcScores.length;
    const sortedScores = [...epcScores].sort((a, b) => a - b);
    const min = sortedScores[0];
    const max = sortedScores[sortedScores.length - 1];

    console.log('=== E+P+C 선택지 분포 분석 (종합 점수) ===');
    console.log(`평균: ${mean.toFixed(2)}`);
    console.log(`최소: ${min}, 최대: ${max}`);
    console.log(`범위: ${min} ~ ${max}`);

    // 18개 질문 모두 선택했을 때 가능한 최소/최대
    console.log(`\n=== 18개 질문 응답 시 가능한 E+P+C 범위 ===`);
    console.log(`이론적 최소: ${min * 18}`);
    console.log(`이론적 최대: ${max * 18}`);

    // 실제 분포 시뮬레이션 (랜덤 샘플링)
    const simulations = 10000;
    const results: number[] = [];

    for (let i = 0; i < simulations; i++) {
        let totalEPC = 0;
        for (let q = 1; q <= 18; q++) {
            const questionChoices = choiceScores.filter(s => s.questionId === q);
            const randomChoice = questionChoices[Math.floor(Math.random() * questionChoices.length)];
            totalEPC += randomChoice.energy + randomChoice.positivity + randomChoice.curiosity;
        }
        results.push(totalEPC);
    }

    results.sort((a, b) => a - b);
    const q1 = results[Math.floor(simulations * 0.25)];
    const q2 = results[Math.floor(simulations * 0.50)];
    const q3 = results[Math.floor(simulations * 0.75)];

    console.log(`\n=== 10,000회 시뮬레이션 결과 (사분위수) ===`);
    console.log(`Q1 (25%): ${q1}`);
    console.log(`Q2 (50%, 중앙값): ${q2}`);
    console.log(`Q3 (75%): ${q3}`);

    console.log(`\n=== 권장 계절 임계값 (E+P+C 종합, 심리학적 균형) ===`);
    console.log(`겨울 (Winter): E+P+C <= ${q1}`);
    console.log(`가을 (Autumn): ${q1 + 1} <= E+P+C <= ${q2}`);
    console.log(`봄 (Spring): ${q2 + 1} <= E+P+C <= ${q3}`);
    console.log(`여름 (Summer): E+P+C >= ${q3 + 1}`);
}

analyzeSeasonDistribution();
analyzeWeightedDistribution();
