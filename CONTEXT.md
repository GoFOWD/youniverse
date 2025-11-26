# 프로젝트 작업 컨텍스트 (Backend Integration Complete)

> **최종 업데이트**: 2025-11-26  
> **작업자**: Frontend Developer (User Feedback Feature)  
> **상태**: ✅ Backend & Frontend Integration Complete + 🆕 User Feedback UI Ready

---

## 🆕 최신 업데이트 (2025-11-26) - 사용자 피드백 기능

### 📊 추가된 기능: 사용자 만족도 평가 시스템

결과 페이지(`ResultView.tsx`)에 사용자 피드백 수집 기능이 추가되었습니다.

#### 기능 개요
1. **별점 평가 (0-5점)**: 테스트 전반에 대한 만족도 평가
2. **코멘트 입력**: 자유로운 의견 작성 (최대 500자, 선택사항)
3. **제출 후 감사 메시지**: 제출 완료 시 UI 변경

#### 프론트엔드 구현 상태
- **파일**: `src/components/ResultView.tsx`
- **상태 관리**:
  ```typescript
  const [rating, setRating] = useState<number>(0);        // 0-5
  const [comment, setComment] = useState<string>('');     // 최대 500자
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  ```
- **현재 동작**: 제출 시 `console.log()`로 데이터 출력 (백엔드 미연동)

#### 전송 데이터 구조
```typescript
{
  resultCode: string,    // 예: "태평양-여름"
  rating: number,        // 1-5 (0은 미선택 상태)
  comment: string,       // 사용자 코멘트 (빈 문자열 가능)
  timestamp: number      // Date.now()
}
```

**예시**:
```json
{
  "resultCode": "태평양-여름",
  "rating": 4,
  "comment": "질문이 흥미로웠고 결과도 정확했어요!",
  "timestamp": 1732612345678
}
```

---

### 🔌 백엔드 통합 가이드 (Backend AI Agent용)

#### 1. 필요한 작업

##### A. Prisma 스키마에 새 테이블 추가
`prisma/schema.prisma`에 피드백 데이터를 저장할 모델을 추가합니다.

**제안하는 모델 이름**: `UserFeedback`, `Feedback`, `TestFeedback` 등 (자유롭게 선택)

**필수 필드**:
```prisma
model [모델명] {
  id          BigInt   @id @default(autoincrement())
  resultCode  String   // "태평양-여름" 형식
  rating      Int      // 1-5
  comment     String?  // 선택적 코멘트 (nullable)
  timestamp   BigInt   // 제출 시간 (밀리초)
  createdAt   DateTime @default(now())
  
  // 선택적: 인덱스 추가 (조회 성능 향상)
  @@index([resultCode])
  @@index([rating])
}
```

##### B. API 엔드포인트 생성
**제안하는 경로**: 
- `/api/feedback`
- `/api/test/feedback`
- `/api/user/feedback`
- 또는 원하는 다른 경로

**메서드**: `POST`

**요청 본문** (프론트엔드에서 전송):
```typescript
{
  resultCode: string,    // 예: "태평양-여름"
  rating: number,        // 1-5
  comment: string,       // 빈 문자열 가능
  timestamp: number      // Date.now()
}
```

**응답 형식** (제안):
```typescript
// 성공
{
  success: true,
  message?: string  // 선택사항
}

// 실패
{
  success: false,
  error: string
}
```

**구현 예시** (경로는 자유롭게 변경 가능):
```typescript
// src/app/api/[선택한경로]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { resultCode, rating, comment, timestamp } = await req.json();
    
    // 유효성 검사
    if (!resultCode || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Invalid data' },
        { status: 400 }
      );
    }
    
    // DB 저장 (모델명은 실제 정의한 이름으로 변경)
    await prisma.[모델명].create({
      data: {
        resultCode,
        rating,
        comment: comment || '',
        timestamp: BigInt(timestamp),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
```

##### C. 프론트엔드 연동
`src/components/ResultView.tsx`의 `handleFeedbackSubmit()` 함수를 수정합니다.

