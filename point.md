# Supabase DB 최적화 및 어드민 페이지 성능 개선 회고

## 개요
**모바일 어드민 페이지 성능 저하 및 결과 데이터 정합성 확보 (Why)**
→ 렌더링 최적화, React Hooks 에러 수정, DB 시드 데이터 업데이트 (What)
→ `useMemo` 최적화 및 `prisma/seed.ts` 수정을 통한 데이터 중심 구조 확립 (How)

## Challenge: React Hooks 순서 위반 및 데이터 관리

### Challenge 1: 조건부 렌더링 내 Hooks 호출로 인한 런타임 에러

**문제 상황:**
- 어드민 페이지네이션 버튼 생성 로직이 JSX 내부(`{useMemo ...}`)에 작성되어 있었음.
- 렌더링 조건에 따라 Hooks 호출 순서가 달라져 "Rendered more hooks than during the previous render" 에러 발생.

**시도 1:**
- `useMemo`를 단순히 상단으로 옮기려 했으나, 의존성 배열(`stats`)이 `null`일 때의 처리가 미흡했음.

**최종 해결:**
- 페이지네이션 생성 로직(`pageNumbers`)을 컴포넌트 최상위 레벨의 `useMemo`로 분리.
- `if (!stats) return`과 같은 Early Return 문 이전에 모든 Hooks가 선언되도록 구조 변경.
- [관련 코드: src/app/admin/page.tsx](file:///Users/admin/Desktop/youniverse/src/app/admin/page.tsx)

### Challenge 2: UI 하드코딩 vs 데이터베이스 원본 수정

**문제 상황:**
- 결과 페이지의 섹션 타이틀("ADVICE", "Description" 등) 변경 요청.
- 처음엔 `ResultView.tsx` 컴포넌트에서 텍스트를 직접 하드코딩하여 수정했으나, 이는 데이터 기반이 아닌 임시방편이었음.

**최종 해결:**
- `prisma/seed.ts` 파일의 `description` 필드 데이터를 일괄 수정("이번겨울이 보내는 마지막 편지" 등).
- `npx prisma db seed`를 실행하여 DB 데이터를 업데이트하고, UI의 하드코딩을 제거하여 데이터 중심 구조 유지.

## 기술적 회고: 데이터베이스 설계 및 계산 로직

### 1. 데이터베이스 설계 (Schema Design)

**설계 의도:**
사용자의 응답 데이터와 정적인 결과 콘텐츠를 분리하여 관리 효율성을 높이고, 통계 쿼리의 성능을 최적화했습니다.

**주요 테이블 구조:**
- **`Question` & `ChoiceScore`**: 질문과 선택지별 점수(Energy, Positivity, Curiosity)를 저장하는 메타 데이터 테이블.
- **`ResultMapping`**: `ocean`과 `season`의 조합(Unique Key)으로 매핑되는 최종 결과 콘텐츠(Title, Description, Advice) 저장.
- **`UserResponse`**: 사용자의 모든 응답 이력과 계산된 최종 결과(`final_ocean`, `final_season`)를 저장. 어드민 통계 쿼리 성능을 위해 주요 필드(`final_ocean`, `created_at` 등)에 Index 적용.

### 2. 데이터 처리 및 계산 로직 (Logic Flow)

**입력 값 (Input):**
- 클라이언트로부터 `answers` 배열(질문 ID, 선택한 답변, 소요 시간)을 수신합니다.

**계산 로직 (Calculation):**
1.  **점수 합산:** 사용자가 선택한 답변에 해당하는 `ChoiceScore`를 DB에서 조회하여 `Energy(E)`, `Positivity(P)`, `Curiosity(C)` 점수를 각각 합산합니다.
2.  **가중치 적용 알고리즘 (`src/lib/score.ts`):**
    - **Ocean 결정:** `C*3 + P*2 + E*1` 공식을 사용하여 점수를 산출하고, 5분위(20%씩) 구간으로 나누어 5대양(남극해~태평양)을 결정합니다.
    - **Season 결정:** `E*3 + P*2 + C*1` 공식을 사용하여 점수를 산출하고, 4분위(25%씩) 구간으로 나누어 4계절(겨울~여름)을 결정합니다.
    - *참고: 이 로직은 10,000번의 시뮬레이션 결과를 바탕으로 분포를 조정한 것입니다.*

**결과 매핑 (Mapping):**
- 계산된 `Ocean`과 `Season` 값을 키로 사용하여 `ResultMapping` 테이블에서 해당하는 결과 콘텐츠를 조회합니다.
- 이 방식은 로직 수정 없이 DB 데이터 업데이트만으로 결과 텍스트를 변경할 수 있게 해줍니다.

## 다음 담당자에게

**필수로 해야 할 것:**
- **데이터베이스 값 확인:** `context.md` 파일에 정의된 `ResultMapping` 테이블의 기대값과 실제 DB 값이 일치하는지 주기적으로 확인하세요.
- **로직 검증:** `src/app/api/test/submit/route.ts`에서 계산된 `ocean`과 `season` 값이 DB에 저장된 `ResultMapping`의 키와 정확히 매핑되는지 확인해야 합니다.
- **볼드체 처리:** `ResultView.tsx`에 `**텍스트**`를 `<strong>` 태그로 변환하는 `parseTextWithBold` 함수가 구현되어 있습니다. DB 데이터에 `**`를 사용하면 자동으로 볼드 처리됩니다.

**주의사항:**
- **어드민 페이지 성능:** `src/app/admin/page.tsx`의 차트 데이터 계산 로직은 모바일 성능을 위해 `useMemo`로 최적화되어 있습니다. 수정 시 의존성 배열을 주의하세요.
- **스크롤:** 어드민 레이아웃(`layout.tsx`)의 `max-h-screen` 속성은 모바일 스크롤을 위해 필수적입니다. 제거하지 마세요.

**참고 자료:**
- [context.md](file:///Users/admin/Desktop/youniverse/context.md): DB 스키마 및 로직 설명 문서
- [score.ts](file:///Users/admin/Desktop/youniverse/src/lib/score.ts): 점수 계산 알고리즘 원본

## 회고 & 학습

### Keep (계속할 것)
- 성능 병목 구간(필터링, 차트 계산)을 식별하고 `useMemo`, `useCallback`으로 최적화한 점.
- UI 수정 요청을 받았을 때, 단순히 뷰만 고치지 않고 데이터 원본(DB Seed)을 수정하여 유지보수성을 높인 점.

### Problem (문제였던 것)
- Hooks의 규칙(최상위 레벨 호출)을 간과하여 초기 수정 시 런타임 에러를 유발함.
- 텍스트 변경 요청 시 데이터의 출처(DB vs Static)를 먼저 확인하지 않고 하드코딩부터 시도함.

### Try (다음에 시도할 것)
- 컴포넌트 수정 전 Hooks 의존성 및 호출 위치 먼저 점검하기.
- 텍스트 수정 요청 시 해당 텍스트가 DB 데이터인지 정적 텍스트인지 먼저 파악하기.

## Action Items

- [ ] [팀 전체] 다음 배포 전 모바일 기기에서 어드민 페이지 스크롤 및 필터링 속도 최종 점검
- [ ] [담당자] `ResultView`의 `parseTextWithBold` 함수가 다양한 케이스(줄바꿈 등)에서도 잘 동작하는지 테스트
- [ ] [담당자] `context.md`를 참고하여 DB에 들어오는 결과값이 의도한 대로인지 샘플 테스트 진행
