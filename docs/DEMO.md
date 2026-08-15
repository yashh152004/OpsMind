# OpsMind Phase 3 Real-Time Observability & Incident Command Demo Guide

This document is a practical guide for demonstrating the live end-to-end monitoring, tracing, log analysis, and automated incident detection capabilities of the OpsMind platform.

---

## 🏗️ 1. Services to Start

To run the complete demonstration, make sure all services in the telemetry pipeline are running. Follow this sequence:

### Step 1: Start Telemetry Storage & Collector (Docker Compose)
From the project root directory:
```powershell
docker-compose up -d
```
*Verify container status with `docker-compose ps`. This launches MySQL, Prometheus, Jaeger, Loki, and the OpenTelemetry Collector.*

### Step 2: Start OpsMind Spring Boot Backend
From the [backend](file:///d:/Project/backend) directory:
```powershell
.\run-backend.bat
```
*Launches the backend server on `http://localhost:8080` with `/api` context path.*

### Step 3: Start OpsMind React Frontend
From the [frontend](file:///d:/Project/frontend) directory:
```powershell
npm run dev
```
*Starts the development server on `http://localhost:5173`.*

### Step 4: Start Monitored Spring Boot Microservice
From the [monitored-service](file:///d:/Project/monitored-service) directory:
```powershell
java -javaagent:opentelemetry-javaagent.jar "-Dotel.resource.attributes=service.name=monitored-service" "-Dotel.traces.exporter=otlp" "-Dotel.metrics.exporter=otlp" "-Dotel.logs.exporter=otlp" "-Dotel.exporter.otlp.protocol=grpc" "-Dotel.exporter.otlp.endpoint=http://localhost:4317" -jar target/monitored-service-0.0.1-SNAPSHOT.jar
```
*This starts the target microservice on port `8081` with auto-instrumentation via the OTel Agent.*

### Step 5: Start Traffic Generator Script
From the project root directory:
```powershell
.\generate-traffic.ps1
```
*Initiates continuous request generation hitting `/api/hello`, `/api/delay`, and `/api/error` endpoints to simulate active client traffic.*

---

## 🌐 2. Web Access & Authentication

1. Open your web browser and navigate to:
   ```text
   http://localhost:5173
   ```
2. **First Time Setup**: Create a user account if one doesn't exist by clicking **Register** or run the following PowerShell script to provision a local profile:
   ```powershell
   $body = @{
       firstName = "Yash"
       lastName = "Kumar"
       email = "admin@opsmind.io"
       password = "OpsMind2026!"
       organizationName = "Global Finance Systems"
   } | ConvertTo-Json
   Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $body -ContentType "application/json"
   ```
3. **Login Flow**: Log in using `admin@opsmind.io` and password `OpsMind2026!` (or use the Google OAuth flow if configured).
4. Upon successful login, you are redirected to the **OpsMind Platform Overview Dashboard**.

---

## 📈 3. Live Demonstration Walkthrough

### Walkthrough A: Platform Overview Dashboard
1. **Click**: **Dashboard** on the sidebar.
2. **Show**:
   - **Platform Availability**: Driven by live system telemetry metrics.
   - **Active Incidents**: Real-time count of active incident tickets in the database.
   - **Average Latency**: Average response duration of the monitored microservice, queried dynamically from Prometheus.
   - **Security Posture**: Calculated dynamically based on open vulnerabilities and security compliance findings.
   - **Cluster Performance Chart**: Recharts visualization rendering current node CPU utilization chronologically.

---

### Walkthrough B: Live Telemetry & Traffic Ingestion
1. Keep the **Dashboard** open and scroll down to the **Target Microservice: monitored-service** section.
2. **Show**:
   - The green **UP** status badge, showing that OpsMind successfully pings the microservice at `http://localhost:8081`.
   - **Total Request Count** and **Active Request Rate** metrics updating in real-time as the traffic generator sends requests.
3. **Latency Test**:
   - Call the delay endpoint in a separate console:
     ```powershell
     Invoke-WebRequest -Uri "http://localhost:8081/api/delay" -UseBasicParsing
     ```
   - Watch the **Average Latency** gauge increase instantly to reflect the delayed span (~200ms).
4. **Error Injection Test**:
   - Call the error endpoint in a separate console:
     ```powershell
     Invoke-WebRequest -Uri "http://localhost:8081/api/error" -UseBasicParsing
     ```
   - Watch the **HTTP Error Count** increment on the microservice dashboard.

---

### Walkthrough C: Traces & Logs Verification
1. On the dashboard under the **Recent Distributed Traces** section:
   - Identify the live trace span corresponding to your requests (e.g. `GET /api/hello` or `GET /api/error`).
   - Notice the trace duration (e.g. `200.0 ms`) and whether it contains a red error indicator (triggered by `/api/error`).
   - Observe the real Jaeger trace IDs loaded directly from the Jaeger API.
2. In the **Live Application Log Streams** terminal section:
   - Watch log lines propagate in real-time from Loki.
   - Verify that errors from `/api/error` appear with a red `ERROR` tag showing the stack trace for `"Simulated check failed: unable to write transaction to payment DB."`

---

### Walkthrough D: Incident Command Workflow (HIGH_ERROR_RATE)
This is the core operational flow demonstrating threshold evaluation and status lifecycle management.

#### 1. Baseline State (No Errors)
- Ensure the traffic generator is stopped, or run it while avoiding `/api/error` traffic.
- Verify that **no active incidents** exist for `monitored-service` on the Dashboard.

#### 2. Outage Injection (Crossing the Threshold)
- Simulate a high error-rate spike by hitting the error endpoint repeatedly:
  ```powershell
  for ($i=1; $i -le 15; $i++) {
      Invoke-WebRequest -Uri "http://localhost:8081/api/error" -UseBasicParsing -ErrorAction SilentlyContinue
  }
  ```
- This triggers continuous HTTP 500 errors, driving the error rate over the configured threshold of 5%.
- **Wait**: Allow the backend evaluation cron to run (configured for 10-second polling intervals).
- **Incident Declaration**:
   - A critical red banner will slide into the dashboard stating:
     `Active Incident: High HTTP Error Rate on monitored-service`
   - It lists the live error rate (e.g. `100.00%` vs threshold `5.00%`).
   - Check the **Incidents** page to see the newly declared `OPEN` incident.

#### 3. Triage & Manual Acknowledgment
- In the **Identity & Incidents** page, click on the declared incident to open the **Signal Progression Drawer**.
- **Show**:
   - The Service Focus (`monitored-service`), Severity Class (`P1 RESPONSE`), and Environmental attributes.
   - The current metric value vs threshold.
- **Acknowledge**:
   - Click the **Acknowledge** button in the bottom footer.
   - Observe the **Signal Progression** updates to highlight `ACKNOWLEDGED`.
   - A timeline event is generated: `"Incident transitioned from OPEN to ACKNOWLEDGED"`.

#### 4. System Recovery & Auto-Resolution
- Stop injecting error requests.
- Generate normal traffic by hitting the hello endpoint:
  ```powershell
  for ($i=1; $i -le 10; $i++) {
      Invoke-WebRequest -Uri "http://localhost:8081/api/hello" -UseBasicParsing
  }
  ```
- **Observe Recovery**:
   - Once the evaluation window slides (error rate falls back below 5%), the backend detection job automatically transitions the incident status to `RESOLVED`.
   - The red alert banner on the dashboard switches to a green **Automated Platform Protection Alert** showing recovery status and resolution context.
   - Check the Incidents page to verify that the lifecycle marker shows `RESOLVED` and that the dynamic MTTR metric on the dashboard recalculates.

---

## 🎙️ 4. Presenter Script

Use this script to guide recruiters or engineering leads through the architecture:

> *"Welcome to the OpsMind platform demonstration. OpsMind is designed to move teams away from fragmented logs and static charts to **context-aware incident command**."*
>
> *"Here, we are monitoring a real Spring Boot microservice running on port 8081. This microservice is equipped with the OpenTelemetry Java Agent, which collects metrics, distributed traces, and log lines on every invocation, sending them to an Otel Collector. The collector formats and routes these metrics to Prometheus, traces to Jaeger, and logs to Grafana Loki."*
>
> *"OpsMind's backend periodically queries these telemetry sources to aggregate system status. Look at the dashboard: these KPI cards show the real-time average latency and request rates. The distributed trace list and live logs console below query Jaeger and Loki directly. Nothing is mock or static. If I inject latency on `/api/delay`, you will see the average latency card update in real-time."*
>
> *"Let's simulate a platform failure. By hitting `/api/error`, we generate HTTP 500 exceptions. SRE teams can't stare at dashboards all day, so OpsMind evaluates the error rate on the backend. When the error rate crosses our configured 5% threshold, SREs receive a notification, and a P1 Incident is declared."*
>
> *"Clicking the incident opens the incident triage HUD, where we can view the exact telemetry metrics that triggered the threshold. Responders can manually Acknowledge the incident. Once the underlying issue is fixed and the error rate normalized, OpsMind detects the recovery, auto-resolves the ticket, updates our SLA stats, and recalibrates our Mean Time to Resolution (MTTR) dynamically. That's real-time, context-driven observability in action."*
