# OpsMind — Phase 2 Demo Guide

This guide details the integration of the OpsMind platform with a real Spring Boot microservice, collecting live telemetry via OpenTelemetry, Grafana Loki, Jaeger, and Prometheus.

## 1. Phase 2 Objective

The goal of Phase 2 is to replace mock telemetry data in OpsMind with real-world, live telemetry. A standalone Spring Boot microservice (`monitored-service`) runs independently and is auto-instrumented using the official OpenTelemetry Java Agent. Telemetry is collected by an OpenTelemetry Collector, exported to Prometheus (metrics), Jaeger (traces), and Loki (logs), which is then consumed and displayed in real-time in the OpsMind React Dashboard.

## 2. Architecture

The end-to-end telemetry pipeline is structured as follows:

```text
       [ Traffic Generator PS Script ]
                     ↓
         [ Real Spring Boot Microservice ]  (Port 8081)
                     ↓
        [ OpenTelemetry Java Agent ]
                     ↓
        [ OpenTelemetry Collector ]        (Port 4317/4318)
          ↙          ↓           ↘
[ Prometheus ]   [ Jaeger ]    [ Loki ]    (Telemetry Storage)
(Port 9090)     (Port 16686)  (Port 3100)
          ↖          ↑           ↗
          [ OpsMind Spring Boot Backend ]   (Port 8080)
                     ↓
          [ OpsMind React Dashboard ]       (Port 5173)
```

## 3. What Was Implemented

1. **Monitored Microservice**: A standalone Spring Boot web application running at port `8081` with endpoints:
   - `/api/hello` - Light successful response.
   - `/api/delay` - Simulates variable latency.
   - `/api/error` - Forces a server-side exception (HTTP 500).
2. **OpenTelemetry Auto-Instrumentation**: OpenTelemetry Java Agent attached during JVM startup, exporting standard OTLP telemetry.
3. **OpenTelemetry Collector**: Receives OTLP metrics, traces, and logs. Redistributes metrics to Prometheus, traces to Jaeger over gRPC, and logs to Loki over OTLP-HTTP.
4. **OpsMind Backend Core Integration**:
   - `OtelTelemetryService` queries Prometheus API for request count, rate, and latency; Jaeger JSON API for distributed operations; and Loki API range queries for structural application log lines.
   - Exposures via `/api/telemetry/realtime` REST endpoint.
5. **Observed telemetry views**: Real-time KPI microservice indicators, live Loki terminal feed, and a Jaeger distributed traces list displayed side-by-side on the React Dashboard.

## 4. Live Demo Flow

To demonstrate the microservice telemetry integration live:

### Demo A: Normal Traffic (Successes)
- **Action**: Run the traffic generator, causing requests to hit `/api/hello`.
- **Reaction**: The **Total Request Count** on the Dashboard increases. The **Active Request Rate** stabilizes.
- **Trace & Log**: A trace for `GET /api/hello` appears in the *Recent Distributed Traces* card. An INFO log `Received request on /hello endpoint` prints in the *Live Application Log Streams* terminal.

### Demo B: Latency Simulation (Delays)
- **Action**: The traffic generator sends requests to `/api/delay`.
- **Reaction**: The **Average Latency** gauge on the dashboard rises to reflect the real delay injected by the endpoint (default ~200ms).
- **Trace & Log**: Traces for `GET /api/delay` show duration badges of ~200.0ms.

### Demo C: Failure Ingestion (Errors)
- **Action**: The traffic generator triggers `/api/error`.
- **Reaction**: The **HTTP Error Count** increases. The border of the card glows red.
- **Trace & Log**: Traces for `GET /api/error` appear with a red outline and error indicator. A stack trace from `dispatcherServlet` detailing the simulated write failure prints directly in the log terminal.

### Demo D: Trace & Log Verification
- Select any trace or log line in the Dashboard. The IDs and payloads confirm they originate from the OTLP Collector's live pipeline.

## 5. Screen Capture Anchors

When verifying, check these core UI areas:
1. **Target Microservice KPI Grid**: Cards displaying request count, latency, error count, and throughput rates.
2. **Recent Distributed Traces**: List of spans with latency benchmarks, endpoints, and error statuses.
3. **Live Application Log Streams**: Console container displaying ANSI-styled log streams from Loki.

## 6. Startup Commands

Start the components in the following sequence:

### Step 1: Start Infrastructure (Docker Compose)
From the root directory:
```powershell
docker-compose up -d
```
*Validates: MySQL, Prometheus, Jaeger, Loki, and OpenTelemetry Collector are active.*

### Step 2: Start OpsMind Backend
From `backend/`:
```powershell
.\run-backend.bat
```
*Validates: OpsMind Backend is running on port 8080, context path `/api`.*

### Step 3: Register / Login
Generate a local admin profile to access the authenticated dashboard:
```powershell
$body = @{
    firstName = "John"
    lastName = "Doe"
    email = "admin@opsmind.com"
    password = "password123"
    organizationName = "Google"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Step 4: Start React Dashboard
From `frontend/`:
```powershell
npm run dev
```
*Validates: Server starts on `http://localhost:5173/`.*

### Step 5: Start Monitored Microservice
From `monitored-service/`:
```powershell
java -javaagent:opentelemetry-javaagent.jar "-Dotel.resource.attributes=service.name=monitored-service" "-Dotel.traces.exporter=otlp" "-Dotel.metrics.exporter=otlp" "-Dotel.logs.exporter=otlp" "-Dotel.exporter.otlp.protocol=grpc" "-Dotel.exporter.otlp.endpoint=http://localhost:4317" -jar target/monitored-service-0.0.1-SNAPSHOT.jar
```
*Validates: The Spring Boot app starts on port 8081 with the OTel Agent enabled.*

### Step 6: Start Traffic Generator
From the root directory:
```powershell
.\generate-traffic.ps1
```

## 7. Definition of Done
Phase 2 is considered complete when:
- [x] No mock values are used in `/api/telemetry/realtime`.
- [x] All OTel metrics, logging, and trace configurations export dynamically.
- [x] Average latency dynamically updates when slow requests are sent.
- [x] Request and error counts increment correctly under load.
- [x] Distributed traces and Loki logs show up instantly on dashboard.

## 8. Known Limitations
- High-frequency logs and metrics query directly against local REST APIs, suitable for dev environments. Scale-out deployments would use a dedicated caching layer.