**현재 코드** (29-42행):
```typescript
const handleFeedbackSubmit = () => {
  if (rating === 0) {
    alert('별점을 선택해주세요!');
    return;
  }

  const feedbackData = {
    resultCode: `${result.ocean}-${result.season}`,
    rating,
    comment,
    timestamp: Date.now(),
  };

  console.log('📊 User Feedback:', feedbackData);
  setIsSubmitted(true);
};
```

**수정 후** (API 엔드포인트 경로를 실제 생성한 경로로 변경):
```typescript
const handleFeedbackSubmit = async () => {
  if (rating === 0) {
    alert('별점을 선택해주세요!');
    return;
  }

  const feedbackData = {
    resultCode: `${result.ocean}-${result.season}`,
    rating,
    comment,
    timestamp: Date.now(),
  };

  try {
    const res = await fetch('/api/[실제경로]', {  // ← 여기를 실제 경로로 변경
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
    
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Feedback submission failed');
    }
    
    setIsSubmitted(true);
  } catch (error) {
    console.error('Feedback error:', error);
    alert('피드백 제출에 실패했습니다. 다시 시도해주세요.');
  }
};
```

#### 2. 데이터베이스 마이그레이션
스키마 변경 후 실행:
```bash
npx prisma db push
npx prisma generate
```

#### 3. 관리자 페이지 (선택사항)
피드백 데이터를 조회할 수 있는 Admin API를 추가할 수 있습니다:
- 전체 피드백 조회
- 통계 (평균 별점, 결과별 만족도 등)
- 필터링 (날짜, 별점, 결과 코드 등)

---

### 📝 주요 파일 변경 사항

#### 프론트엔드 (이미 완료)
- `src/components/ResultView.tsx`
  - 피드백 상태 관리 추가
  - 별점 UI 구현
  - 코멘트 입력 필드 추가
  - 제출 핸들러 구현 (현재 console.log만)

#### 백엔드 (작업 필요)
- `prisma/schema.prisma` - 피드백 모델 추가
- `src/app/api/[경로]/route.ts` - API 엔드포인트 생성
- `src/components/ResultView.tsx` - API 호출 코드 추가 (handleFeedbackSubmit 수정)

---

### ⚠️ 중요 사항

1. **필수 필드**: `resultCode`, `rating`, `timestamp`
2. **선택 필드**: `comment` (빈 문자열 허용)
3. **유효성 검사**: rating은 1-5 범위 확인
4. **에러 처리**: API 호출 실패 시 사용자 알림
5. **중복 제출 방지**: `isSubmitted` 상태로 제어
6. **타임스탬프**: `Date.now()` 사용 (밀리초 단위)

---

### 🔄 작업 순서

1. **백엔드 개발자**: 
   - Prisma 모델 정의 (이름 자유)
   - API 엔드포인트 생성 (경로 자유)
   - DB 마이그레이션

2. **프론트엔드 연동**:
   - `ResultView.tsx`의 `handleFeedbackSubmit()` 함수에서
   - `fetch('/api/[실제경로]')` 부분을 실제 생성한 경로로 변경
   - `async/await` 추가

3. **테스트**:
   - 별점 선택 후 제출
   - 콘솔에서 네트워크 요청 확인
   - DB에 데이터 저장 확인

---




## 📋 작업 완료 요약

이 프로젝트는 **심리 테스트 서비스 (Psychological Test Service)**로, Next.js 14 + Prisma + Supabase 기반으로 구축되었습니다.

**완료된 작업:**
- ✅ Prisma 스키마 정의 및 데이터베이스 설계
- ✅ 점수 계산 로직 구현 (`src/lib/score.ts`)
- ✅ 질문 및 선택지 점수 데이터 시딩
- ✅ 20가지 결과 데이터 시딩 (Ocean × Season 조합)
- ✅ User API 구현 (`/api/test/start`, `/api/test/submit`)
- ✅ Admin API 구현 (질문/결과 수정)
- ✅ Frontend 통합 완료 (`ClientApp.tsx`, `ResultView.tsx`)

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블

#### 1. `Question` - 질문 테이블
```prisma
model Question {
  id        Int      @id @default(autoincrement())
  category  String?  // P, E, S, M, A
  text      String
  choices   String[] // 선택지 배열
  
  choiceScores ChoiceScore[]
}
```

