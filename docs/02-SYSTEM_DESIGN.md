# OpsMind - System Design Document

## Table of Contents
1. [Low-Level Architecture](#low-level-architecture)
2. [Service Design](#service-design)
3. [Sequence Diagrams](#sequence-diagrams)
4. [Component Interactions](#component-interactions)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Resilience Patterns](#resilience-patterns)

---

## Low-Level Architecture

### Backend Service Architecture (DDD + Clean Architecture)

Each service follows this layered structure:

```
┌──────────────────────────────────────────────────────────┐
│                    REST Controller Layer                 │
│                  (HTTP Request Handling)                 │
│  - Request validation                                    │
│  - Response mapping                                      │
│  - Exception handling                                    │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│               Application Service Layer                  │
│           (Use Case / Business Logic)                    │
│  - Orchestrate domain logic                             │
│  - Manage transactions                                  │
│  - Handle cross-cutting concerns                        │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│              Domain Layer (Business Logic)               │
│              (Entities, Value Objects, Rules)            │
│  - Pure business logic                                  │
│  - Independent of frameworks                           │
│  - No external dependencies                            │
└────────────────────────┬─────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────┐
│         Infrastructure Layer (Persistence)               │
│  - Database access (JPA)                                │
│  - External API calls                                  │
│  - Cache interactions                                  │
│  - Message publishing                                 │
└──────────────────────────────────────────────────────────┘
```

### Incident Service Structure

```
incident-service/
├── adapter/
│   ├── controller/
│   │   ├── IncidentController.java
│   │   └── IncidentDTO.java
│   ├── persistence/
│   │   ├── IncidentJpaRepository.java
│   │   ├── IncidentEntity.java
│   │   └── IncidentMapper.java
│   └── event/
│       ├── IncidentEventPublisher.java
│       └── IncidentEventListener.java
├── application/
│   ├── IncidentService.java
│   ├── IncidentQueryService.java
│   └── IncidentAssignmentService.java
├── domain/
│   ├── Incident.java (Aggregate Root)
│   ├── IncidentId.java (Value Object)
│   ├── IncidentStatus.java (Enum)
│   ├── IncidentSeverity.java (Enum)
│   ├── IncidentTimeline.java (Entity)
│   ├── IncidentRepository.java (Interface)
│   └── IncidentFactory.java
└── config/
    └── IncidentBeanConfig.java
```

### Domain Model - Incident

```java
// Domain Layer
public class Incident {
    private IncidentId id;
    private TenantId tenantId;
    private String title;
    private String description;
    private ServiceName serviceName;
    private Environment environment;
    private Severity severity;
    private Status status;
    private UserId assigneeId;
    private UserId reporterId;
    private Timeline timeline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    
    // Business logic
    public void assign(UserId userId) {
        if (this.status == Status.CLOSED) {
            throw new IncidentAlreadyClosedException();
        }
        this.assigneeId = userId;
        this.timeline.addEntry("Incident assigned to " + userId);
    }
    
    public void resolve(String resolution) {
        if (this.status == Status.CLOSED) {
            throw new IncidentAlreadyClosedException();
        }
        this.status = Status.RESOLVED;
        this.resolvedAt = LocalDateTime.now();
        this.timeline.addEntry("Incident resolved: " + resolution);
    }
    
    public Duration getMttr() {
        if (resolvedAt == null) return null;
        return Duration.between(createdAt, resolvedAt);
    }
}
```

---

## Service Design

### Authentication Service

```
┌──────────────────────────────────────────────────────────┐
│           Authentication Service                         │
├──────────────────────────────────────────────────────────┤
│ Responsibilities:                                        │
│ - User registration & email verification                │
│ - Login & token generation                              │
│ - Token refresh & validation                            │
│ - Password reset                                        │
│ - Session management                                    │
├──────────────────────────────────────────────────────────┤
│ Key Components:                                         │
│                                                          │
│ 1. AuthController                                       │
│    POST /api/auth/register                             │
│    POST /api/auth/login                                │
│    POST /api/auth/refresh                              │
│    POST /api/auth/logout                               │
│                                                          │
│ 2. JwtTokenProvider                                     │
│    - Generate JWT tokens                               │
│    - Validate tokens                                   │
│    - Extract claims                                    │
│                                                          │
│ 3. PasswordEncoder (BCrypt)                            │
│    - Encode passwords                                  │
│    - Verify passwords                                  │
│                                                          │
│ 4. EmailService                                        │
│    - Send verification emails                          │
│    - Send password reset emails                        │
│                                                          │
│ 5. AuthRepository                                      │
│    - Store users                                       │
│    - Store refresh tokens in Redis                     │
└──────────────────────────────────────────────────────────┘
```

### Incident Service

```
┌──────────────────────────────────────────────────────────┐
│           Incident Service                              │
├──────────────────────────────────────────────────────────┤
│ Responsibilities:                                        │
│ - Create, retrieve, update incidents                    │
│ - Manage incident timeline                              │
│ - Assign incidents                                      │
│ - Escalate incidents                                    │
│ - Resolve incidents                                     │
├──────────────────────────────────────────────────────────┤
│ Key Components:                                         │
│                                                          │
│ 1. IncidentController                                   │
│    POST /api/incidents                                 │
│    GET /api/incidents/:id                              │
│    PUT /api/incidents/:id                              │
│    PATCH /api/incidents/:id/assign                     │
│    PATCH /api/incidents/:id/resolve                    │
│                                                          │
│ 2. IncidentService                                      │
│    - Create incident                                   │
│    - Update incident                                   │
│    - Add comment                                       │
│    - Change severity                                   │
│                                                          │
│ 3. IncidentQueryService                                │
│    - List incidents with filtering                     │
│    - Search incidents                                  │
│    - Get incident statistics                           │
│                                                          │
│ 4. TimelineService                                      │
│    - Add timeline entries                              │
│    - Get incident history                              │
│    - Calculate MTTR/MTBF                               │
│                                                          │
│ 5. EventPublisher                                       │
│    - Publish incident.created                          │
│    - Publish incident.updated                          │
│    - Publish incident.resolved                         │
└──────────────────────────────────────────────────────────┘
```

### Alert Service

```
┌──────────────────────────────────────────────────────────┐
│           Alert Service                                 │
├──────────────────────────────────────────────────────────┤
│ Responsibilities:                                        │
│ - Manage alert rules                                    │
│ - Generate alerts based on metrics                      │
│ - Route alerts to channels                              │
│ - De-duplicate alerts                                   │
│ - Track alert status                                    │
├──────────────────────────────────────────────────────────┤
│ Key Components:                                         │
│                                                          │
│ 1. AlertRuleService                                     │
│    - Create alert rules                                │
│    - Evaluate rules against metrics                    │
│    - Update rule status                                │
│                                                          │
│ 2. AlertGenerator                                       │
│    Listens to:                                          │
│    - Metrics (CPU > 80%)                               │
│    - Error rates (> 5%)                                │
│    - Service health (Down)                             │
│                                                          │
│ 3. AlertNotificationService                            │
│    - Format alerts                                     │
│    - Route to channels (Email, Slack, Teams)           │
│    - Track delivery status                             │
│                                                          │
│ 4. AlertDeduplicator                                    │
│    - Merge similar alerts                              │
│    - Prevent alert fatigue                             │
│    - Correlation logic                                 │
└──────────────────────────────────────────────────────────┘
```

### Log Service

```
┌──────────────────────────────────────────────────────────┐
│           Log Service                                    │
├──────────────────────────────────────────────────────────┤
│ Responsibilities:                                        │
│ - Accept log events                                     │
│ - Parse and enrich logs                                 │
│ - Index logs in Elasticsearch                           │
│ - Provide log search API                                │
│ - Generate log analytics                                │
├──────────────────────────────────────────────────────────┤
│ Key Components:                                         │
│                                                          │
│ 1. LogIngestionController                              │
│    POST /api/logs/ingest                               │
│    (Bulk log acceptance)                               │
│                                                          │
│ 2. LogProcessor (Kafka Consumer)                        │
│    - Parse log format (JSON, plain text)               │
│    - Extract metadata                                  │
│    - Enrich with context                               │
│    - Apply transformations                             │
│                                                          │
│ 3. ElasticsearchService                                │
│    - Index logs                                        │
│    - Manage indices                                    │
│    - Index lifecycle management (ILM)                  │
│                                                          │
│ 4. LogSearchService                                     │
│    GET /api/logs/search                                │
│    - Full-text search                                  │
│    - Filter by timestamp, level, service               │
│    - Aggregations                                      │
│                                                          │
│ 5. LogAnalyticsService                                 │
│    - Error rate calculation                            │
│    - Pattern detection                                 │
│    - Anomaly detection                                 │
└──────────────────────────────────────────────────────────┘
```

### AI Service

```
┌──────────────────────────────────────────────────────────┐
│           AI Service (Python)                           │
├──────────────────────────────────────────────────────────┤
│ Responsibilities:                                        │
│ - Root cause analysis                                   │
│ - Log pattern analysis                                  │
│ - Incident summarization                                │
│ - Alert correlation                                     │
│ - Chat-based assistant                                  │
├──────────────────────────────────────────────────────────┤
│ Key Components:                                         │
│                                                          │
│ 1. RCA Engine                                           │
│    Input: Incident ID, logs, metrics                   │
│    Process:                                            │
│    - Fetch related logs                                │
│    - Analyze error patterns                            │
│    - LLM inference for root cause                      │
│    - Generate recommendations                         │
│    Output: RCA report with confidence                  │
│                                                          │
│ 2. LogAnalyzer                                          │
│    - Pattern matching                                  │
│    - Anomaly detection                                 │
│    - Clustering similar errors                         │
│                                                          │
│ 3. ChatAssistant (RAG)                                 │
│    - Vector embedding of knowledge base                │
│    - Semantic search                                   │
│    - LLM-powered responses                             │
│    - Multi-turn conversation                           │
│                                                          │
│ 4. AlertCorrelator                                      │
│    - Identify related alerts                           │
│    - Suggest alert merging                             │
│    - Reduce alert noise                                │
│                                                          │
│ 5. ReportGenerator                                      │
│    - Generate incident reports                         │
│    - Create visualizations                             │
│    - Export to PDF                                     │
└──────────────────────────────────────────────────────────┘
```

---

## Sequence Diagrams

### User Login Sequence

```
User          Browser         API Gateway      Auth Service      Database
 │               │                 │                 │               │
 ├─ Enter Email & Password ───────▶│                 │               │
 │               │                 │                 │               │
 │               │  POST /auth/login│                 │               │
 │               │────────────────▶│                 │               │
 │               │                 │  Validate JWT  │               │
 │               │                 │  Middleware    │               │
 │               │                 │                 │               │
 │               │                 │ Query User     │               │
 │               │                 │────────────────▶│               │
 │               │                 │                 │ SELECT user  │
 │               │                 │                 │───────────────▶
 │               │                 │                 │ Return User  │
 │               │                 │◀────────────────│◀───────────────
 │               │                 │                 │               │
 │               │                 │ Verify Password│               │
 │               │                 │ (BCrypt Check) │               │
 │               │                 │                 │               │
 │               │                 │ Generate JWT   │               │
 │               │                 │ Store Refresh  │               │
 │               │                 │ Token in Redis │               │
 │               │                 │                 │               │
 │               │ Return: {       │                 │               │
 │               │ accessToken,    │                 │               │
 │               │ refreshToken,   │                 │               │
 │               │ user {}         │                 │               │
 │               │◀────────────────────────────────▶│               │
 │  Display Dashboard              │                 │               │
 │◀──────────────│                 │                 │               │
 │               │                 │                 │               │
```

### Incident Creation Flow

```
User           Frontend         Backend API      Incident Service     Kafka      Elasticsearch
 │                │                 │                 │              │              │
 ├─Create Incident────────────────▶│                 │              │              │
 │                │                 │                 │              │              │
 │                │ POST /incidents │                 │              │              │
 │                │────────────────▶│                 │              │              │
 │                │                 │                 │              │              │
 │                │                 │ Create Domain  │              │              │
 │                │                 │ Object & Rules │              │              │
 │                │                 │──────────────▶│              │              │
 │                │                 │                 │              │              │
 │                │                 │ Save to DB &   │              │              │
 │                │                 │ Generate ID    │              │              │
 │                │                 │◀──────────────│              │              │
 │                │                 │                 │              │              │
 │                │                 │ Publish Event  │              │              │
 │                │                 │ incident.created              │              │
 │                │                 │                 │ Publish    │              │
 │                │                 │                 │────────────▶│              │
 │                │                 │                 │              │              │
 │                │                 │                 │ Consume    │              │
 │                │                 │                 │────────────────────────▶│
 │                │                 │                 │              │ Index Log │
 │                │  { id, status } │                 │              │◀─────────│
 │                │◀────────────────│                 │              │              │
 │  Show Incident │                 │                 │              │              │
 │◀────────────────│                 │                 │              │              │
 │                │                 │                 │              │              │
```

### Log Ingestion Pipeline

```
App         LogCollector    Kafka Topic      LogProcessor    Elasticsearch
 │               │               │                │                │
 ├─POST Logs────▶│               │                │                │
 │               │               │                │                │
 │               │ Batch Logs   │                │                │
 │               │ (Every 100ms)│                │                │
 │               │               │                │                │
 │               │ Publish     │                │                │
 │               │─────────────▶│                │                │
 │               │               │                │                │
 │               │               │ Subscribe   │                │
 │               │               │──────────────▶│                │
 │               │               │                │                │
 │               │               │                │ Parse JSON   │
 │               │               │                │ Extract Fields│
 │               │               │                │ Enrich       │
 │               │               │                │ Transform    │
 │               │               │                │                │
 │               │               │                │ Index Bulk  │
 │               │               │                │─────────────▶│
 │               │               │                │                │
 │               │               │                │ 200 OK      │
 │               │               │                │◀─────────────│
 │               │               │                │                │
 │               │ ACK          │                │                │
 │               │◀──────────────│                │                │
 │  200 OK        │               │                │                │
 │◀───────────────│               │                │                │
 │               │               │                │                │
```

### Root Cause Analysis Flow

```
Incident           Backend        AI Service        OpenAI API      Vector DB
   │                  │                │                │              │
   ├─RCA Request─────▶│                │                │              │
   │                  │                │                │              │
   │                  │ Fetch Logs &  │                │              │
   │                  │ Metrics       │                │              │
   │                  │────────────────▶ LogAnalyzer  │              │
   │                  │                │                │              │
   │                  │                │ Prepare Context              │
   │                  │                │ - Relevant Logs             │
   │                  │                │ - Error Stack Traces        │
   │                  │                │ - Similar Incidents        │
   │                  │                │                │              │
   │                  │                │ Search KB     │              │
   │                  │                │─────────────────────────────▶│
   │                  │                │                │ Return      │
   │                  │                │                │ Similar Cases
   │                  │                │◀─────────────────────────────│
   │                  │                │                │              │
   │                  │                │ Call LLM      │              │
   │                  │                │─────────────▶│              │
   │                  │                │                │              │
   │                  │                │ {rootCause,   │              │
   │                  │                │  confidence,  │              │
   │                  │                │  fixes}       │              │
   │                  │                │◀─────────────│              │
   │                  │                │                │              │
   │                  │ Store Analysis│                │              │
   │                  │ & Recommendations              │              │
   │                  │◀────────────────                │              │
   │  RCA Report      │                │                │              │
   │◀─────────────────│                │                │              │
   │                  │                │                │              │
```

---

## Component Interactions

### Event-Driven Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Kafka Topics                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  incidents                 │ alerts                      │
│  ├── incident.created      │ ├── alert.triggered        │
│  ├── incident.updated      │ ├── alert.resolved         │
│  ├── incident.resolved     │ └── alert.escalated        │
│  └── incident.closed       │                            │
│                            │ logs                        │
│  metrics                   │ ├── log.ingested           │
│  ├── metric.recorded       │ ├── log.analyzed           │
│  ├── cpu.spike             │ └── error.detected         │
│  └── memory.spike          │                            │
│                            │ users                       │
│                            │ ├── user.created           │
│                            │ ├── user.updated           │
│                            │ └── user.deleted           │
│                                                          │
└──────────────────────────────────────────────────────────┘

                            ▲
         ┌──────────────────┼──────────────────┐
         │                  │                  │
    Publishers         Processors         Consumers
    
    IncidentService     LogProcessor    AlertService
    AlertService       MetricsProcessor  AIService
    UserService        AlertGenerator    NotificationService
    MetricsCollector   Correlator        AnalyticsEngine
```

### Service Communication

```
┌──────────────────────────────────────────────────────────┐
│              Service Mesh (Istio/Linkerd)               │
└──────────────────────────────────────────────────────────┘

Synchronous (REST / gRPC):
- User Service → Auth Service (validate token)
- Incident Service → Notification Service (send alert)
- Alert Service → Incident Service (create incident)

Asynchronous (Kafka):
- Incident Service publishes incident.created
- AI Service subscribes to incident.created
- Alert Service subscribes to incident.created
- Analytics Engine subscribes to all events

Circuit Breaker Pattern:
┌─────────────┐
│   Service A │
└─────┬───────┘
      │ Request
      ▼
┌─────────────────┐     Fail ──┐
│ Circuit Breaker │ ────────────┤
└─────┬───────────┘     Pass    │
      │                         │
      ▼                   ┌─────▼─────┐
┌─────────────┐          │  Fallback  │
│   Service B │          │  Response  │
└─────────────┘          └────────────┘
```

---

## State Management

### Incident State Machine

```
                         ┌──────────────┐
                         │     NEW      │
                         └──────┬───────┘
                                │
                                ▼
                    ┌────────────────────────┐
                    │     INVESTIGATING      │
                    │ (Assigned to team)     │
                    └────┬───────────────┬───┘
                         │               │
              Escalate   │               │ Resolve
                         ▼               ▼
                    ┌─────────────────────────┐
                    │   IN_PROGRESS           │
                    │ (Working on fix)        │
                    └─────────────┬───────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │  RESOLVED    │
                          │ (Fix applied)│
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │   CLOSED     │
                          │ (Archived)   │
                          └──────────────┘

Transitions:
- NEW → INVESTIGATING (when assigned)
- INVESTIGATING → IN_PROGRESS (when work starts)
- IN_PROGRESS → RESOLVED (when fixed)
- RESOLVED → CLOSED (after 7 days or manual)
- Any → CANCELLED (if not applicable)
```

### User Session Management

```
┌─────────────────────────────────────────────────────────┐
│            User Session State                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Session Data (in Redis):                               │
│ ├── sessionId                                          │
│ ├── userId                                             │
│ ├── tenantId                                           │
│ ├── roles                                              │
│ ├── permissions                                        │
│ ├── lastActivity                                       │
│ ├── expiresAt                                          │
│ └── refreshTokenId                                     │
│                                                         │
│ Lifecycle:                                             │
│ 1. Login → Generate tokens                            │
│ 2. Store refresh token in Redis (TTL: 7 days)         │
│ 3. Client uses access token (TTL: 15 mins)            │
│ 4. On access token expiry → Use refresh token         │
│ 5. On logout → Delete refresh token from Redis        │
│ 6. On inactivity → Auto-expire session                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling

### Exception Hierarchy

```
┌──────────────────────────────────┐
│    RuntimeException              │
└─────────────┬────────────────────┘
              │
              ▼
┌──────────────────────────────────┐
│  ApplicationException            │
├──────────────────────────────────┤
│ - errorCode                      │
│ - statusCode                     │
│ - message                        │
│ - timestamp                      │
└─────────────┬────────────────────┘
              │
      ┌───────┴───────┬────────────┬──────────────┐
      │               │            │              │
      ▼               ▼            ▼              ▼
┌──────────┐  ┌──────────────┐  ┌────────────┐  ┌────────────┐
│ Validation│  │ Not Found    │  │ Forbidden  │  │ Conflict   │
│ Exception │  │ Exception    │  │ Exception  │  │ Exception  │
└──────────┘  └──────────────┘  └────────────┘  └────────────┘

    ┌──────────────────────────────────────────────┐
    │   Global Exception Handler (Advice)          │
    ├──────────────────────────────────────────────┤
    │                                              │
    │ @ExceptionHandler(ValidationException.class) │
    │ → HTTP 400 + Error Details                  │
    │                                              │
    │ @ExceptionHandler(EntityNotFoundException..)│
    │ → HTTP 404 + Error Details                  │
    │                                              │
    │ @ExceptionHandler(Exception.class)          │
    │ → HTTP 500 + Error Details                  │
    │                                              │
    └──────────────────────────────────────────────┘
```

### Error Response Format

```json
{
  "errorCode": "INCIDENT_NOT_FOUND",
  "statusCode": 404,
  "message": "Incident with ID incident_123 not found",
  "timestamp": "2026-06-05T10:30:45Z",
  "path": "/api/incidents/incident_123",
  "errors": [
    {
      "field": "incidentId",
      "value": "incident_123",
      "message": "Resource not found"
    }
  ],
  "traceId": "2e6222a9d7e51c1a"
}
```

---

## Resilience Patterns

### Circuit Breaker Pattern

```
┌────────────────────────────────┐
│      CLOSED STATE              │
│ (Service working normally)     │
│ - Forward all requests         │
│ - Track failures               │
│ - If failures > threshold      │
│   → OPEN state                 │
└────────────────────────────────┘

         (failures exceed threshold)
                    ▼

┌────────────────────────────────┐
│      OPEN STATE                │
│ (Service not responding)       │
│ - Block requests               │
│ - Return fallback response     │
│ - After timeout period         │
│   → HALF_OPEN state            │
└────────────────────────────────┘

         (after timeout)
                    ▼

┌────────────────────────────────┐
│      HALF_OPEN STATE           │
│ (Testing service recovery)     │
│ - Allow limited requests       │
│ - If successful → CLOSED       │
│ - If failed → OPEN             │
└────────────────────────────────┘
```

### Retry Strategy

```
Request → Service
             │
             ├─ Success (2xx) → Return Response
             │
             ├─ Client Error (4xx) → Fail (No Retry)
             │
             ├─ Server Error (5xx) → Retry
             │   │
             │   ├─ Retry 1: Wait 100ms
             │   ├─ Retry 2: Wait 200ms (Exponential backoff)
             │   ├─ Retry 3: Wait 400ms
             │   │
             │   └─ Max retries: 3
             │
             └─ Timeout → Fail
```

### Bulkhead Pattern

```
┌─────────────────────────────────────────────────────────┐
│               Thread Pool                               │
│  (100 threads total)                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │  Incident Service   │  │  Alert Service      │      │
│  │  (30 threads)       │  │  (30 threads)       │      │
│  │                     │  │                     │      │
│  │  ┌──────────────┐   │  │  ┌──────────────┐   │      │
│  │  │ Thread 1     │   │  │  │ Thread 1     │   │      │
│  │  │ Thread 2     │   │  │  │ Thread 2     │   │      │
│  │  │ ...          │   │  │  │ ...          │   │      │
│  │  └──────────────┘   │  │  └──────────────┘   │      │
│  └─────────────────────┘  └─────────────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────┐       │
│  │  Other Services (40 threads)                │       │
│  └─────────────────────────────────────────────┘       │
│                                                         │
└─────────────────────────────────────────────────────────┘

Benefit: If one service exhausts its threads,
         others continue functioning normally.
```

---

**Next Steps**: Refer to [03-DATABASE_SCHEMA.md](03-DATABASE_SCHEMA.md) for data model details.
