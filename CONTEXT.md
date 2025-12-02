# Youniverse - 바다 심리 테스트 프로젝트

## 최근 작업 내역 (2025-12-03)

### 1. ShareCard 최종 디자인 완성
- **9:16 비율** (Instagram Story 최적화)
- **지도 섹션**: 정확한 4:5 비율 유지
- **계기판 배치**: 기압계와 나침반을 나란히 수평 배치 (120px × 120px)
- **Featured Sailor 스타일**: "올해를 빛낸 선원" 컨셉으로 동물 페르소나 표현
  - 대형 초상화 (160px × 160px)
  - Award-style 헤더 ("⚓ Featured Sailor ⚓")
  - 명패 스타일 이름/설명 플레이트
  - 빈티지 프레임 및 장식
- **패딩 제거**: 계기판 섹션 패딩 0으로 설정

### 2. 동물 이미지 연결
- 모든 20개 바다 유형 조합에 동물 PNG 이미지 연결 완료
- `personaData.ts`에 누락된 `image` 필드 추가:
  - 북극늑대, 해마, 순록, 북극곰, 인도독수리
  - 얼룩무늬물범, 북극여우, 문어, 알바트로스

### 3. 계기판 바늘 수정
- **기압계 바늘**: 길이를 18%로 조정하여 이미지 경계 내에 위치
  - 중심에서 정확히 회전하도록 수정
  - 계절별 회전: 봄(45°), 여름(135°), 가을(-45°), 겨울(-135°)
- **나침반 바늘**: 길이를 25px로 축소하여 경계 내에 위치

### 4. 전환 효과 및 타이밍 수정
- **18번째 문제**: 미리 나오던 수면 영상 제거
- **로딩 페이지**: `main3.mp4` (수면 위로 올라가는 영상) 4초 동안 재생
- **대양 전환**: 각 대양별 영상 3초 동안 재생
- **총 전환 시간**: 7초 (로딩 4초 + 대양 영상 3초)

### 5. AllOceanTypesView 개선
- 동물 이미지 크기 확대: 80px → 128px (w-32 h-32)
- 테두리 강화: border-2 → border-4
- 그림자 효과 강화: shadow-md → shadow-lg

## 주요 파일 변경사항

### 수정된 파일
1. `src/components/result/ShareCard.tsx`
   - 9:16 비율 레이아웃
   - Featured Sailor 스타일 구현
   - 계기판 나란히 배치
   - 패딩 제거

2. `src/data/personaData.ts`
   - 모든 항목에 `image` 필드 추가
   - 20개 바다 유형 완성

3. `src/components/result/Barometer.tsx`
   - 바늘 길이 18%로 조정
   - 중심 회전 정확도 개선

4. `src/components/ClientApp.tsx`
   - 18번째 문제 영상 제거
   - 로딩 페이지 4초 대기 추가
   - `main3.mp4` 사용

5. `src/components/result/AllOceanTypesView.tsx`
   - 동물 이미지 크기 확대
   - 시각적 효과 강화

## 기술 스택
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: Prisma + PostgreSQL

## 프로젝트 구조
```
youniverse-main/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/             # React 컴포넌트
│   │   ├── result/            # 결과 페이지 컴포넌트
│   │   │   ├── ShareCard.tsx  # 공유 카드 (9:16)
│   │   │   ├── Barometer.tsx  # 기압계
│   │   │   ├── Compass.tsx    # 나침반
│   │   │   └── AllOceanTypesView.tsx
│   │   └── ClientApp.tsx      # 메인 앱 로직
│   └── data/
│       └── personaData.ts     # 동물 페르소나 데이터
└── public/
    └── assets/                # 이미지 및 비디오 파일
        ├── *.png             # 동물 이미지 (20개)
        └── *.mp4             # 배경 비디오
```

## 다음 작업 예정
- [ ] 사용자 피드백 수집
- [ ] 성능 최적화
- [ ] SEO 개선
- [ ] 소셜 공유 기능 강화