#### 2. `ChoiceScore` - 선택지별 점수
```prisma
model ChoiceScore {
  id         Int      @id @default(autoincrement())
  questionId Int
  choice     String   // "A", "B", "C"
  energy     Int      // E 점수
  positivity Int      // P 점수
  curiosity  Int      // C 점수

  question   Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
}
```

#### 3. `ResultMapping` - 결과 매핑 테이블
```prisma
model ResultMapping {
  id          Int      @id @default(autoincrement())
  ocean       String   // 남극해, 북극해, 대서양, 인도양, 태평양
  season      String   // 겨울, 가을, 봄, 여름
  title       String
  description String
  advice      String?
  hashtag     String[]

  @@unique([ocean, season])
}
```

#### 4. `UserResponse` - 사용자 응답 기록
```prisma
model UserResponse {
  id           BigInt   @id @default(autoincrement())
  user_answers Json     // 상세 답변 기록 (타이밍 포함)
  final_ocean  String
  final_season String
  final_code   String
  score        Json     // { energy, positivity, curiosity }
  created_at   DateTime @default(now())
}
```

---

## 🧮 점수 계산 로직 (`src/lib/score.ts`)

### 정규화 함수
```typescript
const normalize = (value: number): number => {
  if (value >= 8) return 2;
  if (value >= 3) return 1;
  if (value > -3) return 0;
  if (value > -8) return -1;
  return -2;
};
```

### 매핑
- **OceanMap**: Energy 점수 → 대양 (남극해, 북극해, 대서양, 인도양, 태평양)
- **SeasonMap**: Positivity 점수 → 계절 (겨울, 가을, 봄, 여름)
  - **중요**: 1점과 2점 모두 "여름"으로 통합됨

### 최종 결과
- 18개 질문의 선택지 점수를 합산
- Energy, Positivity, Curiosity 각각 정규화
- Ocean-Season 조합으로 최종 결과 코드 생성

---

## 📊 시딩 데이터

### 질문 데이터 (18개)
- **파일**: `prisma/seed.ts`
- **카테고리**: P (긍정정서), E (몰입), S (사회관계), M (의미), A (성취)
- **형식**: 각 질문은 3개의 선택지 (A, B, C)를 가짐

### 선택지 점수 (54개)
- **파일**: `seed/choices.json` → `prisma/seed.ts`로 통합
- 각 질문의 A, B, C 선택지마다 energy, positivity, curiosity 점수 할당

### 결과 데이터 (20개)
- **조합**: 5개 대양 × 4개 계절 = 20가지
- **내용**: 각 결과마다 제목, 설명, 조언(행운 열쇠), 해시태그 포함
- **특이사항**: 
  - ID 7: 인도양 봄 (텍스트는 "인도양의 가을을 즐기는 너")
  - ID 14: 남극해 여름 (텍스트는 "대서양의 겨울바다를 건너는 너")
  - 위 두 항목은 중복 방지를 위해 누락된 조합으로 매핑됨

---

## 🔌 API 엔드포인트

### User APIs

#### `GET /api/test/start`
**목적**: 테스트 시작 시 질문 목록 조회  
**응답**:
```json
[
  {
    "id": 1,
    "category": "P",
    "text": "질문 텍스트",
    "choices": ["선택지 A", "선택지 B", "선택지 C"]
  }
]
```
**보안**: `choiceScores`는 제외하여 점수 노출 방지

#### `POST /api/test/submit`
**목적**: 사용자 답변 제출 및 결과 계산  
**요청**:
```json
{
  "answers": [
    {
      "questionId": 1,
      "choice": "A",
      "startTime": 1700000000000,
      "endTime": 1700000005000
    }
  ]
}
```
**응답**:
```json
{
  "ocean": "태평양",
  "season": "여름",
  "code": "태평양-여름",
  "title": "태평양의 여름을 가로지르는 너",
  "description": "...",
  "advice": "...",
  "hashtag": ["#태평양", "#여름", "#작가", "#의미"]
}
```

### Admin APIs (인증 필요)

#### `GET /api/admin/questions`
**목적**: 모든 질문 및 점수 조회 (관리자용)

#### `PUT /api/admin/questions/[id]`
**목적**: 질문 및 선택지 점수 수정

#### `PUT /api/admin/results/[id]`
**목적**: 결과 텍스트 수정

**인증**: `admin_token` 쿠키 필요 (`src/middleware.ts`)

