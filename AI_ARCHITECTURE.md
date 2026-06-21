# AI_ARCHITECTURE.md

## 🏗️ Native OpsMind SRE Intelligence Architecture

### 1. Overview
The OpsMind AI has been transformed from a generic LLM proxy into a deterministic **Domain Reasoning Engine (DRE)**. This architecture ensures 100% data privacy and zero latency by processing SRE logic directly within the Spring Boot application context.

### 2. Multi-Layer Intelligence Model

| Layer | Component | Responsibility |
| :--- | :--- | :--- |
| **Layer 1** | **Operational Intelligence** | Ingests raw Alert, Incident, and Infrastructure telemetry via JPA repositories. |
| **Layer 2** | **Correlation Engine** | Groups telemetry signals by `serviceName`, `source`, and `timestamp` to identify clusters of failure. |
| **Layer 3** | **Deduction Engine** | Applies SRE heuristics (e.g., Latency + CPU Spikes = Thread Starvation) to determine Root Cause. |
| **Layer 4** | **Recommendation Engine** | Generates deterministic recovery steps (Scaling, Configuration tuning, Patching) based on findings. |
| **Layer 5** | **Presentation Layer** | Formats findings into structured, technical reports for the SRE operator. |

### 3. Reasoning Data Flow
1. **Query**: User asks "Why is the checkout service failing?"
2. **Scan**: Engine queries `IncidentRepository` and `AlertRepository` for "checkout-service" signals in the last 60 minutes.
3. **Cross-Reference**: Engine queries `InfrastructureRepository` for heath status of nodes linked to the service.
4. **Synthesis**: Engine correlates "Database Latency" alerts with "Primary DB" infrastructure degradation.
5. **Report**: Generates RCA report with specific evidence and pool-size recommendations.

### 4. Benefits
- **Deterministic**: Same telemetry always produces the same (correct) conclusion.
- **Privacy**: No platform data ever leaves the local environment.
- **Speed**: Conclusion generated in milliseconds without network hops.
- **Cost**: Zero API token costs.
