# OpsMind - Database Schema Design

## Table of Contents
1. [ER Diagram](#er-diagram)
2. [Schema Overview](#schema-overview)
3. [Tables Definition](#tables-definition)
4. [Indices Strategy](#indices-strategy)
5. [Partitioning Strategy](#partitioning-strategy)
6. [Data Constraints](#data-constraints)

---

## ER Diagram

```
┌──────────────────┐         ┌─────────────────┐         ┌──────────────┐
│  Organizations   │         │      Users      │         │     Roles    │
├──────────────────┤         ├─────────────────┤         ├──────────────┤
│ org_id (PK)      │◄────────│ user_id (PK)    │────────►│ role_id (PK) │
│ name             │    1  N │ org_id (FK)     │    1  N │ name         │
│ plan             │         │ email           │         │ permissions  │
│ status           │         │ password_hash   │         │              │
│ created_at       │         │ first_name      │         └──────────────┘
│ updated_at       │         │ last_name       │
└──────────────────┘         │ created_at      │         ┌──────────────┐
         ▲                   │ updated_at      │         │    Teams     │
         │                   └─────────────────┘         ├──────────────┤
         │ 1                                      N      │ team_id (PK) │
         └────────────────────────────────────────────────│ org_id (FK)  │
                                                         │ name         │
                                                         │ description  │
                                                         │ created_at   │
                                                         └──────────────┘

┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐
│    Incidents         │  │  Incident Timeline    │  │  Comments        │
├──────────────────────┤  ├───────────────────────┤  ├──────────────────┤
│ incident_id (PK)     │◄─│ timeline_id (PK)      │  │ comment_id (PK)  │
│ org_id (FK)          │1 │ incident_id (FK)      │◄─│ incident_id (FK) │
│ title               │  │ user_id (FK)          │  │ user_id (FK)     │
│ description         │  │ action_type           │  │ content          │
│ service_name        │  │ details               │  │ created_at       │
│ environment         │  │ created_at            │  └──────────────────┘
│ severity            │  └───────────────────────┘
│ status              │
│ assignee_id (FK)    │  ┌───────────────────────┐
│ reporter_id (FK)    │  │   Attachments         │
│ created_at          │  ├───────────────────────┤
│ updated_at          │  │ attachment_id (PK)   │
│ resolved_at         │  │ incident_id (FK)     │
└──────────────────────┘  │ file_url              │
                          │ file_type             │
                          │ created_at            │
                          └───────────────────────┘

┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐
│      Alerts          │  │   Alert Rules         │  │  Alert History   │
├──────────────────────┤  ├───────────────────────┤  ├──────────────────┤
│ alert_id (PK)        │◄─│ rule_id (PK)          │  │ history_id (PK)  │
│ org_id (FK)          │  │ org_id (FK)           │  │ rule_id (FK)     │
│ incident_id (FK)     │  │ name                  │  │ alert_id (FK)    │
│ severity             │  │ condition             │  │ status_change    │
│ status               │  │ threshold             │  │ reason            │
│ message              │  │ notification_channel  │  │ created_at       │
│ triggered_at         │  │ enabled               │  └──────────────────┘
│ resolved_at          │  │ created_at            │
└──────────────────────┘  └───────────────────────┘

┌──────────────────────┐  ┌───────────────────────┐  ┌──────────────────┐
│    Log Events        │  │  Log Analysis         │  │  Metrics         │
├──────────────────────┤  ├───────────────────────┤  ├──────────────────┤
│ log_id (PK)          │  │ analysis_id (PK)      │  │ metric_id (PK)   │
│ org_id (FK)          │  │ org_id (FK)           │  │ org_id (FK)      │
│ service_name         │  │ incident_id (FK)      │  │ service_name     │
│ timestamp            │  │ pattern_detected      │  │ metric_type      │
│ level                │  │ root_cause            │  │ value            │
│ message              │  │ confidence_score      │  │ unit             │
│ stack_trace          │  │ recommendations       │  │ timestamp        │
│ host                 │  │ created_at            │  │ tags             │
│ request_id           │  └───────────────────────┘  └──────────────────┘
│ user_id              │
│ tags                 │  ┌───────────────────────┐
│ created_at           │  │    Knowledge Base     │
└──────────────────────┘  ├───────────────────────┤
                          │ kb_id (PK)            │
                          │ org_id (FK)           │
                          │ title                 │
                          │ content               │
                          │ category              │
                          │ tags                  │
                          │ created_at            │
                          └───────────────────────┘

┌──────────────────────┐  ┌───────────────────────┐
│    Audit Logs        │  │  Reports              │
├──────────────────────┤  ├───────────────────────┤
│ audit_id (PK)        │  │ report_id (PK)        │
│ org_id (FK)          │  │ org_id (FK)           │
│ user_id (FK)         │  │ title                 │
│ action               │  │ generated_by          │
│ resource_type        │  │ period_start          │
│ resource_id          │  │ period_end            │
│ changes_before       │  │ metrics_summary       │
│ changes_after        │  │ incidents_count       │
│ ip_address           │  │ file_url              │
│ user_agent           │  │ created_at            │
│ created_at           │  └───────────────────────┘
└──────────────────────┘
```

---

## Schema Overview

### Core Entities

| Entity | Purpose | Cardinality |
|--------|---------|------------|
| Organizations | SaaS tenant | 1:N Users, Teams, Incidents |
| Users | System users | M:N Roles, Teams |
| Roles | Access control | 1:N Permissions |
| Teams | Organizational units | N:M Users, Incidents |
| Incidents | Production issues | 1:N Timeline, Comments, Attachments |
| Alerts | Alert rules & triggers | 1:N History |
| Logs | Application logs | 1:N Analysis |
| Metrics | Performance data | 1:1 Services |
| Knowledge Base | Documentation | 1:N Organizations |
| Reports | Generated reports | 1:N Organizations |
| Audit Logs | Activity tracking | 1:N Organizations |

### Multi-Tenancy Isolation

```
Column: tenant_id or org_id

ALL queries MUST include:
WHERE org_id = ${currentOrgId}

Database Level (Row-Level Security):
CREATE POLICY org_isolation ON incidents
  USING (org_id = current_setting('app.current_org_id')::UUID);

Application Level (Spring Filter):
@Component
public class TenantFilter implements Filter {
    @Override
    public void doFilter(ServletRequest request, ...) {
        String orgId = extractOrgIdFromJWT(request);
        TenantContext.setCurrentTenant(orgId);
        // All queries use TenantContext
    }
}
```

---

## Tables Definition

### 1. Organizations Table

```sql
CREATE TABLE organizations (
    org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    plan VARCHAR(50) NOT NULL DEFAULT 'free',
    -- free, starter, professional, enterprise
    
    -- Billing
    billing_email VARCHAR(255),
    billing_cycle VARCHAR(20),
    next_billing_date TIMESTAMP,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, suspended, cancelled
    
    -- Configuration
    settings JSONB DEFAULT '{}',
    -- {
    --   "alertChannels": ["email", "slack"],
    --   "retentionDays": 30,
    --   "timezone": "UTC"
    -- }
    
    -- Audit
    created_by UUID REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT org_name_not_empty CHECK (name != '')
);

CREATE INDEX idx_org_status ON organizations(status);
CREATE INDEX idx_org_plan ON organizations(plan);
```

### 2. Users Table

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Profile
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    phone_number VARCHAR(20),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, suspended, inactive, deleted
    
    -- Email Verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP,
    email_verification_token VARCHAR(255),
    
    -- Password Reset
    password_reset_token VARCHAR(255),
    password_reset_token_expires_at TIMESTAMP,
    last_password_change_at TIMESTAMP,
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP,
    last_login_ip VARCHAR(45),
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMP,
    
    -- Preferences
    preferences JSONB DEFAULT '{}',
    -- {
    --   "theme": "dark",
    --   "timezone": "UTC",
    --   "notifications": {"email": true, "slack": true}
    -- }
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
    CONSTRAINT unique_email_per_org UNIQUE (org_id, email),
    CONSTRAINT status_valid CHECK (status IN ('active', 'suspended', 'inactive', 'deleted'))
);

CREATE INDEX idx_user_org ON users(org_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_status ON users(status);
CREATE INDEX idx_user_org_status ON users(org_id, status);
```

### 3. Roles Table

```sql
CREATE TABLE roles (
    role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Built-in roles (org_id = NULL)
    is_system_role BOOLEAN DEFAULT FALSE,
    
    -- Permissions (JSON)
    permissions JSONB NOT NULL DEFAULT '[]',
    -- [
    --   "incident:create",
    --   "incident:read",
    --   "incident:update",
    --   "user:manage"
    -- ]
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_role_per_org UNIQUE (org_id, name),
    CONSTRAINT name_not_empty CHECK (name != '')
);

CREATE INDEX idx_role_org ON roles(org_id);
```

### 4. User Roles Mapping

```sql
CREATE TABLE user_roles (
    user_role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES users(user_id),
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

CREATE INDEX idx_user_role_user ON user_roles(user_id);
CREATE INDEX idx_user_role_role ON user_roles(role_id);
```

### 5. Teams Table

```sql
CREATE TABLE teams (
    team_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    description TEXT,
    slack_webhook_url TEXT,
    
    -- Team Lead
    lead_id UUID REFERENCES users(user_id),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_team_per_org UNIQUE (org_id, name),
    CONSTRAINT name_not_empty CHECK (name != '')
);

CREATE INDEX idx_team_org ON teams(org_id);
CREATE INDEX idx_team_lead ON teams(lead_id);
```

### 6. Team Members Mapping

```sql
CREATE TABLE team_members (
    team_member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    
    role_in_team VARCHAR(50) DEFAULT 'member',
    -- member, lead, owner
    
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

CREATE INDEX idx_team_member_team ON team_members(team_id);
CREATE INDEX idx_team_member_user ON team_members(user_id);
```

### 7. Incidents Table

```sql
CREATE TABLE incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    -- Incident Details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    service_name VARCHAR(100) NOT NULL,
    environment VARCHAR(50) NOT NULL,
    -- development, staging, production
    
    -- Severity & Status
    severity VARCHAR(50) NOT NULL,
    -- critical, high, medium, low, info
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    -- open, investigating, in_progress, resolved, closed
    
    -- Assignment
    assignee_id UUID REFERENCES users(user_id),
    reporter_id UUID NOT NULL REFERENCES users(user_id),
    team_id UUID REFERENCES teams(team_id),
    
    -- Root Cause Analysis
    root_cause_summary TEXT,
    affected_components TEXT[],
    
    -- SLA
    sla_start_time TIMESTAMP,
    sla_due_time TIMESTAMP,
    sla_exceeded BOOLEAN DEFAULT FALSE,
    
    -- Impact
    affected_users_count INT,
    estimated_revenue_impact DECIMAL,
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT severity_valid CHECK (severity IN ('critical', 'high', 'medium', 'low', 'info')),
    CONSTRAINT status_valid CHECK (status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed')),
    CONSTRAINT title_not_empty CHECK (title != '')
);

CREATE INDEX idx_incident_org ON incidents(org_id);
CREATE INDEX idx_incident_status ON incidents(status);
CREATE INDEX idx_incident_severity ON incidents(severity);
CREATE INDEX idx_incident_assignee ON incidents(assignee_id);
CREATE INDEX idx_incident_team ON incidents(team_id);
CREATE INDEX idx_incident_created ON incidents(created_at DESC);
CREATE INDEX idx_incident_org_status ON incidents(org_id, status);
CREATE INDEX idx_incident_org_created ON incidents(org_id, created_at DESC);
```

### 8. Incident Timeline Table

```sql
CREATE TABLE incident_timeline (
    timeline_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    
    -- Change Tracking
    action_type VARCHAR(50) NOT NULL,
    -- status_changed, assigned, commented, escalated
    details TEXT,
    
    -- Who made the change
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    -- Audit
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT action_valid CHECK (action_type IN (
        'status_changed', 'assigned', 'commented', 'escalated', 'severity_changed'
    ))
);

CREATE INDEX idx_timeline_incident ON incident_timeline(incident_id);
CREATE INDEX idx_timeline_created ON incident_timeline(created_at DESC);
```

### 9. Comments Table

```sql
CREATE TABLE comments (
    comment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id),
    
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    -- For edits
    edited_at TIMESTAMP,
    edited_by UUID REFERENCES users(user_id),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT content_not_empty CHECK (content != '')
);

CREATE INDEX idx_comment_incident ON comments(incident_id);
CREATE INDEX idx_comment_user ON comments(user_id);
CREATE INDEX idx_comment_created ON comments(created_at DESC);
```

### 10. Attachments Table

```sql
CREATE TABLE attachments (
    attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_size INT,
    file_type VARCHAR(50),
    file_url TEXT NOT NULL,
    s3_key VARCHAR(500),
    
    uploaded_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT file_name_not_empty CHECK (file_name != '')
);

CREATE INDEX idx_attachment_incident ON attachments(incident_id);
```

### 11. Alerts Table

```sql
CREATE TABLE alerts (
    alert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(incident_id),
    
    -- Alert Details
    title VARCHAR(255) NOT NULL,
    message TEXT,
    severity VARCHAR(50) NOT NULL,
    -- critical, warning, info
    
    -- Source
    source VARCHAR(50) NOT NULL,
    -- metric, log, custom, integration
    source_details JSONB,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'triggered',
    -- triggered, acknowledged, resolved
    
    -- Timing
    triggered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    acknowledged_at TIMESTAMP,
    acknowledged_by UUID REFERENCES users(user_id),
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(user_id),
    
    -- Notification
    notification_channels TEXT[],
    notified_teams TEXT[],
    
    CONSTRAINT severity_valid CHECK (severity IN ('critical', 'warning', 'info')),
    CONSTRAINT status_valid CHECK (status IN ('triggered', 'acknowledged', 'resolved'))
);

CREATE INDEX idx_alert_org ON alerts(org_id);
CREATE INDEX idx_alert_status ON alerts(status);
CREATE INDEX idx_alert_incident ON alerts(incident_id);
CREATE INDEX idx_alert_created ON alerts(triggered_at DESC);
```

### 12. Alert Rules Table

```sql
CREATE TABLE alert_rules (
    rule_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(team_id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Rule Definition
    condition JSONB NOT NULL,
    -- {
    --   "metric": "cpu_usage",
    --   "operator": "greater_than",
    --   "value": 80,
    --   "window": "5m"
    -- }
    
    threshold DECIMAL,
    
    -- Notification
    notification_channels TEXT[] NOT NULL DEFAULT ARRAY['email'],
    notification_on_recovery BOOLEAN DEFAULT TRUE,
    
    -- Status
    enabled BOOLEAN DEFAULT TRUE,
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT name_not_empty CHECK (name != '')
);

CREATE INDEX idx_rule_org ON alert_rules(org_id);
CREATE INDEX idx_rule_enabled ON alert_rules(enabled);
CREATE INDEX idx_rule_team ON alert_rules(team_id);
```

### 13. Log Events Table (Elasticsearch Primary)

```sql
-- PostgreSQL backup/metadata table
CREATE TABLE logs_metadata (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL,
    
    elasticsearch_id VARCHAR(255) UNIQUE NOT NULL,
    service_name VARCHAR(100),
    timestamp TIMESTAMP NOT NULL,
    level VARCHAR(20),
    
    indexed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- TTL for cleanup (based on org plan)
    expires_at TIMESTAMP,
    
    CONSTRAINT level_valid CHECK (level IN (
        'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
    ))
);

CREATE INDEX idx_log_org ON logs_metadata(org_id);
CREATE INDEX idx_log_service ON logs_metadata(service_name);
CREATE INDEX idx_log_timestamp ON logs_metadata(timestamp DESC);
CREATE INDEX idx_log_org_timestamp ON logs_metadata(org_id, timestamp DESC);
```

### 14. Log Analysis Table

```sql
CREATE TABLE log_analysis (
    analysis_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    incident_id UUID REFERENCES incidents(incident_id),
    
    -- Analysis Results
    pattern_detected JSONB,
    -- {
    --   "error_type": "ConnectionPoolExhausted",
    --   "occurrences": 234,
    --   "first_seen": "...",
    --   "last_seen": "..."
    -- }
    
    root_cause TEXT,
    confidence_score DECIMAL CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Recommendations
    recommendations TEXT[],
    
    -- AI Generation
    ai_generated BOOLEAN DEFAULT FALSE,
    model_used VARCHAR(100),
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analysis_org ON log_analysis(org_id);
CREATE INDEX idx_analysis_incident ON log_analysis(incident_id);
```

### 15. Metrics Table

```sql
CREATE TABLE metrics (
    metric_id BIGSERIAL PRIMARY KEY,
    org_id UUID NOT NULL,
    
    service_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    -- cpu_usage, memory_usage, disk_usage, requests_per_sec, error_rate, latency
    
    value DECIMAL NOT NULL,
    unit VARCHAR(20),
    
    tags JSONB DEFAULT '{}',
    -- {"host": "prod-1", "region": "us-east-1"}
    
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Retention based on age
    CONSTRAINT value_positive CHECK (value >= 0)
);

-- Partitioning by date
CREATE INDEX idx_metric_org_service ON metrics(org_id, service_name);
CREATE INDEX idx_metric_timestamp ON metrics(timestamp DESC);
```

### 16. Knowledge Base Table

```sql
CREATE TABLE knowledge_base (
    kb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    -- runbook, sop, troubleshooting, architecture
    
    tags TEXT[],
    
    -- For embedding in vector DB
    embedding_id VARCHAR(255),
    
    -- Audit
    created_by UUID NOT NULL REFERENCES users(user_id),
    updated_by UUID REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT title_not_empty CHECK (title != ''),
    CONSTRAINT content_not_empty CHECK (content != '')
);

CREATE INDEX idx_kb_org ON knowledge_base(org_id);
CREATE INDEX idx_kb_category ON knowledge_base(category);
```

### 17. Reports Table

```sql
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    -- incident_summary, reliability, performance
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metrics Summary
    metrics_summary JSONB,
    -- {
    --   "total_incidents": 15,
    --   "avg_mttr": "45m",
    --   "avg_mtbf": "3d",
    --   "availability": 99.9
    -- }
    
    incidents_count INT,
    file_url TEXT,
    s3_key VARCHAR(500),
    
    generated_by UUID NOT NULL REFERENCES users(user_id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_org ON reports(org_id);
CREATE INDEX idx_report_period ON reports(period_start, period_end);
```

### 18. Audit Logs Table

```sql
CREATE TABLE audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(org_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id),
    
    -- Action Details
    action VARCHAR(50) NOT NULL,
    -- create, read, update, delete, export
    
    resource_type VARCHAR(50) NOT NULL,
    -- incident, alert, user, role, team
    
    resource_id UUID NOT NULL,
    resource_name VARCHAR(255),
    
    -- Changes
    changes_before JSONB,
    changes_after JSONB,
    
    -- Request Details
    ip_address VARCHAR(45),
    user_agent TEXT,
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT action_valid CHECK (action IN (
        'create', 'read', 'update', 'delete', 'export'
    ))
);

CREATE INDEX idx_audit_org ON audit_logs(org_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
```

---

## Indices Strategy

### Performance Indices

```sql
-- Frequently queried combinations
CREATE INDEX idx_incident_org_status_created 
ON incidents(org_id, status, created_at DESC);

CREATE INDEX idx_alert_org_status_triggered 
ON alerts(org_id, status, triggered_at DESC);

CREATE INDEX idx_comment_incident_created 
ON comments(incident_id, created_at DESC);

CREATE INDEX idx_timeline_incident_created 
ON incident_timeline(incident_id, created_at DESC);

-- JSONB Indices
CREATE INDEX idx_alert_rule_condition 
ON alert_rules USING GIN (condition);

CREATE INDEX idx_metrics_tags 
ON metrics USING GIN (tags);

-- Partial Indices
CREATE INDEX idx_active_users 
ON users(org_id) WHERE status = 'active';

CREATE INDEX idx_open_incidents 
ON incidents(org_id) WHERE status IN ('open', 'investigating', 'in_progress');

CREATE INDEX idx_active_rules 
ON alert_rules(org_id) WHERE enabled = TRUE;
```

---

## Partitioning Strategy

### Time-Based Partitioning

```sql
-- Metrics table partitioned by day
CREATE TABLE metrics_2026_06_05 PARTITION OF metrics
    FOR VALUES FROM ('2026-06-05') TO ('2026-06-06');

CREATE TABLE metrics_2026_06_06 PARTITION OF metrics
    FOR VALUES FROM ('2026-06-06') TO ('2026-06-07');

-- Logs metadata partitioned by month
CREATE TABLE logs_metadata_2026_06 PARTITION OF logs_metadata
    FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Automatic partition creation script
-- (Run monthly/daily)
```

---

## Data Constraints

### Unique Constraints

```sql
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);
ALTER TABLE organizations ADD CONSTRAINT unique_org_name UNIQUE (name);
ALTER TABLE teams ADD CONSTRAINT unique_team_name UNIQUE (org_id, name);
ALTER TABLE roles ADD CONSTRAINT unique_role_name UNIQUE (org_id, name);
```

### Referential Integrity

```sql
-- Cascade deletes for dependent records
ALTER TABLE users 
ADD CONSTRAINT fk_user_org 
FOREIGN KEY (org_id) REFERENCES organizations(org_id) ON DELETE CASCADE;

-- Prevent deletion of org if has active incidents
CREATE OR REPLACE FUNCTION prevent_org_delete() RETURNS TRIGGER AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM incidents 
               WHERE org_id = OLD.org_id AND status != 'closed') THEN
        RAISE EXCEPTION 'Cannot delete org with active incidents';
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_org_delete 
BEFORE DELETE ON organizations 
FOR EACH ROW EXECUTE FUNCTION prevent_org_delete();
```

### Check Constraints

```sql
-- Ensure valid status transitions
ALTER TABLE incidents 
ADD CONSTRAINT valid_status 
CHECK (status IN ('open', 'investigating', 'in_progress', 'resolved', 'closed'));

-- Ensure resolved_at is only set when status = resolved/closed
CREATE OR REPLACE FUNCTION validate_incident_dates() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status NOT IN ('resolved', 'closed') AND NEW.resolved_at IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot set resolved_at for open incidents';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_incident_dates 
BEFORE INSERT OR UPDATE ON incidents 
FOR EACH ROW EXECUTE FUNCTION validate_incident_dates();
```

---

**Next Steps**: See [04-API_DESIGN.md](04-API_DESIGN.md) for REST API specifications.
