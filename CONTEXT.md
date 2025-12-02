# Context: Database & Logic

## 1. Data Flow Overview
**User Interaction** → **API Calculation** → **Database Storage** → **Result Display**

1.  **User Interaction**: User answers 18 questions.
2.  **API Calculation (`/api/test/submit`)**:
    *   Receives answers.
    *   Fetches `ChoiceScore` from DB.
    *   Calculates `Energy`, `Positivity`, `Curiosity` scores.
    *   Determines `Ocean` (based on Energy/Positivity) and `Season` (based on Curiosity/Positivity).
3.  **Database Storage**:
    *   Saves raw answers and calculated final scores to `UserResponse`.
    *   Fetches the matching result content from `ResultMapping` using `ocean` and `season`.
4.  **Result Display**: Returns the title, description, advice, and hashtags to the frontend.

## 2. Database Schema Expectations

### `ResultMapping` Table
This table holds the static content for each result type.
*   **Key**: `ocean` + `season` (Unique Combination)
*   **Fields**:
    *   `title`: The main result title (e.g., "북극해의 봄을 맞는 너").
    *   `description`: Detailed explanation. **IMPORTANT**: Contains specific headers like "이번겨울이 보내는 마지막 편지" and "2026뜨거운 여름을 위한 너에게".
    *   `advice`: Actionable advice. **IMPORTANT**: Label changed to "이겨울 온도를 높여줄 한가지".
    *   `hashtag`: Array of strings (e.g., `["#북극해", "#봄"]`).

### `UserResponse` Table
Stores individual user test results.
*   `user_answers`: JSON array of selected choices.
*   `final_ocean`: Calculated Ocean type.
*   `final_season`: Calculated Season type.
*   `score`: JSON object with raw scores (`{ energy: 10, positivity: 5, ... }`).

## 3. Logic Verification
*   **Calculation**: `lib/score.ts` (implied) handles the math.
*   **Mapping**: The API looks up `ResultMapping` where `ocean` AND `season` match the calculated values.
*   **Verification Point**:
    *   Check if `final_ocean` and `final_season` in `UserResponse` match the expected logic based on `user_answers`.
    *   Ensure `ResultMapping` has entries for ALL possible Ocean/Season combinations (20 total).

## 4. Admin Optimization Context
*   **Mobile Performance**:
    *   `useMemo` used for heavy chart calculations in `AdminDashboard`.
    *   `max-h-screen` in layout ensures proper scrolling on mobile.
*   **Data Integrity**:
    *   Admin dashboard displays raw data from `UserResponse`.
    *   Filtering relies on DB queries matching `final_ocean` and `final_season`.
