# OpsMind Testing Guide

Comprehensive testing strategy for the OpsMind Enterprise Platform.

## 1. Backend Testing (JUnit/Mockito)
- **GeminiServiceTest**: Mock the Google API response and verify the reasoning logic.
- **IncidentControllerTest**: Verify the lifecycle transitions (OPEN -> RESOLVED).
- **Security**: Test JWT token validation and role-based access.

## 2. Frontend Testing (Cypress/Vitest)
- **Auth Flow**: Test registration, login, and redirection to onboarding.
- **WebSocket**: Verify that `useAlertStream` correctly receives messages from the STOMP broker.
- **Charts**: Test Recharts rendering reliability with empty or malformed data.

## 3. Integration Testing
- **Simulation Test**: Trigger a CPU Spike via `/api/simulator/trigger` and verify:
  1. Incident is created in DB.
  2. Alert is created in DB.
  3. WebSocket notification is sent.
  4. Frontend UI updates without refresh.

## 4. AI Verification
- Test various prompts: "/rca [id]", "summarize logs", "predict failure".
- Verify that Gemini 404 errors are handled by the fallback mechanism in `GeminiService`.

## 5. UI/UX Audit
- Verify dark mode contrast ratios.
- Test responsive layouts on Mobile (iPhone 14) and Tablet (iPad Pro).
