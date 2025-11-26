# Deep Ocean, Soft Dawn 🌊

심해에서 시작되는 당신의 이야기. 18가지 질문을 통해 당신의 내면을 탐험하는 심리 테스트 애플리케이션입니다.

## ✨ Features

- 🎨 **몰입형 UI/UX**: Framer Motion을 활용한 부드러운 애니메이션
- 🌊 **Ascent 테마**: 심해에서 수면으로 올라가는 시각적 진행 표현
- 🔊 **오디오 피드백**: Web Audio API를 활용한 인터랙티브 사운드
- 🚀 **SEO 최적화**: Next.js App Router를 활용한 서버 사이드 렌더링
- 📱 **반응형 디자인**: 모바일부터 데스크톱까지 최적화된 경험

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Audio**: Web Audio API

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x 이상
- npm 또는 yarn

### Installation

```bash
# 저장소 클론
git clone https://github.com/GoFOWD/youniverse.git
cd youniverse

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

개발 서버가 실행되면 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

### Build

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout (Server Component, SEO metadata)
│   ├── page.tsx           # Home page (Server Component)
│   └── globals.css        # Global styles
├── components/
│   ├── ClientApp.tsx      # Main app logic (Client Component)
│   ├── Layout.tsx         # Visual layout & animations
│   ├── LandingView.tsx    # Landing screen
│   ├── QuestionView.tsx   # Question display
│   ├── LoadingView.tsx    # Loading animation
│   ├── ResultView.tsx     # Result screen
│   ├── ProgressBar.tsx    # Progress indicator
│   ├── ParticleOverlay.tsx # Particle effects
│   └── DepthIndicator.tsx  # Depth meter
└── utils/
    └── audioManager.ts     # Audio effects manager
```

## 🏗 Architecture

이 프로젝트는 **Server/Client Component 분리 아키텍처**를 사용합니다:

- **Server Components** (`app/layout.tsx`, `app/page.tsx`): SEO 메타데이터 및 초기 HTML 렌더링
- **Client Components** (`components/*`): 사용자 인터랙션, 상태 관리, 애니메이션

자세한 내용은 [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md)를 참조하세요.

## 🔗 Backend Integration

백엔드 연동을 위한 가이드는 [BACKEND_HANDOFF.md](./BACKEND_HANDOFF.md)에서 확인할 수 있습니다.

## 📝 License

This project is private and proprietary.

## 👥 Team

- **Frontend**: GoFOWD
