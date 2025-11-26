# Backend Handoff & Architecture Context

> **For the Backend AI Agent:**
> This document explains the current frontend architecture and provides *context* to help you design the backend logic.
> Please treat the integration points below as **suggestions**. You have full flexibility to design the API structure, database schema, and data fetching strategy as you see fit.

## 1. Project Context & Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Key Goal**: SEO optimization (Server Components) + Rich Interactivity (Client Components)

## 2. Architecture Evolution (Why is it like this?)
The project started as a React+Vite SPA and was migrated to Next.js to improve SEO.
- **`src/app/page.tsx` (Server Component)**: Handles metadata and initial HTML rendering for search engines.
- **`src/components/ClientApp.tsx` (Client Component)**: Contains the core application logic (state, animations, audio) inherited from the original SPA.

**Insight**: The frontend is currently structured to isolate client-side interactivity in `ClientApp.tsx`.

## 3. Data Flow & State
Currently, all data is local and hardcoded.

- **Questions**: Hardcoded in `ClientApp.tsx` (`const questions = [...]`).
- **User Answers**: Stored in React state `const [answers, setAnswers] = useState<string[]>([])`.
- **Flow**: Landing -> Question Loop -> Loading -> Result.

## 4. Integration Suggestions (Flexible)

### A. Saving User Responses
The natural place to trigger a save is likely in `ClientApp.tsx` inside `handleAnswer`, specifically when the last question is answered.

**Current Logic:**
```typescript
// src/components/ClientApp.tsx
const handleAnswer = (answerId: string) => {
  // ... state updates ...
  if (currentQuestionIndex < questions.length - 1) {
    // Next question
  } else {
    // [SUGGESTION]: This is where an API call to save results could happen
    // await saveResults(newAnswers);
    setStep('loading');
    // ...
  }
};
```

### B. Fetching Questions (Optional)
If you decide to serve questions from a DB:
- **Option 1 (Server Fetch)**: Fetch in `src/app/page.tsx` and pass as props to `ClientApp`. (Good for SEO if questions are static).
- **Option 2 (Client Fetch)**: Fetch inside `ClientApp.tsx` on mount.

### C. Result Calculation
Currently, the result view is static. You might want to:
1. Calculate the result on the backend based on `answers`.
2. Return the result type/data in the API response.
3. Pass that data to `ResultView`.

## 5. Key Files for Backend Work
- **`src/components/ClientApp.tsx`**: **Primary integration point.** Contains the main logic loop and state.
- **`src/app/page.tsx`**: Entry point. Useful if you want to inject server-side data.
- **`src/utils/audioManager.ts`**: Note that audio logic is browser-only (handled safely, but be aware).

---
*This architecture is designed to be extensible. Feel free to refactor `ClientApp.tsx` or introduce new API utilities as needed for your backend design.*
