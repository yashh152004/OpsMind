# OpsMind User Onboarding Guide

Welcome to the OpsMind Enterprise SRE Platform. This guide walks you through the initial setup for a new organization.

## Step 1: Registration
- Create your administrative account at `/register`.
- Verify your credentials.

## Step 2: Organization Setup (The Wizard)
- Upon first login, you will enter the **Setup Wizard** at `/onboarding`.
- **Identity**: Define your organization name (e.g., `Acme-Corp`).
- **Teams**: Provision your first Engineering Units (e.g., `NOC`, `Cloud Platform`).
- **Connectivity**: Select your telemetry sources (Prometheus, CloudWatch).

## Step 3: Connecting Your Infrastructure
- Generate an API Key in **Settings**.
- Deploy the OpsMind agent or use the CLI:
  ```bash
  opsmind connect --source=prometheus --token=$OPSMIND_TOKEN
  ```

## Step 4: Configuring Alerts
- Go to the **Alerts** module.
- Define thresholds for S1/S2 scenarios.
- Connect your Slack or PagerDuty sinks.

## Step 5: Utilizing the AI Copilot
- Access the **AI Copilot** for daily standups.
- Example query: "Give me a summary of all P1 incidents from the last 24 hours."

## Step 6: Analytics & Export
- Use the **Analytics** page to track team performance.
- Export Monthly Reliability Reports in CSV/PDF format.
