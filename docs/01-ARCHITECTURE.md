# OpsMind - Architecture Overview

## Table of Contents
1. [System Context](#system-context)
2. [Architecture Principles](#architecture-principles)
3. [High-Level Architecture](#high-level-architecture)
4. [Component Overview](#component-overview)
5. [Technology Stack](#technology-stack)
6. [Data Flow](#data-flow)
7. [Security Architecture](#security-architecture)
8. [Scalability & Performance](#scalability--performance)

---

## System Context

### What is OpsMind?

OpsMind is an AI-powered observability platform that centralizes incident management, log analytics, monitoring, and root cause analysis. It serves enterprises that need to reduce Mean Time To Resolution (MTTR) and gain intelligent insights from their production systems.

### Business Goals

1. **Reduce MTTR** - From hours to minutes through intelligent incident correlation
2. **Centralize Observability** - Single pane of glass for all incidents and logs
3. **Enable Root Cause Analysis** - AI-powered insights from logs and metrics
4. **Scale Efficiently** - Support organizations with thousands of services
5. **Secure Multi-Tenancy** - Complete data isolation between customers

### Key Stakeholders

- **DevOps Engineers** - Use for incident management and monitoring
- **SRE Teams** - Analyze patterns and improve reliability
- **Engineering Teams** - Investigate production issues
- **Organization Admins** - Manage users and settings
- **Finance Team** - Track usage and billing

---

## Architecture Principles

### 1. Clean Architecture
```
┌─────────────────────────────────────┐
│   Presentation Layer (REST API)     │
├─────────────────────────────────────┤
│   Application Layer (Services)      │
├─────────────────────────────────────┤
│   Domain Layer (Business Logic)     │
├─────────────────────────────────────┤
│   Infrastructure Layer (Persistence)│
└─────────────────────────────────────┘
```

### 2. Domain-Driven Design
- Organize by business domain (Incidents, Logs, Alerts, etc.)
- Shared understanding between domain experts and developers
- Bounded contexts for each major feature area

### 3. SOLID Principles
- **S**ingle Responsibility: Each class has one reason to change
- **O**pen/Closed: Open for extension, closed for modification
- **L**iskov Substitution: Derived classes must be substitutable
- **I**nterface Segregation: Clients depend on specific interfaces
- **D**ependency Inversion: Depend on abstractions, not concretions

### 4. Microservices Ready
- Independent deployment of services
- Asynchronous communication via Kafka
- API-driven architecture
- Scalable horizontally

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Layer (React SPA)                  │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│   │  Dashboard   │  │  Incidents   │  │   Analytics  │         │
│   └──────────────┘  └──────────────┘  └──────────────┘         │
└────────────────────┬────────────────────────────────────────────┘
                     │ REST API + WebSocket
┌────────────────────▼────────────────────────────────────────────┐
│              API Gateway / Load Balancer                         │
│                    (Nginx / AWS ALB)                            │
└────────────────────┬────────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┬────────────────┐
        │                         │                │
┌───────▼──────────────┐ ┌───────▼──────┐ ┌──────▼──────────────┐
│  Backend Services    │ │  AI Service  │ │  Log Ingestion     │
│  (Spring Boot)       │ │  (Python)    │ │  (Kafka Consumer)  │
│ ┌──────────────────┐ │ │ ┌──────────┐ │ └────────────────────┘
│ │ Incident Service │ │ │ │ RCA      │ │
│ ├──────────────────┤ │ │ │ Engine   │ │
│ │ Log Service      │ │ │ └──────────┘ │
│ ├──────────────────┤ │ │ ┌──────────┐ │
│ │ Alert Service    │ │ │ │ Chat     │ │
│ ├──────────────────┤ │ │ │ Assistant│ │
│ │ Auth Service     │ │ │ └──────────┘ │
│ ├──────────────────┤ │ └──────────────┘
│ │ Tenant Service   │ │
│ └──────────────────┘ │
└───────┬──────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Data Layer                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │PostgreSQL│  │Elasticsea│  │  Redis   │  │  Kafka   │       │
│  │   (RDS)  │  │     rch   │  │  Cache   │  │  Queue   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Overview

### Frontend Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| Auth UI | Login, registration, password reset | React, Formik |
| Dashboard | Real-time metrics and alerts | React, Recharts |
| Incident Manager | Create, view, update incidents | React, React Query |
| Log Viewer | Search and view logs | React, Elasticsearch |
| Alert Dashboard | Alert configuration and history | React, React Query |
| AI Chat | Chat with engineering assistant | React, WebSocket |
| Admin Panel | Org & user management | React |
| Analytics | Reports and metrics | React, Recharts |

### Backend Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| Auth Service | JWT, RBAC, session management | Spring Security, JWT |
| Incident Service | CRUD incidents, timeline | Spring Boot, JPA |
| Log Service | Log ingestion, search, analysis | Spring Boot, Elasticsearch |
| Alert Service | Alert rules, notifications | Spring Boot, Kafka |
| Tenant Service | Multi-tenant isolation | Spring Boot, JPA |
| Notification Service | Email, Slack, Teams | Spring Boot, HTTP Client |
| Report Service | Generate PDF reports | Spring Boot, iText |
| Audit Service | Track all user actions | Spring Boot, JPA |

### AI Service Components

| Component | Purpose | Technology |
|-----------|---------|-----------|
| RCA Engine | Root cause analysis | LangChain, OpenAI |
| Log Analyzer | Pattern detection, anomalies | NLP, ML |
| Chat Assistant | Q&A with knowledge base | LangChain, Vector DB |
| Alert Correlator | Correlate related alerts | ML, heuristics |
| Report Generator | Automated reports | LangChain, templates |

---

## Technology Stack

### Frontend Stack
```
Framework       : React 19
Language        : TypeScript 5.3+
Build Tool      : Vite 5.x
UI Components   : ShadCN UI
Styling         : Tailwind CSS 3.x
State Management: Zustand
Data Fetching   : React Query (TanStack Query)
Routing         : React Router 6
HTTP Client     : Axios
Charts          : Recharts
Real-time       : WebSocket
```

### Backend Stack
```
Language        : Java 21 (LTS)
Framework       : Spring Boot 3.3.x
Architecture    : Clean Architecture
ORM             : Hibernate + Spring Data JPA
Database        : PostgreSQL 15+
Cache           : Redis 7+
Search Engine   : Elasticsearch 8.x
Message Queue   : Apache Kafka 3.x
Security        : Spring Security 6.x, JWT
Testing         : JUnit 5, Mockito
Build Tool      : Maven 3.9+
Logging         : SLF4J, Logback
Monitoring      : Micrometer, Prometheus
```

### AI Service Stack
```
Language        : Python 3.11+
Framework       : FastAPI
LLM Framework   : LangChain
Vector DB       : Pinecone / Weaviate
NLP             : spaCy, NLTK
ML              : scikit-learn, numpy
Async           : asyncio, httpx
```

### Infrastructure Stack
```
Containerization: Docker
Orchestration   : Kubernetes 1.28+
Package Manager : Helm 3.x
IaC             : Terraform / Bicep
CI/CD           : GitHub Actions
Cloud Provider  : AWS
Monitoring      : Prometheus, Grafana
Logging         : ELK Stack
```

---

## Data Flow

### Incident Creation Flow

```
User Interface
      │
      ▼
┌──────────────────────────────────┐
│ API: POST /api/incidents         │
│ (Auth: JWT Token)                │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ IncidentController               │
│ - Validate Request               │
│ - Check Tenant Access            │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ IncidentService                  │
│ - Create Incident Domain Object  │
│ - Apply Business Rules           │
│ - Generate Timeline Entry        │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ IncidentRepository               │
│ - Persist to PostgreSQL          │
│ - Index in Elasticsearch         │
└──────────────────┬───────────────┘
                   │
                   ▼
┌──────────────────────────────────┐
│ Kafka Publisher                  │
│ - Publish: incident.created      │
│ - Topic: incidents               │
└──────────────────┬───────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────┐
│ Alert Service    │  │ AI Service       │
│ (Evaluate rules) │  │ (Trigger RCA)    │
└──────────────────┘  └──────────────────┘
```

### Log Ingestion Flow

```
Applications (Spring Boot, Node, Containers)
            │
            ├──► HTTP (Log Collector Endpoint)
            │
            ├──► Kafka (Log Events Topic)
            │
            └──► Cloud Logging (CloudWatch)
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Log Processor (Kafka Consumer)
        │ - Parse & Enrich            │
        │ - Filter & Transform        │
        │ - Deduplicate               │
        └──────────┬──────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌─────────────┐          ┌──────────────────┐
│ Elasticsearch                 │ PostgreSQL │
│ (Search, Analytics)           │ (Metadata) │
└─────────────┘          └──────────────────┘
```

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────┐
│  User Credentials (Email + Password)│
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ POST /api/auth/login                 │
│ - Validate credentials               │
│ - Check email verified               │
│ - Check user active                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Generate JWT Tokens                  │
│ - Access Token (15 min expiry)       │
│ - Refresh Token (7 day expiry)       │
│ - Store refresh token in Redis       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Return to Client                     │
│ {                                    │
│   "accessToken": "...",              │
│   "refreshToken": "...",             │
│   "user": {...}                      │
│ }                                    │
└──────────────────────────────────────┘
```

### Authorization Matrix

| Resource | Super Admin | Org Admin | Team Lead | DevOps | Viewer |
|----------|:-----------:|:---------:|:---------:|:------:|:------:|
| View Incidents | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Incident | ✓ | ✓ | ✓ | ✓ | ✗ |
| Assign Incident | ✓ | ✓ | ✓ | ✓ | ✗ |
| Manage Users | ✓ | ✓ | ✗ | ✗ | ✗ |
| View Billing | ✓ | ✓ | ✗ | ✗ | ✗ |
| Configure Alerts | ✓ | ✓ | ✓ | ✓ | ✗ |
| Access Admin Panel | ✓ | ✓ | ✗ | ✗ | ✗ |

### Data Isolation (Multi-Tenancy)

```
Organization A (Tenant ID: org_123)
├── Users [org_123_user_1, org_123_user_2, ...]
├── Incidents [filtered by tenant_id = org_123]
├── Logs [filtered by tenant_id = org_123]
└── Alerts [filtered by tenant_id = org_123]

Organization B (Tenant ID: org_456)
├── Users [org_456_user_1, org_456_user_2, ...]
├── Incidents [filtered by tenant_id = org_456]
├── Logs [filtered by tenant_id = org_456]
└── Alerts [filtered by tenant_id = org_456]

Query Enforcement:
- Every query includes: WHERE tenant_id = ${currentTenantId}
- At database level: Row-Level Security (RLS)
- At application level: TenantContext filter
```

---

## Scalability & Performance

### Horizontal Scaling Strategy

```
┌─────────────────────────────────────┐
│ AWS Application Load Balancer       │
└──────┬──────────────┬───────────────┘
       │              │
       ▼              ▼
┌─────────────┐  ┌─────────────┐
│Backend Pod 1│  │Backend Pod 2│  ... (auto-scaling)
└──────┬──────┘  └──────┬──────┘
       │                │
       └────────┬───────┘
                │
    ┌───────────┴──────────┐
    │                      │
    ▼                      ▼
┌────────────┐      ┌──────────────┐
│  PostgreSQL│      │ Read Replicas│
│   (Write)  │      │   (Read)     │
└────────────┘      └──────────────┘

Cache Layer:
┌─────────────────────────────────────┐
│ Redis Cluster (Replicated)          │
│ - User sessions                     │
│ - API response cache                │
│ - Rate limiting counters            │
└─────────────────────────────────────┘

Message Queue:
┌─────────────────────────────────────┐
│ Kafka Cluster (Multiple Partitions) │
│ - Log ingestion                     │
│ - Event streaming                   │
│ - Incident notifications            │
└─────────────────────────────────────┘

Search Engine:
┌─────────────────────────────────────┐
│ Elasticsearch Cluster               │
│ - Log search and analytics          │
│ - Incident search                   │
│ - Full-text indexing                │
└─────────────────────────────────────┘
```

### Performance Targets

| Metric | Target |
|--------|--------|
| API Response Time (p95) | < 200ms |
| API Response Time (p99) | < 500ms |
| Dashboard Load Time | < 2s |
| Log Search (100K logs) | < 1s |
| Concurrent Users | 10,000+ |
| Requests Per Second | 50,000+ |
| Log Ingestion | 1M logs/sec |

### Caching Strategy

```
┌──────────────────────────────────────┐
│ Request from Client                  │
└──────────┬───────────────────────────┘
           │
           ▼
┌──────────────────────────────────────┐
│ Check Redis Cache                    │
│ - User sessions                      │
│ - Organization configs               │
│ - User preferences                   │
└──────────┬────────────┬──────────────┘
           │ HIT       │ MISS
           │            │
      ┌────▼─┐      ┌──▼────────────┐
      │Return│      │Query Database │
      │Cached│      │Update Cache   │
      │Data  │      │TTL: 1 hour    │
      └──────┘      └───────────────┘
```

---

## Deployment Architecture

### AWS Multi-Region Setup

```
Primary Region (us-east-1)
├── EKS Cluster
│   ├── API Pods
│   ├── Worker Pods
│   └── Ingress Controller
├── RDS PostgreSQL (Primary)
├── RDS PostgreSQL (Read Replica)
├── ElastiCache Redis
├── Elasticsearch Domain
├── S3 Buckets
└── CloudFront Distribution

Disaster Recovery Region (us-west-2)
├── EKS Cluster (Standby)
├── RDS PostgreSQL (Replica)
├── Elasticsearch (Replica)
└── S3 Cross-Region Replication

Monitoring (All Regions)
├── CloudWatch
├── Prometheus
├── Grafana
└── Datadog Integration
```

---

## Next Steps

Proceed to:
- [02-SYSTEM_DESIGN.md](02-SYSTEM_DESIGN.md) - Detailed component design
- [03-DATABASE_SCHEMA.md](03-DATABASE_SCHEMA.md) - Database structure
- [04-API_DESIGN.md](04-API_DESIGN.md) - REST API specifications
