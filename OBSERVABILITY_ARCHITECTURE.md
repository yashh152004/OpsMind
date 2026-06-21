# OBSERVABILITY_ARCHITECTURE.md

## 📡 Real-Time Telemetry Pipeline

OpsMind utilizes a high-frequency polling and ingestion architecture to monitor the local environment in real-time.

### 1. Ingestion Layer
- **Hardware Observer (OSHI)**: Interrogates the host operating system every 5 seconds for CPU, RAM, and Disk metrics.
- **Database Sentinel (JDBC)**: Polls the MySQL performance schema for active connections and slow query counts.
- **Spring Actuator**: Exposes JVM internals (GC, Heap, Threads) via Micrometer.

### 2. Processing Layer (Autonomous Detection)
- **Threshold Engine**: Metrics are evaluated against critical operational baselines (e.g., CPU > 90%).
- **Incident Architect**: If a breach is detected, a `CRITICAL` alert and a `P1` Incident are automatically persisted.
- **Telemetry Indexer**: All metrics are saved to the `system_metrics` table for historical trend analysis.

### 3. Reasoning Layer (Cognitive Bridge)
- **Live Context Synthesis**: During an AI query, the recent 50 metric points and 100 log entries are bundled into the reasoning context.
- **Semantic Matching**: The Python Engine performs a semantic search over this live telemetry to identify the root cause of hardware stress.

### 4. Presentation Layer
- **Recharts Integration**: The React dashboard performs sub-second polling of the `SummaryController`, resulting in a "Live Streaming" feel for charts.
