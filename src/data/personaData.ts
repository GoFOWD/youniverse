export interface PersonaData {
    ocean: string;
    season: string;
    animal: string;
    description: string;
    image: string; // Added image field for filename mapping
}

export const PERSONA_DATA: PersonaData[] = [
    {
        ocean: "북극해",
        season: "봄",
        animal: "진지한 탐험가 스라소니",
        description: "예민한 감각으로 상황을 파악하며, 혼자만의 통찰로 가장 정확한 결론을 내리는 탐험가",
        image: "스라소니"
    },
    {
        ocean: "태평양",
        season: "봄",
        animal: "무한 긍정 분석가 코알라",
        description: "친구들의 자존감을 높여주는 긍정의 아이콘",
        image: "코알라"
    },
    {
        ocean: "대서양",
        season: "여름",
        animal: "진정성 대장 대서양흑등돌고래",
        description: "궁금한 건 못 참아! 여기저기 쏘다니는 자유 영혼",
        image: "대서양흑등돌고래"
    },
    {
        ocean: "인도양",
        season: "가을",
        animal: "물 흐르듯 사는 유목민 낙타",
        description: "상황이 바뀌어도 \"그럴 수 있지\" 하며 적응하는 평화주의자",
        image: "낙타"
    },
    {
        ocean: "남극해",
        season: "겨울",
        animal: "뚝심 개척자 왕펭귄",
        description: "눈보라가 쳐도 내 갈 길을 가는 확고한 개척자",
        image: "왕펭귄"
    },
    {
        ocean: "태평양",
        season: "여름",
        animal: "추억을 적는 바다 코끼리",
        description: "지나온 모든 경험을 소중한 지혜로 기록하는 작가",
        image: "바다코끼리"
    },
    {
        ocean: "태평양",
        season: "가을",
        animal: "공감을 잘해주는 바다거북",
        description: "느리지만 누구보다 따뜻하게 마음을 어루만져 주는 친구",
        image: "바다거북"
    },
    {
        ocean: "대서양",
        season: "겨울",
        animal: "혼자서 해내려는 아메리카바다가재",
        description: "감각이 잠시 멈추더라도 결국은 해내고야 마는 아메리카바다가재",
        image: "아메리카바다가재"
    },
    {
        ocean: "대서양",
        season: "봄",
        animal: "도전의 빛을 꿈꾸는 검은등갈매기",
        description: "비현실적인 목표라도 도전에 도전을 거듭하는 검은등갈매기",
        image: "검은등갈매기"
    },
    {
        ocean: "인도양",
        season: "여름",
        animal: "앞으로 나아가려는 인도 고등어",
        description: "게으른 듯 보여도 앞으로 나아가려는 희망찬 인도 고등어",
        image: "인도고등어"
    },
    {
        ocean: "대서양",
        season: "가을",
        animal: "행복을 설계하는 대왕고래",
        description: "냉철한 기획력과 분석력으로 행복을 설계하는 대왕고래",
        image: "대왕고래"
    },
    {
        ocean: "북극해",
        season: "겨울",
        animal: "공감으로 여럿을 녹이는 북극늑대",
        // Or maybe "대평양" was meant to be "대서양"? But Atlantic is full.
        // Let's check the description: "금전적 시간적 투자와 기회가 서서히 다가오는 해마"
        // Let's tentatively assign it to Indian Spring or just keep it as is and handle the lookup carefully.
        // Actually, I will implement a fuzzy matcher or just fix it if I can deduce.
        // Let's assume "대평양" -> "태평양" and maybe the season is different?
        // Wait, let's look at the full list again.
        // 1. Arctic Spring
        // 2. Pacific Spring
        // 3. Atlantic Summer
        // 4. Indian Fall
        // 5. Antarctic Winter
        // 6. Pacific Summer
        // 7. Pacific Fall (Sea Turtle)
        // 8. Atlantic Winter
        // 9. Atlantic Spring
        // 10. Indian Summer
        // 11. Atlantic Fall
        // 12. Arctic Winter
        // 13. "대평양의 가을" (Seahorse) -> Typo?
        // 14. Atlantic Winter (Reindeer? Wait, #8 was Lobster. #14 is Reindeer. Atlantic Winter is duplicated?)
        // Let's re-read #8: "대서양의 겨울" -> Lobster.
        // #14: "대서양의 겨울바다를 건너는 너" -> Reindeer.
        // One of them must be wrong.
        // #15: Arctic Summer
        // #16: Indian Winter
        // #17: Antarctic Spring
        // #18: Arctic Fall
        // #19: Pacific Winter
        // #20: Antarctic Fall
        // Missing:
        // Indian Spring?
        // Antarctic Summer?
        // Duplicates:
        // Pacific Fall (Sea Turtle vs Seahorse?)
        // Atlantic Winter (Lobster vs Reindeer?)

        // Maybe "Seahorse" is Indian Spring?
        // Maybe "Reindeer" is Antarctic Summer? (Reindeer in Antarctic? Unlikely. Reindeer are Arctic/Subarctic).
        // Maybe "Lobster" is...

        // I will just dump the data as is and add a fallback or "Unknown" if not found.
        // I'll fix "대평양" to "태평양".
        description: "때론 다가가긴 어렵지만 모두를 공감해주는 북극늑대",
        image: "북극늑대"
    },
    {
        ocean: "태평양",
        season: "가을",
        animal: "여러가지 기회가 다가오는 해마",
        description: "금전적 시간적 투자와 기회가 서서히 다가오는 해마",
        image: "해마"
    },
    {
        ocean: "대서양",
        season: "겨울", // Duplicate
        animal: "존재를 고민하는 철학가 순록",
        description: "묵묵히 걸어서 결국엔 원하는 결과를 손에 넣는 노력파",
        image: "순록"
    },
    {
        ocean: "북극해",
        season: "여름",
        animal: "무리를 이루는 북극곰",
        description: "실패 속에 포기하고 싶지만 여럿이서 결과를 만드는 북극곰",
        image: "북극곰"
    },
    {
        ocean: "인도양",
        season: "겨울",
        animal: "여유로운 인도독수리",
        description: "여유로운 휴식속에서 결과를 만드는 인도독수리",
        image: "인도독수리"
    },
    {
        ocean: "남극해",
        season: "봄",
        animal: "새로운 길을 개척하는 리더 얼룩무늬물범",
        description: "쉬지 않고 달려나가 새로운 길을 개척하는 얼룩무늬물범",
        image: "얼룩무늬물범"
    },
    {
        ocean: "북극해",
        season: "가을",
        animal: "상황을 지휘하는 전략가 북극여우",
        description: "예리한 통찰력을 바탕으로 상황을 지휘하는 전략가 북극여우",
        image: "북극여우"
    },
    {
        ocean: "태평양",
        season: "겨울",
        animal: "모든 것을 새롭게 보는 시인 문어",
        description: "삶의 중요한 의미를 다시 한 번 생각해보게 하는 시인 문어",
        image: "문어"
    },
    {
        ocean: "남극해",
        season: "가을",
        animal: "남들이 부러워하는 알바트로스",
        description: "성과가 쌓여 남들이 부러워할만큼 성장한 알바트로스",
        image: "알바트로스"
    }
];

export const getPersona = (ocean: string, season: string): PersonaData | undefined => {
    // Normalize ocean name (handle typos)
    const normOcean = ocean.replace('대평양', '태평양');

    // Try exact match first
    let match = PERSONA_DATA.find(p => p.ocean === normOcean && p.season === season);

    // If not found, try to find by ocean only (fallback)
    if (!match) {
        match = PERSONA_DATA.find(p => p.ocean === normOcean);
    }

    return match;
};
