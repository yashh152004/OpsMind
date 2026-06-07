/**
 * Core API Response and Entity Types
 */

// Authentication
export interface AuthCredentials {
  email: string
  password: string
  organizationIdentifier: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  organizationName: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

// User
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  organizationId: string
  teamIds: string[]
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION'
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  firstName: string
  lastName: string
  role: UserRole
  teamIds?: string[]
}

// Organization
export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
  description?: string
  logoUrl?: string
  website?: string
  createdAt: string
  updatedAt: string
}

// Team
export interface Team {
  id: string
  organizationId: string
  name: string
  description?: string
  memberCount: number
  createdAt: string
  updatedAt: string
}

// Incident
export enum IncidentSeverity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  IDENTIFIED = 'IDENTIFIED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export interface Incident {
  id: string
  organizationId: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  environment: string
  assignedTo?: string
  tags: string[]
  detectedAt: string
  resolvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateIncidentRequest {
  title: string
  description: string
  severity: IncidentSeverity
  environment: string
  tags?: string[]
}

// Alert
export enum AlertStatus {
  TRIGGERED = 'TRIGGERED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  RESOLVED = 'RESOLVED',
  EXPIRED = 'EXPIRED',
}

export interface Alert {
  id: string
  organizationId: string
  ruleId: string
  title: string
  description: string
  status: AlertStatus
  severity: IncidentSeverity
  triggeredAt: string
  resolvedAt?: string
}

export interface AlertRule {
  id: string
  organizationId: string
  name: string
  description: string
  condition: string
  severity: IncidentSeverity
  enabled: boolean
  createdAt: string
  updatedAt: string
}

// Log
export interface LogEntry {
  id: string
  organizationId: string
  timestamp: string
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
  message: string
  source: string
  metadata?: Record<string, unknown>
}

// Metric
export interface Metric {
  timestamp: string
  name: string
  value: number
  unit: string
  tags: Record<string, string>
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Error Response
export interface ApiError {
  statusCode: number
  errorCode: string
  message: string
  timestamp: string
  path: string
  errors?: Array<{
    field: string
    value: unknown
    message: string
  }>
}
