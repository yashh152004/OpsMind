# PROJECT_KNOWLEDGE_MAP.md

## 🔍 OpsMind Platform Ecosystem

### 1. Data Models (Knowledge Sources)

| Entity | Description | Key Attributes | Reasoning Relevance |
| :--- | :--- | :--- | :--- |
| **Incident** | Active or historical outages. | `id`, `title`, `status`, `severity`, `serviceName`, `createdAt` | Root Cause Analysis (RCA), MTTR tracking. |
| **Alert** | Raw telemetry triggers. | `alertName`, `source`, `severity`, `status`, `message` | Failure detection, Correlation with incidents. |
| **Service** | Microservices and deployments. | `name`, `type`, `owner`, `healthStatus`, `version` | Dependency mapping, Blast radius analysis. |
| **InfrastructureAsset** | Physical/Cloud nodes. | `name`, `type`, `region`, `status`, `ipAddress` | Resource exhaustion, Regional failure analysis. |
| **SecurityFinding** | Vulnerabilities & threats. | `title`, `vulnerabilityType`, `severity`, `serviceName` | Risk prioritization, Security impact analysis. |
| **Comment** | Human remediation notes. | `content`, `author`, `incidentId` | Historical resolution patterns. |

### 2. Monitoring & Analytics Surface

- **Alert Engine**: Monitors `Alert` table for `CRITICAL` signals.
- **Incident Engine**: Grouping alerts into logical service disruptions.
- **Reliability Metrics**:
    - **Uptime**: Calculated via `Service` status history.
    - **MTTR**: Mean Time to Recovery from `Incident` resolution logs.
    - **Incident Frequency**: Pattern detection over weeks/months.

### 3. API Surface (Interaction Interface)

- **Auth**: `/api/auth/**` (User & Session management).
- **Core Ops**: 
    - `/api/incidents` (CRUD & Analysis).
    - `/api/alerts` (Real-time telemetry).
    - `/api/infrastructure` (Inventory).
- **AI/Reasoning**:
    - `/api/ai/chat` -> Main reasoning interface.
    - `/api/ai/insights` -> Predictive analytics.
- **System**: `/api/system/health` (Internal sub-system state).

### 4. Workflow Dependencies

1. **Failure Flow**: 
   `Alert` (Trigger) -> `Correlation Engine` -> `Incident` (Creation) -> `AI/SRE Engine` (Investigation).
2. **Analysis Flow**:
   `Historical Metrics` + `Infrastructure State` -> `Reasoning Engine` -> `Decision Support`.

### 5. Architectural Layers

- **Frontend**: Vite + React + Tailwind (Visualization).
- **Backend**: Spring Boot + JPA (Execution & Data Orchestration).
- **Security**: JWT + Spring Security (Access Control).
- **Intelligence**: Initial Gemini fallback (To be replaced by Internal Reasoning).
