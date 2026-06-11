# OpsMind Working Demo Guide

This guide explains how to set up and demonstrate the OpsMind Enterprise Platform.

## 1. Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Gemini API Key (Google AI Studio)

## 2. Installation & Configuration

### Backend Setup
1. Navigate to `backend/`
2. Update `src/main/resources/application.yml` with your database credentials.
3. Set your Gemini API key:
   ```bash
   export GEMINI_API_KEY=your_actual_key_here
   ```
4. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to `frontend/`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 3. Demonstration Steps

### A. The Dashboard (Operational Health)
- Navigate to `/dashboard`.
- Observe the real-time KPI cards (Uptime, Incidents, MTTR).
- Use the **Lab Mode** buttons (top right) to inject failures like "CPU Spike" or "DB Crash".
- Watch the charts update dynamically.

### B. AI SRE Copilot (The Reasoning Engine)
- Go to `/ai-chat`.
- Ask: "Why is the checkout service experiencing latency?"
- Try the RCA command: `/rca 2` (where 2 is an incident ID).
- The AI will analyze the database telemetry and provide root cause insights.

### C. Incident Management (The Workflow)
- Go to `/incidents`.
- Use the **Declare Incident** button to create a new P1 outage.
- Use the **Status Tabs** to filter the lifecycle of tickets.
- Resolve an incident and witness the MTTR update in the Dashboard.

### D. Real-time Alerts
- Open `/alerts`.
- When an incident is triggered via the Simulator, watch the alert appear instantly via WebSocket.

### E. Onboarding Wizard
- Log out and go to `/onboarding`.
- Follow the multi-step setup to provision an organization cluster.
