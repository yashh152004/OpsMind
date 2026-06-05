# OpsMind - REST API Design

## Table of Contents
1. [API Overview](#api-overview)
2. [Authentication](#authentication)
3. [API Conventions](#api-conventions)
4. [Error Handling](#error-handling)
5. [Auth Endpoints](#auth-endpoints)
6. [Organization Endpoints](#organization-endpoints)
7. [User Endpoints](#user-endpoints)
8. [Incident Endpoints](#incident-endpoints)
9. [Alert Endpoints](#alert-endpoints)
10. [Log Endpoints](#log-endpoints)
11. [Analytics Endpoints](#analytics-endpoints)
12. [AI Endpoints](#ai-endpoints)

---

## API Overview

### Base URL
```
Development:  http://localhost:8080/api
Production:   https://api.opsmind.com/api
```

### API Versioning
```
Current: v1
Header: Accept: application/vnd.opsmind.v1+json
```

### Response Format
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {...},
  "meta": {
    "timestamp": "2026-06-05T10:30:45Z",
    "traceId": "abc123xyz"
  }
}
```

---

## Authentication

### JWT Token Structure

```
Header: Authorization: Bearer <access_token>

Access Token (JWT):
{
  "alg": "HS256",
  "typ": "JWT"
}
{
  "sub": "user_123",
  "org_id": "org_456",
  "roles": ["team_lead", "devops"],
  "permissions": ["incident:create", "incident:read"],
  "iat": 1717484545,
  "exp": 1717485445,  // 15 minutes
  "iss": "opsmind"
}

Refresh Token (stored in Redis/DB):
TTL: 7 days
```

### Token Endpoints

```
POST /auth/login
POST /auth/refresh
POST /auth/logout
POST /auth/register
POST /auth/verify-email
POST /auth/forgot-password
POST /auth/reset-password
```

---

## API Conventions

### HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service down |

### Pagination

```
Query Parameters:
- page: 1 (starting from 1)
- limit: 20 (max 100)
- sort: -created_at (field, - for desc)
- filter: status:open,severity:critical

Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 543,
    "pages": 28,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Filtering

```
Query Parameters:
?status=open&severity=critical&created_after=2026-06-01&created_before=2026-06-05
?service_name=auth-service&environment=production
?assignee_id=user_123&team_id=team_456
```

### Rate Limiting

```
Headers:
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1717484645

Limits:
- Standard: 1000 requests/hour
- Premium: 10,000 requests/hour
- Enterprise: Unlimited
```

---

## Error Handling

### Error Response Format

```json
{
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "value": "invalid-email",
      "message": "Invalid email format"
    }
  ],
  "timestamp": "2026-06-05T10:30:45Z",
  "traceId": "abc123xyz",
  "path": "/api/users"
}
```

### Common Error Codes

```
VALIDATION_ERROR       - Input validation failed (400)
UNAUTHORIZED          - Missing/invalid auth (401)
FORBIDDEN             - Insufficient permissions (403)
RESOURCE_NOT_FOUND    - Resource not found (404)
CONFLICT              - Resource conflict (409)
RATE_LIMIT_EXCEEDED   - Rate limit exceeded (429)
INTERNAL_ERROR        - Server error (500)
SERVICE_UNAVAILABLE   - Service unavailable (503)
```

---

## Auth Endpoints

### POST /auth/register

**Description**: User registration

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "organizationName": "Acme Corp",
  "organizationPlan": "starter"
}
```

**Response** (201):
```json
{
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "organizationId": "org_456",
    "verificationEmailSent": true
  }
}
```

### POST /auth/login

**Description**: User login

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200):
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJyZW...",
    "expiresIn": 900,
    "user": {
      "userId": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "organizationId": "org_456",
      "roles": ["team_lead"],
      "permissions": ["incident:create", "incident:read"]
    }
  }
}
```

### POST /auth/refresh

**Description**: Refresh access token

**Request**:
```json
{
  "refreshToken": "eyJyZW..."
}
```

**Response** (200):
```json
{
  "data": {
    "accessToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

### POST /auth/logout

**Description**: Logout user

**Response** (204): No Content

### POST /auth/verify-email

**Description**: Verify email address

**Request**:
```json
{
  "token": "verification_token_123"
}
```

**Response** (200):
```json
{
  "data": {
    "message": "Email verified successfully"
  }
}
```

### POST /auth/forgot-password

**Description**: Request password reset

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (200):
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

### POST /auth/reset-password

**Description**: Reset password with token

**Request**:
```json
{
  "token": "reset_token_123",
  "newPassword": "NewPassword123!"
}
```

**Response** (200):
```json
{
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

## Organization Endpoints

### GET /organizations

**Description**: List all organizations (Super Admin only)

**Query Parameters**: `page`, `limit`, `sort`, `filter`

**Response** (200):
```json
{
  "data": [
    {
      "orgId": "org_123",
      "name": "Acme Corp",
      "plan": "professional",
      "status": "active",
      "usersCount": 15,
      "createdAt": "2026-01-15T08:30:00Z"
    }
  ],
  "pagination": {...}
}
```

### GET /organizations/{orgId}

**Description**: Get organization details

**Response** (200):
```json
{
  "data": {
    "orgId": "org_123",
    "name": "Acme Corp",
    "description": "Leading tech company",
    "plan": "professional",
    "status": "active",
    "billingEmail": "billing@acme.com",
    "nextBillingDate": "2026-07-15",
    "settings": {
      "theme": "dark",
      "timezone": "UTC",
      "alertChannels": ["email", "slack"]
    },
    "createdAt": "2026-01-15T08:30:00Z",
    "updatedAt": "2026-06-05T10:30:00Z"
  }
}
```

### PATCH /organizations/{orgId}

**Description**: Update organization

**Request**:
```json
{
  "name": "Acme Corp Updated",
  "description": "Updated description",
  "billingEmail": "new-billing@acme.com",
  "settings": {
    "timezone": "America/New_York"
  }
}
```

**Response** (200): Updated organization object

---

## User Endpoints

### GET /organizations/{orgId}/users

**Description**: List organization users

**Query Parameters**: `page`, `limit`, `sort`, `filter`, `status`

**Response** (200):
```json
{
  "data": [
    {
      "userId": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "active",
      "roles": ["team_lead", "devops"],
      "lastLoginAt": "2026-06-05T09:00:00Z",
      "createdAt": "2026-01-15T08:30:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /organizations/{orgId}/users

**Description**: Create new user (Org Admin only)

**Request**:
```json
{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["devops"]
}
```

**Response** (201):
```json
{
  "data": {
    "userId": "user_456",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "status": "active",
    "roles": ["devops"],
    "invitationSent": true
  }
}
```

### GET /users/me

**Description**: Get current user profile

**Response** (200):
```json
{
  "data": {
    "userId": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "organizationId": "org_123",
    "organizationName": "Acme Corp",
    "roles": ["team_lead"],
    "permissions": ["incident:create", "incident:read"],
    "preferences": {
      "theme": "dark",
      "timezone": "UTC"
    }
  }
}
```

### PATCH /users/me

**Description**: Update current user profile

**Request**:
```json
{
  "firstName": "Jonathan",
  "lastName": "Smith",
  "phone": "+1-555-0123",
  "preferences": {
    "theme": "light"
  }
}
```

**Response** (200): Updated user object

### PUT /users/{userId}

**Description**: Update user (Org Admin only)

**Request**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "status": "suspended",
  "roles": ["viewer"]
}
```

**Response** (200): Updated user object

### DELETE /users/{userId}

**Description**: Delete user (Org Admin only)

**Response** (204): No Content

---

## Incident Endpoints

### GET /incidents

**Description**: List incidents for current organization

**Query Parameters**: 
```
page, limit, sort, 
status, severity, assignee_id, team_id,
service_name, environment,
created_after, created_before
```

**Response** (200):
```json
{
  "data": [
    {
      "incidentId": "inc_123",
      "title": "Database connection timeout",
      "description": "Payment service unable to connect to database",
      "serviceName": "payment-service",
      "environment": "production",
      "severity": "critical",
      "status": "investigating",
      "assigneeId": "user_123",
      "assigneeName": "John Doe",
      "teamId": "team_456",
      "teamName": "Platform Team",
      "reporterId": "user_789",
      "affectedComponentsCount": 3,
      "mttr": "15m",
      "createdAt": "2026-06-05T10:00:00Z",
      "updatedAt": "2026-06-05T10:15:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /incidents

**Description**: Create new incident

**Request**:
```json
{
  "title": "Database connection timeout",
  "description": "Payment service unable to connect to database",
  "serviceName": "payment-service",
  "environment": "production",
  "severity": "critical",
  "affectedComponentsCount": 3,
  "teamId": "team_456"
}
```

**Response** (201):
```json
{
  "data": {
    "incidentId": "inc_123",
    "title": "Database connection timeout",
    "severity": "critical",
    "status": "open",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

### GET /incidents/{incidentId}

**Description**: Get incident details

**Response** (200):
```json
{
  "data": {
    "incidentId": "inc_123",
    "title": "Database connection timeout",
    "description": "Payment service unable to connect to database",
    "serviceName": "payment-service",
    "environment": "production",
    "severity": "critical",
    "status": "investigating",
    "assigneeId": "user_123",
    "assigneeName": "John Doe",
    "reporterId": "user_789",
    "reporterName": "Jane Smith",
    "teamId": "team_456",
    "teamName": "Platform Team",
    "rootCauseSummary": "Database connection pool exhausted",
    "affectedComponents": ["database", "cache", "queue"],
    "slaStartTime": "2026-06-05T10:00:00Z",
    "slaDueTime": "2026-06-05T10:30:00Z",
    "affectedUsersCount": 5000,
    "estimatedRevenueImpact": 50000.00,
    "createdAt": "2026-06-05T10:00:00Z",
    "updatedAt": "2026-06-05T10:15:00Z",
    "resolvedAt": null,
    "timeline": [...],
    "comments": [...],
    "attachments": [...]
  }
}
```

### PATCH /incidents/{incidentId}

**Description**: Update incident

**Request**:
```json
{
  "title": "Database connection timeout - RESOLVED",
  "description": "Payment service unable to connect to database - fixed",
  "severity": "high",
  "status": "resolved",
  "rootCauseSummary": "Connection pool was exhausted due to slow queries"
}
```

**Response** (200): Updated incident object

### PATCH /incidents/{incidentId}/assign

**Description**: Assign incident to user/team

**Request**:
```json
{
  "assigneeId": "user_123",
  "teamId": "team_456"
}
```

**Response** (200):
```json
{
  "data": {
    "incidentId": "inc_123",
    "assigneeId": "user_123",
    "assigneeName": "John Doe",
    "teamId": "team_456",
    "teamName": "Platform Team"
  }
}
```

### PATCH /incidents/{incidentId}/escalate

**Description**: Escalate incident severity

**Request**:
```json
{
  "newSeverity": "critical",
  "reason": "Revenue impact increased"
}
```

**Response** (200): Updated incident object

### PATCH /incidents/{incidentId}/resolve

**Description**: Resolve incident

**Request**:
```json
{
  "resolution": "Increased database connection pool from 100 to 200",
  "postIncidentActions": [
    "Add monitoring alerts",
    "Review query performance"
  ]
}
```

**Response** (200): Updated incident object

### POST /incidents/{incidentId}/comments

**Description**: Add comment to incident

**Request**:
```json
{
  "content": "Database logs show connection timeouts starting at 10:00 UTC"
}
```

**Response** (201):
```json
{
  "data": {
    "commentId": "com_123",
    "incidentId": "inc_123",
    "userId": "user_123",
    "userName": "John Doe",
    "content": "Database logs show connection timeouts starting at 10:00 UTC",
    "createdAt": "2026-06-05T10:15:00Z"
  }
}
```

### GET /incidents/{incidentId}/comments

**Description**: Get incident comments

**Response** (200):
```json
{
  "data": [
    {
      "commentId": "com_123",
      "userId": "user_123",
      "userName": "John Doe",
      "content": "Database logs show connection timeouts",
      "createdAt": "2026-06-05T10:15:00Z",
      "updatedAt": "2026-06-05T10:15:00Z"
    }
  ]
}
```

### POST /incidents/{incidentId}/attachments

**Description**: Upload attachment to incident

**Content-Type**: multipart/form-data

**Request**:
```
file: <binary file>
```

**Response** (201):
```json
{
  "data": {
    "attachmentId": "att_123",
    "fileName": "database-logs.txt",
    "fileSize": 102400,
    "fileType": "text/plain",
    "fileUrl": "https://s3.amazonaws.com/opsmind/...",
    "uploadedBy": "user_123",
    "createdAt": "2026-06-05T10:15:00Z"
  }
}
```

---

## Alert Endpoints

### GET /alerts

**Description**: List alerts

**Query Parameters**: `page`, `limit`, `status`, `severity`, `created_after`

**Response** (200):
```json
{
  "data": [
    {
      "alertId": "alert_123",
      "title": "CPU usage critical",
      "message": "CPU usage on payment-service exceeded 95%",
      "severity": "critical",
      "status": "triggered",
      "source": "metric",
      "sourceService": "payment-service",
      "incidentId": "inc_123",
      "triggeredAt": "2026-06-05T10:00:00Z",
      "acknowledgedAt": null
    }
  ],
  "pagination": {...}
}
```

### GET /alerts/{alertId}

**Description**: Get alert details

**Response** (200):
```json
{
  "data": {
    "alertId": "alert_123",
    "title": "CPU usage critical",
    "message": "CPU usage on payment-service exceeded 95%",
    "severity": "critical",
    "status": "triggered",
    "source": "metric",
    "sourceDetails": {
      "metric": "cpu_usage",
      "value": 96.5,
      "threshold": 95,
      "window": "5m"
    },
    "notificationChannels": ["email", "slack"],
    "notifiedTeams": ["platform-team"],
    "triggeredAt": "2026-06-05T10:00:00Z",
    "acknowledgedAt": null,
    "resolvedAt": null
  }
}
```

### PATCH /alerts/{alertId}/acknowledge

**Description**: Acknowledge alert

**Request**:
```json
{
  "comment": "Acknowledged, investigating now"
}
```

**Response** (200):
```json
{
  "data": {
    "alertId": "alert_123",
    "status": "acknowledged",
    "acknowledgedAt": "2026-06-05T10:05:00Z",
    "acknowledgedBy": "user_123"
  }
}
```

### PATCH /alerts/{alertId}/resolve

**Description**: Resolve alert

**Request**:
```json
{
  "resolution": "Issue resolved by scaling service"
}
```

**Response** (200):
```json
{
  "data": {
    "alertId": "alert_123",
    "status": "resolved",
    "resolvedAt": "2026-06-05T10:15:00Z",
    "resolvedBy": "user_123"
  }
}
```

### GET /alert-rules

**Description**: List alert rules

**Query Parameters**: `page`, `limit`, `enabled`, `team_id`

**Response** (200):
```json
{
  "data": [
    {
      "ruleId": "rule_123",
      "name": "High CPU Alert",
      "description": "Alert when CPU exceeds 80%",
      "enabled": true,
      "notificationChannels": ["email", "slack"],
      "createdAt": "2026-06-01T08:00:00Z"
    }
  ],
  "pagination": {...}
}
```

### POST /alert-rules

**Description**: Create alert rule

**Request**:
```json
{
  "name": "High CPU Alert",
  "description": "Alert when CPU exceeds 80%",
  "condition": {
    "metric": "cpu_usage",
    "operator": "greater_than",
    "value": 80,
    "window": "5m"
  },
  "notificationChannels": ["email", "slack"],
  "teamId": "team_456"
}
```

**Response** (201):
```json
{
  "data": {
    "ruleId": "rule_123",
    "name": "High CPU Alert",
    "enabled": true,
    "createdAt": "2026-06-05T10:30:00Z"
  }
}
```

---

## Log Endpoints

### POST /logs/ingest

**Description**: Ingest logs (batch)

**Content-Type**: application/json or application/x-ndjson

**Request**:
```json
{
  "logs": [
    {
      "timestamp": "2026-06-05T10:30:45Z",
      "level": "ERROR",
      "message": "Database connection timeout",
      "service": "payment-service",
      "host": "prod-1.example.com",
      "request_id": "req_123456",
      "tags": {
        "environment": "production",
        "region": "us-east-1"
      },
      "stack_trace": "..."
    }
  ]
}
```

**Response** (202):
```json
{
  "data": {
    "accepted": 1000,
    "rejected": 0,
    "message": "Logs accepted for processing"
  }
}
```

### GET /logs/search

**Description**: Search logs

**Query Parameters**:
```
q: search query
service: service name
level: log level
host: hostname
after: timestamp
before: timestamp
limit: 100
```

**Response** (200):
```json
{
  "data": [
    {
      "logId": "log_123",
      "timestamp": "2026-06-05T10:30:45Z",
      "level": "ERROR",
      "message": "Database connection timeout",
      "service": "payment-service",
      "host": "prod-1.example.com",
      "requestId": "req_123456",
      "stackTrace": "...",
      "tags": {
        "environment": "production"
      }
    }
  ],
  "pagination": {
    "total": 5432,
    "returned": 100
  }
}
```

### GET /logs/{logId}

**Description**: Get log details

**Response** (200):
```json
{
  "data": {
    "logId": "log_123",
    "timestamp": "2026-06-05T10:30:45Z",
    "level": "ERROR",
    "message": "Database connection timeout",
    "service": "payment-service",
    "host": "prod-1.example.com",
    "requestId": "req_123456",
    "stackTrace": "at PaymentService.process(...)",
    "tags": {...}
  }
}
```

---

## Analytics Endpoints

### GET /analytics/incidents/metrics

**Description**: Get incident metrics

**Query Parameters**: `period, start_date, end_date`

**Response** (200):
```json
{
  "data": {
    "totalIncidents": 45,
    "criticalIncidents": 8,
    "averageMttr": "45m",
    "medianMttr": "38m",
    "averageMtbf": "3d 5h",
    "availability": 99.85,
    "topServices": [
      {
        "name": "payment-service",
        "incidents": 12,
        "mttr": "52m"
      }
    ],
    "incidents": {
      "critical": 8,
      "high": 12,
      "medium": 20,
      "low": 5
    }
  }
}
```

### GET /analytics/incidents/trends

**Description**: Get incident trends

**Query Parameters**: `period, granularity (daily, weekly, monthly)`

**Response** (200):
```json
{
  "data": [
    {
      "date": "2026-06-05",
      "incidents": 3,
      "averageMttr": "42m",
      "availability": 99.92,
      "bySeverity": {
        "critical": 0,
        "high": 1,
        "medium": 2,
        "low": 0
      }
    }
  ]
}
```

### GET /analytics/alerts/metrics

**Description**: Get alert metrics

**Response** (200):
```json
{
  "data": {
    "totalAlerts": 234,
    "triggeredAlerts": 45,
    "acknowledgedAlerts": 100,
    "resolvedAlerts": 89,
    "alertsPerDay": 15,
    "topRules": [
      {
        "ruleName": "High CPU Alert",
        "triggeredCount": 23
      }
    ]
  }
}
```

---

## AI Endpoints

### POST /ai/root-cause-analysis

**Description**: Trigger RCA for incident

**Request**:
```json
{
  "incidentId": "inc_123"
}
```

**Response** (202):
```json
{
  "data": {
    "analysisId": "analysis_123",
    "status": "processing",
    "estimatedCompletionTime": "30s"
  }
}
```

### GET /ai/root-cause-analysis/{analysisId}

**Description**: Get RCA result

**Response** (200):
```json
{
  "data": {
    "analysisId": "analysis_123",
    "incidentId": "inc_123",
    "status": "completed",
    "rootCause": "Database connection pool exhausted",
    "confidenceScore": 92,
    "affectedServices": ["payment-service", "auth-service"],
    "recommendations": [
      "Increase connection pool size from 100 to 200",
      "Optimize N+1 queries in payment processing",
      "Add connection pooling metrics to monitoring"
    ],
    "aiModel": "gpt-4",
    "completedAt": "2026-06-05T10:35:00Z"
  }
}
```

### POST /ai/chat

**Description**: Chat with AI assistant

**Request**:
```json
{
  "message": "What caused yesterday's outage?",
  "conversationId": "conv_123"
}
```

**Response** (200):
```json
{
  "data": {
    "conversationId": "conv_123",
    "messageId": "msg_456",
    "response": "Yesterday's outage on 2026-06-04 from 14:30-15:15 UTC was caused by database connection pool exhaustion. The root cause was a slow query introduced in deployment v2.5.3 that caused connections to be held for extended periods.",
    "relatedIncidents": ["inc_100", "inc_101"],
    "relatedKnowledgeBase": ["kb_45", "kb_89"]
  }
}
```

### GET /ai/chat/{conversationId}

**Description**: Get conversation history

**Response** (200):
```json
{
  "data": {
    "conversationId": "conv_123",
    "messages": [
      {
        "role": "user",
        "content": "What caused yesterday's outage?",
        "timestamp": "2026-06-05T10:00:00Z"
      },
      {
        "role": "assistant",
        "content": "Yesterday's outage...",
        "timestamp": "2026-06-05T10:00:05Z"
      }
    ]
  }
}
```

---

**Next Steps**: See [05-BACKEND_STRUCTURE.md](05-BACKEND_STRUCTURE.md) for backend project structure.