---

## 🎨 Frontend 통합

### `src/components/ClientApp.tsx`
**변경사항**:
- `useEffect`로 `/api/test/start`에서 질문 로드
- 답변 타이밍 추적 (`useRef`, `Date.now()`)
- `handleAnswer`에서 `/api/test/submit`로 상세 답변 전송
- API 응답으로 결과 화면 표시

### `src/components/ResultView.tsx`
**변경사항**:
- `result` prop으로 동적 데이터 수신
- `title`, `description`, `advice`, `hashtag` 표시

---

## 🚀 로컬 환경 설정

### 1. 환경 변수 (`.env`)
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```
**중요**: Supabase 연결 정보 필요

### 2. 의존성 설치
```bash
npm install
```

### 3. Prisma 설정
```bash
# Prisma Client 생성
npx prisma generate

# 데이터베이스 스키마 푸시
npx prisma db push

# 데이터 시딩
npx prisma db seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```

---

## 📝 주요 파일 목록

### Backend Core
- `prisma/schema.prisma` - 데이터베이스 스키마
- `prisma/seed.ts` - 시딩 스크립트 (질문 18개 + 점수 54개 + 결과 20개)
- `src/lib/score.ts` - 점수 계산 로직
- `src/lib/prisma.ts` - Prisma 클라이언트 싱글톤

### APIs
- `src/app/api/test/start/route.ts` - 질문 조회
- `src/app/api/test/submit/route.ts` - 답변 제출 및 결과 계산
- `src/app/api/admin/questions/route.ts` - 질문 목록 조회 (관리자)
- `src/app/api/admin/questions/[id]/route.ts` - 질문 수정 (관리자)
- `src/app/api/admin/results/[id]/route.ts` - 결과 수정 (관리자)
- `src/middleware.ts` - 관리자 인증 미들웨어

### Frontend
- `src/components/ClientApp.tsx` - 메인 테스트 로직
- `src/components/ResultView.tsx` - 결과 화면

### Reference Data
- `seed/choices.json` - 선택지 점수 원본 데이터 (참고용)
- `seed/questions` - 질문 SQL (참고용)

---

## ⚠️ 주의사항

### Prisma 버전
- **사용 중**: Prisma v6
- **이유**: 프로젝트 요구사항에 맞춰 v6 사용
- `package.json`의 `prisma` 설정에 seed 명령어 정의됨

### 데이터 일관성
- 질문 수정 시 `ChoiceScore`도 함께 업데이트 필요
- 트랜잭션 처리로 데이터 일관성 보장 (`/api/admin/questions/[id]`)

### 결과 매핑
- Ocean-Season 조합은 `@@unique` 제약으로 중복 방지
- 총 20개 조합 (5 × 4) 필수

---

## 🔄 다음 작업 시 참고사항

### Pull 후 작업 순서
1. `.env` 파일 확인 (Supabase 연결 정보)
2. `npm install` - 의존성 설치
3. `npx prisma generate` - Prisma Client 재생성
4. `npx prisma db push` - 스키마 동기화 (필요시)
5. `npx prisma db seed` - 데이터 재시딩 (필요시)
6. `npm run dev` - 개발 서버 실행

### 데이터 초기화가 필요한 경우
```bash
# 기존 데이터 삭제 후 재시딩
npx prisma db seed
```

### 스키마 변경 시
```bash
# 스키마 변경 후
npx prisma db push
npx prisma generate
npx prisma db seed
```

---

## 🐛 트러블슈팅

### Prisma Client 에러
```bash
npx prisma generate
```

### 시딩 실패
- `prisma/seed.ts` 확인
- `package.json`의 `prisma.seed` 설정 확인
- TypeScript 컴파일 에러 확인

### API 호출 실패
- 개발 서버 실행 확인 (`npm run dev`)
- 브라우저 콘솔에서 네트워크 탭 확인
- API 라우트 파일 경로 확인

---

## 📞 문의사항

이 문서를 읽고도 이해가 안 되는 부분이 있다면:
1. `BACKEND_HANDOFF.md` - 초기 프로젝트 가이드 참고
2. `walkthrough.md` - 작업 완료 내역 참고
3. Prisma 공식 문서 참고

---

**Happy Coding! 🚀**
